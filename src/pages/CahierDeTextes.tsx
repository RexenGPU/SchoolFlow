import { useMemo, useState } from 'react'
import { BookOpen, ChevronDown, FileText, Link2, Paperclip } from 'lucide-react'
import { Badge, GlassCard, PageHeader, Segmented } from '../components/ui'
import { useData } from '../providers/DataProvider'
import { subjectColor } from '../data/demo'
import { formatDate } from '../utils/dates'
import { cn } from '../utils/cn'

export function CahierDeTextesPage() {
  const { lessons, homeworks } = useData()
  const subjects = useMemo(() => [...new Set(lessons.map((l) => l.subject))].sort(), [lessons])
  const [subject, setSubject] = useState<string>('all')
  const [openId, setOpenId] = useState<string | null>(lessons[0]?.id ?? null)

  const visible = subject === 'all' ? lessons : lessons.filter((l) => l.subject === subject)

  return (
    <div className="page-enter">
      <PageHeader
        title="Cahier de textes"
        subtitle="Cours organisés par matière, documents et ressources associés."
        actions={
          <Segmented
            ariaLabel="Matière"
            value={subject}
            onChange={setSubject}
            options={[
              { value: 'all', label: 'Toutes' },
              ...subjects.map((s) => ({ value: s, label: s.split(' ')[0]! })),
            ]}
          />
        }
      />

      <div className="space-y-3">
        {visible.map((lesson) => {
          const open = openId === lesson.id
          const linkedHw = homeworks.find((h) => h.id === lesson.homeworkId)
          return (
            <GlassCard key={lesson.id} className="overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : lesson.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-surface-hover"
                aria-expanded={open}
              >
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-white"
                  style={{
                    background: `linear-gradient(135deg, ${subjectColor(lesson.subject)}, color-mix(in oklab, ${subjectColor(lesson.subject)} 60%, black))`,
                  }}
                  aria-hidden
                >
                  <BookOpen className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold text-ink">{lesson.title}</span>
                    <Badge>{lesson.subject}</Badge>
                    {linkedHw && <Badge tone="warning">Devoir associé</Badge>}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-ink-2">{lesson.description}</span>
                  <span className="mt-0.5 block text-xs text-ink-3">
                    Cours du {formatDate(lesson.date, { long: true })}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    'size-5 shrink-0 text-ink-3 transition-transform duration-300',
                    open && 'rotate-180',
                  )}
                  aria-hidden
                />
              </button>

              {open && (
                <div className="border-t border-line-soft px-5 py-5 fade-in">
                  <p className="max-w-3xl text-sm leading-relaxed text-ink-2">{lesson.content}</p>

                  {linkedHw && (
                    <div className="mt-4 rounded-2xl border border-warning/25 bg-warning/8 px-4 py-3">
                      <p className="text-xs font-semibold tracking-wide text-warning uppercase">
                        Devoir associé
                      </p>
                      <p className="mt-1 text-sm font-medium text-ink">{linkedHw.title}</p>
                      <p className="text-xs text-ink-3">Pour le {formatDate(linkedHw.dueDate, { long: true })}</p>
                    </div>
                  )}

                  {lesson.documents.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-semibold tracking-wide text-ink-3 uppercase">
                        Documents
                      </p>
                      <ul className="flex flex-wrap gap-2">
                        {lesson.documents.map((d) => (
                          <li key={d}>
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 rounded-xl border border-line-soft bg-surface-strong px-3 py-2 text-xs font-medium text-ink transition hover:bg-surface-hover"
                            >
                              <FileText className="size-3.5 text-accent" aria-hidden />
                              {d}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {lesson.resources.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-semibold tracking-wide text-ink-3 uppercase">
                        Ressources
                      </p>
                      <ul className="flex flex-wrap gap-2">
                        {lesson.resources.map((r) => (
                          <li key={r.label}>
                            <a
                              href={r.url}
                              className="inline-flex items-center gap-2 rounded-xl border border-accent/25 bg-accent-softer px-3 py-2 text-xs font-medium text-accent transition hover:bg-accent-soft"
                            >
                              <Link2 className="size-3.5" aria-hidden />
                              {r.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink-3">
                    <Paperclip className="size-3.5" aria-hidden />
                    {lesson.documents.length} document(s) · ressources disponibles hors ligne
                  </p>
                </div>
              )}
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
