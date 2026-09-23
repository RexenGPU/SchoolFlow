import { STORAGE_KEYS, storage } from './storage'
import type { SyncItemState, SyncState } from '../types'

export const SYNC_ITEMS: SyncItemState[] = [
  { key: 'profile', label: 'Profil et rôle', available: true, synced: false },
  { key: 'classes', label: 'Classes', available: true, synced: false },
  { key: 'timetable', label: 'Emploi du temps', available: true, synced: false },
  { key: 'grades', label: 'Notes', available: true, synced: false },
  { key: 'homework', label: 'Devoirs', available: true, synced: false },
  { key: 'lessons', label: 'Cahier de textes', available: true, synced: false },
  { key: 'absences', label: 'Absences et retards', available: true, synced: false },
  { key: 'messages', label: 'Messages', available: true, synced: false },
  { key: 'documents', label: 'Documents', available: true, synced: false },
  { key: 'payments', label: 'Paiements et cantine', available: false, synced: false, note: "Cette information n'est pas disponible via l'intégration actuelle." },
  { key: 'behavior', label: 'Punitions / encouragements', available: false, synced: false, note: "Cette information n'est pas disponible via l'intégration actuelle." },
]

export function defaultSyncState(): SyncState {
  return {
    status: 'idle',
    progress: 0,
    lastSync: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    items: SYNC_ITEMS.map((i) => ({ ...i })),
  }
}

export function loadSyncState(): SyncState {
  const saved = storage.get<SyncState | null>(STORAGE_KEYS.sync, null)
  if (!saved) return defaultSyncState()
  return {
    ...defaultSyncState(),
    ...saved,
    status: 'idle',
    progress: 0,
    items: SYNC_ITEMS.map((base) => saved.items?.find((i) => i.key === base.key) ?? base),
  }
}

export function saveSyncState(state: SyncState): void {
  storage.set(STORAGE_KEYS.sync, state)
}

export function syncItemsLabel(state: SyncState): string {
  const ok = state.items.filter((i) => i.synced).length
  const total = state.items.filter((i) => i.available).length
  return `${ok}/${total} jeux de données synchronisés`
}
