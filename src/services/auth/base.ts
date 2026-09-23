import type { AuthProviderLike, AuthResult, ProviderId, Session, User } from '../../types'

export abstract class BaseAuthProvider implements AuthProviderLike {
  abstract readonly id: ProviderId
  abstract readonly label: string
  abstract readonly configured: boolean

  abstract login(input?: Record<string, string>): Promise<AuthResult>
  abstract logout(): Promise<void>
  abstract getSession(): Promise<Session | null>
  abstract refreshSession(): Promise<Session | null>
  abstract isAuthenticated(): Promise<boolean>
  abstract getUser(): Promise<User | null>
}

export const SESSION_TTL_MS = 1000 * 60 * 60 * 12

export function buildSession(user: User, provider: ProviderId): Session {
  const now = new Date()
  return {
    id: `sess_${Math.random().toString(36).slice(2, 10)}`,
    userId: user.id,
    displayName: user.displayName,
    role: user.role,
    establishment: user.establishment,
    provider,
    loggedInAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString(),
  }
}

export function isSessionValid(session: Session | null | undefined): session is Session {
  if (!session) return false
  const exp = Date.parse(session.expiresAt)
  if (Number.isNaN(exp)) return false
  return exp > Date.now()
}

export class SessionExpiredError extends Error {
  constructor() {
    super('Session expirée')
    this.name = 'SessionExpiredError'
  }
}
