import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  CloudOff,
  FileText,
  GraduationCap,
  Lock,
  MessageSquare,
  Palette,
  Shield,
  Sparkles,
} from 'lucide-react'
import { LogoMark } from '../components/Logo'
import { Button } from '../components/ui'

const features = [
  { icon: Clock, title: 'Emploi du temps vivant', body: 'Jour ou semaine, cours annulés, salles modifiées — tout est lisible en un coup d’œil.' },
  { icon: GraduationCap, title: 'Notes & moyennes', body: 'Évolutions, coefficients, moyennes de classe et appréciations réunis au même endroit.' },
  { icon: BookOpen, title: 'Devoirs & cahier de textes', body: 'Filtres, échéances et suivi persistant pour ne plus rien oublier.' },
  { icon: MessageSquare, title: 'Messagerie intégrée', body: 'Conversations avec les enseignants et la vie scolaire, recherche et archivage.' },
  { icon: FileText, title: 'Documents organisés', body: 'Supports de cours classés par matière, favoris et aperçu rapide.' },
  { icon: CloudOff, title: 'Hors ligne & local', body: 'Vos données de démonstration restent sur votre appareil. Fonctionne hors connexion.' },
]

const steps = [
  { n: '01', title: 'Créez un compte local', body: 'Des comptes de démonstration entièrement fictifs, stockés uniquement sur votre appareil.' },
  { n: '02', title: 'Explorez l’espace élève ou prof', body: 'Dashboard, notes, appel, création de devoirs — tout est fonctionnel.' },
  { n: '03', title: 'Personnalisez', body: 'Mode sombre, couleur d’accent, animations, accessibilité et confidentialité.' },
]

export function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-4 sm:px-8">
      {/* Hero */}
      <section className="relative flex flex-col items-center pt-14 text-center sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <div className="glass-subtle mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-ink-2">
            <Sparkles className="size-3.5 text-accent" aria-hidden />
            Expérience scolaire 2026
          </div>

          <LogoMark size={76} className="mb-6 spring" />

          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-6xl md:text-7xl">
            SCHOOL<span className="text-accent">FLOW</span>
          </h1>
          <p className="mt-4 text-xl font-medium text-ink-2 sm:text-2xl text-balance">
            « L'école, simplement. »
          </p>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-3 sm:text-lg">
            Une expérience scolaire moderne, claire et pensée pour les élèves et les enseignants.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Se connecter
                <ArrowRight className="size-4.5" aria-hidden />
              </Button>
            </Link>
            <Link to="/login?tab=discover">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Découvrir
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-ink-3/90">
            Projet indépendant — aucune affiliation avec Pronote, EduConnect ou l'Éducation nationale.
          </p>
        </motion.div>

        {/* App preview mock */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 w-full"
        >
          <div className="glass-panel relative mx-auto max-w-4xl overflow-hidden rounded-[28px] p-3 sm:p-4">
            <div className="mb-3 flex items-center gap-1.5 px-1">
              <span className="size-2.5 rounded-full bg-danger/70" />
              <span className="size-2.5 rounded-full bg-warning/70" />
              <span className="size-2.5 rounded-full bg-success/70" />
              <span className="ml-3 rounded-lg bg-surface-strong px-2 py-0.5 text-[10px] text-ink-3">
                app.schoolflow.local
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="glass rounded-2xl p-4 text-left">
                <p className="text-[11px] font-semibold tracking-wide text-ink-3 uppercase">Prochain cours</p>
                <p className="mt-2 text-base font-semibold text-ink">Mathématiques</p>
                <p className="text-sm text-ink-2">10:00 — 11:00</p>
                <p className="text-xs text-accent">Salle B204</p>
              </div>
              <div className="glass rounded-2xl p-4 text-left">
                <p className="text-[11px] font-semibold tracking-wide text-ink-3 uppercase">Moyenne générale</p>
                <p className="mt-2 text-3xl font-semibold text-ink">14,7</p>
                <p className="text-sm text-ink-3">/ 20</p>
              </div>
              <div className="glass rounded-2xl p-4 text-left">
                <p className="text-[11px] font-semibold tracking-wide text-ink-3 uppercase">Devoirs</p>
                <p className="mt-2 text-base font-semibold text-ink">3 à venir</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-strong">
                  <div className="h-full w-2/3 rounded-full bg-accent" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mt-20 sm:mt-28" aria-labelledby="features-title">
        <div className="mb-8 text-center">
          <h2 id="features-title" className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Tout ce qu'il faut, rien de superflu
          </h2>
          <p className="mt-2 text-sm text-ink-2 sm:text-base">
            Une interface unique pour suivre toute la vie scolaire.
          </p>
        </div>
        <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className="glass rounded-3xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-accent-softer text-accent">
                <f.icon className="size-5" aria-hidden />
              </div>
              <h3 className="text-base font-semibold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mt-20 sm:mt-28" aria-labelledby="how-title">
        <div className="mb-8 text-center">
          <h2 id="how-title" className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Comment ça marche
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="glass rounded-3xl p-6">
              <p className="text-xs font-bold tracking-widest text-accent">{s.n}</p>
              <h3 className="mt-3 text-base font-semibold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="mt-20 sm:mt-28" aria-labelledby="trust-title">
        <div className="glass-panel rounded-[28px] p-6 sm:p-10">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex gap-3">
              <Shield className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
              <div>
                <h3 className="text-sm font-semibold text-ink">Aucune usurpation d'identité</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-2">
                  Projet indépendant de démonstration. Aucune affiliation avec Pronote, EduConnect,
                  Index Éducation ou l'Éducation nationale.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Lock className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
              <div>
                <h3 className="text-sm font-semibold text-ink">Jamais de mot de passe externe</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-2">
                  SCHOOLFLOW ne demande ni ne stocke votre mot de passe Pronote ou EduConnect. Si
                  l'intégration officielle n'est pas configurée, les boutons restent désactivés.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Palette className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
              <div>
                <h3 className="text-sm font-semibold text-ink">Données locales</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-2">
                  Les comptes et données de démonstration sont stockés sur cet appareil. Vous pouvez
                  tout effacer depuis les paramètres.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Essayer maintenant
                <ArrowRight className="size-4.5" aria-hidden />
              </Button>
            </Link>
            <p className="text-xs text-ink-3">
              <CheckCircle2 className="mr-1.5 inline size-3.5 text-success" aria-hidden />
              Comptes de démo inclus · mode élève & professeur
            </p>
          </div>
        </div>
      </section>

      {/* Mini features strip */}
      <section className="mt-14 flex flex-wrap items-center justify-center gap-2.5 text-xs text-ink-2" aria-label="Fonctionnalités">
        {[
          { icon: CalendarDays, label: 'Calendrier' },
          { icon: Bell, label: 'Notifications' },
          { icon: FileText, label: 'Recherche Ctrl+K' },
          { icon: CheckCircle2, label: 'Mode hors ligne' },
        ].map((i) => (
          <span key={i.label} className="glass-subtle inline-flex items-center gap-1.5 rounded-full px-3 py-1.5">
            <i.icon className="size-3.5 text-accent" aria-hidden />
            {i.label}
          </span>
        ))}
      </section>
    </div>
  )
}
