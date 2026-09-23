import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Clock,
  FileStack,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  MoreHorizontal,
  PlusCircle,
  Search,
  Settings,
  Sun,
  Users,
  X,
  CloudUpload,
  PenLine,
} from 'lucide-react'
import { Logo } from '../components/Logo'
import { SyncIndicator } from '../components/SyncIndicator'
import { CommandPalette } from '../components/CommandPalette'
import { Avatar, Button } from '../components/ui'
import { useAuth } from '../providers/AuthProvider'
import { useTheme } from '../providers/ThemeProvider'
import { useData } from '../providers/DataProvider'
import { useHotkey } from '../hooks'
import { cn } from '../utils/cn'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
}

function studentNav(): NavItem[] {
  return [
    { to: '/app', label: 'Accueil', icon: LayoutDashboard, end: true },
    { to: '/app/emploi-du-temps', label: 'Emploi du temps', icon: Clock },
    { to: '/app/notes', label: 'Notes', icon: GraduationCap },
    { to: '/app/devoirs', label: 'Devoirs', icon: BookOpen },
    { to: '/app/cahier-de-textes', label: 'Cahier de textes', icon: FileStack },
    { to: '/app/absences', label: 'Absences', icon: ClipboardCheck },
    { to: '/app/messages', label: 'Messagerie', icon: MessageSquare },
    { to: '/app/documents', label: 'Documents', icon: FolderOpen },
    { to: '/app/calendrier', label: 'Calendrier', icon: CalendarDays },
  ]
}

function teacherNav(): NavItem[] {
  return [
    { to: '/app', label: 'Accueil', icon: LayoutDashboard, end: true },
    { to: '/app/emploi-du-temps', label: 'Emploi du temps', icon: Clock },
    { to: '/app/classes', label: 'Mes classes', icon: Users },
    { to: '/app/saisie-notes', label: 'Saisie des notes', icon: PenLine },
    { to: '/app/nouveau-devoir', label: 'Créer un devoir', icon: PlusCircle },
    { to: '/app/appel', label: 'Appel', icon: ClipboardCheck },
    { to: '/app/devoirs', label: 'Devoirs', icon: BookOpen },
    { to: '/app/messages', label: 'Messagerie', icon: MessageSquare },
    { to: '/app/documents', label: 'Documents', icon: FolderOpen },
    { to: '/app/calendrier', label: 'Calendrier', icon: CalendarDays },
  ]
}

const secondary: NavItem[] = [
  { to: '/app/notifications', label: 'Notifications', icon: Bell },
  { to: '/app/synchronisation', label: 'Synchronisation', icon: CloudUpload },
  { to: '/app/parametres', label: 'Paramètres', icon: Settings },
]

const mobilePrimary = ['/app', '/app/emploi-du-temps', '/app/devoirs', '/app/messages']

export function AppLayout() {
  const { user, logout } = useAuth()
  const { resolvedTheme, toggleTheme } = useTheme()
  const { notifications } = useData()
  const navigate = useNavigate()
  const location = useLocation()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const isTeacher = user?.role === 'teacher'
  const nav = useMemo(() => (isTeacher ? teacherNav() : studentNav()), [isTeacher])
  const unread = notifications.filter((n) => !n.read).length

  useHotkey({ key: 'k', ctrl: true }, () => setPaletteOpen((v) => !v))
  useHotkey({ key: 'k', meta: true }, () => setPaletteOpen((v) => !v))

  useEffect(() => {
    setDrawerOpen(false)
    setMenuOpen(false)
  }, [location.pathname])

  const handleLogout = useCallback(async () => {
    await logout()
    navigate('/logout', { replace: true })
  }, [logout, navigate])

  const mobileNav = useMemo(() => {
    const base = isTeacher
      ? [
          { to: '/app', label: 'Accueil', icon: LayoutDashboard, end: true },
          { to: '/app/emploi-du-temps', label: 'Cours', icon: Clock },
          { to: '/app/appel', label: 'Appel', icon: ClipboardCheck },
          { to: '/app/messages', label: 'Messages', icon: MessageSquare },
        ]
      : mobilePrimary.map((to) => nav.find((n) => n.to === to)!)
    return base.filter(Boolean)
  }, [isTeacher, nav])

  return (
    <div className="relative min-h-dvh">
      <div className="ambient" aria-hidden>
        <div className="ambient__blob" />
        <div className="ambient__blob" />
        <div className="ambient__blob" />
      </div>

      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line-soft bg-surface/60 backdrop-blur-2xl lg:flex">
        <div className="flex h-16 items-center px-5">
          <Logo size="sm" />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 no-scrollbar" aria-label="Navigation principale">
          <p className="mt-2 mb-1.5 px-3 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">
            {isTeacher ? 'Enseignement' : 'Scolarité'}
          </p>
          <ul className="space-y-0.5">
            {nav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-accent-softer text-accent shadow-[inset_0_0_0_1px_var(--accent-soft)]'
                        : 'text-ink-2 hover:bg-surface-hover hover:text-ink',
                    )
                  }
                >
                  <item.icon className="size-4.5 shrink-0" aria-hidden />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <p className="mt-5 mb-1.5 px-3 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">
            Système
          </p>
          <ul className="space-y-0.5">
            {secondary.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-accent-softer text-accent'
                        : 'text-ink-2 hover:bg-surface-hover hover:text-ink',
                    )
                  }
                >
                  <item.icon className="size-4.5 shrink-0" aria-hidden />
                  {item.label}
                  {item.to === '/app/notifications' && unread > 0 && (
                    <span className="ml-auto inline-flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-contrast">
                      {unread}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-line-soft p-3">
          <div className="glass-subtle rounded-2xl p-3">
            <div className="flex items-center gap-2.5">
              <Avatar name={user?.displayName ?? '?'} hue={user?.avatarHue} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{user?.displayName}</p>
                <p className="truncate text-xs text-ink-3">
                  {isTeacher ? user?.subject : user?.className}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full justify-start text-danger hover:bg-danger/10"
              onClick={handleLogout}
            >
              <LogOut className="size-4" aria-hidden />
              Se déconnecter
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              type="button"
              aria-label="Fermer le menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="glass-strong absolute inset-y-0 left-0 flex w-72 flex-col rounded-none"
            >
              <div className="flex h-16 items-center justify-between px-5">
                <Logo size="sm" />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Fermer"
                  className="rounded-xl p-2 text-ink-3 hover:bg-surface-hover"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Navigation">
                <ul className="space-y-0.5">
                  {[...nav, ...secondary].map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition',
                            isActive ? 'bg-accent-softer text-accent' : 'text-ink-2 hover:bg-surface-hover',
                          )
                        }
                      >
                        <item.icon className="size-5" aria-hidden />
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="border-t border-line-soft p-4">
                <Button variant="danger" size="sm" className="w-full" onClick={handleLogout}>
                  <LogOut className="size-4" aria-hidden />
                  Se déconnecter
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex min-h-dvh flex-col lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-line-soft bg-surface/70 backdrop-blur-2xl">
          <div className="flex h-16 items-center gap-2 px-4 sm:px-6">
            <button
              type="button"
              className="rounded-2xl p-2.5 text-ink-2 transition hover:bg-surface-hover lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu className="size-5" />
            </button>

            <div className="lg:hidden">
              <Logo size="sm" showText />
            </div>

            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="glass-subtle ml-auto hidden h-10 w-full max-w-xs items-center gap-2 rounded-2xl px-3 text-sm text-ink-3 transition hover:bg-surface-hover sm:flex lg:ml-0 lg:max-w-sm"
              aria-label="Rechercher"
            >
              <Search className="size-4" aria-hidden />
              <span className="flex-1 text-left">Rechercher…</span>
              <kbd className="rounded-md border border-line-soft bg-surface-strong px-1.5 py-0.5 text-[10px]">
                Ctrl K
              </kbd>
            </button>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                aria-label="Rechercher"
                className="rounded-2xl p-2.5 text-ink-2 transition hover:bg-surface-hover sm:hidden"
              >
                <Search className="size-5" />
              </button>

              <SyncIndicator onOpenSync={() => navigate('/app/synchronisation')} />

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={resolvedTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
                className="rounded-2xl p-2.5 text-ink-2 transition hover:bg-surface-hover"
              >
                {resolvedTheme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
              </button>

              <NavLink
                to="/app/notifications"
                aria-label={`Notifications${unread ? ` (${unread} non lues)` : ''}`}
                className="relative rounded-2xl p-2.5 text-ink-2 transition hover:bg-surface-hover"
              >
                <Bell className="size-5" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-accent ring-2 ring-[var(--bg)]" />
                )}
              </NavLink>

              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Menu du compte"
                  aria-expanded={menuOpen}
                  className="rounded-full transition hover:opacity-90"
                >
                  <Avatar name={user?.displayName ?? '?'} hue={user?.avatarHue} size={36} />
                </button>
                {menuOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-10 cursor-default"
                      aria-label="Fermer"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="glass-strong absolute right-0 z-20 mt-2 w-56 rounded-2xl p-2 scale-in">
                      <div className="px-3 py-2">
                        <p className="truncate text-sm font-semibold text-ink">{user?.displayName}</p>
                        <p className="truncate text-xs text-ink-3">{user?.email}</p>
                      </div>
                      <div className="my-1 h-px bg-line-soft" />
                      <button
                        type="button"
                        onClick={() => navigate('/app/parametres')}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-2 hover:bg-surface-hover hover:text-ink"
                      >
                        <Settings className="size-4" /> Paramètres
                      </button>
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-2 hover:bg-surface-hover hover:text-ink"
                      >
                        {resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                        {resolvedTheme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-danger hover:bg-danger/10"
                      >
                        <LogOut className="size-4" /> Se déconnecter
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pt-5 pb-28 sm:px-6 sm:pt-7 lg:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-full max-w-6xl"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Navigation mobile"
        className="glass-strong fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t px-2 pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {mobileNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2.5 text-[10px] font-medium transition',
                isActive ? 'text-accent' : 'text-ink-3',
              )
            }
          >
            <item.icon className="size-5" aria-hidden />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2.5 text-[10px] font-medium text-ink-3"
          aria-label="Plus"
        >
          <MoreHorizontal className="size-5" aria-hidden />
          <span>Plus</span>
        </button>
      </nav>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
