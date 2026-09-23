import { useEffect, useMemo, useRef, useState } from 'react'
import { Archive, ArrowLeft, ArchiveRestore, PenSquare, Search, Send, Trash2 } from 'lucide-react'
import { Avatar, Button, GlassCard, Input, Modal, PageHeader, Textarea } from '../components/ui'
import { useData } from '../providers/DataProvider'
import { useAuth } from '../providers/AuthProvider'
import { useToast } from '../providers/ToastProvider'
import { relativeTime } from '../utils/dates'
import { cn } from '../utils/cn'

export function MessagesPage() {
  const {
    conversations,
    markMessageRead,
    toggleArchive,
    deleteConversation,
    sendMessage,
    createConversation,
  } = useData()
  const { user } = useAuth()
  const toast = useToast()

  const [tab, setTab] = useState<'inbox' | 'archived'>('inbox')
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [mobileView, setMobileView] = useState<'list' | 'thread'>('list')
  const [newOpen, setNewOpen] = useState(false)
  const [newForm, setNewForm] = useState({ subject: '', to: 'Claire Martin', body: '' })
  const bottomRef = useRef<HTMLDivElement>(null)

  const visible = useMemo(() => {
    let list = conversations.filter((c) => (tab === 'archived' ? c.archived : !c.archived))
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (c) =>
          c.subject.toLowerCase().includes(q) ||
          c.participantNames.join(' ').toLowerCase().includes(q) ||
          c.messages.some((m) => m.body.toLowerCase().includes(q)),
      )
    }
    return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [conversations, tab, query])

  const active = conversations.find((c) => c.id === activeId) ?? null

  useEffect(() => {
    if (activeId) markMessageRead(activeId)
  }, [activeId, markMessageRead])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active?.messages.length, activeId])

  function openConversation(id: string) {
    setActiveId(id)
    setMobileView('thread')
  }

  function submitReply(e: React.FormEvent) {
    e.preventDefault()
    if (!active || !draft.trim() || !user) return
    sendMessage(active.id, draft.trim(), user.displayName, user.id)
    setDraft('')
    toast.success('Message envoyé')
  }

  function submitNew(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !newForm.body.trim()) return
    createConversation(
      newForm.subject || 'Nouveau message',
      [user.id, 'other'],
      [user.displayName, newForm.to],
      newForm.body.trim(),
      user.displayName,
      user.id,
    )
    setNewOpen(false)
    setNewForm({ subject: '', to: 'Claire Martin', body: '' })
    toast.success('Conversation créée')
  }

  return (
    <div className="page-enter">
      <PageHeader
        title="Messagerie"
        subtitle="Conversations avec les enseignants et l'administration."
        actions={
          <Button onClick={() => setNewOpen(true)}>
            <PenSquare className="size-4" aria-hidden />
            Nouveau message
          </Button>
        }
      />

      <GlassCard className="overflow-hidden p-0">
        <div className="grid min-h-[560px] md:grid-cols-[320px_1fr]">
          {/* List */}
          <div
            className={cn(
              'border-r border-line-soft md:border-r',
              mobileView === 'thread' && 'hidden md:flex md:flex-col',
              mobileView === 'list' && 'flex flex-col',
            )}
          >
            <div className="space-y-3 border-b border-line-soft p-4">
              <div className="relative">
                <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher…"
                  aria-label="Rechercher une conversation"
                  className="h-11 w-full rounded-2xl border border-line-soft bg-surface-strong pr-4 pl-10 text-sm text-ink placeholder:text-ink-3 focus:border-accent/50 focus:outline-none"
                />
              </div>
              <div className="flex gap-1 rounded-2xl bg-surface-strong p-1">
                {(['inbox', 'archived'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={cn(
                      'flex-1 rounded-xl px-3 py-1.5 text-xs font-medium transition',
                      tab === t ? 'bg-accent text-accent-contrast' : 'text-ink-2 hover:text-ink',
                    )}
                  >
                    {t === 'inbox' ? 'Boîte de réception' : 'Archivés'}
                  </button>
                ))}
              </div>
            </div>

            <ul className="flex-1 overflow-y-auto">
              {visible.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => openConversation(c.id)}
                    className={cn(
                      'flex w-full items-start gap-3 border-b border-line-soft px-4 py-3.5 text-left transition',
                      activeId === c.id ? 'bg-accent-softer' : 'hover:bg-surface-hover',
                    )}
                  >
                    <Avatar name={c.participantNames[0] ?? '?'} size={40} hue={c.id.length * 37} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-ink">{c.subject}</span>
                        <span className="shrink-0 text-[10px] text-ink-3">
                          {relativeTime(c.updatedAt)}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-ink-3">
                        {c.participantNames.filter((n) => n !== user?.displayName).join(', ')}
                      </span>
                      <span className="mt-1 block truncate text-xs text-ink-2">
                        {c.messages[c.messages.length - 1]?.body}
                      </span>
                    </span>
                    {c.unread > 0 && (
                      <span className="mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-contrast">
                        {c.unread}
                      </span>
                    )}
                  </button>
                </li>
              ))}
              {visible.length === 0 && (
                <li className="px-4 py-10 text-center text-sm text-ink-3">Aucune conversation.</li>
              )}
            </ul>
          </div>

          {/* Thread */}
          <div
            className={cn(
              'flex min-h-[560px] flex-col',
              mobileView === 'list' && 'hidden md:flex',
            )}
          >
            {!active ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
                <Send className="size-8 text-ink-3" aria-hidden />
                <p className="font-medium text-ink">Sélectionnez une conversation</p>
                <p className="text-sm text-ink-3">Ou rédigez un nouveau message.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-line-soft px-4 py-3">
                  <button
                    type="button"
                    className="rounded-xl p-2 text-ink-2 hover:bg-surface-hover md:hidden"
                    onClick={() => setMobileView('list')}
                    aria-label="Retour"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                  <Avatar name={active.participantNames[0] ?? '?'} size={36} hue={active.id.length * 37} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{active.subject}</p>
                    <p className="truncate text-xs text-ink-3">
                      {active.participantNames.join(' · ')}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        toggleArchive(active.id)
                        toast.info(active.archived ? 'Désarchivée' : 'Conversation archivée')
                      }}
                      className="rounded-xl p-2 text-ink-3 transition hover:bg-surface-hover hover:text-ink"
                      aria-label={active.archived ? 'Désarchiver' : 'Archiver'}
                    >
                      {active.archived ? <ArchiveRestore className="size-4.5" /> : <Archive className="size-4.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteConversation(active.id)
                        setActiveId(null)
                        setMobileView('list')
                        toast.warning('Conversation supprimée')
                      }}
                      className="rounded-xl p-2 text-ink-3 transition hover:bg-danger/10 hover:text-danger"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="size-4.5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  {active.messages.map((m) => {
                    const mine = m.senderId === user?.id
                    return (
                      <div
                        key={m.id}
                        className={cn('flex', mine ? 'justify-end' : 'justify-start')}
                      >
                        <div
                          className={cn(
                            'max-w-[85%] rounded-2xl px-4 py-2.5 sm:max-w-[70%]',
                            mine
                              ? 'bg-accent text-accent-contrast rounded-br-md'
                              : 'glass-subtle text-ink rounded-bl-md',
                          )}
                        >
                          {!mine && (
                            <p className="mb-0.5 text-[11px] font-semibold opacity-80">
                              {m.senderName}
                            </p>
                          )}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.body}</p>
                          <p
                            className={cn(
                              'mt-1 text-[10px]',
                              mine ? 'text-white/70' : 'text-ink-3',
                            )}
                          >
                            {relativeTime(m.at)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>

                <form
                  onSubmit={submitReply}
                  className="flex items-end gap-2 border-t border-line-soft p-3"
                >
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Écrire un message…"
                    aria-label="Votre message"
                    className="min-h-12 max-h-32"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        submitReply(e as unknown as React.FormEvent)
                      }
                    }}
                  />
                  <Button type="submit" size="icon" disabled={!draft.trim()} aria-label="Envoyer">
                    <Send className="size-4.5" />
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </GlassCard>

      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="Nouveau message"
        footer={
          <>
            <Button variant="ghost" onClick={() => setNewOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submitNew} disabled={!newForm.body.trim()}>
              <Send className="size-4" aria-hidden />
              Envoyer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Destinataire"
            value={newForm.to}
            onChange={(e) => setNewForm((f) => ({ ...f, to: e.target.value }))}
          />
          <Input
            label="Objet"
            value={newForm.subject}
            onChange={(e) => setNewForm((f) => ({ ...f, subject: e.target.value }))}
            placeholder="Objet de la conversation"
          />
          <Textarea
            label="Message"
            value={newForm.body}
            onChange={(e) => setNewForm((f) => ({ ...f, body: e.target.value }))}
            placeholder="Votre message…"
          />
          <p className="text-xs text-ink-3">
            Messages de démonstration stockés localement sur cet appareil.
          </p>
        </div>
      </Modal>
    </div>
  )
}
