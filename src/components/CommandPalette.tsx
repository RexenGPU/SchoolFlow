import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Command,
  FileText,
  GraduationCap,
  MessageSquare,
  Moon,
  RefreshCw,
  Search,
  Sun,
  User,
} from 'lucide-react'
import { buildSearchIndex, searchItems } from '../services/search'
import { useTheme } from '../providers/ThemeProvider'
import { useAuth } from '../providers/AuthProvider'
import { useData } from '../providers/DataProvider'
import type { SearchableItem } from '../types'
import { cn } from '../utils/cn'

interface CommandDef {
  id: string
  label: string
  hint?: string
  icon: typeof Search
  run: () => void
  keywords?: string
}

const typeIcons: Record<SearchableItem['type'], typeof Search> = {
  course: Clock,
  homework: BookOpen,
  grade: GraduationCap,
  document: FileText,
  message: MessageSquare,
  student: User,
  page: ChevronRight,
  event: Calendar,
}

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const { settings, toggleTheme, resolvedTheme } = useTheme()
  const { user } = useAuth()
  const data = useData()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const extra: SearchableItem[] = useMemo(() => {
    if (!user || user.role !== 'student') return []
    return data.grades
      .slice(0, 5)
      .concat()
      .map((g) => ({
        id: `sg-${g.id}`,
        title: `${g.subject} — ${g.value}/20`,
        subtitle: g.title,
        type: 'grade' as const,
        section: 'Mes notes',
        href: '/app/notes',
      }))
  }, [user, data.grades])

  const index = useMemo(() => buildSearchIndex(extra), [extra])
  const results = useMemo(() => searchItems(index, query), [index, query])

  const commands = useMemo<CommandDef[]>(() => {
    const go = (path: string) => () => {
      navigate(path)
      onClose()
    }
    const list: CommandDef[] = [
      { id: 'cmd-notes', label: 'Aller aux notes', icon: GraduationCap, run: go('/app/notes'), keywords: 'notes moyennes notes' },
      { id: 'cmd-tt', label: "Ouvrir l'emploi du temps", icon: Clock, run: go('/app/emploi-du-temps'), keywords: 'horaire cours semaine' },
      { id: 'cmd-hw', label: 'Nouveau devoir', icon: BookOpen, run: go('/app/nouveau-devoir'), keywords: 'creer homework publier' },
      { id: 'cmd-doc', label: 'Rechercher un document', icon: FileText, run: go('/app/documents'), keywords: 'fichier pdf dossier' },
      { id: 'cmd-dark', label: resolvedTheme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre', icon: resolvedTheme === 'dark' ? Sun : Moon, run: () => { toggleTheme(); onClose() }, keywords: 'theme sombre clair dark light' },
      { id: 'cmd-sync', label: 'Synchroniser', icon: RefreshCw, run: go('/app/synchronisation'), keywords: 'sync update mettre a jour' },
      { id: 'cmd-cal', label: 'Ouvrir le calendrier', icon: Calendar, run: go('/app/calendrier') },
      { id: 'cmd-msg', label: 'Ouvrir la messagerie', icon: MessageSquare, run: go('/app/messages') },
      { id: 'cmd-set', label: 'Ouvrir les paramètres', icon: Command, run: go('/app/parametres') },
    ]
    if (user?.role === 'teacher') {
      list.unshift(
        { id: 'cmd-classes', label: 'Gérer mes classes', icon: User, run: go('/app/classes') },
        { id: 'cmd-grades', label: 'Saisir des notes', icon: GraduationCap, run: go('/app/saisie-notes') },
        { id: 'cmd-call', label: "Faire l'appel", icon: CheckCircle2, run: go('/app/appel') },
      )
    }
    return list
  }, [navigate, onClose, resolvedTheme, toggleTheme, user?.role])

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || (c.keywords ?? '').toLowerCase().includes(q),
    )
  }, [commands, query])

  const merged = useMemo(() => {
    const cmdItems: SearchableItem[] = filteredCommands.map((c) => ({
      id: c.id,
      title: c.label,
      subtitle: 'Commande',
      type: 'page' as const,
      section: 'Commandes',
      keywords: c.keywords,
    }))
    if (!query.trim()) return [...cmdItems, ...results.slice(0, 8)]
    return [...cmdItems, ...results]
  }, [filteredCommands, results, query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      const t = window.setTimeout(() => inputRef.current?.focus(), 40)
      return () => window.clearTimeout(t)
    }
  }, [open])

  useEffect(() => setActive(0), [query])

  const runItem = (item: SearchableItem) => {
    const cmd = filteredCommands.find((c) => c.id === item.id)
    if (cmd) {
      cmd.run()
      return
    }
    if (item.href) {
      navigate(item.href)
      onClose()
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, merged.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = merged[active]
      if (item) runItem(item)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!open) return null

  let lastSection = ''

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[12vh]">
        <button
          type="button"
          aria-label="Fermer la recherche"
          className="absolute inset-0 bg-black/40 backdrop-blur-md fade-in"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          role="dialog"
          aria-modal="true"
          aria-label="Recherche globale et commandes"
          className="glass-panel relative z-10 w-full max-w-xl overflow-hidden rounded-3xl"
        >
          <div className="flex items-center gap-3 border-b border-line-soft px-4 py-3.5">
            <Search className="size-5 shrink-0 text-ink-3" aria-hidden />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Rechercher un cours, un devoir, une note…"
              className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-3"
              aria-label="Recherche"
              autoComplete="off"
            />
            <kbd className="hidden rounded-lg border border-line-soft bg-surface-strong px-2 py-0.5 text-[11px] text-ink-3 sm:block">
              Esc
            </kbd>
          </div>

          <div className="max-h-[52vh] overflow-y-auto p-2" role="listbox">
            {merged.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-ink-3">Aucun résultat pour « {query} »</p>
            )}
            {merged.map((item, i) => {
              const Icon = typeIcons[item.type]
              const showSection = item.section !== lastSection
              if (showSection) lastSection = item.section ?? ''
              return (
                <div key={item.id}>
                  {showSection && item.section && (
                    <p className="px-3 pt-3 pb-1 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">
                      {item.section}
                    </p>
                  )}
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => runItem(item)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition',
                      i === active ? 'bg-accent-softer text-ink' : 'text-ink-2 hover:bg-surface-hover',
                    )}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface-strong border border-line-soft">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{item.title}</span>
                      {item.subtitle && (
                        <span className="block truncate text-xs text-ink-3">{item.subtitle}</span>
                      )}
                    </span>
                    {i === active && <ChevronRight className="size-4 text-accent" aria-hidden />}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between border-t border-line-soft px-4 py-2.5 text-[11px] text-ink-3">
            <span className="inline-flex items-center gap-1.5">
              <kbd className="rounded border border-line-soft px-1.5 py-0.5">↑↓</kbd> naviguer
              <kbd className="ml-2 rounded border border-line-soft px-1.5 py-0.5">↵</kbd> ouvrir
            </span>
            <span>Ctrl + K · {settings.theme === 'auto' ? 'Auto' : settings.theme}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
