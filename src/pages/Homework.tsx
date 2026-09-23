import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Check, CheckCircle2, Clock, Paperclip, Plus, Search } from 'lucide-react'
import { Badge, Button, GlassCard, Input, Modal, PageHeader, Segmented, Textarea } from '../components/ui'
import { useData } from '../providers/DataProvider'
import { useAuth } from '../providers/AuthProvider'
import { useToast } from '../providers/ToastProvider'
import { subjectColor } from '../data/demo'
import { formatDate, todayISO } from '../utils/dates'
import { cn } from '../utils/cn'

type Filter = 'all' | 'todo' | 'done' | 'late'

export function HomeworkPage() {
  const { homeworks, toggleHomework, addHomework, pushNotification } = useData()
  const { user } = useAuth()
  const toast = useToast()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    subject: user?.subject ?? 'Mathématiques',
    description: '',
    dueDate: todayISO(),
    className: user?.className ?? '3e B',
  })

  const isTeacher = user?.role === 'teacher'
  const today = todayISO()

  const visible = useMemo(() => {
    let list = homeworks
    if (isTeacher) {
      list = list.filter((h) => h.createdBy === user?.displayName || h.subject === user?.subject)
    } else if (user?.id) {
      list = list.filter((h) => !h.studentId || h.studentId === user.id)
    }
    if (filter === 'todo') list = list.filter((h) => h.status === 'todo')
    if (filter === 'done') list = list.filter((h) => h.status === 'done')
    if (filter === 'late') list = list.filter((h) => h.status === 'todo' && h.dueDate < today)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.subject.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q),
      )
    }
    return [...list].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  }, [homeworks, filter, query, isTeacher, user, today])

  const counts = {
    all: homeworks.length,
    todo: homeworks.filter((h) => h.status === 'todo').length,
    done: homeworks.filter((h) => h.status === 'done').length,
    late: homeworks.filter((h) => h.status === 'todo' && h.dueDate < today).length,
  }

  function create() {
    if (!form.title.trim()) return
    addHomework({
      subject: form.subject,
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate,
      className: form.className,
      createdBy: user?.displayName,
      status: 'todo',
    })
    pushNotification({
      title: 'Nouveau devoir',
      body: `${form.subject} — ${form.title}`,
      kind: 'homework',
    })
    toast.success('Devoir publié', 'Il apparaît dans le tableau de bord des élèves concernés.')
    setOpen(false)
    setForm({ ...form, title: '', description: '' })
  }

  function onToggle(id: string) {
    toggleHomework(id, user?.id)
    const hw = homeworks.find((h) => h.id === id)
    if (hw && hw.status === 'todo') toast.success('Devoir terminé', hw.title)
  }

  return (
    <div className="page-enter">
      <PageHeader
        title="Devoirs"
        subtitle={
          isTeacher
            ? 'Les devoirs que vous avez publiés pour vos classes.'
            : 'Suivez vos échéances et marquez ce qui est terminé.'
        }
        actions={
          isTeacher ? (
            <Button onClick={() => setOpen(true)}>
              <Plus className="size-4" aria-hidden />
              Créer un devoir
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          ariaLabel="Filtrer les devoirs"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: `Tous (${counts.all})` },
            { value: 'todo', label: `À faire (${counts.todo})` },
            { value: 'done', label: `Terminés (${counts.done})` },
            { value: 'late', label: `En retard (${counts.late})` },
          ]}
        />
        <div className="relative sm:w-64">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher…"
            aria-label="Rechercher un devoir"
            className="h-11 w-full rounded-2xl border border-line-soft bg-surface-strong pr-4 pl-10 text-sm text-ink placeholder:text-ink-3 focus:border-accent/50 focus:outline-none"
          />
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="stagger grid gap-3">
          {visible.map((h) => {
            const late = h.status === 'todo' && h.dueDate < today
            return (
              <motion.div
                key={h.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
              >
                <GlassCard className={cn('p-5', h.status === 'done' && 'opacity-75')}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="flex min-w-0 flex-1 gap-3.5">
                      <span
                        className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl text-white"
                        style={{
                          background: `linear-gradient(135deg, ${subjectColor(h.subject)}, color-mix(in oklab, ${subjectColor(h.subject)} 65%, black))`,
                        }}
                        aria-hidden
                      >
                        <BookOpen className="size-4.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2
                            className={cn(
                              'text-base font-semibold text-ink',
                              h.status === 'done' && 'line-through decoration-ink-3',
                            )}
                          >
                            {h.title}
                          </h2>
                          <Badge tone="neutral">{h.subject}</Badge>
                          {late && <Badge tone="danger">En retard</Badge>}
                          {h.status === 'done' && <Badge tone="success">Terminé</Badge>}
                        </div>
                        {h.description && (
                          <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{h.description}</p>
                        )}
                        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-ink-3">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="size-3.5" aria-hidden />
                            Pour le {formatDate(h.dueDate, { long: true })}
                          </span>
                          {h.className && <span>Classe {h.className}</span>}
                          {h.createdBy && <span>Par {h.createdBy}</span>}
                          {h.attachments && h.attachments.length > 0 && (
                            <span className="inline-flex items-center gap-1.5">
                              <Paperclip className="size-3.5" aria-hidden />
                              {h.attachments.length} pièce{h.attachments.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!isTeacher && (
                      <Button
                        variant={h.status === 'done' ? 'subtle' : 'primary'}
                        size="sm"
                        onClick={() => onToggle(h.id)}
                        className="shrink-0"
                      >
                        {h.status === 'done' ? (
                          <>
                            <CheckCircle2 className="size-4" aria-hidden /> Terminé
                          </>
                        ) : (
                          <>
                            <Check className="size-4" aria-hidden /> Marquer comme terminé
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      </AnimatePresence>

      {visible.length === 0 && (
        <div className="glass rounded-3xl px-6 py-14 text-center">
          <BookOpen className="mx-auto mb-3 size-8 text-ink-3" aria-hidden />
          <p className="font-semibold text-ink">Aucun devoir ici</p>
          <p className="mt-1 text-sm text-ink-3">
            Modifiez les filtres ou créez un nouveau devoir.
          </p>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Créer un devoir"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={create} disabled={!form.title.trim()}>
              Publier
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Titre"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Ex. Exercices 12 à 18"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Classe"
              value={form.className}
              onChange={(e) => setForm((f) => ({ ...f, className: e.target.value }))}
            />
            <Input
              label="Matière"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            />
          </div>
          <Input
            label="Date limite"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Consignes détaillées…"
          />
          <p className="rounded-2xl bg-accent-softer px-3.5 py-2.5 text-xs text-ink-2">
            Après publication, le devoir apparaît automatiquement dans le dashboard des élèves de la
            classe.
          </p>
        </div>
      </Modal>
    </div>
  )
}
