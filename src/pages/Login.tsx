import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  GraduationCap,
  KeyRound,
  LoaderCircle,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  UserPlus,
} from 'lucide-react'
import { Button, Input, Segmented, Select } from '../components/ui'
import { LogoMark } from '../components/Logo'
import { useAuth } from '../providers/AuthProvider'
import { useToast } from '../providers/ToastProvider'
import { PROVIDER_UNCONFIGURED_MESSAGE } from '../services/auth'
import { useHotkey } from '../hooks'
import { probePronoteUrl } from '../services/pronoteApi'
import {
  searchCities,
  searchEstablishments,
  type Establishment,
  type EstablishmentCity,
  type EstablishmentType,
} from '../services/establishments'
import { cn } from '../utils/cn'

type Mode = 'login' | 'register' | 'pronote'

export function LoginPage() {
  const { loginLocal, registerLocal, loginPronote } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const discover = params.get('tab') === 'discover'

  const [mode, setMode] = useState<Mode>(discover ? 'pronote' : 'pronote')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [establishmentType, setEstablishmentType] = useState<EstablishmentType>('all')
  const [cityQuery, setCityQuery] = useState('')
  const [cities, setCities] = useState<EstablishmentCity[]>([])
  const [selectedCity, setSelectedCity] = useState<EstablishmentCity | null>(null)
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [establishmentLoading, setEstablishmentLoading] = useState(false)
  const [establishmentError, setEstablishmentError] = useState<string | null>(null)
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<string | null>(null)

  const [pronote, setPronote] = useState({
    url: '',
    username: '',
    password: '',
    kind: 'student' as 'student' | 'parent' | 'teacher',
    remember: true,
  })

  const [reg, setReg] = useState({
    displayName: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'teacher',
    className: '3e B',
    subject: 'Mathématiques',
  })

  useHotkey({ key: 'k', ctrl: true }, () => {})

  async function findCities() {
    setEstablishmentLoading(true)
    setEstablishmentError(null)
    try {
      const results = await searchCities(cityQuery)
      setCities(results)
      setSelectedCity(null)
      setEstablishments([])
      if (results.length === 0) setEstablishmentError('Aucune ville trouvée.')
    } catch (cause) {
      setEstablishmentError(cause instanceof Error ? cause.message : 'Impossible de rechercher les villes.')
    } finally {
      setEstablishmentLoading(false)
    }
  }

  async function findEstablishments(city?: EstablishmentCity) {
    const targetCity = city ?? selectedCity
    if (!targetCity) {
      setEstablishmentError('Recherchez puis sélectionnez d’abord votre ville.')
      return
    }
    setEstablishmentLoading(true)
    setEstablishmentError(null)
    setSelectedEstablishmentId(null)
    try {
      const results = await searchEstablishments({ type: establishmentType, city: targetCity.name, department: targetCity.department })
      setEstablishments(results.slice(0, 30))
      if (results.length === 0) setEstablishmentError('Aucun établissement trouvé dans cette ville avec ce filtre.')
    } catch (cause) {
      setEstablishmentError(cause instanceof Error ? cause.message : 'Impossible de rechercher les établissements.')
    } finally {
      setEstablishmentLoading(false)
    }
  }

  function selectCity(city: EstablishmentCity) {
    setSelectedCity(city)
    setCities([])
    setEstablishments([])
    void findEstablishments(city)
  }

  async function selectEstablishment(establishment: Establishment) {
    setSelectedEstablishmentId(establishment.id)
    const candidates = establishment.pronoteCandidates?.length
      ? establishment.pronoteCandidates
      : establishment.pronoteUrl
        ? [establishment.pronoteUrl]
        : []
    if (candidates.length === 0) {
      setEstablishmentError('Établissement sélectionné. Demandez-lui l’URL exacte de son portail Pronote.')
      return
    }
    setEstablishmentError(null)
    setPronote((current) => ({ ...current, url: candidates[0] }))
    setEstablishmentLoading(true)
    try {
      const results = await Promise.all(candidates.map((url) => probePronoteUrl(url, pronote.kind)))
      const hit = results.find((r) => r.ok)
      if (hit?.base || hit?.url) {
        const next = hit.base || hit.url || candidates[0]
        setPronote((current) => ({ ...current, url: next }))
        if (hit.cas) {
          setEstablishmentError(`${establishment.name} passe par un ENT (portail académique).`)
        } else {
          setEstablishmentError(
            `Pronote détecté${hit.establishmentName ? ` · ${hit.establishmentName}` : ''}${hit.version ? ` · v${hit.version}` : ''}.`,
          )
        }
      } else {
        setEstablishmentError(
          `Aucune page Pronote mobile trouvée pour ${establishment.name}. Vérifiez l'URL manuellement si l'établissement en fournit une.`,
        )
      }
    } finally {
      setEstablishmentLoading(false)
    }
  }

  async function submitLogin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await loginLocal(email.trim(), password, remember)
    setLoading(false)
    if (!res.ok) {
      setError(res.error ?? 'Connexion impossible.')
      return
    }
    toast.success('Connexion réussie', 'Bienvenue dans SCHOOLFLOW.')
    navigate('/app', { replace: true })
  }

  async function submitPronote(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await loginPronote(pronote.url.trim(), pronote.username.trim(), pronote.password, pronote.kind, pronote.remember)
    setLoading(false)
    if (!res.ok) {
      setError(res.error ?? 'Connexion Pronote impossible.')
      return
    }
    toast.success('Connexion Pronote réussie', 'Bienvenue dans SCHOOLFLOW.')
    navigate('/app', { replace: true })
  }

  async function submitRegister(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (reg.displayName.trim().length < 3) {
      setError('Indiquez votre nom complet.')
      return
    }
    setLoading(true)
    const res = await registerLocal({
      email: reg.email,
      password: reg.password,
      displayName: reg.displayName,
      role: reg.role,
      className: reg.className,
      subject: reg.subject,
    })
    setLoading(false)
    if (!res.ok) {
      setError(res.error ?? 'Création impossible.')
      return
    }
    toast.success('Compte local créé', 'Votre session est active.')
    navigate('/app', { replace: true })
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center px-5 pb-16 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoMark size={56} className="mb-4" />
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {mode === 'register' ? 'Créer un compte local' : 'Se connecter'}
          </h1>
          <p className="mt-1.5 text-sm text-ink-2">
            {mode === 'register'
              ? 'Compte fictif stocké uniquement sur cet appareil.'
              : mode === 'pronote'
                ? 'Connexion à votre établissement via Pronote.'
                : 'Compte local stocké sur cet appareil.'}
          </p>
        </div>

        <div className="glass-panel rounded-[28px] p-5 sm:p-6">
          <div className="mb-5 flex justify-center">
            <Segmented
              ariaLabel="Mode d'authentification"
              value={mode}
              onChange={(v) => {
                setMode(v as Mode)
                setError(null)
              }}
              options={[
                { value: 'pronote', label: 'Pronote' },
                { value: 'login', label: 'Local' },
                { value: 'register', label: 'Nouveau' },
              ]}
            />
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-2xl border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{error}</span>
            </div>
          )}

          {mode === 'pronote' ? (
            <form onSubmit={submitPronote} className="space-y-4">
              <div className="rounded-2xl border border-line-soft bg-surface-strong/60 p-3.5">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-softer text-accent">
                    <MapPin className="size-4.5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">Choisir ma ville</p>
                    <p className="mt-0.5 text-xs leading-5 text-ink-3">
                      Recherchez votre ville, puis choisissez votre collège ou votre lycée.
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                  <input
                    value={cityQuery}
                    onChange={(event) => setCityQuery(event.target.value)}
                    placeholder="Ex. Lyon, Nantes, Paris"
                    aria-label="Rechercher une ville"
                    className="h-10 min-w-0 rounded-xl border border-line-soft bg-surface-solid px-3 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-accent/50"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => void findCities()}
                    disabled={establishmentLoading || cityQuery.trim().length < 2}
                    aria-label="Rechercher une ville"
                  >
                    {establishmentLoading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Search className="size-4" aria-hidden />}
                    <span className="hidden sm:inline">Trouver</span>
                  </Button>
                </div>
                {cities.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-ink-2">Choisissez votre ville</p>
                    {cities.map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => selectCity(city)}
                        className="w-full rounded-xl border border-line-soft bg-surface-solid/70 px-3 py-2 text-left transition hover:border-accent/40 hover:bg-accent-softer/40"
                      >
                        <span className="block text-sm font-medium text-ink">{city.name}</span>
                        <span className="block text-xs text-ink-3">
                          {city.department ? `Département ${city.department}` : 'France'} · {city.postalCodes.slice(0, 3).join(', ')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedCity && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-accent-softer/50 px-3 py-2">
                    <span className="text-xs text-ink-2">Ville choisie : <strong>{selectedCity.name}</strong></span>
                    <select
                      value={establishmentType}
                      onChange={(event) => setEstablishmentType(event.target.value as EstablishmentType)}
                      aria-label="Type d’établissement"
                      className="ml-auto h-9 rounded-lg border border-line-soft bg-surface-solid px-2 text-xs text-ink outline-none focus:border-accent/50"
                    >
                      <option value="all">Tous</option>
                      <option value="Ecole">Écoles</option>
                      <option value="Collège">Collèges</option>
                      <option value="Lycée">Lycées</option>
                      <option value="EREA">EREA</option>
                      <option value="CIO">CIO</option>
                    </select>
                    <Button type="button" variant="ghost" size="sm" onClick={() => void findEstablishments()} disabled={establishmentLoading}>
                      Afficher
                    </Button>
                  </div>
                )}
                {establishmentError && <p className="mt-2 text-xs leading-5 text-warning">{establishmentError}</p>}
                {establishments.length > 0 && (
                  <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                    {establishments.map((establishment) => (
                      <button
                        key={establishment.id}
                        type="button"
                        onClick={() => selectEstablishment(establishment)}
                        className={cn(
                          'w-full rounded-xl border px-3 py-2 text-left transition hover:border-accent/40 hover:bg-accent-softer/40',
                          selectedEstablishmentId === establishment.id ? 'border-accent/50 bg-accent-softer/50' : 'border-line-soft bg-surface-solid/70',
                        )}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="min-w-0 truncate text-sm font-medium text-ink">{establishment.name}</span>
                          <span className="shrink-0 text-[11px] text-ink-3">
                            {establishment.distanceKm !== undefined ? `${establishment.distanceKm.toFixed(1)} km` : establishment.type}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-ink-3">
                          {establishment.type} · {establishment.postalCode} {establishment.city}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Input
                label="URL Pronote"
                name="pronoteUrl"
                required
                value={pronote.url}
                onChange={(e) => setPronote((p) => ({ ...p, url: e.target.value }))}
                placeholder="https://moncollege.index-education.net/pronote/eleve.html"
                hint="Utilisez l’adresse communiquée par votre établissement."
              />
              <Select
                label="Type de compte"
                value={pronote.kind}
                onChange={(e) => setPronote((p) => ({ ...p, kind: e.target.value as typeof pronote.kind }))}
              >
                <option value="student">Élève</option>
                <option value="parent">Parent</option>
                <option value="teacher">Professeur</option>
              </Select>
              <Input
                label="Identifiant Pronote"
                name="pronoteUsername"
                autoComplete="username"
                required
                value={pronote.username}
                onChange={(e) => setPronote((p) => ({ ...p, username: e.target.value }))}
              />
              <Input
                label="Mot de passe Pronote"
                name="pronotePassword"
                type="password"
                autoComplete="current-password"
                required
                value={pronote.password}
                onChange={(e) => setPronote((p) => ({ ...p, password: e.target.value }))}
                hint="Utilisé uniquement pour ouvrir votre session Pronote. Les identifiants ne sont pas conservés sur le serveur."
              />
              <p className="text-xs leading-5 text-ink-3">
                L’adresse, l’identifiant et le mot de passe sont ceux de votre établissement.{' '}
                <a
                  href="https://docs.index-education.com/docs_fr/fr-pronote-support-fiche-934-3529-se-connecter-a-l-espace-eleves.php"
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent underline underline-offset-2"
                >
                  Aide officielle Index Éducation
                </a>
              </p>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-2">
                <input
                  type="checkbox"
                  checked={pronote.remember}
                  onChange={(e) => setPronote((p) => ({ ...p, remember: e.target.checked }))}
                  className="size-4 rounded accent-[var(--accent)]"
                />
                Rester connecté sur cet appareil
              </label>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Connexion à Pronote…' : 'Se connecter'}
                <ArrowRight className="size-4.5" aria-hidden />
              </Button>
            </form>
          ) : mode === 'login' ? (
            <form onSubmit={submitLogin} className="space-y-4">
              <Input
                label="E-mail local"
                name="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@exemple.local"
              />

              <Input
                label="Mot de passe local"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                hint="Compte local uniquement — jamais un mot de passe scolaire."
              />

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="size-4 rounded accent-[var(--accent)]"
                />
                Rester connecté sur cet appareil
              </label>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Connexion…' : 'Se connecter'}
                <ArrowRight className="size-4.5" aria-hidden />
              </Button>
            </form>
          ) : mode === 'register' ? (
            <form onSubmit={submitRegister} className="space-y-4">
              <div className="flex justify-center">
                <Segmented
                  ariaLabel="Rôle"
                  value={reg.role}
                  onChange={(role) => setReg((r) => ({ ...r, role }))}
                  options={[
                    { value: 'student', label: 'Élève' },
                    { value: 'teacher', label: 'Professeur' },
                  ]}
                />
              </div>
              <Input
                label="Nom complet"
                required
                value={reg.displayName}
                onChange={(e) => setReg((r) => ({ ...r, displayName: e.target.value }))}
                placeholder="Prénom Nom"
              />
              <Input
                label="E-mail local"
                type="email"
                required
                value={reg.email}
                onChange={(e) => setReg((r) => ({ ...r, email: e.target.value }))}
                placeholder="prenom.nom@exemple.local"
              />
              <Input
                label="Mot de passe local"
                type="password"
                required
                minLength={6}
                value={reg.password}
                onChange={(e) => setReg((r) => ({ ...r, password: e.target.value }))}
                hint="6 caractères minimum. Ce mot de passe ne concerne aucun service externe."
              />
              {reg.role === 'student' ? (
                <Select
                  label="Classe"
                  value={reg.className}
                  onChange={(e) => setReg((r) => ({ ...r, className: e.target.value }))}
                >
                  {['5e A', '4e B', '3e B', '3e C', '2e A'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              ) : (
                <Select
                  label="Matière"
                  value={reg.subject}
                  onChange={(e) => setReg((r) => ({ ...r, subject: e.target.value }))}
                >
                  {['Mathématiques', 'Français', 'Histoire', 'Anglais VT', 'Physique', 'SVT'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              )}
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                <UserPlus className="size-4.5" aria-hidden />
                {loading ? 'Création…' : 'Créer mon compte local'}
              </Button>
            </form>
          ) : null}

          {/* External providers */}
          <div className="mt-6">
            <div className="relative mb-4 text-center">
              <div className="absolute inset-x-0 top-1/2 h-px bg-line-soft" aria-hidden />
              <span className="relative bg-surface-strong/0 px-3 text-[11px] font-medium tracking-wide text-ink-3">
                OU
              </span>
            </div>

            <p className="flex items-start gap-2 rounded-2xl bg-accent-softer px-3 py-2.5 text-[11px] leading-relaxed text-ink-2">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
              <span>
                {PROVIDER_UNCONFIGURED_MESSAGE} EduConnect n'est pas encore configuré. La connexion Pronote
                s'effectue via le serveur SCHOOLFLOW, qui n'enregistre pas vos identifiants.
              </span>
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-ink-3">
          <button type="button" onClick={() => setMode('pronote')} className="hover:text-accent">
            <GraduationCap className="mr-1 inline size-3.5" aria-hidden />
            Pronote
          </button>
          <button type="button" onClick={() => setMode('login')} className="hover:text-accent">
            <KeyRound className="mr-1 inline size-3.5" aria-hidden />
            Compte local
          </button>
          <Link to="/" className="hover:text-accent">
            Retour à l'accueil
          </Link>
        </div>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-ink-3/90">
          <Plus className="mr-1 inline size-3" aria-hidden />
          L'authentification Pronote s'effectue via le serveur SCHOOLFLOW (aucun CAPTCHA n'est contourné ;
          une vérification 2FA demandée par Pronote vous est signalée honnêtement).
        </p>
      </motion.div>
    </div>
  )
}
