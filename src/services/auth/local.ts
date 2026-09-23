import { STORAGE_KEYS, storage } from '../storage'
import type { AuthResult, LocalAccount, ProviderId, Session, User } from '../../types'
import { BaseAuthProvider, buildSession, isSessionValid } from './base'

/**
 * LocalAuthProvider — comptes fictifs stockés uniquement sur cet appareil.
 * Aucun mot de passe scolaire n'est jamais demandé ni stocké.
 */
function hashPassword(password: string): string {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < password.length; i++) {
    const ch = password.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16)
}

export class LocalAuthProvider extends BaseAuthProvider {
  readonly id: ProviderId = 'local'
  readonly label = 'Compte local SCHOOLFLOW'
  readonly configured = true

  private ensureAccounts(): LocalAccount[] {
    return storage.get<LocalAccount[]>(STORAGE_KEYS.accounts, [])
  }

  listAccounts(): LocalAccount[] {
    return this.ensureAccounts()
  }

  register(input: { email: string; password: string; displayName: string; role: 'student' | 'teacher'; className?: string; subject?: string }): AuthResult {
    const email = input.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: 'Adresse e-mail invalide.' }
    }
    if (input.password.length < 6) {
      return { ok: false, error: 'Le mot de passe local doit contenir au moins 6 caractères.' }
    }
    const accounts = this.ensureAccounts()
    if (accounts.some((a) => a.email === email)) {
      return { ok: false, error: 'Un compte local utilise déjà cette adresse.' }
    }
    const firstName = input.displayName.trim().split(/\s+/)[0] ?? 'Élève'
    const lastName = input.displayName.trim().split(/\s+/).slice(1).join(' ') || 'Nouveau'
    const user: User = {
      id: `u_local_${Math.random().toString(36).slice(2, 9)}`,
      displayName: input.displayName.trim(),
      firstName,
      lastName,
      role: input.role,
      className: input.role === 'student' ? (input.className || '3e B') : undefined,
      subject: input.role === 'teacher' ? (input.subject || 'Mathématiques') : undefined,
      establishment: 'Compte local (démo)',
      email,
      avatarHue: Math.floor(Math.random() * 360),
    }
    const account: LocalAccount = {
      id: `acc_${Math.random().toString(36).slice(2, 9)}`,
      email,
      passwordHash: hashPassword(input.password),
      user,
      createdAt: new Date().toISOString(),
    }
    storage.set(STORAGE_KEYS.accounts, [...accounts, account])
    const session = buildSession(user, 'local')
    storage.set(STORAGE_KEYS.session, session)
    return { ok: true, session, user }
  }

  deleteAccount(email: string): boolean {
    const accounts = this.ensureAccounts()
    const next = accounts.filter((a) => a.email !== email)
    if (next.length === accounts.length) return false
    storage.set(STORAGE_KEYS.accounts, next)
    return true
  }

  override async login(input?: Record<string, string>): Promise<AuthResult> {
    const email = (input?.email ?? '').trim().toLowerCase()
    const password = input?.password ?? ''
    if (!email || !password) {
      return { ok: false, error: 'Renseignez votre e-mail et votre mot de passe local.' }
    }
    const accounts = this.ensureAccounts()
    const account = accounts.find((a) => a.email === email)
    if (!account) {
      return { ok: false, error: 'Aucun compte local ne correspond à cette adresse.' }
    }
    if (account.passwordHash !== hashPassword(password)) {
      return { ok: false, error: 'Mot de passe local incorrect.' }
    }
    const session = buildSession(account.user, 'local')
    storage.set(STORAGE_KEYS.session, session)
    return { ok: true, session, user: account.user }
  }

  override async logout(): Promise<void> {
    storage.remove(STORAGE_KEYS.session)
  }

  override async getSession(): Promise<Session | null> {
    const session = storage.get<Session | null>(STORAGE_KEYS.session, null)
    if (!isSessionValid(session)) {
      if (session) storage.remove(STORAGE_KEYS.session)
      return null
    }
    if (session.provider !== 'local') return null
    return session
  }

  override async refreshSession(): Promise<Session | null> {
    const session = await this.getSession()
    if (!session) return null
    const accounts = this.ensureAccounts()
    const user = accounts.find((a) => a.id === session.userId)?.user
    if (!user) {
      storage.remove(STORAGE_KEYS.session)
      return null
    }
    const refreshed = buildSession(user, 'local')
    storage.set(STORAGE_KEYS.session, refreshed)
    return refreshed
  }

  override async isAuthenticated(): Promise<boolean> {
    return (await this.getSession()) !== null
  }

  override async getUser(): Promise<User | null> {
    const session = await this.getSession()
    if (!session) return null
    return this.ensureAccounts().find((a) => a.id === session.userId)?.user ?? null
  }
}

export const localAuthProvider = new LocalAuthProvider()
