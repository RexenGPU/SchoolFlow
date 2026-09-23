import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, User, XCircle } from 'lucide-react'
import { Badge, Button, Modal, PageHeader, Segmented } from '../components/ui'
import { useData } from '../providers/DataProvider'
import { COURSE_SLOTS, subjectColor } from '../data/demo'
import { addDays, DAYS_SHORT, formatDate, weekDates, toISO, todayISO } from '../utils/dates'
import { cn } from '../utils/cn'
import type { Course } from '../types'

type ViewMode = 'week' | 'day'

export function TimetablePage() {
  const { courses } = useData()
  const [mode, setMode] = useState<ViewMode>('week')
  const [anchor, setAnchor] = useState(() => new Date())
  const [direction, setDirection] = useState(1)
  const [selected, setSelected] = useState<Course | null>(null)
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDay() || 1)

  const days = useMemo(() => weekDates(anchor), [anchor])
  const today = todayISO()

  function shift(dir: number) {
    setDirection(dir)
    setAnchor((d) => addDays(d, mode === 'week' ? dir * 7 : dir))
  }

  const dayCourses = (dayIdx: number) =>
    courses
      .filter((c) => c.day === dayIdx)
      .sort((a, b) => a.start.localeCompare(b.start))

  const daySlots = useMemo(() => {
    const used = new Set<string>()
    courses.forEach((c) => used.add(`${c.start}-${c.end}`))
    return COURSE_SLOTS.filter((s) => used.has(`${s.start}-${s.end}`) || true)
  }, [courses])

  return (
    <div className="page-enter">
      <PageHeader
        title="Emploi du temps"
        subtitle="Cours, salles, professeurs et modifications de la semaine."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              ariaLabel="Mode d'affichage"
              value={mode}
              onChange={(v) => setMode(v)}
              options={[
                { value: 'day', label: 'Jour' },
                { value: 'week', label: 'Semaine' },
              ]}
            />
            <div className="glass-subtle flex items-center gap-1 rounded-2xl p-1">
              <button
                type="button"
                onClick={() => shift(-1)}
                className="rounded-xl p-2 text-ink-2 transition hover:bg-surface-hover"
                aria-label="Période précédente"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setAnchor(new Date())
                  setSelectedDay(new Date().getDay() || 1)
                }}
                className="rounded-xl px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:bg-surface-hover"
              >
                Aujourd'hui
              </button>
              <button
                type="button"
                onClick={() => shift(1)}
                className="rounded-xl p-2 text-ink-2 transition hover:bg-surface-hover"
                aria-label="Période suivante"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        }
      />

      {mode === 'day' && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {days.map((d, i) => {
            const dayIdx = d.getDay() || 7
            const isActive = dayIdx === selectedDay
            return (
              <button
                key={toISO(d)}
                type="button"
                onClick={() => setSelectedDay(dayIdx)}
                className={cn(
                  'glass-subtle flex min-w-16 flex-col items-center rounded-2xl px-3 py-2.5 transition',
                  isActive ? 'bg-accent text-accent-contrast border-accent/40' : 'text-ink-2 hover:bg-surface-hover',
                )}
              >
                <span className="text-[10px] font-semibold uppercase">{DAYS_SHORT[d.getDay()]}</span>
                <span className="text-base font-semibold">{d.getDate()}</span>
                {i === days.findIndex((x) => toISO(x) === today) && (
                  <span className={cn('mt-0.5 size-1.5 rounded-full', isActive ? 'bg-white' : 'bg-accent')} />
                )}
              </button>
            )
          })}
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${mode}-${toISO(anchor)}-${selectedDay}`}
          initial={{ opacity: 0, x: direction * 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -12 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          {mode === 'week' ? (
            <div className="glass overflow-hidden rounded-3xl">
              <div className="grid grid-cols-[64px_repeat(5,minmax(0,1fr))] border-b border-line-soft bg-surface-strong/50">
                <div />
                {days.slice(0, 5).map((d) => (
                  <div
                    key={toISO(d)}
                    className={cn(
                      'px-2 py-3 text-center border-l border-line-soft',
                      toISO(d) === today && 'bg-accent-softer',
                    )}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">
                      {DAYS_SHORT[d.getDay()]}
                    </p>
                    <p className={cn('text-sm font-semibold', toISO(d) === today ? 'text-accent' : 'text-ink')}>
                      {d.getDate()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="relative max-h-[65vh] overflow-y-auto">
                {daySlots.map((slot) => (
                  <div
                    key={`${slot.start}-${slot.end}`}
                    className="grid min-h-20 grid-cols-[64px_repeat(5,minmax(0,1fr))] border-b border-line-soft last:border-0"
                  >
                    <div className="flex items-start justify-center px-1 py-2">
                      <span className="text-[11px] font-medium text-ink-3">{slot.start}</span>
                    </div>
                    {[1, 2, 3, 4, 5].map((day) => {
                      const course = courses.find(
                        (c) => c.day === day && c.start === slot.start && c.end === slot.end,
                      )
                      return (
                        <div key={day} className="border-l border-line-soft p-1">
                          {course && (
                            <button
                              type="button"
                              onClick={() => setSelected(course)}
                              className={cn(
                                'group w-full rounded-xl p-2 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-md',
                                course.cancelled && 'opacity-60',
                              )}
                              style={{
                                background: `linear-gradient(145deg, ${subjectColor(course.subject)}26, ${subjectColor(course.subject)}12)`,
                                boxShadow: `inset 0 0 0 1px ${subjectColor(course.subject)}40`,
                              }}
                            >
                              <span
                                className="mb-1 block size-2 rounded-full"
                                style={{ background: subjectColor(course.subject) }}
                                aria-hidden
                              />
                              <span
                                className={cn(
                                  'block truncate text-[13px] font-semibold text-ink',
                                  course.cancelled && 'line-through',
                                )}
                              >
                                {course.subject}
                              </span>
                              <span className="block truncate text-[11px] text-ink-3">{course.room}</span>
                              <span className="block truncate text-[11px] text-ink-3">{course.teacher}</span>
                              {course.cancelled && (
                                <span className="mt-1 inline-block rounded-md bg-danger/15 px-1.5 py-0.5 text-[10px] font-semibold text-danger">
                                  Annulé
                                </span>
                              )}
                              {course.modified && (
                                <span className="mt-1 inline-block rounded-md bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
                                  Modifié
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass rounded-3xl p-4">
              <p className="mb-3 text-sm font-semibold text-ink">
                {formatDate(toISO(days.find((d) => (d.getDay() || 7) === selectedDay) ?? days[0]), {
                  long: true,
                  weekday: true,
                })}
              </p>
              <ul className="space-y-3">
                {dayCourses(selectedDay).map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(c)}
                      className="flex w-full items-start gap-4 rounded-2xl border border-line-soft bg-surface-strong/50 p-4 text-left transition hover:bg-surface-hover"
                      style={{ borderLeft: `4px solid ${subjectColor(c.subject)}` }}
                    >
                      <span className="w-20 shrink-0 text-sm font-semibold text-ink-3">
                        {c.start}
                        <br />
                        {c.end}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-semibold text-ink">{c.subject}</span>
                        <span className="block text-sm text-ink-2">{c.teacher}</span>
                        <span className="block text-sm text-ink-3">Salle {c.room}</span>
                      </span>
                      {c.cancelled && <Badge tone="danger">Annulé</Badge>}
                      {c.modified && <Badge tone="warning">Modifié</Badge>}
                    </button>
                  </li>
                ))}
                {dayCourses(selectedDay).length === 0 && (
                  <li className="rounded-2xl border border-dashed border-line-soft py-10 text-center text-sm text-ink-3">
                    Aucun cours ce jour-là.
                  </li>
                )}
              </ul>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.subject ?? ''}
        footer={
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Fermer
          </Button>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div
              className="rounded-2xl p-4"
              style={{
                background: `linear-gradient(145deg, ${subjectColor(selected.subject)}22, transparent)`,
                boxShadow: `inset 0 0 0 1px ${subjectColor(selected.subject)}35`,
              }}
            >
              <p className="text-lg font-semibold text-ink">
                {selected.start} — {selected.end}
              </p>
              <p className="text-sm text-ink-2">
                {formatDate(todayISO(), { weekday: true, long: true })} · jour {selected.day}
              </p>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center gap-2.5">
                <User className="size-4 text-ink-3" aria-hidden />
                <dt className="sr-only">Professeur</dt>
                <dd className="text-ink">{selected.teacher}</dd>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="size-4 text-ink-3" aria-hidden />
                <dt className="sr-only">Salle</dt>
                <dd className="text-ink">Salle {selected.room}</dd>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="size-4 text-ink-3" aria-hidden />
                <dt className="sr-only">Durée</dt>
                <dd className="text-ink">
                  {selected.start} — {selected.end}
                </dd>
              </div>
            </dl>
            {selected.cancelled && (
              <p className="flex items-start gap-2 rounded-2xl border border-danger/25 bg-danger/10 px-3.5 py-3 text-sm text-danger">
                <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                {selected.modificationNote ?? 'Cours annulé.'}
              </p>
            )}
            {selected.modified && (
              <p className="flex items-start gap-2 rounded-2xl border border-warning/25 bg-warning/10 px-3.5 py-3 text-sm text-warning">
                <CalendarDays className="mt-0.5 size-4 shrink-0" aria-hidden />
                {selected.modificationNote ?? 'Cours modifié.'}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
