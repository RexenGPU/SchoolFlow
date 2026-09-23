const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]

const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const DAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

export function parseISO(date: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatDate(iso: string, opts?: { long?: boolean; weekday?: boolean }): string {
  const d = parseISO(iso)
  if (Number.isNaN(d.getTime())) return iso
  const day = d.getDate()
  const month = MONTHS[d.getMonth()]
  const year = d.getFullYear()
  if (opts?.weekday) {
    const wd = DAYS[d.getDay()]
    return opts.long ? `${wd} ${day} ${month} ${year}` : `${wd} ${day} ${month}`
  }
  return opts?.long ? `${day} ${month} ${year}` : `${day} ${month}`
}

export function formatShortDay(iso: string): string {
  const d = parseISO(iso)
  return DAYS_SHORT[d.getDay()] ?? ''
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return iso
  const diff = Date.now() - then
  const abs = Math.abs(diff)
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })
  const minutes = Math.round(abs / 60000)
  const sign = diff > 0 ? -1 : 1
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return rtf.format(sign * minutes, 'minute')
  const hours = Math.round(abs / 3600000)
  if (hours < 24) return rtf.format(sign * hours, 'hour')
  const days = Math.round(abs / 86400000)
  if (days < 7) return rtf.format(sign * days, 'day')
  const weeks = Math.round(abs / (86400000 * 7))
  if (weeks < 5) return rtf.format(sign * weeks, 'week')
  const months = Math.round(abs / (86400000 * 30))
  if (months < 12) return rtf.format(sign * months, 'month')
  return rtf.format(sign * Math.round(abs / (86400000 * 365)), 'year')
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  )
}

export function weekDates(base: Date): Date[] {
  const start = startOfWeek(base)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function monthGrid(date: Date): Date[] {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const start = startOfWeek(first)
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

export function todayISO(): string {
  return toISO(new Date())
}

export function greetByHour(d = new Date()): string {
  const h = d.getHours()
  if (h < 6) return 'Bonne nuit'
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bonjour'
  return 'Bonsoir'
}

export function formatMonthLabel(date: Date): string {
  const m = MONTHS[date.getMonth()]
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} ${date.getFullYear()}`
}

export function formatTimeRange(start: string, end: string): string {
  return `${start} — ${end}`
}

export { DAYS, DAYS_SHORT, MONTHS }
