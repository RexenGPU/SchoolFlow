import { useState } from 'react'
import { Check, ClipboardCheck, Save, X } from 'lucide-react'
import { Badge, Button, GlassCard, PageHeader, Segmented, Select } from '../../components/ui'
import { useData } from '../../providers/DataProvider'
import { useToast } from '../../providers/ToastProvider'
import { todayISO, formatDate } from '../../utils/dates'
import { cn } from '../../utils/cn'
import type { AttendanceStatus } from '../../types'

export function AttendancePage() {
  const { classes, updateStudentAttendance } = useData()
  const toast = useToast()
  const [classId, setClassId] = useState(classes[0]?.id ?? '')
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({})
  const [saved, setSaved] = useState(false)

  const activeClass = classes.find((c) => c.id === classId) ?? classes[0]

  function setStatus(id: string, status: AttendanceStatus) {
    setStatuses((s) => ({ ...s, [id]: status }))
    setSaved(false)
  }

  function markAll(status: AttendanceStatus) {
    if (!activeClass) return
    const next: Record<string, AttendanceStatus> = {}
    activeClass.students.forEach((s) => (next[s.id] = status))
    setStatuses(next)
    setSaved(false)
  }

  function save() {
    if (!activeClass) return
    let absent = 0
    let late = 0
    Object.entries(statuses).forEach(([id, st]) => {
      if (st === 'absent') {
        updateStudentAttendance(activeClass.id, id, 'absent')
        absent += 1
      }
      if (st === 'late') late += 1
    })
    setSaved(true)
    toast.success(
      'Appel enregistré',
      `${activeClass.name} · ${absent} absent(s), ${late} retard(s)`,
    )
  }

  if (!activeClass) return null

  const counts = {
    present: activeClass.students.filter((s) => (statuses[s.id] ?? 'present') === 'present').length,
    absent: activeClass.students.filter((s) => statuses[s.id] === 'absent').length,
    late: activeClass.students.filter((s) => statuses[s.id] === 'late').length,
  }

  const statusOptions: { value: AttendanceStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Tous présents' },
    { value: 'absent', label: 'Tous absents' },
    { value: 'late', label: 'Tous en retard' },
  ]

  return (
    <div className="page-enter">
      <PageHeader
        title="Appel"
        subtitle={`Séance du ${formatDate(todayISO(), { long: true, weekday: true })}.`}
        actions={
          <Button onClick={save}>
            <Save className="size-4" aria-hidden />
            Enregistrer l'appel
          </Button>
        }
      />

      <GlassCard className="mb-4 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <Select
              label="Classe"
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value)
                setStatuses({})
                setSaved(false)
              }}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.students.length} élèves
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Segmented
              ariaLabel="Actions groupées"
              value={('all' as unknown) as string}
              onChange={(v) => {
                if (v === 'all') markAll('present')
                else markAll(v as AttendanceStatus)
              }}
              options={statusOptions.map((o) => ({ value: o.value as string, label: o.label }))}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="success">✓ {counts.present} présent(s)</Badge>
          <Badge tone="danger">✕ {counts.absent} absent(s)</Badge>
          <Badge tone="warning">⏱ {counts.late} retard(s)</Badge>
          {saved && <Badge tone="accent">Appel enregistré</Badge>}
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <ul className="divide-y divide-line-soft">
          {activeClass.students.map((s) => {
            const st = statuses[s.id] ?? 'present'
            return (
              <li key={s.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-softer text-xs font-bold text-accent">
                    {s.name
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{s.name}</p>
                    <p className="text-xs text-ink-3">
                      {s.absences} absence{s.absences > 1 ? 's' : ''} · moy.{' '}
                      {s.average.toFixed(1).replace('.', ',')}
                    </p>
                  </div>
                </div>

                <div
                  role="group"
                  aria-label={`Statut de ${s.name}`}
                  className="glass-subtle flex shrink-0 gap-1 rounded-2xl p-1"
                >
                  <button
                    type="button"
                    onClick={() => setStatus(s.id, 'present')}
                    aria-pressed={st === 'present'}
                    title="Présent"
                    className={cn(
                      'flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition',
                      st === 'present' ? 'bg-success text-white' : 'text-ink-3 hover:text-ink',
                    )}
                  >
                    <Check className="size-4" aria-hidden />
                    <span className="hidden sm:inline">Présent</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(s.id, 'absent')}
                    aria-pressed={st === 'absent'}
                    title="Absent"
                    className={cn(
                      'flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition',
                      st === 'absent' ? 'bg-danger text-white' : 'text-ink-3 hover:text-ink',
                    )}
                  >
                    <X className="size-4" aria-hidden />
                    <span className="hidden sm:inline">Absent</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(s.id, 'late')}
                    aria-pressed={st === 'late'}
                    title="Retard"
                    className={cn(
                      'flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition',
                      st === 'late' ? 'bg-warning text-white' : 'text-ink-3 hover:text-ink',
                    )}
                  >
                    <span aria-hidden>⏱</span>
                    <span className="hidden sm:inline">Retard</span>
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </GlassCard>

      <div className="mt-4 flex justify-end">
        <Button onClick={save} size="lg">
          <ClipboardCheck className="size-4.5" aria-hidden />
          Enregistrer l'appel
        </Button>
      </div>
    </div>
  )
}
