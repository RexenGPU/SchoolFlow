import { useMemo, useState } from 'react'
import { Check, PenLine, Save } from 'lucide-react'
import { Badge, Button, GlassCard, Input, PageHeader, Select } from '../../components/ui'
import { useData } from '../../providers/DataProvider'
import { useToast } from '../../providers/ToastProvider'
import { todayISO } from '../../utils/dates'
import { cn } from '../../utils/cn'

export function GradeEntryPage() {
  const { classes, grades, updateGrade, addGrade, pushNotification } = useData()
  const toast = useToast()

  const [classId, setClassId] = useState(classes[0]?.id ?? '')
  const [title, setTitle] = useState('Interrogation')
  const [coef, setCoef] = useState('1')
  const [date, setDate] = useState(todayISO())
  const activeClass = classes.find((c) => c.id === classId) ?? classes[0]

  const existing = useMemo(
    () => grades.filter((g) => g.title === title && g.subject === 'Mathématiques'),
    [grades, title],
  )

  const [values, setValues] = useState<Record<string, string>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [dirty, setDirty] = useState(false)

  function setValue(id: string, v: string) {
    setValues((s) => ({ ...s, [id]: v }))
    setDirty(true)
  }

  function setComment(id: string, v: string) {
    setComments((s) => ({ ...s, [id]: v }))
    setDirty(true)
  }

  function fillAll(v: string) {
    if (!activeClass) return
    const next: Record<string, string> = {}
    activeClass.students.forEach((s) => (next[s.id] = v))
    setValues(next)
    setDirty(true)
  }

  function save() {
    if (!activeClass) return
    const numCoef = Number(coef) || 1
    let saved = 0
    activeClass.students.forEach((s) => {
      const raw = (values[s.id] ?? '').replace(',', '.').trim()
      if (raw === '') return
      const num = Number(raw)
      if (Number.isNaN(num) || num < 0 || num > 20) return

      const match = existing.find(
        (g) => g.title === title && g.comment?.includes(s.name),
      )
      if (match) {
        updateGrade(match.id, { value: num, coef: numCoef, date, comment: comments[s.id] || match.comment })
      } else {
        addGrade({
          subject: 'Mathématiques',
          title: `${title} — ${s.name}`,
          value: num,
          coef: numCoef,
          date,
          comment: comments[s.id],
        })
      }
      saved += 1
    })
    setDirty(false)
    pushNotification({
      title: 'Nouvelle note disponible',
      body: `Mathématiques — ${title}`,
      kind: 'grade',
    })
    toast.success('Notes enregistrées', `${saved} élève(s) mis à jour pour ${activeClass.name}.`)
  }

  if (!activeClass) return null

  return (
    <div className="page-enter">
      <PageHeader
        title="Saisie des notes"
        subtitle="Sélectionnez une classe, une matière et une évaluation."
        actions={
          <>
            <Button variant="secondary" onClick={() => fillAll('10')} disabled={!dirty && Object.keys(values).length === 0}>
              Pré-remplir 10
            </Button>
            <Button onClick={save}>
              <Save className="size-4" aria-hidden />
              Enregistrer
            </Button>
          </>
        }
      />

      <GlassCard className="mb-4 p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Classe"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Input label="Matière" value="Mathématiques" readOnly />
          <Input
            label="Évaluation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Coef."
              type="number"
              min={1}
              max={10}
              value={coef}
              onChange={(e) => setCoef(e.target.value)}
            />
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge tone="accent">{activeClass.students.length} élèves</Badge>
          <Badge>{activeClass.level}</Badge>
          {dirty && <Badge tone="warning">Modifications non enregistrées</Badge>}
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="hidden border-b border-line-soft px-5 py-3.5 text-xs font-semibold tracking-wide text-ink-3 uppercase sm:flex sm:items-center sm:gap-4">
          <span className="flex-1">Élève</span>
          <span className="w-28">Note / 20</span>
          <span className="hidden w-20 lg:block">Coef.</span>
          <span className="w-56">Commentaire</span>
          <span className="w-20 text-right">Statut</span>
        </div>
        <ul className="divide-y divide-line-soft">
          {activeClass.students.map((s) => {
            const raw = (values[s.id] ?? '').replace(',', '.')
            const num = raw === '' ? null : Number(raw)
            const invalid = num !== null && (Number.isNaN(num) || num < 0 || num > 20)
            return (
              <li
                key={s.id}
                className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-softer text-xs font-bold text-accent">
                    {s.name
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{s.name}</p>
                    <p className="text-xs text-ink-3">Moyenne actuelle {s.average.toFixed(1)}</p>
                  </div>
                </div>

                <input
                  value={values[s.id] ?? ''}
                  onChange={(e) => setValue(s.id, e.target.value)}
                  inputMode="decimal"
                  placeholder="—"
                  aria-label={`Note de ${s.name}`}
                  className={cn(
                    'h-11 w-full rounded-2xl border bg-surface-strong px-3 text-center text-sm font-semibold text-ink focus:outline-none sm:w-28',
                    invalid
                      ? 'border-danger/60 focus:border-danger'
                      : 'border-line-soft focus:border-accent/50',
                  )}
                />

                <input
                  value={coef}
                  readOnly
                  aria-label="Coefficient"
                  className="hidden h-11 w-20 rounded-2xl border border-line-soft bg-surface px-3 text-center text-sm text-ink-3 lg:block"
                />

                <input
                  value={comments[s.id] ?? ''}
                  onChange={(e) => setComment(s.id, e.target.value)}
                  placeholder="Appréciation…"
                  aria-label={`Commentaire pour ${s.name}`}
                  className="h-11 w-full rounded-2xl border border-line-soft bg-surface-strong px-3 text-sm text-ink placeholder:text-ink-3 focus:border-accent/50 focus:outline-none lg:w-56"
                />

                <div className="flex w-full justify-end sm:w-20">
                  {invalid ? (
                    <Badge tone="danger">Erreur</Badge>
                  ) : num !== null ? (
                    <Badge tone={num >= 10 ? 'success' : 'danger'}>
                      <Check className="size-3" aria-hidden />
                      {num.toFixed(1).replace('.', ',')}
                    </Badge>
                  ) : (
                    <Badge>—</Badge>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </GlassCard>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-2 text-xs text-ink-3">
          <PenLine className="size-3.5 text-accent" aria-hidden />
          Les notes sont stockées localement en mode démonstration.
        </p>
        <Button onClick={save} size="lg">
          <Save className="size-4.5" aria-hidden />
          Enregistrer
        </Button>
      </div>
    </div>
  )
}
