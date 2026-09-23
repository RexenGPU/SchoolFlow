import { storage } from './storage'
import { pronoteApiUrl } from './pronoteApi'
import type { Absence, Conversation, Course, Grade, Homework, LateMark, SchoolEvent } from '../types'

export interface PronoteData {
  courses?: Course[]
  grades?: Grade[]
  homeworks?: Homework[]
  absences?: Absence[]
  lates?: LateMark[]
  conversations?: Conversation[]
  events?: SchoolEvent[]
}

export async function getPronoteData(): Promise<PronoteData | null> {
  const sessionId = storage.get<string | null>('pronote.sessionId', null)
  if (!sessionId) return null
  try {
    const res = await fetch(pronoteApiUrl('/api/pronote/data'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
    if (!res.ok) return null
    const raw = (await res.json()) as Record<string, unknown>
    return {
      courses: mapTimetable(raw.timetable),
      grades: mapGrades(raw.grades),
      homeworks: mapHomeworks(raw.assignments),
      absences: [],
      lates: [],
      conversations: [],
      events: [],
    }
  } catch {
    return null
  }
}

function toISO(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === 'string') return value.slice(0, 10)
  return new Date().toISOString().slice(0, 10)
}

function hhmm(value: unknown): string {
  const d = value instanceof Date ? value : new Date(String(value))
  if (Number.isNaN(d.getTime())) return '00:00'
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function dayIndex(value: unknown): number {
  const d = value instanceof Date ? value : new Date(String(value))
  const jsDay = d.getDay()
  return jsDay === 0 ? 7 : jsDay
}

interface RawClass {
  id?: string
  is?: string
  title?: string
  subject?: { name?: string }
  subjectName?: string
  room?: string
  rooms?: Array<{ name?: string }>
  startDate?: string | Date
  endDate?: string | Date
  canceled?: boolean
  isCanceled?: boolean
}

function mapTimetable(raw: unknown): Course[] {
  if (!raw || typeof raw !== 'object') return []
  const holder = raw as { classes?: unknown }
  const classes = Array.isArray(holder.classes)
    ? (holder.classes as RawClass[])
    : Array.isArray(raw)
      ? (raw as RawClass[])
      : []
  return classes
    .filter((c) => c.is !== 'activity')
    .map((c, i) => ({
      id: c.id || `pn_${i}`,
      subject: c.title || c.subject?.name || c.subjectName || 'Cours',
      teacher: '',
      room: c.room || c.rooms?.[0]?.name || '',
      day: dayIndex(c.startDate),
      start: hhmm(c.startDate),
      end: hhmm(c.endDate),
      cancelled: Boolean(c.canceled || c.isCanceled),
    }))
}

interface RawGrade {
  id?: string
  subject?: { name?: string }
  subjectName?: string
  description?: string
  title?: string
  value?: number | { student?: number; outOf?: number }
  average?: number
  max?: number
  coef?: number
  date?: string | Date
  comment?: string
}

function gradeValue(v: unknown): number {
  if (typeof v === 'number') return v
  if (v && typeof v === 'object' && 'student' in v) {
    const s = (v as { student?: number }).student
    return typeof s === 'number' ? s : 0
  }
  return 0
}

function mapGrades(raw: unknown): Grade[] {
  const list = Array.isArray(raw)
    ? (raw as RawGrade[])
    : raw && typeof raw === 'object' && Array.isArray((raw as { grades?: unknown }).grades)
      ? ((raw as { grades: RawGrade[] }).grades)
      : raw && typeof raw === 'object' && Array.isArray((raw as { subjects?: unknown }).subjects)
        ? ((raw as { subjects: Array<{ grades?: RawGrade[] }> }).subjects).flatMap((s) => s.grades ?? [])
        : []
  return list.map((g, i) => ({
    id: g.id || `png_${i}`,
    subject: g.subject?.name || g.subjectName || 'Matière',
    title: g.description || g.title || 'Note',
    value: gradeValue(g.value),
    coef: typeof g.coef === 'number' ? g.coef : 1,
    date: toISO(g.date),
    classAverage: typeof g.average === 'number' ? g.average : undefined,
    comment: g.comment,
  }))
}

interface RawAssignment {
  id?: string
  subject?: { name?: string }
  description?: string
  done?: boolean
  deadline?: string | Date
}

function mapHomeworks(raw: unknown): Homework[] {
  const list = Array.isArray(raw) ? (raw as RawAssignment[]) : []
  return list.map((a, i) => ({
    id: a.id || `pnh_${i}`,
    subject: a.subject?.name || 'Matière',
    title: (a.description || 'Devoir').split('\n')[0].slice(0, 120),
    description: a.description || '',
    dueDate: toISO(a.deadline),
    status: a.done ? 'done' : 'todo',
  }))
}
