import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  Absence,
  AppNotification,
  ClassRoom,
  Conversation,
  Course,
  DocFile,
  Evaluation,
  Grade,
  Homework,
  LateMark,
  LessonEntry,
  Message,
  SchoolEvent,
} from '../types'
import {
  defaultAbsences,
  defaultClasses,
  defaultConversations,
  defaultCourses,
  defaultDocuments,
  defaultEvaluations,
  defaultEvents,
  defaultGrades,
  defaultHomeworks,
  defaultLates,
  defaultLessons,
  defaultNotifications,
} from '../data/demo'
import { STORAGE_KEYS, storage } from '../services/storage'
import { uid } from '../utils/cn'
import { getPronoteData, type PronoteData } from '../services/pronote'
import { useAuth } from './AuthProvider'

interface DataContextValue {
  courses: Course[]
  grades: Grade[]
  homeworks: Homework[]
  lessons: LessonEntry[]
  absences: Absence[]
  lates: LateMark[]
  conversations: Conversation[]
  documents: DocFile[]
  events: SchoolEvent[]
  notifications: AppNotification[]
  classes: ClassRoom[]
  evaluations: Evaluation[]

  toggleHomework: (id: string, studentId?: string) => void
  addHomework: (hw: Omit<Homework, 'id' | 'status'> & { status?: Homework['status'] }) => Homework
  markMessageRead: (conversationId: string) => void
  toggleArchive: (conversationId: string) => void
  deleteConversation: (conversationId: string) => void
  sendMessage: (conversationId: string, body: string, senderName: string, senderId: string) => void
  createConversation: (subject: string, participants: string[], participantNames: string[], body: string, senderName: string, senderId: string) => string
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  deleteNotification: (id: string) => void
  pushNotification: (n: Omit<AppNotification, 'id' | 'at' | 'read'>) => void
  toggleDocFavorite: (id: string) => void
  updateGrade: (id: string, patch: Partial<Grade>) => void
  addGrade: (grade: Omit<Grade, 'id'>) => void
  updateStudentAttendance: (classId: string, studentId: string, status: string) => void
  resetDemoData: () => void
}

const DataContext = createContext<DataContextValue | null>(null)

function load<T>(key: string, fallback: () => T): T {
  const saved = storage.get<T | null>(key, null)
  if (saved && Array.isArray(saved) && saved.length === 0) return fallback()
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) return saved
  if (Array.isArray(saved) && saved.length > 0) return saved
  return fallback()
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [courses, setCourses] = useState<Course[]>(() => load(STORAGE_KEYS.homework + '.courses', defaultCourses))
  const [grades, setGrades] = useState<Grade[]>(() => load(STORAGE_KEYS.grades, defaultGrades))
  const [homeworks, setHomeworks] = useState<Homework[]>(() => load(STORAGE_KEYS.homework, defaultHomeworks))
  const [lessons, setLessons] = useState<LessonEntry[]>(() => load('lessons', defaultLessons))
  const [absences, setAbsences] = useState<Absence[]>(() => load(STORAGE_KEYS.absences, defaultAbsences))
  const [lates, setLates] = useState<LateMark[]>(() => load(STORAGE_KEYS.lates, defaultLates))
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    load(STORAGE_KEYS.messages, defaultConversations),
  )
  const [documents, setDocuments] = useState<DocFile[]>(() => load(STORAGE_KEYS.documents, defaultDocuments))
  const [events, setEvents] = useState<SchoolEvent[]>(() => load('events', defaultEvents))
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    load(STORAGE_KEYS.notifications, defaultNotifications),
  )
  const [classes, setClasses] = useState<ClassRoom[]>(() => load(STORAGE_KEYS.classes, defaultClasses))
  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => load('evaluations', defaultEvaluations))

  useEffect(() => {
    if (session?.provider !== 'pronote') return
    let cancelled = false
    void getPronoteData()
      .then((data: PronoteData | null) => {
        if (!data || cancelled) return
        setCourses(data.courses ?? [])
        setGrades(data.grades ?? [])
        setHomeworks(data.homeworks ?? [])
        setAbsences(data.absences ?? [])
        setLates(data.lates ?? [])
        setConversations(data.conversations ?? [])
        setEvents(data.events ?? [])
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [session?.provider])

  useEffect(() => storage.set(STORAGE_KEYS.grades, grades), [grades])
  useEffect(() => storage.set(STORAGE_KEYS.homework, homeworks), [homeworks])
  useEffect(() => storage.set(STORAGE_KEYS.messages, conversations), [conversations])
  useEffect(() => storage.set(STORAGE_KEYS.notifications, notifications), [notifications])
  useEffect(() => storage.set(STORAGE_KEYS.classes, classes), [classes])
  useEffect(() => storage.set(STORAGE_KEYS.documents, documents), [documents])
  useEffect(() => storage.set('lessons', lessons), [lessons])
  useEffect(() => storage.set('evaluations', evaluations), [evaluations])
  useEffect(() => storage.set(STORAGE_KEYS.homework + '.courses', courses), [courses])

  const toggleHomework = useCallback((id: string, studentId?: string) => {
    setHomeworks((list) =>
      list.map((h) => {
        if (h.id !== id) return h
        if (studentId && h.studentId && h.studentId !== studentId) return h
        return { ...h, status: h.status === 'done' ? 'todo' : 'done' }
      }),
    )
  }, [])

  const addHomework = useCallback((hw: Omit<Homework, 'id' | 'status'> & { status?: Homework['status'] }) => {
    const created: Homework = {
      id: uid('hw'),
      status: hw.status ?? 'todo',
      ...hw,
    }
    setHomeworks((list) => [created, ...list])
    return created
  }, [])

  const markMessageRead = useCallback((conversationId: string) => {
    setConversations((list) =>
      list.map((c) =>
        c.id === conversationId
          ? { ...c, unread: 0, messages: c.messages.map((m) => ({ ...m, read: true })) }
          : c,
      ),
    )
  }, [])

  const toggleArchive = useCallback((conversationId: string) => {
    setConversations((list) =>
      list.map((c) => (c.id === conversationId ? { ...c, archived: !c.archived } : c)),
    )
  }, [])

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations((list) => list.filter((c) => c.id !== conversationId))
  }, [])

  const sendMessage = useCallback(
    (conversationId: string, body: string, senderName: string, senderId: string) => {
      const message: Message = {
        id: uid('msg'),
        senderId,
        senderName,
        body,
        at: new Date().toISOString(),
        read: true,
      }
      setConversations((list) =>
        list.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, message], updatedAt: message.at }
            : c,
        ),
      )
    },
    [],
  )

  const createConversation = useCallback(
    (
      subject: string,
      participants: string[],
      participantNames: string[],
      body: string,
      senderName: string,
      senderId: string,
    ) => {
      const id = uid('conv')
      const at = new Date().toISOString()
      const message: Message = {
        id: uid('msg'),
        senderId,
        senderName,
        body,
        at,
        read: true,
      }
      const conv: Conversation = {
        id,
        subject,
        participants,
        participantNames,
        messages: [message],
        unread: 0,
        archived: false,
        updatedAt: at,
      }
      setConversations((list) => [conv, ...list])
      return id
    },
    [],
  )

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((list) => list.map((n) => ({ ...n, read: true })))
  }, [])

  const deleteNotification = useCallback((id: string) => {
    setNotifications((list) => list.filter((n) => n.id !== id))
  }, [])

  const pushNotification = useCallback((n: Omit<AppNotification, 'id' | 'at' | 'read'>) => {
    setNotifications((list) => [
      { ...n, id: uid('ntf'), at: new Date().toISOString(), read: false },
      ...list,
    ])
  }, [])

  const toggleDocFavorite = useCallback((id: string) => {
    setDocuments((list) => list.map((d) => (d.id === id ? { ...d, favorite: !d.favorite } : d)))
  }, [])

  const updateGrade = useCallback((id: string, patch: Partial<Grade>) => {
    setGrades((list) => list.map((g) => (g.id === id ? { ...g, ...patch } : g)))
  }, [])

  const addGrade = useCallback((grade: Omit<Grade, 'id'>) => {
    setGrades((list) => [{ ...grade, id: uid('gr') }, ...list])
  }, [])

  const updateStudentAttendance = useCallback((classId: string, studentId: string, status: string) => {
    setClasses((list) =>
      list.map((cl) => {
        if (cl.id !== classId) return cl
        return {
          ...cl,
          students: cl.students.map((s) =>
            s.id === studentId
              ? {
                  ...s,
                  absences: status === 'absent' ? s.absences + 1 : s.absences,
                }
              : s,
          ),
        }
      }),
    )
  }, [])

  const resetDemoData = useCallback(() => {
    setCourses(defaultCourses())
    setGrades(defaultGrades())
    setHomeworks(defaultHomeworks())
    setLessons(defaultLessons())
    setConversations(defaultConversations())
    setDocuments(defaultDocuments())
    setNotifications(defaultNotifications())
    setClasses(defaultClasses())
    setEvaluations(defaultEvaluations())
    storage.remove(STORAGE_KEYS.sync)
  }, [])

  const value = useMemo(
    () => ({
      courses,
      grades,
      homeworks,
      lessons,
      absences,
      lates,
      conversations,
      documents,
      events,
      notifications,
      classes,
      evaluations,
      toggleHomework,
      addHomework,
      markMessageRead,
      toggleArchive,
      deleteConversation,
      sendMessage,
      createConversation,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
      pushNotification,
      toggleDocFavorite,
      updateGrade,
      addGrade,
      updateStudentAttendance,
      resetDemoData,
    }),
    [
      courses,
      grades,
      homeworks,
      lessons,
      absences,
      lates,
      conversations,
      documents,
      events,
      notifications,
      classes,
      evaluations,
      toggleHomework,
      addHomework,
      markMessageRead,
      toggleArchive,
      deleteConversation,
      sendMessage,
      createConversation,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
      pushNotification,
      toggleDocFavorite,
      updateGrade,
      addGrade,
      updateStudentAttendance,
      resetDemoData,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
