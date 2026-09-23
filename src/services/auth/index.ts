import type { AuthProviderLike, ProviderId } from '../../types'
import { localAuthProvider } from './local'
import { eduConnectAuthProvider, pronoteAuthProvider } from './external'

export { LocalAuthProvider, localAuthProvider } from './local'
export {
  EduConnectAuthProvider,
  PronoteAuthProvider,
  eduConnectAuthProvider,
  pronoteAuthProvider,
  PROVIDER_UNCONFIGURED_MESSAGE,
} from './external'
export { buildSession, isSessionValid, SESSION_TTL_MS } from './base'

const registry: Record<ProviderId, AuthProviderLike> = {
  local: localAuthProvider,
  educonnect: eduConnectAuthProvider,
  pronote: pronoteAuthProvider,
}

export function getAuthProvider(id: ProviderId): AuthProviderLike {
  return registry[id]
}

export function listAuthProviders(): AuthProviderLike[] {
  return [registry.local, registry.educonnect, registry.pronote]
}
