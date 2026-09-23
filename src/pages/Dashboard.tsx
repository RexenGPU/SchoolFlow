import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  FileStack,
  GraduationCap,
  MessageSquare,
  PenLine,
  PlusCircle,
  TrendingUp,
  Users,
  ClipboardList,
  CalendarDays,
} from 'lucide-react'
import { Avatar, Badge, GlassCard, PageHeader } from '../components/ui'
import { useAuth } from '../providers/AuthProvider'
import { useData } from '../providers/DataProvider'
import { greetByHour, formatDate, relativeTime, todayISO, parseISO } from '../utils/dates'
import { weightedAverage } from '../utils/grades'
import { subjectColor } from '../data/demo'
import { cn } from '../utils/cn'

export function DashboardPage() {
  const { user } = useAuth()
  if (user?.role === 'teacher') return <TeacherDashboard />
  return <StudentDashboard />
}

/* ------------------------------------------------------------------ */
/*  Student                                                             */
/* ------------------------------------------------------------------ */
function StudentDashboard() {
  const { user } = useAuth()
  const { courses, grades, homeworks, absences, conversations, events, notifications } = useData()
  const today = new Date()
  const jsDay = today.getDay()
  const todayCourses = useMemo(
    () => courses.filter((c) => c.day === jsDay && !c.cancelled).sort((a, b) => a.start.localeCompare(b.start)),
    [courses, jsDay],
  )

  const nowMinutes = today.getHours() * 60 + today.getMinutes()
  const nextCourse =
    todayCourses.find((c) => {
      const [h, m] = c.start.split(':').map(Number)
      return h * 60 + m >= nowMinutes
    }) ?? todayCourses[0]

  const avg = weightedAverage(grades.map((g) => ({ value: g.value, coef: g.coef })))
  const openHw = homeworks.filter((h) => h.status === 'todo')
  const unreadMsg = conversations.reduce((s, c) => s + c.unread, 0)
  const unreadNotif = notifications.filter((n) => !n.read).length
  const upcoming = events
    .filter((e) => e.date >= todayISO())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  const stats = [
    { label: 'Moyenne générale', value: avg.toFixed(1).replace('.', ','), suffix: '/ 20', icon: TrendingUp, href: '/app/notes', tone: 'text-accent' },
    { label: 'Devoirs', value: String(openHw.length), suffix: 'à venir', icon: BookOpen, href: '/app/devoirs', tone: 'text-warning' },
    { label: 'Absences', value: String(absences.length), suffix: 'cumulées', icon: ClipboardCheck, href: '/app/absences', tone: 'text-danger' },
    { label: 'Messages', value: String(unreadMsg), suffix: 'non lus', icon: MessageSquare, href: '/app/messages', tone: 'text-info' },
  ]

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow={formatDate(todayISO(), { weekday: true, long: true })}
        title={`${greetByHour()}, ${user?.firstName} 👋`}
        subtitle={
          user?.className
            ? `Classe de ${user.className} · ${user.establishment}`
            : user?.establishment
        }
        actions={
          unreadNotif > 0 ? (
            <Link to="/app/notifications">
              <Badge tone="accent">{unreadNotif} notification{unreadNotif > 1 ? 's' : ''}</Badge>
            </Link>
          ) : undefined
        }
      />

      <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.href}>
            <GlassCard interactive className="p-5">
              <div className="flex items-start justify-between">
                <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">{s.label}</p>
                <s.icon className={cn('size-4.5', s.tone)} aria-hidden />
              </div>
              <p className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold tracking-tight text-ink">{s.value}</span>
                <span className="text-xs text-ink-3">{s.suffix}</span>
              </p>
            </GlassCard>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Next course */}
        <GlassCard className="p-5 lg:col-span-2 glass-reflection" reflection>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">Prochain cours</p>
              {nextCourse ? (
                <>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                    {nextCourse.subject}
                  </p>
                  <p className="mt-1 text-sm text-ink-2">
                    {nextCourse.start} — {nextCourse.end}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-accent">Salle {nextCourse.room}</p>
                  <p className="mt-0.5 text-xs text-ink-3">{nextCourse.teacher}</p>
                </>
              ) : (
                <p className="mt-3 text-base text-ink-2">Aucun cours restant aujourd'hui 🎉</p>
              )}
            </div>
            <div
              className="hidden size-20 shrink-0 items-center justify-center rounded-3xl text-white shadow-lg sm:flex"
              style={{
                background: nextCourse
                  ? `linear-gradient(135deg, ${subjectColor(nextCourse.subject)}, color-mix(in oklab, ${subjectColor(nextCourse.subject)} 60%, black))`
                  : 'var(--accent)',
              }}
              aria-hidden
            >
              <CalendarClock className="size-8" />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/app/emploi-du-temps">
              <Badge tone="accent">Emploi du temps <ArrowRight className="size-3" /></Badge>
            </Link>
            <Link to="/app/cahier-de-textes">
              <Badge>Cahier de textes</Badge>
            </Link>
          </div>
        </GlassCard>

        {/* Today's courses */}
        <GlassCard className="p-5">
          <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">Cours du jour</p>
          <ul className="mt-3 space-y-2">
            {todayCourses.length === 0 && (
              <li className="text-sm text-ink-3">Repos — aucun cours aujourd'hui.</li>
            )}
            {todayCourses.slice(0, 5).map((c) => (
              <li key={c.id} className="flex items-center gap-3">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: subjectColor(c.subject) }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{c.subject}</span>
                  <span className="block text-xs text-ink-3">
                    {c.start} — {c.end} · {c.room}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Homework */}
        <GlassCard className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">Prochains devoirs</p>
            <Link to="/app/devoirs" className="text-xs font-medium text-accent hover:underline">
              Tout voir
            </Link>
          </div>
          <ul className="space-y-2.5">
            {openHw.slice(0, 4).map((h) => (
              <li
                key={h.id}
                className="flex items-start gap-3 rounded-2xl border border-line-soft bg-surface-strong/50 px-3.5 py-3"
              >
                <span
                  className="mt-1 size-2.5 shrink-0 rounded-full"
                  style={{ background: subjectColor(h.subject) }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{h.title}</p>
                  <p className="mt-0.5 text-xs text-ink-3">
                    {h.subject} · pour le {formatDate(h.dueDate)}
                  </p>
                </div>
                {h.dueDate < todayISO() && <Badge tone="danger">Retard</Badge>}
              </li>
            ))}
            {openHw.length === 0 && (
              <li className="rounded-2xl border border-dashed border-line-soft px-4 py-6 text-center text-sm text-ink-3">
                Aucun devoir en attente.
              </li>
            )}
          </ul>
        </GlassCard>

        {/* Events */}
        <GlassCard className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">
              Prochains événements
            </p>
            <Link to="/app/calendrier" className="text-xs font-medium text-accent hover:underline">
              Calendrier
            </Link>
          </div>
          <ul className="space-y-2.5">
            {upcoming.map((e) => (
              <li key={e.id} className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-2xl bg-accent-softer text-accent">
                  <span className="text-[10px] font-semibold uppercase leading-none">
                    {parseISO(e.date).toLocaleDateString('fr-FR', { month: 'short' })}
                  </span>
                  <span className="text-sm font-bold leading-tight">{parseISO(e.date).getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{e.title}</p>
                  <p className="text-xs text-ink-3">
                    {e.type === 'vacation'
                      ? 'Vacances'
                      : e.allDay
                        ? 'Journée'
                        : e.time ?? formatDate(e.date)}{' '}
                    · {relativeTime(new Date(e.date).toISOString())}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      {/* Quick actions */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { to: '/app/notes', label: 'Mes notes', icon: GraduationCap },
          { to: '/app/absences', label: 'Absences', icon: ClipboardCheck },
          { to: '/app/documents', label: 'Documents', icon: FileStack },
          { to: '/app/messages', label: 'Messagerie', icon: MessageSquare },
        ].map((a) => (
          <Link key={a.to} to={a.to}>
            <GlassCard interactive className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-accent-softer text-accent">
                <a.icon className="size-4.5" aria-hidden />
              </span>
              <span className="text-sm font-medium text-ink">{a.label}</span>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Teacher                                                             */
/* ------------------------------------------------------------------ */
function TeacherDashboard() {
  const { user } = useAuth()
  const { classes, evaluations, conversations, notifications, homeworks, grades, courses } = useData()
  const jsDay = new Date().getDay()
  const todayCourses = courses
    .filter((c) => c.day === jsDay)
    .sort((a, b) => a.start.localeCompare(b.start))

  const unreadMsg = conversations.reduce((s, c) => s + c.unread, 0)
  const unreadNotif = notifications.filter((n) => !n.read).length
  const toGrade = 7
  const pendingAbsences = 2
  const upcomingEvals = evaluations
    .filter((e) => e.date >= todayISO())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3)

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow={`${formatDate(todayISO(), { weekday: true, long: true })} · ${user?.subject}`}
        title={`Bonjour, Mme ${user?.lastName} 👋`}
        subtitle={user?.establishment}
        actions={
          <>
            <Link to="/app/nouveau-devoir">
              <motion.span whileTap={{ scale: 0.97 }}>
                <span className="inline-flex h-11 items-center gap-2 rounded-2xl bg-accent px-5 text-sm font-medium text-accent-contrast shadow-[0_8px_24px_-8px_var(--accent)]">
                  <PlusCircle className="size-4" aria-hidden />
                  Nouveau devoir
                </span>
              </motion.span>
            </Link>
          </>
        }
      />

      <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Cours du jour', value: String(todayCourses.length), suffix: 'séances', icon: CalendarClock, href: '/app/emploi-du-temps' },
          { label: 'Devoirs à corriger', value: String(toGrade), suffix: 'copies', icon: PenLine, href: '/app/saisie-notes' },
          { label: 'Absences à renseigner', value: String(pendingAbsences), suffix: 'éléves', icon: ClipboardList, href: '/app/appel' },
          { label: 'Messages', value: String(unreadMsg), suffix: 'non lus', icon: MessageSquare, href: '/app/messages' },
        ].map((s) => (
          <Link key={s.label} to={s.href}>
            <GlassCard interactive className="p-5">
              <div className="flex items-start justify-between">
                <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">{s.label}</p>
                <s.icon className="size-4.5 text-accent" aria-hidden />
              </div>
              <p className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold tracking-tight text-ink">{s.value}</span>
                <span className="text-xs text-ink-3">{s.suffix}</span>
              </p>
            </GlassCard>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-2">
          <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">Cours du jour</p>
          <ul className="mt-3 space-y-2">
            {todayCourses.length === 0 && (
              <li className="text-sm text-ink-3">Aucun cours prévu aujourd'hui.</li>
            )}
            {todayCourses.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-2xl border border-line-soft bg-surface-strong/50 px-3.5 py-3"
              >
                <span className="w-24 shrink-0 text-xs font-semibold text-ink-3">
                  {c.start} — {c.end}
                </span>
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: subjectColor(c.subject) }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                  {c.subject} · {c.group ?? 'Classe entière'}
                </span>
                <span className="text-xs text-ink-3">{c.room}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">Mes classes</p>
          <ul className="mt-3 space-y-2">
            {classes.map((cl) => (
              <li key={cl.id}>
                <Link
                  to={`/app/classes?class=${cl.id}`}
                  className="flex items-center justify-between rounded-2xl border border-line-soft bg-surface-strong/50 px-3.5 py-3 transition hover:bg-surface-hover"
                >
                  <span>
                    <span className="block text-sm font-semibold text-ink">{cl.name}</span>
                    <span className="block text-xs text-ink-3">{cl.students.length} élèves</span>
                  </span>
                  <Badge tone={cl.average >= 13 ? 'success' : 'warning'}>
                    {cl.average.toFixed(1).replace('.', ',')}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">
              Prochaines évaluations
            </p>
            <Link to="/app/saisie-notes" className="text-xs font-medium text-accent hover:underline">
              Saisir une note
            </Link>
          </div>
          <ul className="space-y-2.5">
            {upcomingEvals.map((ev) => {
              const cl = classes.find((c) => c.id === ev.classId)
              return (
                <li key={ev.id} className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent-softer text-accent">
                    <CalendarDays className="size-4.5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{ev.title}</p>
                    <p className="text-xs text-ink-3">
                      {cl?.name} · {formatDate(ev.date)} · coef. {ev.coef}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">Actions rapides</p>
            {unreadNotif > 0 && <Badge tone="accent">{unreadNotif} notifs</Badge>}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { to: '/app/appel', label: 'Appel', icon: ClipboardCheck },
              { to: '/app/saisie-notes', label: 'Saisir des notes', icon: PenLine },
              { to: '/app/classes', label: 'Mes classes', icon: Users },
              { to: '/app/nouveau-devoir', label: 'Créer un devoir', icon: PlusCircle },
              { to: '/app/devoirs', label: 'Devoirs publiés', icon: BookOpen },
              { to: '/app/calendrier', label: 'Calendrier', icon: CalendarDays },
            ].map((a) => (
              <Link key={a.to} to={a.to}>
                <GlassCard interactive className="flex h-full flex-col gap-2 px-3.5 py-3">
                  <a.icon className="size-4.5 text-accent" aria-hidden />
                  <span className="text-[13px] font-medium text-ink">{a.label}</span>
                </GlassCard>
              </Link>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="mt-4">
        <GlassCard className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
          <Avatar name={user?.displayName ?? ''} hue={user?.avatarHue} size={48} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">
              {homeworks.filter((h) => h.status === 'todo').length} devoirs actifs ·{' '}
              {grades.length} notes saisies
            </p>
            <p className="text-xs text-ink-3">
              Données de démonstration locales — aucune donnée réelle d'établissement.
            </p>
          </div>
          <Link to="/app/parametres">
            <Badge tone="accent">Paramètres</Badge>
          </Link>
        </GlassCard>
      </div>
    </div>
  )
}
