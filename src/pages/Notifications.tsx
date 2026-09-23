import {
  Bell,
  BookOpen,
  CalendarClock,
  CheckCheck,
  GraduationCap,
  MessageSquare,
  Settings,
  Trash2,
} from 'lucide-react'
import { Badge, Button, GlassCard, PageHeader } from '../components/ui'
import { useData } from '../providers/DataProvider'
import { useToast } from '../providers/ToastProvider'
import { relativeTime } from '../utils/dates'
import { cn } from '../utils/cn'
import type { NotificationKind } from '../types'

const kindMeta: Record<NotificationKind, { icon: typeof Bell; tone: string }> = {
  homework: { icon: BookOpen, tone: 'text-warning bg-warning/12' },
  grade: { icon: GraduationCap, tone: 'text-success bg-success/12' },
  message: { icon: MessageSquare, tone: 'text-info bg-info/12' },
  schedule: { icon: CalendarClock, tone: 'text-accent bg-accent-softer' },
  absence: { icon: Bell, tone: 'text-danger bg-danger/12' },
  system: { icon: Settings, tone: 'text-ink-2 bg-surface-strong' },
}

export function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = useData()
  const toast = useToast()
  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="page-enter">
      <PageHeader
        title="Notifications"
        subtitle={
          unread > 0
            ? `${unread} notification${unread > 1 ? 's' : ''} non lue${unread > 1 ? 's' : ''}.`
            : 'Tout est à jour.'
        }
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                markAllNotificationsRead()
                toast.success('Tout est marqué comme lu')
              }}
              disabled={unread === 0}
            >
              <CheckCheck className="size-4" aria-hidden />
              Tout marquer comme lu
            </Button>
          </>
        }
      />

      <div className="stagger space-y-2.5">
        {notifications.map((n) => {
          const meta = kindMeta[n.kind]
          const Icon = meta.icon
          return (
            <GlassCard
              key={n.id}
              className={cn('flex items-start gap-4 p-4', !n.read && 'border-accent/25 bg-accent-softer/40')}
            >
              <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-2xl', meta.tone)}>
                <Icon className="size-4.5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink">{n.title}</p>
                  {!n.read && <Badge tone="accent">Nouveau</Badge>}
                </div>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-2">{n.body}</p>
                <p className="mt-1 text-xs text-ink-3">{relativeTime(n.at)}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markNotificationRead(n.id)}
                    className="rounded-xl p-2 text-ink-3 transition hover:bg-surface-hover hover:text-ink"
                    aria-label="Marquer comme lu"
                    title="Marquer comme lu"
                  >
                    <CheckCheck className="size-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    deleteNotification(n.id)
                    toast.info('Notification supprimée')
                  }}
                  className="rounded-xl p-2 text-ink-3 transition hover:bg-danger/10 hover:text-danger"
                  aria-label="Supprimer"
                  title="Supprimer"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </GlassCard>
          )
        })}
      </div>

      {notifications.length === 0 && (
        <div className="glass rounded-3xl px-6 py-14 text-center">
          <Bell className="mx-auto mb-3 size-8 text-ink-3" aria-hidden />
          <p className="font-semibold text-ink">Aucune notification</p>
          <p className="mt-1 text-sm text-ink-3">Vous serez averti des nouveaux devoirs et notes.</p>
        </div>
      )}
    </div>
  )
}
