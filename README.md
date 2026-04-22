# Epiconcept Notes API

API REST multi-tenant de gestion de notes et de réunions, développée comme test technique pour Epiconcept. Le projet adopte une **architecture hexagonale** (Ports & Adapters) côté backend NestJS, couplée à une interface React 19 en front end et une suite de tests end-to-end Playwright.

---

## Table des matières

1. [Présentation du projet](#présentation-du-projet)
2. [Architecture](#architecture)
3. [Prérequis](#prérequis)
4. [Installation](#installation)
5. [Lancer l'application](#lancer-lapplication)
6. [Premier login](#premier-login)
7. [Endpoints API](#endpoints-api)
8. [Frontend](#frontend)
9. [Tests end-to-end](#tests-end-to-end)
10. [Structure du projet](#structure-du-projet)
11. [Choix techniques](#choix-techniques)

---

## Présentation du projet

L'application permet à plusieurs **organisations (tenants)** d'utiliser le même service en toute isolation. Chaque requête doit porter l'en-tête `X-Tenant-Id` (UUID du tenant) ; toutes les données sont filtrées par ce tenant en base de données.

Fonctionnalités implémentées :

- **Authentification JWT** : inscription et connexion par email/mot de passe, token valide 1 heure (configurable).
- **RBAC à deux rôles** : `admin` et `user`. Seul l'admin peut supprimer une note.
- **Notes** : CRUD complet par tenant — création (auteur issu du JWT), lecture, mise à jour, suppression réservée aux admins.
- **Réunions** : CRUD complet par tenant — titre, description, dates de début/fin, lieu optionnel.
- **Multi-tenancy stricte** : le middleware `TenantMiddleware` intercepte chaque requête et rejette celles sans en-tête `X-Tenant-Id` valide. Toutes les requêtes SQL sont filtrées sur `tenant_id`.

---

## Architecture

Le backend suit le pattern **hexagonal (Ports & Adapters)**. Chaque module fonctionnel est découpé en trois couches :

```
src/modules/{feature}/
├── domain/           ← Entités pures (aucun import NestJS)
├── application/      ← Cas d'usage, interfaces de ports
└── infrastructure/
    ├── in/           ← Adaptateurs entrants : contrôleurs HTTP, DTOs
    └── out/          ← Adaptateurs sortants : repositories Kysely
```

### Modules backend

| Module | Responsabilité |
|---|---|
| `AuthModule` | Inscription, connexion, stratégie JWT Passport, `JwtGuard`, `RolesGuard` |
| `NotesModule` | CRUD notes, contrôle d'accès (admin-only delete) |
| `MeetingsModule` | CRUD réunions |
| `SharedModule` | `TenantMiddleware`, `JwtGuard`, `RolesGuard`, décorateurs `@Roles()` et `@TenantId()` |
| `DatabaseModule` | Instance Kysely globale via `SqlJsDialect` (token `KYSELY`) |

### Règles architecturales respectées

- Les **contrôleurs** ne contiennent aucune logique métier : ils délèguent aux ports de service.
- Les **entités de domaine** n'importent aucun symbole NestJS.
- L'injection de dépendance passe toujours par l'**interface du port**, jamais par l'implémentation concrète.
- Chaque requête SQL inclut un filtre `WHERE tenant_id = ?`.
- Toute modification du schéma passe par une **migration Kysely versionnée**.
- Les DTOs sont validés par `class-validator` via le `ValidationPipe` global.

### Frontend

L'interface React utilise une architecture simple en couches :

```
frontend/src/
├── api/        ← Client HTTP (fetch) et fonctions par domaine
├── contexts/   ← AuthContext (état d'authentification global)
├── hooks/      ← useNotes, useMeetings (état + appels API)
├── pages/      ← Pages routées
├── components/ ← Composants réutilisables (NoteCard, MeetingCard, etc.)
└── types/      ← Interfaces TypeScript partagées
```

---

## Prérequis

- **Node.js** ≥ 20 (recommandé, la version `@types/node` déclarée est `^20.17.10`)
- **npm** (inclus avec Node.js)

Aucune base de données externe n'est requise : le projet utilise SQLite embarqué via `sql.js`.

---

## Installation

### Backend

```bash
# Depuis la racine du projet
npm install
```

### Frontend

```bash
cd frontend
npm install
```

### Initialisation de la base de données

Les migrations et le seed s'exécutent **automatiquement au démarrage** de l'application — aucune commande manuelle n'est nécessaire. Les commandes `npm run migration:run` et `npm run db:seed` restent disponibles pour une exécution explicite si besoin.

Le fichier de base de données est créé à `./db.sqlite` par défaut (configurable via `DATABASE_PATH`).

---

## Lancer l'application

### Variables d'environnement

| Variable | Obligatoire | Défaut | Description |
|---|---|---|---|
| `JWT_SECRET` | **oui** | — | Clé secrète de signature des tokens JWT |
| `JWT_EXPIRES_IN` | non | `1h` | Durée de validité d'un token (format ms/vercel) |
| `PORT` | non | `3000` | Port d'écoute du serveur NestJS |
| `DATABASE_PATH` | non | `./db.sqlite` | Chemin vers le fichier SQLite |

### Backend (développement)

```bash
# Depuis la racine
JWT_SECRET=changeme npm run start:dev
```

Le serveur démarre sur `http://localhost:3000` en mode watch (rechargement automatique).

> Au premier démarrage (ou après une réinitialisation), l'application exécute automatiquement les migrations et le script de seed. Aucune commande manuelle n'est nécessaire.

### Backend (production)

```bash
npm run build          # Compile TypeScript → dist/
JWT_SECRET=changeme npm run start   # Lance node dist/main
```

### Frontend

```bash
cd frontend
npm run dev
```

Le serveur Vite démarre sur `http://localhost:5173`. Les requêtes vers `/api/*` sont mandatées vers `http://localhost:3000` avec tous les en-têtes (notamment `X-Tenant-Id` et `Authorization`).

### CORS

Le backend autorise les requêtes provenant de `http://localhost:5173` avec les en-têtes `Content-Type`, `Authorization`, `X-Tenant-Id` et `x-tenant-id`.

---

## Premier login

Le script `db:seed` insère les données de test suivantes :

| Champ | Valeur |
|---|---|
| **Tenant ID** (à placer dans `X-Tenant-Id`) | `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` |
| **Email admin** | `admin@test.com` |
| **Email utilisateur** | `user@test.com` |
| **Mot de passe** (les deux comptes) | `password123` |

Sur la page de connexion, saisir le Tenant ID dans le champ dédié — il est transmis automatiquement en en-tête `X-Tenant-Id` à chaque appel API ultérieur.

---

## Endpoints API

> **Rappel :** Toutes les routes requièrent l'en-tête `X-Tenant-Id: <uuid-du-tenant>`. Son absence retourne `400 Bad Request`.

### Authentification — `/auth`

| Méthode | Chemin | Protection | Corps de la requête | Réponse |
|---|---|---|---|---|
| `POST` | `/auth/register` | Aucune | `{ email, password, role? }` | `{ accessToken, user }` |
| `POST` | `/auth/login` | Aucune | `{ email, password }` | `{ accessToken, user }` |
| `GET` | `/auth/profile` | `JwtGuard` | — | Objet utilisateur extrait du JWT |

**Règles de validation des DTOs :**

- `email` : adresse email valide (`@IsEmail`)
- `password` : chaîne de caractères, minimum 8 caractères
- `role` (inscription) : `"admin"` ou `"user"`, optionnel (défaut : `"user"`)

Le `tenantId` n'est **pas** dans le corps : il est lu depuis l'en-tête `X-Tenant-Id` via le décorateur `@TenantId()`.

---

### Notes — `/notes`

Toutes les routes notes sont protégées par `JwtGuard` + `RolesGuard`.

| Méthode | Chemin | Rôle requis | Description |
|---|---|---|---|
| `GET` | `/notes` | Authentifié | Liste toutes les notes du tenant |
| `GET` | `/notes/:id` | Authentifié | Détail d'une note |
| `POST` | `/notes` | Authentifié | Crée une note (auteur = utilisateur JWT) |
| `PATCH` | `/notes/:id` | Authentifié | Met à jour une note (champs optionnels) |
| `DELETE` | `/notes/:id` | **`admin`** | Supprime une note |

**Corps `POST /notes` :**

```json
{ "title": "string (1–255 car.)", "content": "string (1+ car.)" }
```

**Corps `PATCH /notes/:id` :** tous les champs sont optionnels.

**Logique de suppression :** le `RolesGuard` bloque les non-admins (`403 Forbidden`) avant même d'appeler le service.

---

### Réunions — `/meetings`

Toutes les routes réunions sont protégées par `JwtGuard` + `RolesGuard`.

| Méthode | Chemin | Rôle requis | Description |
|---|---|---|---|
| `GET` | `/meetings` | Authentifié | Liste toutes les réunions du tenant |
| `GET` | `/meetings/:id` | Authentifié | Détail d'une réunion |
| `POST` | `/meetings` | Authentifié | Crée une réunion (organisateur = utilisateur JWT) |
| `PATCH` | `/meetings/:id` | Authentifié | Met à jour une réunion |
| `DELETE` | `/meetings/:id` | Authentifié | Supprime une réunion |

**Corps `POST /meetings` :**

```json
{
  "title": "string (1–255 car.)",
  "description": "string (1+ car.)",
  "startAt": "ISO-8601",
  "endAt": "ISO-8601",
  "location": "string (optionnel)"
}
```

**Corps `PATCH /meetings/:id` :** tous les champs sont optionnels.

---

### Schéma d'une réponse `user`

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "email": "admin@test.com",
  "role": "admin",
  "createdAt": "2026-04-19T...",
  "updatedAt": "2026-04-19T..."
}
```

Le champ `passwordHash` n'est jamais exposé.

---

## Frontend

Le frontend React est accessible sur `http://localhost:5173` après `npm run dev` dans `frontend/`.

### Pages et routes

| Route | Composant | Accès |
|---|---|---|
| `/login` | `LoginPage` | Public (redirige vers `/notes` si déjà connecté) |
| `/register` | `RegisterPage` | Public (redirige vers `/notes` si déjà connecté) |
| `/notes` | `NotesPage` | Authentifié |
| `/notes/:id` | `NoteDetailPage` | Authentifié |
| `/meetings` | `MeetingsPage` | Authentifié |
| `/meetings/:id` | `MeetingDetailPage` | Authentifié |

### État de l'authentification

L'`AuthContext` persiste l'état dans `localStorage` avec trois clés :

| Clé | Contenu |
|---|---|
| `token` | JWT access token |
| `tenant_id` | UUID du tenant |
| `user` | Objet utilisateur sérialisé en JSON |

### Gestion des rôles côté UI

- Le bouton **Supprimer** sur une note est désactivé (`disabled`) pour les utilisateurs avec le rôle `user`.
- La mention « Note: only admins can delete notes. » s'affiche lorsqu'un non-admin consulte la liste.

---

## Tests end-to-end

Les tests utilisent **Playwright** avec le navigateur **Chromium** uniquement.

### Infrastructure de test

Playwright lance automatiquement :
1. Un **serveur backend dédié** sur le port `3001` (base `db-test.sqlite`, isolation complète du serveur de développement) via `scripts/start-test-server.js` qui enchaîne `migration:run` → `db:seed` → `start:dev`.
2. Un **serveur Vite dédié** sur le port `5174` (config `vite.e2e.config.ts`, mandataire vers `localhost:3001`).

Ces deux serveurs sont distincts du développement (`localhost:3000` / `localhost:5173`), garantissant l'isolation des données de test.

### Lancer les tests

```bash
# Depuis la racine du projet
npm run test:e2e           # Exécution en mode CLI
npm run test:e2e:ui        # Exécution avec l'interface graphique Playwright
npm run test:e2e:report    # Afficher le rapport HTML du dernier run

# Ou directement depuis frontend/
cd frontend
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:report
```

### Fichiers de tests

| Fichier | Périmètre |
|---|---|
| `frontend/tests/e2e/auth.spec.ts` | Connexion valide, mauvais mot de passe, mauvais tenant, déconnexion, redirections non authentifié |
| `frontend/tests/e2e/notes.spec.ts` | CRUD notes via UI, bouton supprimer désactivé pour `user`, isolation de tenant |
| `frontend/tests/e2e/api.spec.ts` | Tests directs sur l'API REST : en-tête manquant → 400, scoping tenant, PATCH, DELETE 403 pour `user`, DELETE 200 pour `admin`, 404 après suppression |

### Données de test

Les mêmes identifiants que le seed de développement sont utilisés (sur la base `db-test.sqlite`) :

| Compte | Email | Mot de passe |
|---|---|---|
| Admin | `admin@test.com` | `password123` |
| Utilisateur | `user@test.com` | `password123` |
| Tenant | `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` | — |

---

## Structure du projet

```
epiconcept-notes-api/
├── dist/                          # Sortie de compilation TypeScript (npm run build)
├── frontend/                      # Application React 19 + Vite
│   ├── src/
│   │   ├── api/                   # Client HTTP et fonctions par domaine
│   │   │   ├── auth.api.ts
│   │   │   ├── client.ts
│   │   │   ├── meetings.api.ts
│   │   │   └── notes.api.ts
│   │   ├── components/            # Composants réutilisables
│   │   │   ├── MeetingCard.tsx
│   │   │   ├── MeetingForm.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── NoteCard.tsx
│   │   │   └── NoteForm.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx    # État d'auth global + localStorage
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useMeetings.ts
│   │   │   └── useNotes.ts
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── MeetingDetailPage.tsx
│   │   │   ├── MeetingsPage.tsx
│   │   │   ├── NoteDetailPage.tsx
│   │   │   ├── NotesPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── types/                 # Interfaces TypeScript partagées
│   │   ├── App.tsx                # Routeur et ProtectedRoute
│   │   └── main.tsx
│   ├── tests/
│   │   └── e2e/
│   │       ├── api.spec.ts
│   │       ├── auth.spec.ts
│   │       └── notes.spec.ts
│   ├── playwright.config.ts
│   ├── vite.config.ts             # Dev (port 5173 → backend 3000)
│   ├── vite.e2e.config.ts         # Test (port 5174 → backend 3001)
│   └── package.json
├── scripts/
│   └── start-test-server.js       # Script cross-platform pour le backend de test
├── src/
│   ├── database/
│   │   ├── database.module.ts     # Provider Kysely global (token KYSELY)
│   │   ├── database.types.ts      # Interface Database Kysely
│   │   ├── migrate.ts             # Script de migration
│   │   ├── seed.ts                # Script de seed
│   │   ├── sqljs-dialect.ts       # Dialecte Kysely personnalisé sql.js
│   │   └── migrations/
│   │       └── 001_initial.ts     # Création tables tenants, users, notes, meetings
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── application/
│   │   │   │   ├── ports/         # Interfaces AuthServicePort, UserRepositoryPort
│   │   │   │   └── use-cases/
│   │   │   │       └── auth.service.ts
│   │   │   ├── domain/
│   │   │   │   └── user.entity.ts # User, UserPublic, RequestUser, JwtPayload
│   │   │   └── infrastructure/
│   │   │       ├── in/
│   │   │       │   ├── auth.controller.ts
│   │   │       │   └── dto/
│   │   │       │       ├── login.dto.ts
│   │   │       │       └── register.dto.ts
│   │   │       └── out/
│   │   │           ├── jwt.strategy.ts
│   │   │           └── user-kysely.repository.ts
│   │   ├── meetings/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   └── use-cases/
│   │   │   │       └── meeting.service.ts
│   │   │   ├── domain/
│   │   │   │   └── meeting.entity.ts
│   │   │   └── infrastructure/
│   │   │       ├── in/
│   │   │       │   ├── meetings.controller.ts
│   │   │       │   └── dto/
│   │   │       └── out/
│   │   │           └── meeting-kysely.repository.ts
│   │   ├── notes/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   └── use-cases/
│   │   │   │       └── note.service.ts
│   │   │   ├── domain/
│   │   │   │   └── note.entity.ts
│   │   │   └── infrastructure/
│   │   │       ├── in/
│   │   │       │   ├── notes.controller.ts
│   │   │       │   └── dto/
│   │   │       └── out/
│   │   │           └── note-kysely.repository.ts
│   │   └── shared/
│   │       ├── decorators/
│   │       │   ├── roles.decorator.ts  # @Roles(...roles)
│   │       │   └── tenant-id.decorator.ts  # @TenantId()
│   │       ├── guards/
│   │       │   ├── jwt.guard.ts
│   │       │   └── roles.guard.ts
│   │       ├── middleware/
│   │       │   └── tenant.middleware.ts
│   │       └── shared.module.ts
│   ├── app.module.ts
│   └── main.ts
├── db.sqlite                      # Base de données de développement
├── db-test.sqlite                 # Base de données des tests e2e
├── nest-cli.json
├── package.json
├── package-lock.json
└── tsconfig.json
```

---

## Intégration Continue et Déploiement Continu (CI/CD)

### Philosophie

Aucun code n'atteint la production sans avoir été validé par la suite de tests. Ce principe est appliqué mécaniquement par le pipeline : les jobs de déploiement sont déclarés comme dépendants du job de test, ce qui les rend techniquement impossibles à déclencher si un test échoue. Il ne s'agit pas d'une convention, mais d'une contrainte structurelle de la pipeline.

### Déroulement du pipeline

```
push sur main
      ↓
GitHub Actions déclenché
      ↓
Installation des dépendances → Build → Tests Playwright e2e
      ↓ (bloqué si un test échoue)
Confirmation du déploiement Railway (backend)
      ↓
Déploiement frontend → Vercel
      ↓
Application live ✅
```

La pipeline ne se déclenche que sur les pushs vers `main`. Les pull requests exécutent uniquement les tests, sans jamais toucher aux environnements de production.

### Les trois jobs

**1. Tests e2e Playwright**

C'est le seul juge de la qualité. Il installe les dépendances backend et frontend, lance Chromium via Playwright, puis exécute l'ensemble de la suite de tests end-to-end. Ces tests couvrent :

- l'authentification (connexion, inscription, redirections, tokens JWT) ;
- le CRUD complet des notes et des réunions via l'interface ;
- l'isolation multi-tenant — les données d'un tenant ne sont jamais visibles depuis un autre ;
- le contrôle d'accès par rôle (RBAC) — seul un admin peut supprimer une note.

Si un seul test échoue, les deux jobs de déploiement suivants sont annulés automatiquement.

**2. Confirmation du déploiement Railway (backend)**

Railway surveille la branche `main` en continu et déclenche un déploiement dès qu'un nouveau commit y est poussé. Ce job ne fait pas le déploiement lui-même — il sert de point de synchronisation : son existence dans la pipeline garantit que Vercel ne déploie le frontend qu'après que les tests ont validé le commit qui déclenchera le déploiement backend.

> À chaque démarrage, NestJS exécute automatiquement les migrations (idempotentes) et vérifie si le seed initial est nécessaire. Cette logique garantit que la base de données de production est toujours dans un état cohérent, sans intervention manuelle.

**3. Déploiement frontend vers Vercel**

Ce job récupère l'environnement de production depuis Vercel, compile le frontend en intégrant les variables d'environnement (notamment l'URL du backend Railway) dans le bundle Vite, puis publie le résultat sur le CDN Vercel. Les variables sont injectées au moment du build — elles sont figées dans le bundle et ne peuvent pas être modifiées sans recompilation.

### Comportement en cas d'échec

Lorsqu'un test échoue, GitHub Actions interrompt la pipeline dès le job de test. Les jobs de déploiement backend et frontend ne sont pas déclenchés. La production reste dans l'état du dernier déploiement réussi. GitHub notifie l'auteur du commit par email et marque le commit comme échoué dans l'interface.

### Environnements de production

| Composant | Plateforme | Caractéristiques |
|---|---|---|
| Backend (NestJS) | Railway | Node.js, déploiement automatique sur push, variables d'environnement gérées par Railway |
| Frontend (React + Vite) | Vercel | CDN mondial, déploiement instantané, variables injectées au build |

---

## Choix techniques

### NestJS 10 (backend)

NestJS fournit le cadre d'injection de dépendance nécessaire pour appliquer l'architecture hexagonale : les ports (interfaces) sont enregistrés comme tokens d'injection (`NOTE_SERVICE_PORT`, `USER_REPOSITORY_PORT`, etc.) et les adaptateurs concrets sont injectés à l'exécution. L'intégration native avec Passport.js simplifie la mise en place de la stratégie JWT.

### Kysely 0.27 (ORM type-safe)

Kysely est un query builder TypeScript qui génère des requêtes SQL typées à la compilation. Contrairement à un ORM complet, il n'impose pas de modèle objet-relationnel — le schéma est décrit via des interfaces TypeScript (`Database`, `NotesTable`, etc.) et chaque requête bénéficie de l'autocomplétion et de la vérification des types. C'est l'outil idéal pour un projet où la structure SQL doit être explicite et traçable.

### sql.js (SQLite en JavaScript pur)

`sql.js` compile SQLite en WebAssembly, ce qui permet de faire tourner SQLite sans binaire natif ni dépendance système. Le dialecte personnalisé `SqlJsDialect` charge le fichier `.sqlite` en mémoire au démarrage, exécute les requêtes, et persiste le résultat sur disque après chaque écriture (`PRAGMA foreign_keys = ON` est activé). Ce choix élimine tout prérequis d'installation de base de données pour les évaluateurs.

### JWT + Passport.js

L'authentification sans état (stateless) évite toute gestion de session côté serveur. Le token JWT contient `sub` (id), `email`, `role` et `tenantId`. La durée de vie est configurable via `JWT_EXPIRES_IN`. `JwtStrategy` valide le token et peuple `req.user` pour les routes protégées.

### RBAC via métadonnées NestJS

`@Roles('admin')` appose des métadonnées sur le handler de route. `RolesGuard` les lit via `Reflector.getAllAndOverride()` et compare avec `req.user.role`. Les routes sans décorateur `@Roles` sont accessibles à tout utilisateur authentifié.

### Multi-tenancy par en-tête HTTP

Le choix de l'en-tête `X-Tenant-Id` (plutôt qu'un sous-domaine ou un segment d'URL) permet de partager un domaine unique pour tous les tenants et de modifier facilement le tenant côté client sans changer les URLs. `TenantMiddleware` s'applique à **toutes** les routes avant les guards, garantissant qu'aucune requête ne peut atteindre un controller sans tenant identifié.

### React 19 + Vite 6 (frontend)

React 19 avec le plugin `@vitejs/plugin-react` offre un démarrage à froid rapide en développement. Le proxy Vite (`/api → http://localhost:3000`) évite les problèmes CORS en développement local et permet de déployer le frontend sur un CDN sans modifier les URLs de l'API.

### Playwright 1.59 (tests e2e)

Playwright est utilisé pour les tests end-to-end avec Chromium uniquement (suffisant pour valider le comportement fonctionnel). La configuration lance automatiquement deux serveurs dédiés (backend sur port 3001, frontend sur port 5174) avec une base de données isolée (`db-test.sqlite`), garantissant que les tests ne perturbent pas les données de développement. Le mode `workers: 1` assure l'exécution séquentielle et évite les conflits d'état en base de données entre les tests.

### Migrations et seed automatiques

Les migrations Kysely et le script de seed s'exécutent au démarrage de l'application via `main.ts`. Les deux opérations sont idempotentes : les migrations utilisent une table de suivi pour ne jamais rejouer une migration déjà appliquée, et le seed vérifie l'existence des données avant toute insertion. Ce choix simplifie les déploiements (Railway, Docker) en éliminant les étapes manuelles post-déploiement.

### class-validator + class-transformer

Ces deux bibliothèques, intégrées via le `ValidationPipe` global NestJS (`whitelist: true`, `transform: true`), assurent la validation et la transformation automatique des DTOs : les propriétés non déclarées sont supprimées (`whitelist`) et les types primitifs sont convertis (`transform`).
