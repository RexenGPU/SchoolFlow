import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  CloudOff,
  Database,
  Download,
  RefreshCw,
  Shield,
} from 'lucide-react'
import { Badge, Button, GlassCard, PageHeader, Progress } from '../components/ui'
import { useToast } from '../providers/ToastProvider'
import { useOnline } from '../hooks'
import { loadSyncState, saveSyncState, syncItemsLabel } from '../services/sync'
import { relativeTime } from '../utils/dates'
import { cn } from '../utils/cn'
import type { SyncState } from '../types'

export function SyncPage() {
  const toast = useToast()
  const online = useOnline()
  const navigate = useNavigate()
  const [state, setState] = useState<SyncState>(() => loadSyncState())

  useEffect(() => {
    saveSyncState(state)
  }, [state])

  function runSync() {
    if (!online) {
      setState((s) => ({
        ...s,
        status: 'error',
        error: 'Connexion indisponible — les données locales restent consultables hors ligne.',
      }))
      toast.warning('Hors ligne', 'La synchronisation reprendra dès le retour de la connexion.')
      return
    }

    setState((s) => ({ ...s, status: 'syncing', progress: 0, error: undefined }))
    let progress = 0
    const available = state.items.filter((i) => i.available)
    const timer = window.setInterval(() => {
      progress += 8 + Math.random() * 14
      const next = Math.min(100, progress)
      setState((s) => ({
        ...s,
        progress: next,
        items: s.items.map((item) => {
          const idx = available.findIndex((a) => a.key === item.key)
          const threshold = available.length ? ((idx + 1) / available.length) * 100 : 100
          if (item.available && next >= threshold) return { ...item, synced: true }
          return item
        }),
      }))
      if (next >= 100) {
        window.clearInterval(timer)
        setState((s) => ({
          ...s,
          status: 'success',
          progress: 100,
          lastSync: new Date().toISOString(),
        }))
        toast.success('Synchronisation terminée', 'Données disponibles à présent hors ligne.')
      }
    }, 180)
  }

  return (
    <div className="page-enter">
      <PageHeader
        title="Synchronisation avec votre établissement"
        subtitle="Récupération des données réellement accessibles via une intégration officielle autorisée."
        actions={
          <Button onClick={runSync} disabled={state.status === 'syncing'}>
            <RefreshCw
              className={cn('size-4', state.status === 'syncing' && 'animate-spin')}
              aria-hidden
            />
            {state.status === 'syncing' ? 'Synchronisation…' : 'Synchroniser maintenant'}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-2 glass-reflection" reflection>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex size-11 items-center justify-center rounded-2xl',
                  online ? 'bg-success/12 text-success' : 'bg-surface-strong text-ink-3',
                )}
              >
                {online ? <Cloud className="size-5" /> : <CloudOff className="size-5" />}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">
                  {online ? '● Synchronisé' : '○ Hors ligne'}
                </p>
                <p className="text-xs text-ink-3">
                  Dernière synchronisation :{' '}
                  {state.lastSync ? relativeTime(state.lastSync) : 'jamais'}
                </p>
              </div>
            </div>
            <Badge
              tone={
                state.status === 'error'
                  ? 'danger'
                  : state.status === 'success'
                    ? 'success'
                    : state.status === 'syncing'
                      ? 'accent'
                      : 'neutral'
              }
            >
              {state.status === 'syncing'
                ? `${Math.round(state.progress)} %`
                : state.status === 'error'
                  ? 'Erreur'
                  : state.status === 'success'
                    ? 'À jour'
                    : 'En attente'}
            </Badge>
          </div>

          <div className="mt-5">
            <Progress value={state.progress} tone={state.status === 'error' ? 'danger' : 'accent'} />
            <p className="mt-2 text-xs text-ink-3">{syncItemsLabel(state)}</p>
          </div>

          {state.error && (
            <p className="mt-4 flex items-start gap-2 rounded-2xl border border-danger/25 bg-danger/10 px-3.5 py-3 text-sm text-danger">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {state.error}
            </p>
          )}

          {state.status === 'success' && (
            <p className="mt-4 flex items-start gap-2 rounded-2xl border border-success/25 bg-success/10 px-3.5 py-3 text-sm text-success">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
              Synchronisation réussie. Les données synchronisées sont consultables hors ligne.
            </p>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">Mode hors ligne</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            Une fois synchronisées, l'emploi du temps, les notes, les devoirs, le calendrier et les
            documents disponibles localement restent consultables sans connexion.
          </p>
          <div className="mt-4 space-y-2 text-xs text-ink-3">
            <p className="inline-flex items-center gap-2">
              <Download className="size-3.5 text-accent" aria-hidden />
              Cache applicatif actif (service worker)
            </p>
            <p className="inline-flex items-center gap-2">
              <Database className="size-3.5 text-accent" aria-hidden />
              Données stockées sur cet appareil
            </p>
            <p className="inline-flex items-center gap-2">
              <Shield className="size-3.5 text-accent" aria-hidden />
              Aucune donnée sensible hors ligne
            </p>
          </div>
          <Button
            variant="secondary"
            className="mt-5 w-full"
            onClick={() => navigate('/app/parametres')}
          >
            Gérer les données locales
          </Button>
        </GlassCard>
      </div>

      <GlassCard className="mt-4 overflow-hidden">
        <div className="border-b border-line-soft px-5 py-4">
          <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">
            Données synchronisées
          </p>
        </div>
        <ul className="divide-y divide-line-soft">
          {state.items.map((item) => (
            <li key={item.key} className="flex items-start gap-4 px-5 py-3.5">
              <span
                className={cn(
                  'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl',
                  !item.available
                    ? 'bg-surface-strong text-ink-3'
                    : item.synced
                      ? 'bg-success/12 text-success'
                      : 'bg-accent-softer text-accent',
                )}
                aria-hidden
              >
                {!item.available ? <CloudOff className="size-4" /> : <CheckCircle2 className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{item.label}</p>
                {!item.available ? (
                  <p className="mt-0.5 text-xs text-ink-3">
                    {item.note ?? "Cette information n'est pas disponible via l'intégration actuelle."}
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-ink-3">
                    {item.synced ? 'Synchronisé · disponible hors ligne' : 'En attente de synchronisation'}
                  </p>
                )}
              </div>
              <Badge tone={!item.available ? 'neutral' : item.synced ? 'success' : 'warning'}>
                {!item.available ? 'Indisponible' : item.synced ? 'OK' : 'Attente'}
              </Badge>
            </li>
          ))}
        </ul>
      </GlassCard>

      <p className="mt-4 rounded-2xl border border-line-soft bg-surface-strong/50 px-4 py-3 text-xs leading-relaxed text-ink-3">
        SCHOOLFLOW ne récupère jamais de données par scraping ni en contournant une protection
        technique. Seules les données réellement exposées par une intégration officielle autorisée
        peuvent être synchronisées. En l'absence d'intégration configurée, l'application utilise
        exclusivement vos comptes locaux de démonstration.
      </p>
    </div>
  )
}
