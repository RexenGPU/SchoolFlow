import { useEffect, useState } from 'react'

export function useOnline(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  return online
}

export function useHotkey(combo: { key: string; ctrl?: boolean; shift?: boolean; meta?: boolean }, handler: () => void) {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      if (combo.ctrl !== undefined && combo.ctrl !== ctrl) return
      if (combo.shift !== undefined && combo.shift !== e.shiftKey) return
      if (e.key.toLowerCase() === combo.key.toLowerCase()) {
        e.preventDefault()
        handler()
      }
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [combo.key, combo.ctrl, combo.shift, combo.meta, handler])
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    setMatches(mq.matches)
    return () => mq.removeEventListener('change', handler)
  }, [query])
  return matches
}
