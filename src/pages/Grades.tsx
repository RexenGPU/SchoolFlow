import { useMemo, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { Badge, GlassCard, PageHeader, Segmented } from '../components/ui'
import { useData } from '../providers/DataProvider'
import { subjectColor } from '../data/demo'
import { formatGrade, gradeLabel, weightedAverage } from '../utils/grades'
import { formatDate } from '../utils/dates'
import { cn } from '../utils/cn'

export function GradesPage() {
  const { grades } = useData()
  const [filter, setFilter] = useState<string>('all')

  const overall = weightedAverage(grades.map((g) => ({ value: g.value, coef: g.coef })))
  const subjects = useMemo(() => {
    const map = new Map<string, { subject: string; items: typeof grades }>()
    grades.forEach((g) => {
      const entry = map.get(g.subject) ?? { subject: g.subject, items: [] }
      entry.items.push(g)
      map.set(g.subject, entry)
    })
    return [...map.values()]
      .map((e) => ({
        ...e,
        average: weightedAverage(e.items.map((g) => ({ value: g.value, coef: g.coef }))),
      }))
      .sort((a, b) => a.subject.localeCompare(b.subject))
  }, [grades])

  const visible = filter === 'all' ? grades : grades.filter((g) => g.subject === filter)
  const sorted = [...visible].sort((a, b) => b.date.localeCompare(a.date))

  // Evolution of overall average over time
  const evolution = useMemo(() => {
    const sortedGrades = [...grades].sort((a, b) => a.date.localeCompare(b.date))
    const acc: { value: number; coef: number }[] = []
    return sortedGrades.map((g) => {
      acc.push({ value: g.value, coef: g.coef })
      return { date: g.date, avg: weightedAverage([...acc]) }
    })
  }, [grades])

  const maxAvg = Math.max(20, ...evolution.map((e) => e.avg))
  const path = evolution.length > 1
    ? evolution
        .map((p, i) => {
          const x = (i / (evolution.length - 1)) * 100
          const y = 100 - (p.avg / maxAvg) * 100
          return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
        })
        .join(' ')
    : ''

  return (
    <div className="page-enter">
      <PageHeader
        title="Notes"
        subtitle="Toutes vos évaluations, coefficients et moyennes."
        actions={
          <Segmented
            ariaLabel="Filtrer par matière"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'Toutes' },
              ...subjects.map((s) => ({ value: s.subject, label: s.subject.split(' ')[0] })),
            ]}
          />
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-6 lg:col-span-1 glass-reflection" reflection>
          <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">Moyenne générale</p>
          <p className="mt-3 flex items-end gap-2">
            <span className="text-5xl font-semibold tracking-tight text-ink">
              {overall.toFixed(1).replace('.', ',')}
            </span>
            <span className="mb-1.5 text-lg text-ink-3">/ 20</span>
          </p>
          <p className="mt-2 text-sm font-medium text-accent">{gradeLabel(overall)}</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-strong border border-line-soft">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-400 transition-all duration-700"
              style={{ width: `${(overall / 20) * 100}%` }}
            />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-surface-strong/60 p-3">
              <p className="text-lg font-semibold text-ink">{grades.length}</p>
              <p className="text-[11px] text-ink-3">évaluations</p>
            </div>
            <div className="rounded-2xl bg-surface-strong/60 p-3">
              <p className="text-lg font-semibold text-ink">
                {Math.max(...grades.map((g) => g.value), 0).toString().replace('.', ',')}
              </p>
              <p className="text-[11px] text-ink-3">meilleure note</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">
              Évolution de la moyenne
            </p>
            <TrendingUp className="size-4 text-accent" aria-hidden />
          </div>
          {evolution.length > 1 ? (
            <>
              <div className="relative h-44 w-full">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
                  {[0, 25, 50, 75, 100].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      x2="100"
                      y1={y}
                      y2={y}
                      stroke="var(--border-soft)"
                      strokeWidth="0.4"
                    />
                  ))}
                  <path
                    d={path}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d={`${path} L 100 100 L 0 100 Z`}
                    fill="url(#gradeFill)"
                    opacity="0.18"
                    stroke="none"
                  />
                  <defs>
                    <linearGradient id="gradeFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-ink-3">
                <span>{formatDate(evolution[0].date)}</span>
                <span>{formatDate(evolution[evolution.length - 1].date)}</span>
              </div>
            </>
          ) : (
            <p className="py-10 text-center text-sm text-ink-3">Pas encore assez de données.</p>
          )}
        </GlassCard>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => (
          <GlassCard key={s.subject} interactive className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ background: subjectColor(s.subject) }}
                  aria-hidden
                />
                <p className="truncate text-sm font-semibold text-ink">{s.subject}</p>
              </div>
              <span
                className={cn(
                  'text-lg font-semibold',
                  s.average >= 14 ? 'text-success' : s.average >= 10 ? 'text-ink' : 'text-danger',
                )}
              >
                {s.average.toFixed(1).replace('.', ',')}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-strong">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(s.average / 20) * 100}%`,
                  background: subjectColor(s.subject),
                }}
              />
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mt-4 overflow-hidden">
        <div className="border-b border-line-soft px-5 py-4">
          <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">
            Détail des évaluations
          </p>
        </div>
        <ul className="divide-y divide-line-soft">
          {sorted.map((g) => (
            <li
              key={g.id}
              className="flex flex-col gap-2 px-5 py-4 transition hover:bg-surface-hover sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: subjectColor(g.subject) }}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{g.title}</p>
                  <p className="text-xs text-ink-3">
                    {g.subject} · {formatDate(g.date)} · coef. {g.coef}
                  </p>
                  {g.comment && (
                    <p className="mt-1 truncate text-xs italic text-ink-3">« {g.comment} »</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 sm:justify-end">
                {g.classAverage !== undefined && (
                  <span className="text-xs text-ink-3">
                    Moy. classe {g.classAverage.toFixed(1).replace('.', ',')}
                  </span>
                )}
                <Badge tone={g.value >= 14 ? 'success' : g.value >= 10 ? 'info' : 'danger'}>
                  {formatGrade(g.value, g.max ?? 20)}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  )
}
