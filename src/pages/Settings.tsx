import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Accessibility,
  Bell,
  Cloud,
  Database,
  Info,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Shield,
  Sun,
  Trash2,
  User,
} from 'lucide-react'
import { Badge, Button, GlassCard, PageHeader, Progress, Switch } from '../components/ui'
import { ACCENTS, useTheme } from '../providers/ThemeProvider'
import { useAuth } from '../providers/AuthProvider'
import { useData } from '../providers/DataProvider'
import { useToast } from '../providers/ToastProvider'
import { estimateLocalDataSize, storage } from '../services/storage'
import { loadSyncState } from '../services/sync'
import { cn } from '../utils/cn'
import type { ThemeMode } from '../types'

type Section = 'compte' | 'apparence' | 'notifications' | 'confidentialite' | 'sync' | 'accessibilite'

const sections: { id: Section; label: string; icon: typeof User }[] = [
  { id: 'compte', label: 'Compte', icon: User },
  { id: 'apparence', label: 'Apparence', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'confidentialite', label: 'Confidentialité', icon: Shield },
  { id: 'sync', label: 'Synchronisation', icon: Cloud },
  { id: 'accessibilite', label: 'Accessibilité', icon: Accessibility },
]

export function SettingsPage() {
  const [section, setSection] = useState<Section>('compte')
  const { settings, setTheme, setAccent, update } = useTheme()
  const { user, session, logout, deleteLocalAccount } = useAuth()
  const { resetDemoData, notifications } = useData()
  const toast = useToast()
  const navigate = useNavigate()
  const [confirmClear, setConfirmClear] = useState(false)
  const [dataSize, setDataSize] = useState(() => estimateLocalDataSize())
  const sync = loadSyncState()

  const isLocal = session?.provider === 'local'

  async function handleLogout() {
    await logout()
    toast.info('Déconnexion', 'Session locale fermée.')
    navigate('/logout')
  }

  function clearAllData() {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    storage.clearAll()
    setConfirmClear(false)
    setDataSize(estimateLocalDataSize())
    toast.warning('Données locales effacées', 'Préférences et sessions ont été supprimées.')
    window.setTimeout(() => window.location.assign('/login'), 800)
  }

  function deleteAccount() {
    if (!user?.email) return
    deleteLocalAccount(user.email)
    toast.warning('Compte local supprimé', user.email)
    void handleLogout()
  }

  return (
    <div className="page-enter">
      <PageHeader
        title="Paramètres"
        subtitle="Personnalisez SCHOOLFLOW et gérez vos données locales."
      />

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <GlassCard className="h-max p-2">
          <nav aria-label="Sections des paramètres" className="flex gap-1 overflow-x-auto lg:flex-col no-scrollbar">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                aria-current={section === s.id ? 'page' : undefined}
                className={cn(
                  'flex shrink-0 items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition',
                  section === s.id
                    ? 'bg-accent-softer text-accent'
                    : 'text-ink-2 hover:bg-surface-hover hover:text-ink',
                )}
              >
                <s.icon className="size-4" aria-hidden />
                {s.label}
              </button>
            ))}
          </nav>
        </GlassCard>

        <div className="space-y-4">
          {section === 'compte' && (
            <>
              <GlassCard className="p-5">
                <p className="mb-4 text-xs font-semibold tracking-wide text-ink-3 uppercase">
                  Informations du compte
                </p>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-lg font-semibold text-ink">{user?.displayName}</p>
                    <p className="text-sm text-ink-2">{user?.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone="accent">{user?.role === 'teacher' ? 'Professeur' : 'Élève'}</Badge>
                      <Badge>{user?.className ?? user?.subject}</Badge>
                      <Badge tone={isLocal ? 'success' : 'info'}>
                        {session?.provider === 'local'
                          ? 'Session locale'
                          : session?.provider === 'educonnect'
                            ? 'EduConnect'
                            : 'Pronote'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-ink-3">Établissement</dt>
                    <dd className="font-medium text-ink">{user?.establishment}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-3">Connecté depuis</dt>
                    <dd className="font-medium text-ink">
                      {session ? new Date(session.loggedInAt).toLocaleString('fr-FR') : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-3">Expiration de session</dt>
                    <dd className="font-medium text-ink">
                      {session ? new Date(session.expiresAt).toLocaleString('fr-FR') : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-3">Identifiant technique</dt>
                    <dd className="truncate font-mono text-xs text-ink-2">
                      {session?.id.slice(0, 18)}…
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 rounded-2xl bg-accent-softer px-3.5 py-2.5 text-xs leading-relaxed text-ink-2">
                  Aucun mot de passe n'est conservé dans la session. Les tokens ne sont ni affichés ni
                  journalisés.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={handleLogout}>
                    <LogOut className="size-4" aria-hidden />
                    Se déconnecter
                  </Button>
                  {isLocal && (
                    <Button variant="danger" onClick={deleteAccount}>
                      <Trash2 className="size-4" aria-hidden />
                      Supprimer le compte local
                    </Button>
                  )}
                </div>
              </GlassCard>

              {!isLocal && (
                <GlassCard className="p-5">
                  <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">
                    Authentification externe
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">
                    L'authentification est effectuée auprès du fournisseur externe. SCHOOLFLOW ne
                    demande ni ne stocke votre mot de passe externe.
                  </p>
                </GlassCard>
              )}
            </>
          )}

          {section === 'apparence' && (
            <GlassCard className="p-5">
              <p className="mb-4 text-xs font-semibold tracking-wide text-ink-3 uppercase">Apparence</p>

              <p className="mb-2 text-sm font-medium text-ink">Thème</p>
              <div className="mb-6 grid grid-cols-3 gap-2.5">
                {(
                  [
                    { id: 'light', label: 'Clair', icon: Sun },
                    { id: 'dark', label: 'Sombre', icon: Moon },
                    { id: 'auto', label: 'Auto', icon: Monitor },
                  ] as { id: ThemeMode; label: string; icon: typeof Sun }[]
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    aria-pressed={settings.theme === t.id}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-sm font-medium transition',
                      settings.theme === t.id
                        ? 'border-accent/50 bg-accent-softer text-accent'
                        : 'border-line-soft bg-surface-strong text-ink-2 hover:bg-surface-hover',
                    )}
                  >
                    <t.icon className="size-5" aria-hidden />
                    {t.label}
                  </button>
                ))}
              </div>

              <p className="mb-2.5 text-sm font-medium text-ink">Couleur d'accent</p>
              <div className="mb-6 flex flex-wrap gap-2.5">
                {ACCENTS.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setAccent(a.value)}
                    aria-label={a.name}
                    aria-pressed={settings.accent === a.value}
                    className={cn(
                      'size-9 rounded-full transition hover:scale-110',
                      settings.accent === a.value && 'ring-2 ring-offset-2 ring-offset-[var(--bg)]',
                    )}
                    style={{ background: a.value, '--tw-ring-color': a.value } as React.CSSProperties}
                  />
                ))}
              </div>

              <Switch
                label="Animations"
                description="Désactivez pour réduire les animations de l'interface."
                checked={settings.animations}
                onChange={(v) => update({ animations: v })}
              />
            </GlassCard>
          )}

          {section === 'notifications' && (
            <GlassCard className="p-5">
              <p className="mb-4 text-xs font-semibold tracking-wide text-ink-3 uppercase">Notifications</p>
              <Switch
                label="Notifications in-app"
                description="Afficher les alertes de nouveaux devoirs, notes et messages."
                checked={settings.notifications}
                onChange={(v) => {
                  update({ notifications: v })
                  toast.success(v ? 'Notifications activées' : 'Notifications désactivées')
                }}
              />
              <div className="mt-4 border-t border-line-soft pt-4">
                <p className="text-sm text-ink-2">
                  {notifications.filter((n) => !n.read).length} notification(s) non lue(s) actuellement.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/app/notifications')}
                >
                  Ouvrir le centre de notifications
                </Button>
              </div>
            </GlassCard>
          )}

          {section === 'confidentialite' && (
            <>
              <GlassCard className="p-5">
                <div className="mb-4 flex items-center gap-2.5">
                  <Database className="size-5 text-accent" aria-hidden />
                  <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">
                    Confidentialité · Données locales
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-ink">
                  Toutes les données de démonstration sont stockées sur cet appareil.
                </p>
                <dl className="mt-4 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between rounded-2xl bg-surface-strong/60 px-4 py-3">
                    <dt className="text-ink-2">Stockage utilisé</dt>
                    <dd className="font-semibold text-ink">{dataSize}</dd>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-surface-strong/60 px-4 py-3">
                    <dt className="text-ink-2">Clés locales</dt>
                    <dd className="font-semibold text-ink">{storage.keys().length}</dd>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-surface-strong/60 px-4 py-3">
                    <dt className="text-ink-2">Mots de passe scolaires</dt>
                    <dd className="font-semibold text-success">Aucun</dd>
                  </div>
                </dl>
                <div className="mt-5 rounded-2xl border border-line-soft bg-accent-softer px-4 py-3 text-xs leading-relaxed text-ink-2">
                  <Info className="mr-1.5 inline size-3.5 text-accent" aria-hidden />
                  localStorage est utilisé pour les préférences et les données non sensibles. Aucune
                  clé API secrète n'est stockée côté client.
                </div>
                <div className="mt-5">
                  {!confirmClear ? (
                    <Button variant="danger" onClick={() => setConfirmClear(true)}>
                      <Trash2 className="size-4" aria-hidden />
                      Effacer toutes les données locales
                    </Button>
                  ) : (
                    <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4">
                      <p className="flex items-start gap-2 text-sm font-medium text-danger">
                        <Trash2 className="mt-0.5 size-4 shrink-0" aria-hidden />
                        Confirmer la suppression de toutes les données locales ? Cette action est
                        irréversible (comptes, préférences, devoirs, messages…).
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button variant="danger" onClick={clearAllData}>
                          Oui, tout effacer
                        </Button>
                        <Button variant="secondary" onClick={() => setConfirmClear(false)}>
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    resetDemoData()
                    toast.success('Données de démonstration restaurées')
                  }}
                >
                  Restaurer les données de démonstration
                </Button>
              </GlassCard>

              <GlassCard className="p-5">
                <p className="mb-3 text-xs font-semibold tracking-wide text-ink-3 uppercase">
                  Mention légale
                </p>
                <p className="text-xs leading-relaxed text-ink-2">
                  SCHOOLFLOW est un projet indépendant de démonstration. Il n'est pas affilié à
                  Pronote, EduConnect, Index Éducation ou au ministère de l'Éducation nationale.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-ink-2">
                  Lorsqu'un compte externe est utilisé : « L'authentification est effectuée auprès du
                  fournisseur externe. SCHOOLFLOW ne demande ni ne stocke votre mot de passe externe. »
                </p>
              </GlassCard>
            </>
          )}

          {section === 'sync' && (
            <GlassCard className="p-5">
              <div className="mb-4 flex items-center gap-2.5">
                <Cloud className="size-5 text-accent" aria-hidden />
                <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">Synchronisation</p>
              </div>
              <Switch
                label="Synchronisation automatique"
                description="Tenter une mise à jour lorsque la connexion est disponible."
                checked={settings.autoSync}
                onChange={(v) => update({ autoSync: v })}
              />
              <div className="mt-5 rounded-2xl border border-line-soft bg-surface-strong/60 p-4">
                <p className="text-sm text-ink-2">État actuel</p>
                <div className="mt-2">
                  <Progress value={sync.progress || (sync.lastSync ? 100 : 0)} />
                </div>
                <p className="mt-2 text-xs text-ink-3">
                  Dernière synchronisation :{' '}
                  {sync.lastSync ? new Date(sync.lastSync).toLocaleString('fr-FR') : 'jamais'}
                </p>
              </div>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => navigate('/app/synchronisation')}
              >
                Ouvrir la synchronisation
              </Button>
            </GlassCard>
          )}

          {section === 'accessibilite' && (
            <GlassCard className="p-5">
              <div className="mb-4 flex items-center gap-2.5">
                <Accessibility className="size-5 text-accent" aria-hidden />
                <p className="text-xs font-semibold tracking-wide text-ink-3 uppercase">
                  Accessibilité
                </p>
              </div>

              <label className="block">
                <span className="mb-2 flex items-center justify-between text-sm font-medium text-ink">
                  Taille du texte
                  <span className="text-xs text-ink-3">{Math.round(settings.textScale * 100)} %</span>
                </span>
                <input
                  type="range"
                  min={0.9}
                  max={1.25}
                  step={0.05}
                  value={settings.textScale}
                  onChange={(e) => update({ textScale: Number(e.target.value) })}
                  className="w-full"
                  aria-label="Échelle du texte"
                />
              </label>

              <div className="mt-5 border-t border-line-soft pt-4">
                <Switch
                  label="Réduire les animations"
                  description="Équivalent de prefers-reduced-motion, appliqué en permanence."
                  checked={!settings.animations}
                  onChange={(v) => update({ animations: !v })}
                />
              </div>

              <ul className="mt-5 space-y-2 text-xs leading-relaxed text-ink-2">
                <li>• Navigation clavier complète (Tab, Entrée, Échap, flèches).</li>
                <li>• Indicateur de focus visible sur tous les contrôles interactifs.</li>
                <li>• Contrastes conformes WCAG AA sur les textes principaux.</li>
                <li>• Zones tactiles d'au moins 44 px sur mobile.</li>
                <li>• Raccourci Ctrl/⌘ + K pour la recherche globale.</li>
              </ul>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}
