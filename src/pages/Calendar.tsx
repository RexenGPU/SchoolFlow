import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge, GlassCard, PageHeader, Segmented } from '../components/ui'
import { useData } from '../providers/DataProvider'
import {
  addDays,
  DAYS_SHORT,
  formatDate,
  formatMonthLabel,
  isSameDay,
  monthGrid,
  startOfWeek,
  toISO,
  todayISO,
  weekDates,
} from '../utils/dates'
import { cn } from '../utils/cn'
import type { EventType, SchoolEvent } from '../types'

type View = 'month' | 'week' | 'day'

const typeStyles: Record<EventType, { label: string; cls: string }> = {
  course: { label: 'Cours', cls: 'bg-info/15 text-info border-info/25' },
  homework: { label: 'Devoir', cls: 'bg-warning/15 text-warning border-warning/25' },
  eval: { label: 'Évaluation', cls: 'bg-danger/15 text-danger border-danger/25' },
  event: { label: 'Événement', cls: 'bg-accent/15 text-accent border-accent/25' },
  vacation: { label: 'Vacances', cls: 'bg-success/15 text-success border-success/25' },
}

export function CalendarPage() {
  const { events, courses } = useData()
  const [view, setView] = useState<View>('month')
  const [anchor, setAnchor] = useState(() => new Date())
  const [selected, setSelected] = useState<SchoolEvent | null>(null)

  const today = todayISO()

  const allEvents = useMemo(() => {
    const courseEvents: SchoolEvent[] = courses
      .filter((c) => !c.cancelled)
      .map((c) => ({
        id: `ce-${c.id}`,
        title: c.subject,
        date: dateForWeekday(c.day),
        time: c.start,
        type: 'course' as const,
        subject: c.subject,
        description: `${c.start} — ${c.end} · ${c.room} · ${c.teacher}`,
      }))
    return [...events, ...courseEvents].sort((a, b) => a.date.localeCompare(b.date))
  }, [events, courses])

  const grid = monthGrid(anchor)
  const week = weekDates(anchor)
  const day = anchor

  const eventsOn = (d: Date) => {
    const iso = toISO(d)
    return allEvents.filter((e) => {
      if (e.date === iso) return true
      if (e.end && e.date <= iso && iso <= e.end) return true
      return false
    })
  }

  const dayEvents = (d: Date) => eventsOn(d)

  function shift(dir: number) {
    setAnchor((a) => {
      if (view === 'month') return new Date(a.getFullYear(), a.getMonth() + dir, 1)
      if (view === 'week') return addDays(a, dir * 7)
      return addDays(a, dir)
    })
  }

  const title =
    view === 'month'
      ? formatMonthLabel(anchor)
      : view === 'week'
        ? `${formatDate(toISO(week[0]!), { long: true })} → ${formatDate(toISO(week[6]!), { long: true })}`
        : formatDate(toISO(anchor), { long: true, weekday: true })

  const legend = (['homework', 'eval', 'event', 'vacation', 'course'] as EventType[]).map((t) => ({
    type: t,
    ...typeStyles[t],
  }))

  return (
    <div className="page-enter">
      <PageHeader
        title="Calendrier"
        subtitle="Cours, devoirs, évaluations, événements et vacances."
        actions={
          <div className="flex items-center gap-2">
            <Segmented
              ariaLabel="Vue du calendrier"
              value={view}
              onChange={setView}
              options={[
                { value: 'month', label: 'Mois' },
                { value: 'week', label: 'Semaine' },
                { value: 'day', label: 'Jour' },
              ]}
            />
            <div className="glass-subtle flex items-center gap-1 rounded-2xl p-1">
              <button
                type="button"
                onClick={() => shift(-1)}
                className="rounded-xl p-2 text-ink-2 hover:bg-surface-hover"
                aria-label="Précédent"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setAnchor(new Date())}
                className="rounded-xl px-3 py-1.5 text-xs font-medium text-ink-2 hover:bg-surface-hover"
              >
                Aujourd'hui
              </button>
              <button
                type="button"
                onClick={() => shift(1)}
                className="rounded-xl p-2 text-ink-2 hover:bg-surface-hover"
                aria-label="Suivant"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        }
      />

      <div className="mb-3 flex flex-wrap gap-2">
        {legend.map((l) => (
          <span
            key={l.type}
            className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium', l.cls)}
          >
            {l.label}
          </span>
        ))}
      </div>

      <GlassCard className="overflow-hidden p-0">
        <div className="border-b border-line-soft px-5 py-3.5">
          <p className="text-sm font-semibold text-ink">{title}</p>
        </div>

        {view === 'month' && (
          <div>
            <div className="grid grid-cols-7 border-b border-line-soft">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <div key={d} className="px-1 py-2.5 text-center text-[11px] font-semibold text-ink-3 uppercase">
                  {DAYS_SHORT[d]}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {grid.map((d) => {
                const evs = dayEvents(d)
                const inMonth = d.getMonth() === anchor.getMonth()
                return (
                  <button
                    key={toISO(d)}
                    type="button"
                    onClick={() => {
                      setAnchor(d)
                      setView('day')
                    }}
                    className={cn(
                      'min-h-24 border-r border-b border-line-soft p-1.5 text-left transition hover:bg-surface-hover',
                      !inMonth && 'opacity-40',
                      isSameDay(d, new Date()) && 'bg-accent-softer',
                    )}
                    aria-label={`${formatDate(toISO(d), { long: true })}, ${evs.length} événement(s)`}
                  >
                    <span
                      className={cn(
                        'inline-flex size-6 items-center justify-center rounded-full text-xs font-medium',
                        toISO(d) === today && 'bg-accent text-accent-contrast',
                      )}
                    >
                      {d.getDate()}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {evs.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          className={cn(
                            'truncate rounded-md border px-1 py-0.5 text-[9px] font-medium',
                            typeStyles[e.type].cls,
                          )}
                        >
                          {e.time ? `${e.time} ` : ''}
                          {e.title}
                        </div>
                      ))}
                      {evs.length > 2 && (
                        <p className="px-0.5 text-[9px] text-ink-3">+{evs.length - 2} de plus</p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {view === 'week' && (
          <div className="overflow-x-auto">
            <div className="grid min-w-[700px] grid-cols-7">
              {week.map((d) => {
                const evs = dayEvents(d)
                return (
                  <div key={toISO(d)} className="border-r border-line-soft last:border-0">
                    <div
                      className={cn(
                        'border-b border-line-soft px-2 py-2.5 text-center',
                        toISO(d) === today && 'bg-accent-softer',
                      )}
                    >
                      <p className="text-[10px] font-semibold uppercase text-ink-3">{DAYS_SHORT[d.getDay()]}</p>
                      <p className="text-sm font-semibold text-ink">{d.getDate()}</p>
                    </div>
                    <div className="min-h-48 space-y-1.5 p-1.5">
                      {evs.map((e) => (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => setSelected(e)}
                          className={cn(
                            'w-full rounded-lg border px-1.5 py-1.5 text-left text-[10px] font-medium transition hover:brightness-105',
                            typeStyles[e.type].cls,
                          )}
                        >
                          {e.time && <span className="block opacity-80">{e.time}</span>}
                          <span className="block truncate">{e.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {view === 'day' && (
          <div className="p-4">
            <ul className="space-y-2.5">
              {dayEvents(day).map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(e)}
                    className="flex w-full items-start gap-3 rounded-2xl border border-line-soft bg-surface-strong/50 px-4 py-3 text-left transition hover:bg-surface-hover"
                  >
                    <span
                      className={cn(
                        'mt-0.5 inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                        typeStyles[e.type].cls,
                      )}
                    >
                      {typeStyles[e.type].label}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink">{e.title}</span>
                      <span className="block text-xs text-ink-3">
                        {e.allDay ? 'Journée' : e.time ?? formatDate(e.date)}
                        {e.subject ? ` · ${e.subject}` : ''}
                      </span>
                      {e.description && (
                        <span className="mt-0.5 block text-xs text-ink-2">{e.description}</span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
              {dayEvents(day).length === 0 && (
                <li className="rounded-2xl border border-dashed border-line-soft py-12 text-center text-sm text-ink-3">
                  Aucun événement ce jour-là.
                </li>
              )}
            </ul>
          </div>
        )}
      </GlassCard>

      {selected && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/35 backdrop-blur-sm"
            onClick={() => setSelected(null)}
            aria-label="Fermer"
          />
          <div className="glass-strong relative z-10 m-4 w-full max-w-md rounded-3xl p-6 scale-in">
            <Badge className={cn('mb-3', typeStyles[selected.type].cls)}>
              {typeStyles[selected.type].label}
            </Badge>
            <h2 className="text-lg font-semibold text-ink">{selected.title}</h2>
            <p className="mt-1 text-sm text-ink-2">
              {formatDate(selected.date, { long: true, weekday: true })}
              {selected.time ? ` · ${selected.time}` : ''}
              {selected.allDay ? ' · Journée' : ''}
            </p>
            {selected.subject && <p className="mt-1 text-sm text-ink-3">{selected.subject}</p>}
            {selected.description && (
              <p className="mt-3 text-sm leading-relaxed text-ink-2">{selected.description}</p>
            )}
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-5 h-11 w-full rounded-2xl bg-accent text-sm font-medium text-accent-contrast"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function dateForWeekday(day: number): string {
  const now = new Date()
  const start = startOfWeek(now)
  const offset = day === 0 ? 6 : day - 1
  return toISO(addDays(start, offset))
}
