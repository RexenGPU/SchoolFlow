export interface StorageAdapter {
  get<T>(key: string, fallback: T): T
  set<T>(key: string, value: T): void
  remove(key: string): void
  keys(): string[]
  clearAll(): void
}

const PREFIX = 'sf.'

function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export const memoryStore = new Map<string, string>()

export const storage: StorageAdapter = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      if (raw === null) {
        const mem = memoryStore.get(PREFIX + key)
        return mem === undefined ? fallback : safeParse(mem, fallback)
      }
      return safeParse(raw, fallback)
    } catch {
      return fallback
    }
  },
  set<T>(key: string, value: T): void {
    const raw = JSON.stringify(value)
    memoryStore.set(PREFIX + key, raw)
    try {
      localStorage.setItem(PREFIX + key, raw)
    } catch {
      /* quota or private mode — memory fallback keeps the session alive */
    }
  },
  remove(key: string): void {
    memoryStore.delete(PREFIX + key)
    try {
      localStorage.removeItem(PREFIX + key)
    } catch {
      /* ignore */
    }
  },
  keys(): string[] {
    const out = new Set<string>()
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k?.startsWith(PREFIX)) out.add(k.slice(PREFIX.length))
      }
    } catch {
      /* ignore */
    }
    for (const k of memoryStore.keys()) {
      if (k.startsWith(PREFIX)) out.add(k.slice(PREFIX.length))
    }
    return [...out]
  },
  clearAll(): void {
    try {
      const toRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && (k.startsWith(PREFIX) || k.startsWith('sf.'))) toRemove.push(k)
      }
      toRemove.forEach((k) => localStorage.removeItem(k))
      localStorage.removeItem('sf.theme')
      localStorage.removeItem('sf.accent')
      localStorage.removeItem('sf.animations')
    } catch {
      /* ignore */
    }
    memoryStore.clear()
  },
}

export const STORAGE_KEYS = {
  session: 'session',
  accounts: 'accounts',
  settings: 'settings',
  homework: 'homework',
  notifications: 'notifications',
  messages: 'messages',
  documents: 'documents',
  grades: 'grades',
  absences: 'absences',
  lates: 'lates',
  classes: 'classes',
  sync: 'sync',
  favorites: 'doc-favorites',
  readNotifs: 'read-notifications',
} as const

export function estimateLocalDataSize(): string {
  try {
    let bytes = 0
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k) continue
      const v = localStorage.getItem(k) ?? ''
      bytes += (k.length + v.length) * 2
    }
    if (bytes < 1024) return `${bytes} o`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`
  } catch {
    return 'indisponible'
  }
}
