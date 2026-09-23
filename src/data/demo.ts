import type {
  AppNotification,
  AppSettings,
  Absence,
  ClassRoom,
  Conversation,
  Course,
  DocFile,
  Evaluation,
  Grade,
  Homework,
  LateMark,
  LessonEntry,
  SchoolEvent,
  Student,
} from '../types'
import { addDays, toISO } from '../utils/dates'

export const ESTABLISHMENT = 'Collège Jean-Moulin (démo)'

const DEMO_STUDENT = { id: 'u_lucas' }
const DEMO_TEACHER = { id: 'u_claire' }
const DEMO_STUDENT_2 = { id: 'u_ines' }

export const SUBJECT_COLORS: Record<string, string> = {
  Mathématiques: '#6366f1',
  Français: '#f43f5e',
  'Anglais VT': '#0ea5e9',
  Histoire: '#f59e0b',
  'Histoire-Géo': '#f59e0b',
  Physique: '#14b8a6',
  SVT: '#22c55e',
  'EPS': '#84cc16',
  Arts: '#ec4899',
  Musique: '#a855f7',
  Technologie: '#64748b',
  'Philosophie': '#8b5cf6',
}

export function subjectColor(subject: string): string {
  return SUBJECT_COLORS[subject] ?? '#6366f1'
}

/* ------------------------------------------------------------------ */
/*  Timetable                                                           */
/* ------------------------------------------------------------------ */

export function defaultCourses(): Course[] {
  return [
    // Lundi
    { id: 'c1', subject: 'Mathématiques', teacher: 'M. Martin', room: 'B204', day: 1, start: '08:00', end: '09:00' },
    { id: 'c2', subject: 'Français', teacher: 'Mme Roux', room: 'A105', day: 1, start: '09:00', end: '10:00' },
    { id: 'c3', subject: 'Histoire', teacher: 'M. Lefèvre', room: 'C112', day: 1, start: '10:15', end: '11:15' },
    { id: 'c4', subject: 'Anglais VT', teacher: 'Mme Taylor', room: 'D201', day: 1, start: '11:15', end: '12:15' },
    { id: 'c5', subject: 'EPS', teacher: 'M. Girard', room: 'Gymnase', day: 1, start: '14:00', end: '15:30' },

    // Mardi
    { id: 'c6', subject: 'Physique', teacher: 'Mme Costa', room: 'Labo 2', day: 2, start: '08:00', end: '09:00' },
    { id: 'c7', subject: 'Mathématiques', teacher: 'M. Martin', room: 'B204', day: 2, start: '09:00', end: '10:00' },
    { id: 'c8', subject: 'Français', teacher: 'Mme Roux', room: 'A105', day: 2, start: '10:15', end: '11:15' },
    { id: 'c9', subject: 'SVT', teacher: 'M. Petit', room: 'Labo 1', day: 2, start: '11:15', end: '12:15' },
    { id: 'c10', subject: 'Arts', teacher: 'Mme Noël', room: 'Atelier', day: 2, start: '14:00', end: '15:30' },

    // Mercredi
    { id: 'c11', subject: 'Mathématiques', teacher: 'M. Martin', room: 'B204', day: 3, start: '08:00', end: '09:00' },
    { id: 'c12', subject: 'Histoire', teacher: 'M. Lefèvre', room: 'C112', day: 3, start: '09:00', end: '10:00' },
    { id: 'c13', subject: 'Anglais VT', teacher: 'Mme Taylor', room: 'D201', day: 3, start: '10:15', end: '11:15' },
    {
      id: 'c14',
      subject: 'Technologie',
      teacher: 'M. Blanc',
      room: 'Tech 3',
      day: 3,
      start: '11:15',
      end: '12:15',
      cancelled: true,
      modificationNote: 'Cours annulé — absent du professeur',
    },

    // Jeudi
    { id: 'c15', subject: 'Français', teacher: 'Mme Roux', room: 'A105', day: 4, start: '08:00', end: '09:00' },
    { id: 'c16', subject: 'Physique', teacher: 'Mme Costa', room: 'Labo 2', day: 4, start: '09:00', end: '10:00' },
    { id: 'c17', subject: 'Mathématiques', teacher: 'M. Martin', room: 'B204', day: 4, start: '10:15', end: '11:15' },
    {
      id: 'c18',
      subject: 'Histoire',
      teacher: 'M. Lefèvre',
      room: 'C118',
      day: 4,
      start: '11:15',
      end: '12:15',
      modified: true,
      modificationNote: 'Salle modifiée : C112 → C118',
    },
    { id: 'c19', subject: 'Musique', teacher: 'Mme Aria', room: 'Salle musique', day: 4, start: '14:00', end: '15:30' },

    // Vendredi
    { id: 'c20', subject: 'SVT', teacher: 'M. Petit', room: 'Labo 1', day: 5, start: '08:00', end: '09:00' },
    { id: 'c21', subject: 'Anglais VT', teacher: 'Mme Taylor', room: 'D201', day: 5, start: '09:00', end: '10:00' },
    { id: 'c22', subject: 'Mathématiques', teacher: 'M. Martin', room: 'B204', day: 5, start: '10:15', end: '11:15' },
    { id: 'c23', subject: 'EPS', teacher: 'M. Girard', room: 'Stade', day: 5, start: '11:15', end: '12:15' },
    { id: 'c24', subject: 'Français', teacher: 'Mme Roux', room: 'A105', day: 5, start: '14:00', end: '15:00' },
  ]
}

export const COURSE_SLOTS: { start: string; end: string }[] = [
  { start: '08:00', end: '09:00' },
  { start: '09:00', end: '10:00' },
  { start: '10:15', end: '11:15' },
  { start: '11:15', end: '12:15' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
  { start: '16:15', end: '17:15' },
]

/* ------------------------------------------------------------------ */
/*  Grades                                                              */
/* ------------------------------------------------------------------ */

export function defaultGrades(): Grade[] {
  return [
    { id: 'g1', subject: 'Mathématiques', title: 'Devoir surveillé n°2', value: 16, coef: 3, date: daysAgo(4), classAverage: 13.2, comment: 'Très bon travail, raisonnement clair.' },
    { id: 'g2', subject: 'Mathématiques', title: 'Interrogation — fractions', value: 14, coef: 1, date: daysAgo(12), classAverage: 12.8 },
    { id: 'g3', subject: 'Mathématiques', title: 'Dictée de nombres', value: 15.5, coef: 1, date: daysAgo(20), classAverage: 14.1 },
    { id: 'g4', subject: 'Français', title: 'Dissertation', value: 14, coef: 2, date: daysAgo(6), classAverage: 12.4, comment: 'Plan bien construit.' },
    { id: 'g5', subject: 'Français', title: 'Oral — exposé', value: 15, coef: 2, date: daysAgo(15), classAverage: 13.6 },
    { id: 'g6', subject: 'Anglais VT', title: 'Written exam', value: 17, coef: 2, date: daysAgo(8), classAverage: 13.9, comment: 'Excellent level.' },
    { id: 'g7', subject: 'Anglais VT', title: 'Speaking', value: 16, coef: 1, date: daysAgo(18), classAverage: 14.2 },
    { id: 'g8', subject: 'Histoire', title: 'Composition — Révolution', value: 13, coef: 2, date: daysAgo(10), classAverage: 12.1 },
    { id: 'g9', subject: 'Histoire', title: 'QCM chapitre 4', value: 14, coef: 1, date: daysAgo(22), classAverage: 13.4 },
    { id: 'g10', subject: 'Physique', title: 'TP — circuits', value: 15, coef: 2, date: daysAgo(9), classAverage: 13.7 },
    { id: 'g11', subject: 'Physique', title: 'Interrogation optique', value: 15, coef: 1, date: daysAgo(17), classAverage: 12.9 },
    { id: 'g12', subject: 'SVT', title: 'Devoir — digestion', value: 13.5, coef: 2, date: daysAgo(11), classAverage: 13.1 },
    { id: 'g13', subject: 'EPS', title: 'Course endurance', value: 16, coef: 1, date: daysAgo(14), classAverage: 14.5 },
    { id: 'g14', subject: 'Arts', title: 'Projet graphique', value: 15, coef: 1, date: daysAgo(19), classAverage: 14.8 },
  ]
}

function daysAgo(n: number): string {
  return toISO(addDays(new Date(), -n))
}

function daysAhead(n: number): string {
  return toISO(addDays(new Date(), n))
}

/* ------------------------------------------------------------------ */
/*  Homework                                                            */
/* ------------------------------------------------------------------ */

export function defaultHomeworks(): Homework[] {
  return [
    {
      id: 'h1',
      subject: 'Mathématiques',
      title: 'Exercices 12 à 18 page 47',
      description: 'Résoudre les équations du premier degré et vérifier les solutions.',
      dueDate: daysAhead(1),
      status: 'todo',
      attachments: ['equations.pdf'],
      className: '3e B',
      createdBy: 'Claire Martin',
      studentId: DEMO_STUDENT.id,
    },
    {
      id: 'h2',
      subject: 'Français',
      title: 'Rédaction — mon portrait',
      description: 'Rédiger un portrait littéraire de 250 mots environ, en veillant à la construction du paragraphe.',
      dueDate: daysAhead(3),
      status: 'todo',
      className: '3e B',
      createdBy: 'Mme Roux',
      studentId: DEMO_STUDENT.id,
    },
    {
      id: 'h3',
      subject: 'Anglais VT',
      title: 'Learn vocabulary unit 5',
      description: 'Réviser le lexique de l\'unité 5 et préparer l\'oral de jeudi.',
      dueDate: daysAhead(2),
      status: 'todo',
      attachments: ['unit5-words.pdf'],
      className: '3e B',
      createdBy: 'Mme Taylor',
      studentId: DEMO_STUDENT.id,
    },
    {
      id: 'h4',
      subject: 'Histoire',
      title: 'Fiche de révision — la Révolution',
      description: 'Synthèse sur les causes et les étapes de la Révolution française.',
      dueDate: daysAgo(2),
      status: 'todo',
      className: '3e B',
      createdBy: 'M. Lefèvre',
      studentId: DEMO_STUDENT.id,
    },
    {
      id: 'h5',
      subject: 'Physique',
      title: 'Compte rendu de TP',
      description: 'Rédiger le compte rendu du TP sur les circuits en série et en dérivation.',
      dueDate: daysAgo(5),
      status: 'done',
      attachments: ['modele-tp.docx'],
      className: '3e B',
      createdBy: 'Mme Costa',
      studentId: DEMO_STUDENT.id,
    },
    {
      id: 'h6',
      subject: 'SVT',
      title: 'Schéma bilan digestif',
      description: 'Réaliser un schéma légendé du parcours alimentaire.',
      dueDate: daysAgo(8),
      status: 'done',
      className: '3e B',
      createdBy: 'M. Petit',
      studentId: DEMO_STUDENT.id,
    },
    {
      id: 'h7',
      subject: 'Mathématiques',
      title: 'Proportionnalité — exercices 3 à 9',
      description: 'Entrainer les grandeurs proportionnelles et les pourcentages.',
      dueDate: daysAhead(6),
      status: 'todo',
      className: '3e B',
      createdBy: 'Claire Martin',
      studentId: DEMO_STUDENT.id,
    },
    {
      id: 'h8',
      subject: 'Français',
      title: 'Lecture — extrait',
      description: 'Lire l\'extrait du roman et préparer les questions de discussion.',
      dueDate: daysAhead(4),
      status: 'todo',
      className: '3e B',
      createdBy: 'Mme Roux',
      studentId: DEMO_STUDENT.id,
    },
  ]
}

/* ------------------------------------------------------------------ */
/*  Cahier de textes                                                    */
/* ------------------------------------------------------------------ */

export function defaultLessons(): LessonEntry[] {
  return [
    {
      id: 'l1',
      subject: 'Mathématiques',
      title: 'Équations du premier degré',
      description: 'Résolution et vérification',
      content:
        'On apprend à résoudre des équations de la forme ax + b = c. Méthode : isoler l\'inconnu en effectuant les mêmes opérations à chaque membre, puis vérifier la solution en la remplaçant dans l\'équation initiale.',
      date: daysAgo(1),
      homeworkId: 'h1',
      documents: ['equations-cours.pdf', 'exercices-12-18.pdf'],
      resources: [{ label: 'Vidéo — résoudre une équation', url: '#' }],
    },
    {
      id: 'l2',
      subject: 'Français',
      title: 'Le portrait littéraire',
      description: 'Description et construction du paragraphe',
      content:
        'Le portrait littéraire met en évidence les traits physiques et moraux d\'un personnage. On observe l\'ordre des observations, les comparaisons et les champ lexicaux utilisés par l\'auteur.',
      date: daysAgo(2),
      homeworkId: 'h2',
      documents: ['texte-reference.pdf'],
      resources: [],
    },
    {
      id: 'l3',
      subject: 'Histoire',
      title: 'Les causes de la Révolution française',
      description: 'Crise sociale, financière et idées des Lumières',
      content:
        'Trois ordres, inégalités fiscales, dettes de la monarchie et diffusion des idées des Lumières constituent le terreau de la Révolution de 1789.',
      date: daysAgo(3),
      homeworkId: 'h4',
      documents: ['chronologie.pdf'],
      resources: [{ label: 'Frise interactive', url: '#' }],
    },
    {
      id: 'l4',
      subject: 'Physique',
      title: 'Circuits en série et en dérivation',
      description: 'TP et lois de l\'électricité',
      content:
        'Étude du courant et de la tension dans deux types de circuits. Utilisation d\'un multimètre et interprétation des mesures.',
      date: daysAgo(5),
      homeworkId: 'h5',
      documents: ['fiche-tp.pdf'],
      resources: [],
    },
    {
      id: 'l5',
      subject: 'Anglais VT',
      title: 'Unit 5 — Daily routines',
      description: 'Vocabulaire et présent simple',
      content:
        'Revision of daily activities vocabulary, present simple affirmative / negative / questions, time expressions.',
      date: daysAgo(4),
      homeworkId: 'h3',
      documents: ['unit5.pdf'],
      resources: [{ label: 'Audio track', url: '#' }],
    },
    {
      id: 'l6',
      subject: 'SVT',
      title: 'Le parcours alimentaire',
      description: 'Digestion et absorption',
      content:
        'De la bouche au côlon : rôles de l\'estomac, de l\'intestin grêle et absorption des nutriments.',
      date: daysAgo(6),
      homeworkId: 'h6',
      documents: ['scheme-bilan.pdf'],
      resources: [],
    },
  ]
}

/* ------------------------------------------------------------------ */
/*  Absences & retards                                                  */
/* ------------------------------------------------------------------ */

export function defaultAbsences(): Absence[] {
  return [
    { id: 'a1', date: daysAgo(9), from: '08:00', to: '10:00', duration: '2 h', status: 'justified', reason: 'Rendez-vous médical', justified: true },
    { id: 'a2', date: daysAgo(23), from: '14:00', to: '16:00', duration: '2 h', status: 'pending', reason: 'Non renseignée', justified: false },
  ]
}

export function defaultLates(): LateMark[] {
  return [
    { id: 'r1', date: daysAgo(5), minutes: 10, status: 'justified', reason: 'Bus en retard' },
    { id: 'r2', date: daysAgo(16), minutes: 5, status: 'unjustified' },
  ]
}

/* ------------------------------------------------------------------ */
/*  Messages                                                            */
/* ------------------------------------------------------------------ */

export function defaultConversations(): Conversation[] {
  return [
    {
      id: 'm1',
      subject: 'Devoir de mathématiques',
      participants: [DEMO_STUDENT.id, DEMO_TEACHER.id],
      participantNames: ['Claire Martin', 'Lucas Morel'],
      unread: 2,
      archived: false,
      updatedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      messages: [
        {
          id: 'm1a',
          senderId: DEMO_TEACHER.id,
          senderName: 'Claire Martin',
          body: 'Bonjour Lucas, pense à bien justifier chaque étape de la résolution pour le devoir de jeudi.',
          at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          read: true,
        },
        {
          id: 'm1b',
          senderId: DEMO_STUDENT.id,
          senderName: 'Lucas Morel',
          body: 'Bonjour Madame, bien noté. Je m\'y mets ce soir.',
          at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          read: true,
        },
        {
          id: 'm1c',
          senderId: DEMO_TEACHER.id,
          senderName: 'Claire Martin',
          body: 'Parfait. N\'hésite pas si un exercice te bloque.',
          at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          read: false,
        },
        {
          id: 'm1d',
          senderId: DEMO_TEACHER.id,
          senderName: 'Claire Martin',
          body: 'J\'ai ajouté une fiche d\'entraînement dans les documents de la classe.',
          at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
          read: false,
        },
      ],
    },
    {
      id: 'm2',
      subject: 'Sortie pédagogique — musée',
      participants: [DEMO_STUDENT.id, 'u_vie'],
      participantNames: ['Mme Fontaine (Vie scolaire)', 'Lucas Morel'],
      unread: 1,
      archived: false,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      messages: [
        {
          id: 'm2a',
          senderId: 'u_vie',
          senderName: 'Mme Fontaine (Vie scolaire)',
          body: 'Bonjour, la confirmation de la sortie du 12 est attendue avant vendredi. Merci de renvoyer l\'autorisation signée.',
          at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          read: false,
        },
      ],
    },
    {
      id: 'm3',
      subject: 'Anglais — oral de jeudi',
      participants: [DEMO_STUDENT.id, 'u_taylor'],
      participantNames: ['Mme Taylor', 'Lucas Morel'],
      unread: 0,
      archived: false,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      messages: [
        {
          id: 'm3a',
          senderId: 'u_taylor',
          senderName: 'Mme Taylor',
          body: 'Hi Lucas! Don\'t forget to prepare a 2-minute talk about your daily routine.',
          at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
          read: true,
        },
        {
          id: 'm3b',
          senderId: DEMO_STUDENT.id,
          senderName: 'Lucas Morel',
          body: 'Thanks! I\'ll practice tonight.',
          at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
          read: true,
        },
      ],
    },
    {
      id: 'm4',
      subject: 'Absence du 12 mars',
      participants: [DEMO_STUDENT.id, 'u_vie'],
      participantNames: ['Mme Fontaine (Vie scolaire)', 'Lucas Morel'],
      unread: 0,
      archived: true,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      messages: [
        {
          id: 'm4a',
          senderId: 'u_vie',
          senderName: 'Mme Fontaine (Vie scolaire)',
          body: 'Votre justificatif a bien été enregistré. L\'absence est maintenant justifiée.',
          at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
          read: true,
        },
      ],
    },
    {
      id: 'm5',
      subject: 'Projet de groupe — SVT',
      participants: [DEMO_STUDENT.id, DEMO_STUDENT_2.id, 'u_petit'],
      participantNames: ['M. Petit', 'Inès Bernard', 'Lucas Morel'],
      unread: 0,
      archived: false,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
      messages: [
        {
          id: 'm5a',
          senderId: DEMO_STUDENT_2.id,
          senderName: 'Inès Bernard',
          body: 'Je m\'occupe des schémas, tu peux faire la bibliographie ?',
          at: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
          read: true,
        },
        {
          id: 'm5b',
          senderId: DEMO_STUDENT.id,
          senderName: 'Lucas Morel',
          body: 'Oui, parfait. Je m\'en occupe demain.',
          at: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
          read: true,
        },
      ],
    },
  ]
}

/* ------------------------------------------------------------------ */
/*  Documents                                                           */
/* ------------------------------------------------------------------ */

export function defaultDocuments(): DocFile[] {
  return [
    { id: 'd1', name: 'Cours — Équations.pdf', folder: 'Mathématiques', subject: 'Mathématiques', size: '1,2 Mo', kind: 'pdf', updatedAt: daysAgo(1), favorite: true, description: 'Support de cours complet' },
    { id: 'd2', name: 'Exercices 12-18.pdf', folder: 'Mathématiques', subject: 'Mathématiques', size: '640 Ko', kind: 'pdf', updatedAt: daysAgo(1), favorite: false },
    { id: 'd3', name: 'Fiche proportionnalité.docx', folder: 'Mathématiques', subject: 'Mathématiques', size: '88 Ko', kind: 'doc', updatedAt: daysAgo(7), favorite: false },
    { id: 'd4', name: 'Dissertation — méthode.pdf', folder: 'Français', subject: 'Français', size: '950 Ko', kind: 'pdf', updatedAt: daysAgo(6), favorite: true },
    { id: 'd5', name: 'Texte de référence — portrait.pdf', folder: 'Français', subject: 'Français', size: '320 Ko', kind: 'pdf', updatedAt: daysAgo(6), favorite: false },
    { id: 'd6', name: 'Chronologie Révolution.png', folder: 'Histoire', subject: 'Histoire', size: '2,1 Mo', kind: 'image', updatedAt: daysAgo(3), favorite: false },
    { id: 'd7', name: 'Fiche de révision — 1789.docx', folder: 'Histoire', subject: 'Histoire', size: '120 Ko', kind: 'doc', updatedAt: daysAgo(3), favorite: true },
    { id: 'd8', name: 'Schéma bilan digestif.pdf', folder: 'Sciences', subject: 'SVT', size: '780 Ko', kind: 'pdf', updatedAt: daysAgo(6), favorite: false },
    { id: 'd9', name: 'TP circuits — modèle.docx', folder: 'Sciences', subject: 'Physique', size: '64 Ko', kind: 'doc', updatedAt: daysAgo(9), favorite: false },
    { id: 'd10', name: 'Unit 5 vocabulary.pdf', folder: 'Mathématiques', subject: 'Anglais VT', size: '410 Ko', kind: 'pdf', updatedAt: daysAgo(4), favorite: false },
    { id: 'd11', name: 'Planning trimestre.xlsx', folder: 'Administration', size: '54 Ko', kind: 'sheet', updatedAt: daysAgo(12), favorite: false },
    { id: 'd12', name: 'Règlement intérieur.pdf', folder: 'Administration', size: '260 Ko', kind: 'pdf', updatedAt: daysAgo(40), favorite: false },
    { id: 'd13', name: 'Autorisation sortie — musée.pdf', folder: 'Administration', size: '180 Ko', kind: 'pdf', updatedAt: daysAgo(5), favorite: true },
    { id: 'd14', name: 'Présentation projet.pptx', folder: 'Sciences', subject: 'Technologie', size: '3,4 Mo', kind: 'slide', updatedAt: daysAgo(10), favorite: false },
    { id: 'd15', name: 'Convocation conseil de classe.docx', folder: 'Administration', size: '42 Ko', kind: 'doc', updatedAt: daysAgo(2), favorite: false },
  ]
}

export const DOCUMENT_FOLDERS = ['Mathématiques', 'Français', 'Histoire', 'Sciences', 'Administration'] as const

/* ------------------------------------------------------------------ */
/*  Events                                                              */
/* ------------------------------------------------------------------ */

export function defaultEvents(): SchoolEvent[] {
  return [
    { id: 'e1', title: 'Devoir de mathématiques', date: daysAhead(1), time: '08:00', type: 'homework', subject: 'Mathématiques', description: 'Équations du premier degré' },
    { id: 'e2', title: 'Oral d\'anglais', date: daysAhead(2), time: '09:00', type: 'eval', subject: 'Anglais VT', description: 'Daily routines — 2 min par élève' },
    { id: 'e3', title: 'Rédaction', date: daysAhead(3), time: '08:00', type: 'homework', subject: 'Français' },
    { id: 'e4', title: 'Conseil de classe', date: daysAhead(5), time: '16:00', type: 'event', description: 'Salle des professeurs' },
    { id: 'e5', title: 'Devoir surveillé — Histoire', date: daysAhead(7), time: '10:15', type: 'eval', subject: 'Histoire' },
    { id: 'e6', title: 'Sortie musée', date: daysAhead(9), allDay: true, type: 'event', description: 'Départ à 08:30 devant le collège' },
    { id: 'e7', title: 'Vacances de printemps', date: daysAhead(14), end: daysAhead(28), allDay: true, type: 'vacation' },
    { id: 'e8', title: 'Réunion parents-professeurs', date: daysAhead(11), time: '17:30', type: 'event' },
    { id: 'e9', title: 'TP physique', date: daysAgo(1), time: '09:00', type: 'course', subject: 'Physique' },
    { id: 'e10', title: 'Interrogation SVT', date: daysAhead(4), time: '11:15', type: 'eval', subject: 'SVT' },
  ]
}

/* ------------------------------------------------------------------ */
/*  Notifications                                                       */
/* ------------------------------------------------------------------ */

export function defaultNotifications(): AppNotification[] {
  return [
    { id: 'n1', title: 'Nouveau devoir de mathématiques', body: 'Exercices 12 à 18 page 47 — pour demain', kind: 'homework', at: new Date(Date.now() - 1000 * 60 * 35).toISOString(), read: false },
    { id: 'n2', title: 'Nouvelle note disponible', body: 'Anglais VT — Written exam : 17/20', kind: 'grade', at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), read: false },
    { id: 'n3', title: 'Nouveau message', body: 'Claire Martin : « J\'ai ajouté une fiche d\'entraînement… »', kind: 'message', at: new Date(Date.now() - 1000 * 60 * 42).toISOString(), read: false },
    { id: 'n4', title: 'Modification de votre emploi du temps', body: 'Histoire — salle modifiée : C112 → C118', kind: 'schedule', at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), read: true },
    { id: 'n5', title: 'Cours annulé', body: 'Technologie (mercredi) — absent du professeur', kind: 'schedule', at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), read: true },
    { id: 'n6', title: 'Absence en attente de justificatif', body: 'Absence du — merci de fournir un justificatif', kind: 'absence', at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), read: true },
    { id: 'n7', title: 'Synchronisation terminée', body: 'Toutes les données disponibles ont été mises à jour', kind: 'system', at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), read: true },
  ]
}

/* ------------------------------------------------------------------ */
/*  Teacher data                                                        */
/* ------------------------------------------------------------------ */

function makeStudents(prefix: string, names: string[], avgs: number[], abs: number[]): Student[] {
  return names.map((name, i) => ({
    id: `${prefix}_s${i + 1}`,
    name,
    average: avgs[i] ?? 12,
    absences: abs[i] ?? 0,
  }))
}

export function defaultClasses(): ClassRoom[] {
  const c3c = makeStudents(
    '3c',
    [
      'Lucas Morel',
      'Inès Bernard',
      'Tom Chevalier',
      'Emma Lefevre',
      'Nathan Petit',
      'Chloé Roux',
      'Hugo Martin',
      'Léa Garcia',
      'Adam Fournier',
      'Jade Moulin',
      'Sami Benali',
      'Manon Girard',
      'Ethan Leroy',
      'Rose Dubois',
      'Noah Fontaine',
      'Camille Mercier',
    ],
    [14.7, 15.2, 11.4, 13.8, 12.1, 14.4, 10.9, 15.8, 12.7, 13.2, 14.1, 11.8, 16.3, 12.5, 13.6, 14.9],
    [2, 0, 4, 1, 3, 0, 5, 0, 1, 2, 0, 3, 0, 1, 2, 0],
  )

  const c5a = makeStudents(
    '5a',
    ['Alice Robert', 'Louis Bernard', 'Éva Thomas', 'Paul Moreau', 'Anna Simon', 'Maxime Laurent', 'Zoé Michel', 'Nathan Garcia', 'Lina Roussel', 'Gabriel Hubert', 'Sarah Legendre', 'Jules Perrin'],
    [13.1, 14.6, 12.4, 11.2, 15.1, 12.8, 13.9, 10.6, 14.2, 12.0, 13.5, 11.7],
    [1, 0, 2, 3, 0, 1, 0, 4, 0, 2, 1, 0],
  )

  const c4b = makeStudents(
    '4b',
    ['Mila Fontaine', 'Arthur Chevalier', 'Louise Garnier', 'Ethan Perrin', 'Inaya Morel', 'Maël Duval', 'Anaïs Leroux', 'Kylian Bonnet', 'Emma Vidal', 'Noé Blanc', 'Clara Faure', 'Malo Colin', 'Sarah Renard', 'Ilan Lopez'],
    [15.4, 11.9, 13.3, 12.6, 14.8, 10.4, 13.7, 11.1, 14.0, 12.9, 15.0, 11.5, 13.4, 12.2],
    [0, 3, 1, 2, 0, 5, 1, 0, 0, 2, 0, 3, 1, 0],
  )

  return [
    {
      id: 'cl_3c',
      name: '3e C',
      level: '3e',
      subject: 'Mathématiques',
      students: c3c,
      average: 13.4,
      absences: 24,
      lastEvaluation: { title: 'DS — Équations', date: daysAgo(4), classAverage: 13.2 },
    },
    {
      id: 'cl_4b',
      name: '4e B',
      level: '4e',
      subject: 'Mathématiques',
      students: c4b,
      average: 12.9,
      absences: 18,
      lastEvaluation: { title: 'Interrogation — fractions', date: daysAgo(11), classAverage: 12.6 },
    },
    {
      id: 'cl_5a',
      name: '5e A',
      level: '5e',
      subject: 'Mathématiques',
      students: c5a,
      average: 13.1,
      absences: 14,
      lastEvaluation: { title: 'Devoir — proportionnalité', date: daysAgo(8), classAverage: 13.0 },
    },
  ]
}

export function defaultEvaluations(): Evaluation[] {
  return [
    { id: 'ev1', classId: 'cl_3c', subject: 'Mathématiques', title: 'DS — Équations', date: daysAgo(4), coef: 2 },
    { id: 'ev2', classId: 'cl_3c', subject: 'Mathématiques', title: 'Interrogation', date: daysAhead(3), coef: 1 },
    { id: 'ev3', classId: 'cl_4b', subject: 'Mathématiques', title: 'Composition', date: daysAhead(6), coef: 3 },
    { id: 'ev4', classId: 'cl_5a', subject: 'Mathématiques', title: 'Contrôle — pourcentages', date: daysAhead(8), coef: 2 },
  ]
}

export function defaultSettings(): AppSettings {
  return {
    theme: 'auto',
    accent: '#6366f1',
    animations: true,
    notifications: true,
    autoSync: true,
    textScale: 1,
  }
}

/** Teacher's own demo homeworks (published to students). */
export function defaultTeacherHomeworks(): Homework[] {
  return [
    {
      id: 'th1',
      subject: 'Mathématiques',
      title: 'Exercices 12 à 18 page 47',
      description: 'Résoudre les équations du premier degré.',
      dueDate: daysAhead(1),
      status: 'todo',
      className: '3e B',
      createdBy: 'Claire Martin',
    },
    {
      id: 'th2',
      subject: 'Mathématiques',
      title: 'Proportionnalité — exercices 3 à 9',
      description: 'Entrainer les grandeurs proportionnelles.',
      dueDate: daysAhead(6),
      status: 'todo',
      className: '3e B',
      createdBy: 'Claire Martin',
    },
  ]
}
