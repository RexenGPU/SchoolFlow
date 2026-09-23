# SCHOOLFLOW

> L'école, simplement.

Alternative moderne et indépendante à Pronote / EduConnect : emploi du temps, notes, devoirs, cahier de textes, absences, messagerie, documents, calendrier, notifications — espace élève **et** espace professeur.

**Projet indépendant de démonstration.** Aucune affiliation avec Pronote, EduConnect, Index Éducation ou l'Éducation nationale.

## Démarrage

```bash
npm install
npm run dev      # passerelle locale Pronote (:3210) + Vite (:5173)
npm run server   # uniquement la passerelle locale (sans Vite)
npm start        # serveur web production : interface + API Pronote
npm run build    # build de production
npm run preview  # serveur de prévisualisation
```

`npm run dev` lance deux processus :

- `server/pronote-server.mjs` — passerelle locale `http://127.0.0.1:3210` (utilise `pawnote`)
- Vite — `http://localhost:5173`, proxy `/api/pronote` → `127.0.0.1:3210`

## Authentification

- **Connexion Pronote (réelle)** — onglet « Pronote » de l'écran de connexion. Choisissez votre ville et votre établissement ; SCHOOLFLOW tente de déterminer automatiquement le portail Pronote hébergé. Les identifiants sont transmis en HTTPS au backend SCHOOLFLOW uniquement pour établir la session Pronote et ne sont pas stockés. Si Pronote exige une vérification 2FA/CAPTCHA, celle-ci vous est signalée honnêtement ; **aucun contournement n'est tenté**.
- **Comptes locaux SCHOOLFLOW** — onglet « Nouveau » pour créer un compte fictif stocké uniquement sur l'appareil, puis « Local » pour se connecter.
- **EduConnect** — bouton présent mais désactivé tant qu'aucune intégration officielle (OAuth2 / OIDC / SAML) n'est configurée. SCHOOLFLOW ne contourne aucune protection et n'invente aucune API.

Architecture : `AuthProvider` → `LocalAuthProvider` / `EduConnectAuthProvider` / `PronoteAuthProvider` avec `login()`, `logout()`, `getSession()`, `refreshSession()`, `isAuthenticated()`, `getUser()`. Côté client, `src/services/pronote.ts` récupère emploi du temps, notes et devoirs via `/api/pronote/data` et les applique dans `DataProvider`.

### Serveur Pronote (`server/pronote-server.mjs`)

Le même serveur peut fonctionner localement ou être déployé sur Internet. En production, il sert `dist/index.html` et les endpoints API sur une seule URL HTTPS. Les sessions Pronote restent en mémoire et expirent après 12 heures ; configurez `SCHOOLFLOW_ALLOWED_ORIGIN` uniquement si le frontend est hébergé sur un domaine différent.

| Endpoint | Rôle |
|----------|------|
| `POST /api/pronote/login` | Connexion Pronote (`url`, `kind`, `username`, `password`) → `sessionId` local (TTL 12 h) |
| `POST /api/pronote/data` | Emploi du temps, devoirs, notes, discussions de la session |
| `POST /api/pronote/logout` | Destruction de la session locale |

Codes d'erreur renvoyés par `/api/pronote/login` : `401` identifiants refusés / page indisponible, `403` vérification 2FA/CAPTCHA demandée (aucun contournement), `429` IP suspendue ou rate-limit, `502` serveur Pronote injoignable ou erreur inconnue.

En local, le serveur écoute sur `127.0.0.1:3210`. En production, il utilise `PORT` et écoute sur `0.0.0.0`. « Rester connecté » stocke uniquement l'identifiant de session dans `localStorage` (préfixe `sf.`), jamais le mot de passe.

### Déploiement public

Le dépôt contient un `Dockerfile` et un `render.yaml`. Un hébergeur compatible Node/Docker peut lancer `npm start` ; le frontend et le backend seront alors accessibles sur la même URL HTTPS, sans `localhost` sur l'appareil de l'utilisateur.

## Fonctionnalités

- Design **Liquid Glass** (panneaux translucides, backdrop blur, micro-interactions)
- Light / Dark / **Auto** + couleur d'accent personnalisable
- Dashboard élève & professeur
- Emploi du temps jour/semaine interactif (cours annulés, modifications)
- Notes + graphique d'évolution + moyennes pondérées
- Devoirs (filtres, persistance, création par le professeur)
- Cahier de textes, absences/retards + calendrier visuel
- Messagerie (recherche, archivage, envoi)
- Documents (dossiers, favoris, aperçu, tri)
- Calendrier mois / semaine / jour
- Espace professeur : classes, saisie des notes, création de devoirs, appel
- Centre de notifications
- Recherche globale **Ctrl/⌘ + K** + **Command Palette**
- Synchronisation / mode hors ligne (indicateur ● / ○)
- Paramètres : compte, apparence, notifications, confidentialité (effacement local), sync, accessibilité
- **PWA** : manifest, icônes, service worker, installable
- Responsive (desktop → smartphone, navigation inférieure) & accessibilité WCAG

## Architecture

```
src/
├── components/   # UI (GlassCard, Button, Modal…), Logo, CommandPalette
├── pages/        # Routes (élève + teacher/)
├── layouts/      # AppLayout (sidebar + mobile), PublicLayout
├── hooks/        # useOnline, useHotkey, useMediaQuery
├── services/     # storage, auth/, sync, search, pronote
├── providers/    # Auth, Theme, Data, Toast
├── data/         # Données de démonstration (données d'interface, non des comptes)
├── types/
└── utils/        # cn, dates, grades
server/
└── pronote-server.mjs  # passerelle locale Pronote (port 3210)
```

## Données & confidentialité

- Préférences et données d'interface dans `localStorage` (préfixe `sf.`)
- Identifiants Pronote transmis uniquement en HTTPS au backend SCHOOLFLOW pour établir la session, sans stockage persistant du mot de passe
- Aucun token affiché ou journalisé ; aucun CAPTCHA contourné
- Effacement complet depuis **Paramètres → Confidentialité → Données locales**

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · Lucide Icons · React Router · pawnote
