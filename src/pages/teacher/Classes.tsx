import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarDays, ClipboardCheck, Users } from 'lucide-react'
import { Badge, GlassCard, PageHeader, Segmented } from '../../components/ui'
import { useData } from '../../providers/DataProvider'
import { formatDate } from '../../utils/dates'
import { cn } from '../../utils/cn'

export function ClassesPage() {
  const { classes } = useData()
  const [params, setParams] = useSearchParams()
  const activeId = params.get('class') ?? classes[0]?.id ?? ''
  const active = classes.find((c) => c.id === activeId) ?? classes[0]
  const [tab, setTab] = useState<'students' | 'stats'>('students')

  const sortedStudents = useMemo(
    () => [...(active?.students ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [active],
  )

  if (!active) return null

  return (
    <div className="page-enter">
      <PageHeader
        title="Mes classes"
        subtitle="Effectifs, moyennes, absences et dernières évaluations."
        actions={
          <Segmented
            ariaLabel="Vue"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'students', label: 'Élèves' },
              { value: 'stats', label: 'Statistiques' },
            ]}
          />
        }
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar" role="tablist" aria-label="Classes">
        {classes.map((cl) => (
          <button
            key={cl.id}
            type="button"
            role="tab"
            aria-selected={cl.id === active.id}
            onClick={() => setParams({ class: cl.id })}
            className={cn(
              'glass-subtle inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition',
              cl.id === active.id
                ? 'bg-accent text-accent-contrast'
                : 'text-ink-2 hover:bg-surface-hover',
            )}
          >
            <Users className="size-4" aria-hidden />
            {cl.name}
            <span className="text-xs opacity-75">{cl.students.length}</span>
          </button>
        ))}
      </div>

      <div className="stagger mb-4 grid gap-3 sm:grid-cols-3">
        <GlassCard className="p-4">
          <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">Moyenne de classe</p>
          <p className="mt-2 text-3xl font-semibold text-ink">
            {active.average.toFixed(1).replace('.', ',')}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">Absences cumulées</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{active.absences}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">Dernière évaluation</p>
          {active.lastEvaluation ? (
            <>
              <p className="mt-2 text-sm font-semibold text-ink">{active.lastEvaluation.title}</p>
              <p className="text-xs text-ink-3">
                {formatDate(active.lastEvaluation.date)} · moy.{' '}
                {active.lastEvaluation.classAverage.toFixed(1).replace('.', ',')}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-ink-3">Aucune</p>
          )}
        </GlassCard>
      </div>

      {tab === 'students' ? (
        <GlassCard className="overflow-hidden">
          <div className="border-b border-line-soft px-5 py-4">
            <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">
              Élèves de {active.name}
            </p>
          </div>
          <ul className="divide-y divide-line-soft">
            {sortedStudents.map((s) => (
              <li key={s.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-softer text-xs font-bold text-accent">
                  {s.name
                    .split(' ')
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{s.name}</p>
                  <p className="text-xs text-ink-3">
                    {s.absences} absence{s.absences > 1 ? 's' : ''}
                  </p>
                </div>
                <Badge
                  tone={s.average >= 14 ? 'success' : s.average >= 10 ? 'info' : 'danger'}
                >
                  {s.average.toFixed(1).replace('.', ',')}
                </Badge>
              </li>
            ))}
          </ul>
        </GlassCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard className="p-5">
            <p className="mb-4 text-xs font-semibold tracking-wide text-ink-3 uppercase">
              Répartition des moyennes
            </p>
            <ul className="space-y-3">
              {[
                { label: '≥ 14', count: active.students.filter((s) => s.average >= 14).length, tone: 'bg-success' },
                { label: '12 – 13,9', count: active.students.filter((s) => s.average >= 12 && s.average < 14).length, tone: 'bg-info' },
                { label: '10 – 11,9', count: active.students.filter((s) => s.average >= 10 && s.average < 12).length, tone: 'bg-warning' },
                { label: '< 10', count: active.students.filter((s) => s.average < 10).length, tone: 'bg-danger' },
              ].map((b) => (
                <li key={b.label} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-ink-3">{b.label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-strong">
                    <div
                      className={cn('h-full rounded-full', b.tone)}
                      style={{ width: `${(b.count / active.students.length) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-semibold text-ink">{b.count}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="p-5">
            <p className="mb-4 text-xs font-semibold tracking-wide text-ink-3 uppercase">
              Dernières évaluations
            </p>
            <ul className="space-y-3">
              {classes
                .filter((c) => c.lastEvaluation)
                .map((c) => (
                  <li key={c.id} className="flex items-start gap-3 rounded-2xl border border-line-soft bg-surface-strong/50 px-4 py-3">
                    <CalendarDays className="mt-0.5 size-4 text-accent" aria-hidden />
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {c.lastEvaluation!.title} — {c.name}
                      </p>
                      <p className="text-xs text-ink-3">
                        {formatDate(c.lastEvaluation!.date)} · moyenne{' '}
                        {c.lastEvaluation!.classAverage.toFixed(1).replace('.', ',')}
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink-3">
              <ClipboardCheck className="size-3.5" aria-hidden />
              Élèves fictifs en mode démonstration.
            </p>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
