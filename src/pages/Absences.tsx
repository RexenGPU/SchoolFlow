import { Calendar, CheckCircle2, Clock, Hourglass, XCircle } from 'lucide-react'
import { Badge, GlassCard, PageHeader } from '../components/ui'
import { useData } from '../providers/DataProvider'
import { monthGrid, parseISO, toISO, todayISO, formatMonthLabel, DAYS_SHORT } from '../utils/dates'
import { cn } from '../utils/cn'
import { useState } from 'react'

export function AbsencesPage() {
  const { absences, lates } = useData()
  const [month, setMonth] = useState(() => new Date())

  const grid = monthGrid(month)
  const today = todayISO()
  const absenceDates = new Set(absences.map((a) => a.date))
  const lateDates = new Set(lates.map((l) => l.date))

  const justified = absences.filter((a) => a.status === 'justified').length
  const pending = absences.filter((a) => a.status === 'pending').length

  return (
    <div className="page-enter">
      <PageHeader
        title="Absences et retards"
        subtitle="Historique, justificatifs et suivi de votre assiduité."
      />

      <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Absences', value: absences.length, icon: XCircle, tone: 'text-danger' },
          { label: 'Justifiées', value: justified, icon: CheckCircle2, tone: 'text-success' },
          { label: 'En attente', value: pending, icon: Hourglass, tone: 'text-warning' },
          { label: 'Retards', value: lates.length, icon: Clock, tone: 'text-info' },
        ].map((s) => (
          <GlassCard key={s.label} className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">{s.label}</p>
              <s.icon className={cn('size-4.5', s.tone)} aria-hidden />
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{s.value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">
              Calendrier visuel
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                className="rounded-lg px-2 py-1 text-sm text-ink-2 hover:bg-surface-hover"
                aria-label="Mois précédent"
              >
                ←
              </button>
              <span className="min-w-32 text-center text-sm font-semibold text-ink">
                {formatMonthLabel(month)}
              </span>
              <button
                type="button"
                onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                className="rounded-lg px-2 py-1 text-sm text-ink-2 hover:bg-surface-hover"
                aria-label="Mois suivant"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <span key={d} className="py-1 text-[10px] font-semibold text-ink-3 uppercase">
                {DAYS_SHORT[d]}
              </span>
            ))}
            {grid.map((d) => {
              const iso = toISO(d)
              const inMonth = d.getMonth() === month.getMonth()
              const isAbsent = absenceDates.has(iso)
              const isLate = lateDates.has(iso)
              return (
                <div
                  key={iso}
                  title={isAbsent ? 'Absence' : isLate ? 'Retard' : undefined}
                  className={cn(
                    'relative flex aspect-square items-center justify-center rounded-xl text-xs transition',
                    inMonth ? 'text-ink' : 'text-ink-3/40',
                    iso === today && 'ring-2 ring-accent ring-offset-1 ring-offset-[var(--bg)]',
                    isAbsent && 'bg-danger/18 font-semibold text-danger',
                    isLate && !isAbsent && 'bg-warning/18 font-semibold text-warning',
                    !isAbsent && !isLate && inMonth && 'hover:bg-surface-hover',
                  )}
                >
                  {d.getDate()}
                  {isAbsent && (
                    <span className="absolute bottom-1 size-1 rounded-full bg-danger" aria-hidden />
                  )}
                  {isLate && !isAbsent && (
                    <span className="absolute bottom-1 size-1 rounded-full bg-warning" aria-hidden />
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-danger" /> Absence
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-warning" /> Retard
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-accent" /> Aujourd'hui
            </span>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="overflow-hidden">
            <div className="border-b border-line-soft px-5 py-4">
              <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">Absences</p>
            </div>
            <ul className="divide-y divide-line-soft">
              {absences.map((a) => (
                <li key={a.id} className="flex items-start gap-4 px-5 py-4">
                  <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-2xl bg-danger/12 text-danger">
                    <Calendar className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">
                      {parseISO(a.date).getDate()}{' '}
                      {formatMonthLabel(parseISO(a.date)).split(' ')[0]}
                    </p>
                    <p className="text-xs text-ink-3">
                      {a.from} — {a.to} · {a.duration}
                    </p>
                    {a.reason && <p className="mt-1 text-xs text-ink-2">{a.reason}</p>}
                  </div>
                  <Badge
                    tone={
                      a.status === 'justified' ? 'success' : a.status === 'pending' ? 'warning' : 'danger'
                    }
                  >
                    {a.status === 'justified'
                      ? 'Justifiée'
                      : a.status === 'pending'
                        ? 'En attente'
                        : 'Non justifiée'}
                  </Badge>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="overflow-hidden">
            <div className="border-b border-line-soft px-5 py-4">
              <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">Retards</p>
            </div>
            <ul className="divide-y divide-line-soft">
              {lates.map((r) => (
                <li key={r.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-warning/12 text-warning">
                    <Clock className="size-4.5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">+{r.minutes} minutes</p>
                    <p className="text-xs text-ink-3">
                      {parseISO(r.date).getDate()}{' '}
                      {formatMonthLabel(parseISO(r.date)).split(' ')[0]}
                      {r.reason ? ` · ${r.reason}` : ''}
                    </p>
                  </div>
                  <Badge tone={r.status === 'justified' ? 'success' : 'danger'}>
                    {r.status === 'justified' ? 'Justifié' : 'Non justifié'}
                  </Badge>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
