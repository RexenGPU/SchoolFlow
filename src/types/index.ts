export type Role = 'student' | 'teacher'

export type ThemeMode = 'light' | 'dark' | 'auto'

export type ProviderId = 'local' | 'educonnect' | 'pronote'

export type HomeworkStatus = 'todo' | 'done'

export type AbsenceStatus = 'pending' | 'justified' | 'unjustified'

export type EventType = 'course' | 'homework' | 'eval' | 'event' | 'vacation'

export type NotificationKind = 'homework' | 'grade' | 'message' | 'schedule' | 'system' | 'absence'

export type AttendanceStatus = 'present' | 'absent' | 'late'

export interface User {
  id: string
  displayName: string
  firstName: string
  lastName: string
  role: Role
  className?: string
  subject?: string
  establishment: string
  email?: string
  avatarHue?: number
}

export interface Session {
  id: string
  userId: string
  displayName: string
  role: Role
  establishment?: string
  provider: ProviderId
  loggedInAt: string
  expiresAt: string
}

export interface LocalAccount {
  id: string
  email: string
  passwordHash: string
  user: User
  createdAt: string
}

export interface Course {
  id: string
  subject: string
  teacher: string
  room: string
  day: number
  start: string
  end: string
  cancelled?: boolean
  modified?: boolean
  modificationNote?: string
  group?: string
}

export interface Grade {
  id: string
  subject: string
  title: string
  value: number
  max?: number
  coef: number
  date: string
  classAverage?: number
  comment?: string
}

export interface Homework {
  id: string
  subject: string
  title: string
  description: string
  dueDate: string
  status: HomeworkStatus
  attachments?: string[]
  className?: string
  createdBy?: string
  studentId?: string
}

export interface LessonEntry {
  id: string
  subject: string
  title: string
  description: string
  content: string
  date: string
  homeworkId?: string
  documents: string[]
  resources: { label: string; url: string }[]
}

export interface Absence {
  id: string
  date: string
  from: string
  to: string
  duration: string
  status: AbsenceStatus
  reason?: string
  justified?: boolean
}

export interface LateMark {
  id: string
  date: string
  minutes: number
  status: AbsenceStatus
  reason?: string
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  body: string
  at: string
  read: boolean
}

export interface Conversation {
  id: string
  subject: string
  participants: string[]
  participantNames: string[]
  messages: Message[]
  unread: number
  archived: boolean
  updatedAt: string
}

export interface DocFile {
  id: string
  name: string
  folder: string
  subject?: string
  size: string
  kind: 'pdf' | 'image' | 'doc' | 'sheet' | 'slide' | 'other'
  updatedAt: string
  favorite: boolean
  description?: string
}

export interface SchoolEvent {
  id: string
  title: string
  date: string
  end?: string
  allDay?: boolean
  time?: string
  type: EventType
  description?: string
  subject?: string
}

export interface AppNotification {
  id: string
  title: string
  body: string
  kind: NotificationKind
  at: string
  read: boolean
}

export interface Student {
  id: string
  name: string
  average: number
  absences: number
}

export interface ClassRoom {
  id: string
  name: string
  level: string
  subject: string
  students: Student[]
  average: number
  absences: number
  lastEvaluation?: { title: string; date: string; classAverage: number }
}

export interface Evaluation {
  id: string
  classId: string
  subject: string
  title: string
  date: string
  coef: number
}

export interface AppSettings {
  theme: ThemeMode
  accent: string
  animations: boolean
  notifications: boolean
  autoSync: boolean
  textScale: number
  soundFeedback?: boolean
}

export interface SyncState {
  status: 'idle' | 'syncing' | 'success' | 'error'
  progress: number
  lastSync: string | null
  error?: string
  items: SyncItemState[]
}

export interface SyncItemState {
  key: string
  label: string
  available: boolean
  synced: boolean
  note?: string
}

export interface SearchableItem {
  id: string
  title: string
  subtitle?: string
  type: 'course' | 'homework' | 'grade' | 'document' | 'message' | 'student' | 'page' | 'event'
  section?: string
  href?: string
  keywords?: string
}

export interface AuthResult {
  ok: boolean
  session?: Session
  user?: User
  error?: string
}

export interface AuthProviderLike {
  readonly id: ProviderId
  readonly label: string
  readonly configured: boolean
  login(input?: Record<string, string>): Promise<AuthResult>
  logout(): Promise<void>
  getSession(): Promise<Session | null>
  refreshSession(): Promise<Session | null>
  isAuthenticated(): Promise<boolean>
  getUser(): Promise<User | null>
}
