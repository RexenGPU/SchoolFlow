import { useEffect, useState } from 'react'
import { Wifi, WifiOff, RefreshCw, Cloud } from 'lucide-react'
import { useOnline } from '../hooks'
import { cn } from '../utils/cn'
import { loadSyncState } from '../services/sync'
import { relativeTime } from '../utils/dates'

export function SyncIndicator({ onOpenSync }: { onOpenSync?: () => void }) {
  const online = useOnline()
  const [last, setLast] = useState<string | null>(null)

  useEffect(() => {
    const s = loadSyncState()
    setLast(s.lastSync)
    const t = window.setInterval(() => setLast(loadSyncState().lastSync), 30000)
    return () => window.clearInterval(t)
  }, [])

  const label = online ? '● Synchronisé' : '○ Hors ligne'
  const Icon = online ? Wifi : WifiOff

  return (
    <button
      type="button"
      onClick={onOpenSync}
      title={online ? `Dernière synchronisation : ${last ? relativeTime(last) : 'inconnue'}` : 'Données disponibles hors ligne'}
      className={cn(
        'glass-subtle inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-medium transition hover:bg-surface-hover',
        online ? 'text-success' : 'text-ink-3',
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      <span className="hidden sm:inline">{label}</span>
      {online ? <Cloud className="size-3.5 opacity-50" aria-hidden /> : <RefreshCw className="size-3.5 opacity-50" aria-hidden />}
    </button>
  )
}
