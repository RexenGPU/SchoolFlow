import { STORAGE_KEYS, storage } from '../storage'
import type { AuthProviderLike, AuthResult, ProviderId, Session, User } from '../../types'
import { BaseAuthProvider, isSessionValid } from './base'
import { pronoteApiUrl } from '../pronoteApi'

export const PROVIDER_UNCONFIGURED_MESSAGE =
  "L'intégration officielle de ce fournisseur n'est pas configurée. Utilisez le compte local SCHOOLFLOW."

/**
 * AuthProvider externe (EduConnect / Pronote).
 *
 * Règles strictes :
 * - Aucun identifiant / mot de passe du fournisseur n'est saisi dans SCHOOLFLOW.
 * - Aucune API n'est inventée : si le fournisseur n'expose pas d'intégration
 *   officielle (OAuth2 / OIDC / SAML) configurée ici, le bouton est désactivé.
 * - L'authentification doit se faire exclusivement chez le fournisseur officiel,
 *   puis SCHOOLFLOW crée une session locale à partir des informations renvoyées.
 */
export abstract class ExternalAuthProvider extends BaseAuthProvider {
  abstract readonly id: ProviderId
  abstract readonly label: string

  /** Doit être renseigné côté déploiement avec une intégration officielle validée. */
  readonly configured: boolean = false

  readonly documentationUrl?: string

  /** Endpoint officiel d'authentification (redirection), jamais un formulaire local. */
  readonly authorizationEndpoint?: string

  protected sessionKey = ''

  override async login(_input?: Record<string, string>): Promise<AuthResult> {
    if (!this.configured || !this.authorizationEndpoint) {
      return { ok: false, error: PROVIDER_UNCONFIGURED_MESSAGE }
    }
    // Une intégration officielle redirigerait ici vers le fournisseur :
    // window.location.href = authorizeUrl (PKCE, state, nonce…)
    // Aucune collecte de mot de passe n'a lieu dans SCHOOLFLOW.
    return {
      ok: false,
      error: "L'intégration officielle de ce fournisseur n'est pas encore active dans cet environnement. Utilisez le compte local SCHOOLFLOW.",
    }
  }

  override async logout(): Promise<void> {
    storage.remove(this.sessionKey)
  }

  override async getSession(): Promise<Session | null> {
    const session = storage.get<Session | null>(this.sessionKey, null)
    if (!isSessionValid(session)) {
      if (session) storage.remove(this.sessionKey)
      return null
    }
    if (session.provider !== this.id) return null
    return session
  }

  override async refreshSession(): Promise<Session | null> {
    return this.getSession()
  }

  override async isAuthenticated(): Promise<boolean> {
    return (await this.getSession()) !== null
  }

  override async getUser(): Promise<User | null> {
    // Seules les informations non sensibles nécessaires à la session locale.
    const session = await this.getSession()
    if (!session) return null
    return storage.get<User | null>(`external-user.${this.id}`, null)
  }

  /** Appelé après un retour officiel du fournisseur (OAuth2 / OIDC / SAML). */
  acceptExternalSession(user: User): Session {
    const now = new Date()
    const session: Session = {
      id: `sess_${Math.random().toString(36).slice(2, 10)}`,
      userId: user.id,
      displayName: user.displayName,
      role: user.role,
      establishment: user.establishment,
      provider: this.id,
      loggedInAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 12).toISOString(),
    }
    storage.set(this.sessionKey, session)
    storage.set(`external-user.${this.id}`, user)
    return session
  }
}

export class EduConnectAuthProvider extends ExternalAuthProvider {
  readonly id: ProviderId = 'educonnect'
  readonly label = 'Continuer avec EduConnect'
  readonly sessionKey = STORAGE_KEYS.session + '.educonnect'
  readonly documentationUrl = 'https://eduka.ena.education.fr/'
  readonly authorizationEndpoint = undefined
  readonly configured = false
}

export class PronoteAuthProvider extends ExternalAuthProvider {
  readonly id: ProviderId = 'pronote'
  readonly label = 'Se connecter avec Pronote'
  readonly sessionKey = STORAGE_KEYS.session + '.pronote'
  readonly documentationUrl = 'https://www.index-education.com/'
  readonly authorizationEndpoint = undefined
  readonly configured = true

  override async login(input?: Record<string, string>): Promise<AuthResult> {
    const url = (input?.url ?? '').trim()
    const kind = input?.kind ?? 'student'
    const username = (input?.username ?? '').trim()
    const password = input?.password ?? ''
    if (!url || !username || !password) {
      return { ok: false, error: 'Renseignez l’URL Pronote, l’identifiant et le mot de passe.' }
    }
    try {
      const res = await fetch(pronoteApiUrl('/api/pronote/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, kind, username, password }),
      })
      const text = await res.text()
      let data: { sessionId?: string; user?: User; message?: string; error?: string } = {}
      try {
        data = text ? (JSON.parse(text) as typeof data) : {}
      } catch {
        return { ok: false, error: `Réponse invalide du serveur (${res.status}). Réessayez dans un instant.` }
      }
      if (!res.ok || !data.sessionId || !data.user) {
        return {
          ok: false,
          error: data.message ?? `Connexion Pronote impossible (HTTP ${res.status}${data.error ? ` · ${data.error}` : ''}).`,
        }
      }
      const user: User = { ...data.user, role: data.user.role === 'teacher' ? 'teacher' : 'student' }
      if (input?.remember === 'true' || input?.remember === 'on') {
        storage.set('pronote.credentials', { sessionId: data.sessionId, user })
      }
      storage.set('pronote.sessionId', data.sessionId)
      const session = this.acceptExternalSession(user)
      return { ok: true, session, user }
    } catch {
      return {
        ok: false,
        error: 'Impossible de contacter le serveur SCHOOLFLOW. Vérifiez votre connexion puis réessayez.',
      }
    }
  }

  override async logout(): Promise<void> {
    const sessionId = storage.get<string | null>('pronote.sessionId', null)
    if (sessionId) {
      await fetch(pronoteApiUrl('/api/pronote/logout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      }).catch(() => undefined)
    }
    storage.remove('pronote.sessionId')
    storage.remove('pronote.credentials')
    storage.remove('pronote.user')
    storage.remove(this.sessionKey)
    storage.remove(`external-user.${this.id}`)
  }

  getPronoteSessionId(): string | null {
    return storage.get<string | null>('pronote.sessionId', null)
  }
}

export const eduConnectAuthProvider: AuthProviderLike = new EduConnectAuthProvider()
export const pronoteAuthProvider: AuthProviderLike = new PronoteAuthProvider()
