import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ProviderId, Session, User } from '../types'
import {
  getAuthProvider,
  isSessionValid,
  localAuthProvider,
  PROVIDER_UNCONFIGURED_MESSAGE,
} from '../services/auth'
import { storage, STORAGE_KEYS } from '../services/storage'

interface AuthContextValue {
  session: Session | null
  user: User | null
  ready: boolean
  login: (provider: ProviderId, input?: Record<string, string>) => Promise<{ ok: boolean; error?: string }>
  loginLocal: (email: string, password: string, remember?: boolean) => Promise<{ ok: boolean; error?: string }>
  loginPronote: (url: string, username: string, password: string, kind: string, remember?: boolean) => Promise<{ ok: boolean; error?: string }>
  registerLocal: (input: {
    email: string
    password: string
    displayName: string
    role: 'student' | 'teacher'
    className?: string
    subject?: string
  }) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  deleteLocalAccount: (email: string) => void
  listLocalAccounts: () => { id: string; email: string; user: User }[]
}

const AuthContext = createContext<AuthContextValue | null>(null)

const REMEMBER_KEY = 'remember'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  const loadSession = useCallback(async () => {
    const stored = storage.get<Session | null>(STORAGE_KEYS.session, null)
    if (!isSessionValid(stored)) {
      if (stored) storage.remove(STORAGE_KEYS.session)
      setSession(null)
      setUser(null)
      setReady(true)
      return
    }
    const provider = getAuthProvider(stored.provider)
    const valid = await provider.getSession()
    if (!valid) {
      setSession(null)
      setUser(null)
      setReady(true)
      return
    }
    setSession(valid)
    const u = await provider.getUser()
    setUser(u)
    setReady(true)
  }, [])

  useEffect(() => {
    void loadSession()
  }, [loadSession])

  const login = useCallback(
    async (providerId: ProviderId, input?: Record<string, string>) => {
      const provider = getAuthProvider(providerId)
      if (!provider.configured) {
        return { ok: false, error: PROVIDER_UNCONFIGURED_MESSAGE }
      }
      const result = await provider.login(input)
      if (result.ok && result.session) {
        setSession(result.session)
        setUser(result.user ?? null)
        if (input?.remember === 'on' || input?.remember === 'true') {
          storage.set(REMEMBER_KEY, true)
        }
      }
      return { ok: result.ok, error: result.error }
    },
    [],
  )

  const loginLocal = useCallback(
    async (email: string, password: string, remember = true) => {
      const result = await login('local', { email, password, remember: remember ? 'true' : 'false' })
      if (result.ok) storage.set(REMEMBER_KEY, remember)
      return result
    },
    [login],
  )

  const loginPronote = useCallback(
    async (url: string, username: string, password: string, kind: string, remember = true) => {
      const result = await login('pronote', {
        url,
        username,
        password,
        kind,
        remember: remember ? 'true' : 'false',
      })
      if (result.ok) storage.set(REMEMBER_KEY, remember)
      return result
    },
    [login],
  )

  const registerLocal = useCallback(
    async (input: {
      email: string
      password: string
      displayName: string
      role: 'student' | 'teacher'
      className?: string
      subject?: string
    }) => {
      const res = localAuthProvider.register(input)
      if (res.ok && res.session) {
        setSession(res.session)
        setUser(res.user ?? null)
        storage.set(REMEMBER_KEY, true)
        return { ok: true }
      }
      return { ok: false, error: res.error }
    },
    [],
  )

  const logout = useCallback(async () => {
    const providerId = session?.provider ?? 'local'
    await getAuthProvider(providerId).logout()
    storage.remove(STORAGE_KEYS.session)
    setSession(null)
    setUser(null)
  }, [session?.provider])

  const refresh = useCallback(async () => {
    if (!session) return
    const provider = getAuthProvider(session.provider)
    const next = await provider.refreshSession()
    if (next) {
      setSession(next)
      setUser(await provider.getUser())
    } else {
      setSession(null)
      setUser(null)
    }
  }, [session])

  const deleteLocalAccount = useCallback((email: string) => {
    localAuthProvider.deleteAccount(email)
  }, [])

  const listLocalAccounts = useCallback(() => {
    return localAuthProvider.listAccounts().map((a) => ({
      id: a.id,
      email: a.email,
      user: a.user,
    }))
  }, [])

  const value = useMemo(
    () => ({
      session,
      user,
      ready,
      login,
      loginLocal,
      loginPronote,
      registerLocal,
      logout,
      refresh,
      deleteLocalAccount,
      listLocalAccounts,
    }),
    [session, user, ready, login, loginLocal, loginPronote, registerLocal, logout, refresh, deleteLocalAccount, listLocalAccounts],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
