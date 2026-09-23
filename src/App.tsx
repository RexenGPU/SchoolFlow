import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { PublicLayout } from './layouts/PublicLayout'
import { AppLayout } from './layouts/AppLayout'
import { RedirectIfAuthed, RequireAuth } from './components/Guards'
import { LandingPage } from './pages/Landing'
import { LoginPage } from './pages/Login'
import { LogoutPage } from './pages/Logout'
import { ErrorPage, NotFoundPage } from './pages/Errors'
import { DashboardPage } from './pages/Dashboard'
import { TimetablePage } from './pages/Timetable'
import { GradesPage } from './pages/Grades'
import { HomeworkPage } from './pages/Homework'
import { CahierDeTextesPage } from './pages/CahierDeTextes'
import { AbsencesPage } from './pages/Absences'
import { MessagesPage } from './pages/Messages'
import { DocumentsPage } from './pages/Documents'
import { CalendarPage } from './pages/Calendar'
import { NotificationsPage } from './pages/Notifications'
import { SyncPage } from './pages/Sync'
import { SettingsPage } from './pages/Settings'
import { ClassesPage } from './pages/teacher/Classes'
import { GradeEntryPage } from './pages/teacher/GradeEntry'
import { AttendancePage } from './pages/teacher/Attendance'
import { useEffect } from 'react'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route
            path="/"
            element={
              <RedirectIfAuthed>
                <LandingPage />
              </RedirectIfAuthed>
            }
          />
          <Route
            path="/login"
            element={
              <RedirectIfAuthed>
                <LoginPage />
              </RedirectIfAuthed>
            }
          />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="emploi-du-temps" element={<TimetablePage />} />
          <Route path="notes" element={<GradesPage />} />
          <Route path="devoirs" element={<HomeworkPage />} />
          <Route path="cahier-de-textes" element={<CahierDeTextesPage />} />
          <Route path="absences" element={<AbsencesPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="calendrier" element={<CalendarPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="synchronisation" element={<SyncPage />} />
          <Route path="parametres" element={<SettingsPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="saisie-notes" element={<GradeEntryPage />} />
          <Route path="nouveau-devoir" element={<HomeworkPage />} />
          <Route path="appel" element={<AttendancePage />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>
      </Routes>
    </>
  )
}

export { ErrorPage }
