import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AppSettings, ThemeMode } from '../types'
import { defaultSettings } from '../data/demo'
import { storage, STORAGE_KEYS } from '../services/storage'
import { clamp } from '../utils/cn'

interface ThemeContextValue {
  settings: AppSettings
  theme: ThemeMode
  resolvedTheme: 'light' | 'dark'
  accent: string
  update: (patch: Partial<AppSettings>) => void
  setTheme: (mode: ThemeMode) => void
  setAccent: (color: string) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const ACCENTS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Bleu', value: '#3b82f6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Émeraude', value: '#10b981' },
  { name: 'Ambre', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Ardoise', value: '#64748b' },
]

export { ACCENTS }

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => ({
    ...defaultSettings(),
    ...storage.get<Partial<AppSettings>>(STORAGE_KEYS.settings, {}),
  }))
  const [systemDark, setSystemDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  const resolvedTheme: 'light' | 'dark' =
    settings.theme === 'auto' ? (systemDark ? 'dark' : 'light') : settings.theme

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolvedTheme === 'dark')
    root.style.setProperty('--accent', settings.accent)
    root.style.setProperty('--text-scale', String(clamp(settings.textScale, 0.9, 1.25)))
    root.classList.toggle('reduce-animations', !settings.animations)
    try {
      localStorage.setItem('sf.theme', settings.theme)
      localStorage.setItem('sf.accent', settings.accent)
      localStorage.setItem('sf.animations', String(settings.animations))
    } catch {
      /* ignore */
    }
    storage.set(STORAGE_KEYS.settings, settings)
  }, [settings, resolvedTheme])

  useEffect(() => {
    if (!settings.animations) {
      document.documentElement.classList.add('reduce-animations')
    } else {
      document.documentElement.classList.remove('reduce-animations')
    }
  }, [settings.animations])

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((s) => ({ ...s, ...patch }))
  }, [])

  const setTheme = useCallback((mode: ThemeMode) => setSettings((s) => ({ ...s, theme: mode })), [])
  const setAccent = useCallback((color: string) => setSettings((s) => ({ ...s, accent: color })), [])
  const toggleTheme = useCallback(() => {
    setSettings((s) => {
      const next: ThemeMode = resolvedTheme === 'dark' ? 'light' : 'dark'
      return { ...s, theme: next }
    })
  }, [resolvedTheme])

  const value = useMemo(
    () => ({
      settings,
      theme: settings.theme,
      resolvedTheme,
      accent: settings.accent,
      update,
      setTheme,
      setAccent,
      toggleTheme,
    }),
    [settings, resolvedTheme, update, setTheme, setAccent, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
