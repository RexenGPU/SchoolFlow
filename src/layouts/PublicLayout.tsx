import { Link, Outlet } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../providers/ThemeProvider'

export function PublicLayout() {
  const { resolvedTheme, toggleTheme } = useTheme()
  return (
    <div className="relative min-h-dvh">
      <div className="ambient" aria-hidden>
        <div className="ambient__blob" />
        <div className="ambient__blob" />
        <div className="ambient__blob" />
        <div className="ambient__blob" />
      </div>
      <header className="relative z-10 flex h-16 items-center justify-between px-5 sm:px-8">
        <Link to="/" aria-label="SCHOOLFLOW — accueil">
          <Logo size="sm" />
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={resolvedTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          className="glass-subtle rounded-2xl p-2.5 text-ink-2 transition hover:bg-surface-hover"
        >
          {resolvedTheme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>
      </header>
      <main className="relative z-10">
        <Outlet />
      </main>
      <footer className="relative z-10 px-6 pt-8 pb-10 text-center">
        <p className="mx-auto max-w-2xl text-xs leading-relaxed text-ink-3">
          Projet indépendant — aucune affiliation avec Pronote, EduConnect ou l'Éducation nationale.
        </p>
        <p className="mx-auto mt-1 max-w-2xl text-[11px] leading-relaxed text-ink-3/80">
          SCHOOLFLOW est un projet indépendant de démonstration. Il n'est pas affilié à Pronote,
          EduConnect, Index Éducation ou au ministère de l'Éducation nationale.
        </p>
      </footer>
    </div>
  )
}
