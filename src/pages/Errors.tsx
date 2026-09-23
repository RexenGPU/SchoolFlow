import { Link, useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'
import { Button } from '../components/ui'
import { LogoMark } from '../components/Logo'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[75dvh] flex-col items-center justify-center px-6 text-center">
      <div className="glass-panel w-full max-w-lg rounded-[28px] p-8">
        <LogoMark size={56} className="mx-auto mb-5" />
        <p className="text-6xl font-semibold tracking-tight text-accent">404</p>
        <h1 className="mt-3 text-xl font-semibold text-ink">Page introuvable</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Cette page n'existe pas ou a été déplacée. Le contenu demandé est peut-être hors ligne.
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link to="/">
            <Button className="w-full sm:w-auto">
              <Home className="size-4" aria-hidden />
              Accueil
            </Button>
          </Link>
          <Link to="/app">
            <Button variant="secondary" className="w-full sm:w-auto">
              Tableau de bord
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export function ErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Une erreur inattendue est survenue.'

  return (
    <div className="flex min-h-[75dvh] flex-col items-center justify-center px-6 text-center">
      <div className="glass-panel w-full max-w-lg rounded-[28px] p-8">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-3xl bg-danger/12">
          <AlertTriangle className="size-7 text-danger" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold text-ink">Une erreur est survenue</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          L'application n'a pas pu afficher cette page. Vous pouvez réessayer ou revenir au tableau de
          bord.
        </p>
        <pre className="mt-4 max-h-32 overflow-auto rounded-2xl border border-line-soft bg-surface-strong p-3 text-left text-xs text-ink-3">
          {message}
        </pre>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button onClick={() => window.location.reload()} className="w-full sm:w-auto">
            <RotateCcw className="size-4" aria-hidden />
            Réessayer
          </Button>
          <Button variant="secondary" onClick={() => navigate('/app')} className="w-full sm:w-auto">
            Tableau de bord
          </Button>
        </div>
      </div>
    </div>
  )
}
