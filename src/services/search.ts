import type { SearchableItem } from '../types'
import { defaultDocuments, defaultEvents, defaultHomeworks, defaultGrades, defaultCourses, defaultConversations } from '../data/demo'

export function buildSearchIndex(extra: SearchableItem[] = []): SearchableItem[] {
  const items: SearchableItem[] = [
    { id: 'p-dash', title: 'Tableau de bord', type: 'page', section: 'Navigation', href: '/app' },
    { id: 'p-tt', title: 'Emploi du temps', type: 'page', section: 'Navigation', href: '/app/emploi-du-temps' },
    { id: 'p-grades', title: 'Notes', type: 'page', section: 'Navigation', href: '/app/notes' },
    { id: 'p-hw', title: 'Devoirs', type: 'page', section: 'Navigation', href: '/app/devoirs' },
    { id: 'p-cahier', title: 'Cahier de textes', type: 'page', section: 'Navigation', href: '/app/cahier-de-textes' },
    { id: 'p-abs', title: 'Absences et retards', type: 'page', section: 'Navigation', href: '/app/absences' },
    { id: 'p-msg', title: 'Messagerie', type: 'page', section: 'Navigation', href: '/app/messages' },
    { id: 'p-doc', title: 'Documents', type: 'page', section: 'Navigation', href: '/app/documents' },
    { id: 'p-cal', title: 'Calendrier', type: 'page', section: 'Navigation', href: '/app/calendrier' },
    { id: 'p-notif', title: 'Notifications', type: 'page', section: 'Navigation', href: '/app/notifications' },
    { id: 'p-sync', title: 'Synchronisation', type: 'page', section: 'Navigation', href: '/app/synchronisation' },
    { id: 'p-set', title: 'Paramètres', type: 'page', section: 'Navigation', href: '/app/parametres' },

    ...defaultCourses().map((c) => ({
      id: `c-${c.id}`,
      title: c.subject,
      subtitle: `${c.start} — ${c.end} · ${c.room} · ${c.teacher}`,
      type: 'course' as const,
      section: 'Cours',
      href: '/app/emploi-du-temps',
      keywords: `${c.subject} ${c.teacher} ${c.room}`,
    })),

    ...defaultHomeworks().map((h) => ({
      id: `h-${h.id}`,
      title: h.title,
      subtitle: `${h.subject} · ${h.dueDate}`,
      type: 'homework' as const,
      section: 'Devoirs',
      href: '/app/devoirs',
      keywords: `${h.subject} ${h.title} ${h.description}`,
    })),

    ...defaultGrades().map((g) => ({
      id: `g-${g.id}`,
      title: `${g.subject} — ${g.value}/20`,
      subtitle: g.title,
      type: 'grade' as const,
      section: 'Notes',
      href: '/app/notes',
      keywords: `${g.subject} ${g.title}`,
    })),

    ...defaultDocuments().map((d) => ({
      id: `d-${d.id}`,
      title: d.name,
      subtitle: `${d.folder} · ${d.size}`,
      type: 'document' as const,
      section: 'Documents',
      href: '/app/documents',
      keywords: `${d.name} ${d.folder} ${d.subject ?? ''}`,
    })),

    ...defaultConversations().map((c) => ({
      id: `m-${c.id}`,
      title: c.subject,
      subtitle: c.participantNames.join(', '),
      type: 'message' as const,
      section: 'Messages',
      href: '/app/messages',
      keywords: `${c.subject} ${c.participantNames.join(' ')}`,
    })),

    ...defaultEvents().map((e) => ({
      id: `e-${e.id}`,
      title: e.title,
      subtitle: e.date,
      type: 'event' as const,
      section: 'Calendrier',
      href: '/app/calendrier',
      keywords: `${e.title} ${e.subject ?? ''}`,
    })),

    ...extra,
  ]

  return items
}

export function searchItems(items: SearchableItem[], query: string): SearchableItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return items.slice(0, 12)
  const terms = q.split(/\s+/)
  return items
    .map((item) => {
      const hay = `${item.title} ${item.subtitle ?? ''} ${item.section ?? ''} ${item.keywords ?? ''}`.toLowerCase()
      let score = 0
      for (const t of terms) {
        if (item.title.toLowerCase().startsWith(t)) score += 6
        else if (item.title.toLowerCase().includes(t)) score += 4
        if (hay.includes(t)) score += 2
      }
      return { item, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((r) => r.item)
}
