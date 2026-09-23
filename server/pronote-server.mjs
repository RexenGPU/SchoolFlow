import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  AccountKind,
  BadCredentialsError,
  SecurityError,
  SessionExpiredError,
  RateLimitedError,
  UnreachableError,
  PageUnavailableError,
  BusyPageError,
  SuspendedIPError,
  createSessionHandle,
  loginCredentials,
  timetableFromWeek,
  assignmentsFromWeek,
  gradesOverview,
  discussions,
  homepage,
  account,
  sessionInformation,
  translateToWeekNumber,
} from 'pawnote'

const PORT = Number(process.env.PORT || process.env.PRONOTE_SERVER_PORT || 3210)
const HOST = process.env.PRONOTE_SERVER_HOST || '0.0.0.0'
const DIST_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const SESSION_TTL_MS = 1000 * 60 * 60 * 12
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_ATTEMPTS = 30
const KINDS = { student: AccountKind.STUDENT, parent: AccountKind.PARENT, teacher: AccountKind.TEACHER }

const sessions = new Map()
const loginAttempts = new Map()

function pruneSessions() {
  const now = Date.now()
  for (const [id, s] of sessions) {
    if (s.expiresAt <= now) sessions.delete(id)
  }
}

function pruneLoginAttempts(now = Date.now()) {
  for (const [ip, entry] of loginAttempts) {
    if (entry.resetAt <= now) loginAttempts.delete(ip)
  }
}

function requestIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  const first = typeof forwarded === 'string' ? forwarded.split(',').map((p) => p.trim()).filter(Boolean)[0] : null
  return first || req.socket.remoteAddress || 'unknown'
}

function consumeLoginAttempt(req) {
  const now = Date.now()
  pruneLoginAttempts(now)
  const ip = requestIp(req)
  const entry = loginAttempts.get(ip) ?? { count: 0, resetAt: now + LOGIN_WINDOW_MS }
  entry.count += 1
  loginAttempts.set(ip, entry)
  return entry.count <= LOGIN_MAX_ATTEMPTS ? null : Math.ceil((entry.resetAt - now) / 1000)
}

function json(res, status, body) {
  const data = JSON.stringify(body, (_k, v) => (v instanceof Date ? v.toISOString() : v))
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(data)
}

function errorPayload(err) {
  if (err instanceof SecurityError) {
    return { error: 'security', message: "Pronote demande une vérification (2FA/CAPTCHA). Aucune tentative de contournement n'est effectuée." }
  }
  if (err instanceof BadCredentialsError) {
    return { error: 'bad_credentials', message: 'Identifiant ou mot de passe Pronote incorrect.' }
  }
  if (err instanceof SessionExpiredError) {
    return { error: 'session_expired', message: 'Session Pronote expirée.' }
  }
  if (err instanceof RateLimitedError) {
    return { error: 'rate_limited', message: 'Trop de tentatives. Réessayez plus tard.' }
  }
  if (err instanceof UnreachableError) {
    return { error: 'unreachable', message: 'Serveur Pronote injoignable.' }
  }
  if (err instanceof PageUnavailableError) {
    return { error: 'page_unavailable', message: "Page Pronote indisponible (identifiants refusés ou instance non compatible)." }
  }
  if (err instanceof BusyPageError) {
    return { error: 'busy', message: 'Serveur Pronote temporairement indisponible.' }
  }
  if (err instanceof SuspendedIPError) {
    return { error: 'suspended_ip', message: 'Adresse IP suspendue par Pronote. Réessayez plus tard.' }
  }
  return { error: 'unknown', message: err?.message || 'Erreur inconnue.' }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (c) => {
      raw += c
      if (raw.length > 1e6) reject(new Error('payload too large'))
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

async function handleLogin(req, res) {
  const retryAfter = consumeLoginAttempt(req)
  if (retryAfter !== null) {
    res.setHeader('Retry-After', String(retryAfter))
    return json(res, 429, { error: 'rate_limited', message: 'Trop de tentatives. Réessayez plus tard.' })
  }
  const body = await readBody(req)
  const { url, kind, username, password, deviceUUID } = body
  if (!url || !username || !password || !KINDS[kind]) {
    return json(res, 400, { error: 'bad_request', message: 'Paramètres manquants (url, kind, username, password).' })
  }
  const started = Date.now()
  const host = (() => {
    try {
      return new URL(String(url)).host
    } catch {
      return 'invalid-url'
    }
  })()
  console.log(`[pronote] login attempt host=${host} kind=${kind} ip=${requestIp(req)}`)
  const session = createSessionHandle()
  try {
    await loginCredentials(session, {
      url: body.url,
      kind: KINDS[kind],
      username,
      password,
      deviceUUID: deviceUUID || randomUUID(),
    })
    console.log(`[pronote] login ok host=${host} ms=${Date.now() - started}`)
    const info = sessionInformation(session)
    const acc = await account(session).catch(() => null)
    const user = {
      id: session.user?.id || `pronote_${username}`,
      displayName: session.user?.name || username,
      firstName: (session.user?.name || username).split(' ')[0] || username,
      lastName: (session.user?.name || username).split(' ').slice(1).join(' ') || '',
      role: kind === 'teacher' ? 'teacher' : 'student',
      establishment: info?.establishmentName || 'Pronote',
      email: acc?.email || undefined,
      avatarHue: [...username].reduce((a, c) => a + c.charCodeAt(0), 0) % 360,
    }
    const sessionId = randomUUID()
    sessions.set(sessionId, { session, user, kind, url: body.url, expiresAt: Date.now() + SESSION_TTL_MS })
    return json(res, 200, { sessionId, user })
  } catch (err) {
    const status =
      err instanceof SecurityError ? 403 :
      err instanceof BadCredentialsError ? 401 :
      err instanceof PageUnavailableError ? 401 :
      err instanceof SuspendedIPError ? 429 :
      502
    console.log(`[pronote] login fail host=${host} ms=${Date.now() - started} status=${status} name=${err?.name} msg=${err?.message}`)
    return json(res, status, errorPayload(err))
  }
}

async function handleData(req, res) {
  const body = await readBody(req)
  pruneSessions()
  const entry = sessions.get(body.sessionId)
  if (!entry) return json(res, 401, { error: 'session_expired', message: 'Session locale expirée, reconnectez-vous.' })
  entry.expiresAt = Date.now() + SESSION_TTL_MS
  const { session } = entry
  try {
    const week = translateToWeekNumber(new Date())
    const [timetable, assignments, home] = await Promise.all([
      timetableFromWeek(session, week).catch(() => null),
      assignmentsFromWeek(session, week, week + 1).catch(() => []),
      homepage(session).catch(() => null),
    ])
    let grades = null
    try {
      const periods = sessionInformation(session)?.periods
      const current = periods?.find((p) => p.start <= new Date() && p.end >= new Date()) || periods?.[0]
      if (current) grades = await gradesOverview(session, current)
    } catch {
      grades = null
    }
    let convs = []
    try {
      const d = await discussions(session)
      convs = Array.from(d.values?.() ?? d ?? [])
    } catch {
      convs = []
    }
    return json(res, 200, { timetable, assignments, grades, discussions: convs, homepage: home })
  } catch (err) {
    return json(res, 502, errorPayload(err))
  }
}

function handleLogout(req, res) {
  readBody(req)
    .then((body) => {
      pruneSessions()
      sessions.delete(body.sessionId)
      json(res, 200, { ok: true })
    })
    .catch(() => json(res, 400, { error: 'bad_request' }))
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
}

async function serveStatic(req, res) {
  let requestPath
  try {
    requestPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname)
  } catch {
    return json(res, 400, { error: 'bad_request' })
  }

  const requested = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '')
  const candidate = path.resolve(DIST_DIR, requested)
  const indexPath = path.resolve(DIST_DIR, 'index.html')
  const insideDist = candidate === DIST_DIR || candidate.startsWith(`${DIST_DIR}${path.sep}`)
  let filePath = insideDist ? candidate : indexPath

  try {
    const body = await readFile(filePath)
    const extension = path.extname(filePath).toLowerCase()
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[extension] || 'application/octet-stream',
      'Cache-Control': extension === '.html' ? 'no-store' : 'public, max-age=3600',
    })
    return res.end(req.method === 'HEAD' ? undefined : body)
  } catch {
    // Browser routes fall back to the single HTML application.
    if (filePath !== indexPath) {
      filePath = indexPath
      try {
        const body = await readFile(filePath)
        res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'], 'Cache-Control': 'no-store' })
        return res.end(req.method === 'HEAD' ? undefined : body)
      } catch {
        // Continue to the JSON 404 below.
      }
    }
    return json(res, 404, { error: 'not_found', message: 'Fichier introuvable.' })
  }
}

function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('X-Frame-Options', 'DENY')
}

function allowOrigin(req, res) {
  const origin = req.headers.origin
  if (!origin) return true
  const forwardedHost = req.headers['x-forwarded-host'] || req.headers.host
  const forwardedProto = req.headers['x-forwarded-proto'] || 'http'
  const sameOrigin = `${forwardedProto}://${forwardedHost}`
  const configuredOrigin = process.env.SCHOOLFLOW_ALLOWED_ORIGIN || sameOrigin
  const fileOriginAllowed = process.env.SCHOOLFLOW_ALLOW_FILE_ORIGIN === 'true' && origin === 'null'
  if (origin !== configuredOrigin && !fileOriginAllowed) {
    json(res, 403, { error: 'origin_not_allowed' })
    return false
  }
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')
  return true
}

const server = http.createServer((req, res) => {
  applySecurityHeaders(res)
  if (!allowOrigin(req, res)) return
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    return res.end()
  }
  const path = new URL(req.url, `http://localhost:${PORT}`).pathname
  if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(req, res)
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' })
  const handlers = {
    '/api/pronote/login': handleLogin,
    '/api/pronote/data': handleData,
    '/api/pronote/logout': handleLogout,
  }
  const handler = handlers[path]
  if (!handler) return json(res, 404, { error: 'not_found' })
  handler(req, res).catch((err) => json(res, 500, errorPayload(err)))
})

server.listen(PORT, HOST, () => {
  console.log(`[pronote] server listening on ${HOST}:${PORT}`)
})
