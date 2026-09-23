const LOCAL_PRONOTE_SERVER = 'http://127.0.0.1:3210'

/**
 * The standalone build is opened with file:// and therefore cannot resolve
 * relative /api URLs. In that mode, use the local companion server. When the
 * app is served normally, keep the relative URL so the reverse proxy can be
 * used.
 */
export function pronoteApiUrl(path: string): string {
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return `${LOCAL_PRONOTE_SERVER}${path}`
  }
  return path
}

export interface PronoteProbeResult {
  ok: boolean
  base?: string
  url?: string
  version?: string
  cas?: boolean
  establishmentName?: string
  message?: string
}

export async function probePronoteUrl(url: string, kind: string): Promise<PronoteProbeResult> {
  try {
    const res = await fetch(pronoteApiUrl('/api/pronote/probe'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, kind }),
    })
    const text = await res.text()
    try {
      return (text ? JSON.parse(text) : {}) as PronoteProbeResult
    } catch {
      return { ok: false, message: `Réponse invalide du serveur (${res.status}).` }
    }
  } catch {
    return { ok: false, message: 'Serveur SCHOOLFLOW injoignable.' }
  }
}
