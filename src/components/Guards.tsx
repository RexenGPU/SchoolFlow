import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../providers/AuthProvider'
import { LogoMark } from './Logo'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth()
  const location = useLocation()

  if (!ready) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <LogoMark size={56} className="spring" />
        <p className="text-sm text-ink-3">Chargement de votre session…</p>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-surface-strong">
          <div className="h-full w-1/2 animate-[shimmer_1.2s_linear_infinite] rounded-full bg-accent" />
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth()
  if (!ready) return null
  if (session) return <Navigate to="/app" replace />
  return <>{children}</>
}
