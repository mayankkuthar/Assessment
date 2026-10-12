# HappiMynd Assessment Platform

A React (Vite) web app for building, assigning and taking psychometric / emotional-intelligence assessments, and for generating per-user PDF reports. It is used by **HappiMynd (Super Admin)**, **client organisations (Admin)** and **end users** (students, employees, etc.).

> ⚠️ **This frontend talks to the LIVE production backend.**
> All API calls go to `https://happimynd.com/new_api`, which is deployed on AWS and backed by a **live AWS MySQL database**. That holds even when you run `npm run dev` on your laptop. Any user, quiz, organisation or attempt you create, edit or delete locally changes **real production data**. Read [Live backend & data](#live-backend--data) before you click anything.

If something breaks, see **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)**.

---

## Table of contents

1. [What the app does](#what-the-app-does)
2. [Tech stack & versions](#tech-stack--versions)
3. [Architecture](#architecture)
4. [Live backend & data](#live-backend--data)
5. [Getting started](#getting-started)
6. [Environment variables](#environment-variables)
7. [npm scripts](#npm-scripts)
8. [Project structure](#project-structure)
9. [Roles & permissions](#roles--permissions)
10. [Key flows](#key-flows)
11. [Translation](#translation)
12. [PDF reports](#pdf-reports)
13. [Deployment](#deployment)
14. [Legacy / unused files](#legacy--unused-files)
15. [Further documentation](#further-documentation)
16. [Contributing](#contributing)

---

## What the app does

**Admin side (Super Admin / Admin)**

| Menu item | Component | Purpose |
|---|---|---|
| Admin Dashboard | `AdminDashboard.jsx` | User summary with filters, registration dates, scores, and user creation/permissions |
| Organization Management | `OrganizationManager.jsx` | Manage client orgs and onboarding codes. Bulk-import employees from Excel (chunked, with an error export) |
| Profile Management | `ProfileManager.jsx` | Audience profiles (Student, Employee, Senior Citizen…) that quizzes are assigned to |
| Packet Management | `PacketManager.jsx` | Question packets (groups) and their questions (MCQ, True/False, option-based marks, flexible/decimal scoring scales) |
| Quiz Builder | `QuizBuilder.jsx` | Build quizzes by dragging packets in (`@hello-pangea/dnd`), with start instructions |
| Assigned Quizzes | `QuizAssignmentGraph.jsx` | Map quizzes to profiles/users (visualised with React Flow) |
| Quiz Results / Quiz Report | `AssessmentResults.jsx`, `AssessmentReport.jsx`, `DetailedInsights.jsx` | Scores, packet-level breakdowns, personality-type reports |
| Active Tracking | `ActiveTracking.jsx` | Track attempts, incomplete-quiz filters, and **bulk PDF generation + ZIP download** |
| PDF Templates | `PDFTemplateConfig.jsx` | Configure each quiz's report header/footer, sections and branding |

**User side**

| Menu item / route | Purpose |
|---|---|
| Home (`UserDashboard`) | Assigned quizzes and stats |
| Quiz Records | Past attempts and report links |
| `/attempt/:quizId` | Take a quiz (shareable link). Multilingual via Google Translate |
| `/report/:quizId/:attemptId` | View or download the report for one attempt |
| `/reset-password` | Password reset |

Sign-up requires an organisation **onboarding code**. Users aged **13–17** must complete a **Parent/Guardian consent** step (`ParentGuardianConsent.jsx`, `utils/guardianConsent.js`).

---

## Tech stack & versions

The versions below are the ones installed from `package-lock.json`.

### Runtime

| Tool | Version | Notes |
|---|---|---|
| Node.js | **≥ 22.9** (developed on 24.x) | `npm run server` uses `--env-file-if-exists`, which needs Node 22.9+ |
| npm | 10+ (developed on 11.x) | |

### Frontend

| Package | Version | Used for |
|---|---|---|
| react / react-dom | 19.1.0 | UI |
| vite | 4.5.14 | Dev server and bundler |
| @vitejs/plugin-react | 4.6.0 | JSX / Fast Refresh |
| react-router-dom | 6.30.1 | Routing |
| @mui/material, @mui/icons-material | 7.1.2 | UI components (light/dark theme) |
| @emotion/react, @emotion/styled | 11.14.0 | MUI styling engine |
| @hello-pangea/dnd | 18.0.1 | Drag-and-drop in Quiz Builder |
| reactflow | 11.11.4 | Quiz-assignment graph |
| chart.js 4.5.0 + react-chartjs-2 5.3.0, recharts 3.0.2 | | Charts in reports and dashboards |
| jspdf 3.0.4, html2canvas 1.4.1 | | Client-side PDF report generation |
| @react-pdf/renderer | 4.3.0 | PDF generation (`services/pdfGenerator.jsx`) |
| jszip | 3.10.2 | Bulk PDF download as ZIP |
| xlsx (SheetJS) | 0.18.5 | Excel import/export |
| lexical + @lexical/react 0.32.1, @uiw/react-md-editor 4.0.8, react-markdown 10.1.0 + remark-gfm 4.0.1 | | Rich text and markdown for questions, instructions and templates |
| uuid | 11.1.0 | IDs |

### Backend / tooling in this repo

| Package | Version | Used for |
|---|---|---|
| express | 5.1.0 | Local **mock** API (`server-auth-test.js`) |
| cors | 2.8.5 | Mock API |
| bcryptjs | 3.0.3 | Password hashing in mock API |
| better-sqlite3 | 12.11.1 | Legacy SQLite server only (`server.js`) |
| concurrently | 9.2.0 | `npm run dev:local` |
| eslint | 9.29.0 (flat config) | Linting |

### External services

| Service | Where |
|---|---|
| **Production API**: `https://happimynd.com/new_api` | Deployed on **AWS**, backed by **AWS MySQL** (live DB). Its source code is **not** in this repo |
| Google Cloud Translation API v2 | Proxied server-side; the key is never sent to the browser |
| Vercel | Hosts the built frontend and the `api/translate.js` serverless function |

### Optional Python tool (`report_api/`)

This is a standalone EI report generator that works from Excel. It needs Python 3.11 and `pip install -r report_api/requirements.txt` (pandas, numpy, matplotlib, seaborn, fpdf2, openpyxl). The web app does not use it. See [report_api/README.md](report_api/README.md).

---

## Architecture

```
                    ┌────────────────────────────────────────────┐
 Browser            │  React 19 SPA (Vite build)                 │
                    │  src/services/api.js  → API_BASE (hardcoded)│
                    └───────────────┬───────────────┬────────────┘
                                    │               │ /api/translate
                                    │               ▼
                                    │     dev:  Vite proxy (vite.config.js)
                                    │     prod: Vercel fn (api/translate.js)
                                    │               │  + GOOGLE_TRANSLATE_API_KEY
                                    │               ▼
                                    │     Google Cloud Translation v2
                                    ▼
             https://happimynd.com/new_api   (LIVE backend on AWS, not in this repo)
                                    │
                                    ▼
                         AWS MySQL  (LIVE production database)
```

The app reaches the backend in three ways. All three end up at the live API:

1. **`src/services/api.js`** has the main API client, with `API_BASE = 'https://happimynd.com/new_api'` hardcoded. Every call sends `x-user-id` / `x-user-role` headers, read from `localStorage.currentUser`, so the backend can enforce RBAC.
2. **Relative `fetch('/api/...')` calls** (e.g. in `QuizAttempt.jsx`, `PDFTemplateConfig.jsx`):
   - **dev**: the Vite proxy rewrites `/api/*` to `https://happimynd.com/new_api/*`.
   - **prod**: `src/main.jsx` wraps `window.fetch` and makes the same rewrite. The exception is `/api/translate`, which stays same-origin and goes to the Vercel function.
3. A few components (`AuthPage`, `PasswordReset`, `ReportViewer`, `ReportContent`, `QuizAttempt`, `App`) reference `happimynd.com` directly.

The `useDatabase` hook (`src/hooks/useDatabase.js`) is a React context. It loads profiles, organisations, packets, quizzes and assignments through `src/services/database.js`, which is a thin wrapper over `api.js`. Components read shared data from it.

Auth state is kept in `localStorage` (`currentUser`, `assessment_session`). Other keys stored there: `darkMode`, the language preference, `packetScaling_*`, `template-history-*` and guardian consent.

---

## Live backend & data

- **Database:** the production backend at `happimynd.com/new_api` is deployed on **AWS** and uses a **live AWS MySQL** database. Its credentials and API keys live in the backend's own deployment config, **not in this repo**. Do not commit DB credentials or API keys here.
- **Your local dev server uses the same database.** No staging environment is configured. Treat every create, update, delete, import or "clear attempts" action as a production change.
- Before any destructive testing (bulk Excel imports, deleting users/quizzes, `clear-attempts.js`), get approval from the project owner. Use a clearly named test organisation where you can.
- **Working against local data instead.** Point `API_BASE` in `src/services/api.js` and the `apiProxy.target` in `vite.config.js` (plus the `main.jsx` fetch wrapper for prod builds) at `http://localhost:3001/api`. Then run `npm run dev:local`. The local mock server (`server-auth-test.js`) stores everything in `./mock-data.json`, creating it with seed data on first start. The mock API mirrors the live API's routes, but it may lag behind them. **Do not commit those URL changes.**

---

## Getting started

The main repository is **[mayankkuthar/Assessment](https://github.com/mayankkuthar/Assessment)**. Contributors work in a **fork** and open PRs back into it (see [Contributing](#contributing)).

```bash
# 1. Fork mayankkuthar/Assessment on GitHub, then clone YOUR fork
git clone https://github.com/<your-username>/Assessment.git
cd Assessment

# 2. Add the main repo as "upstream"
git remote add upstream https://github.com/mayankkuthar/Assessment.git

npm install

# optional: enable translation in dev
echo "GOOGLE_TRANSLATE_API_KEY=<your-key>" > .env

npm run dev
```

Vite serves on **http://localhost:5175**. If that port is busy it picks the next free one (`strictPort: false`), so check the terminal for the real URL. Because the host is `0.0.0.0`, the server is also reachable on your LAN IP.

Log in with an account that exists in the **live** database. Ask the project owner for a Super Admin or Admin account. The default credentials in `MIGRATION_SUMMARY.md` only apply to the local mock server.

---

## Environment variables

`.env` is git-ignored. Never commit it.

| Variable | Where it's read | Purpose |
|---|---|---|
| `GOOGLE_TRANSLATE_API_KEY` | `vite.config.js` (dev proxy), `api/translate.js` (Vercel), `server-auth-test.js` (mock) | Google Translation v2 key. **No `VITE_` prefix on purpose**, so Vite never bundles it into client JS. If it's missing, translation returns 503 and the UI falls back to English |
| `PORT` | `server-*.js` | Mock/legacy server port (default `3001`) |
| `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD` | `server-auth-test.js` | Seed Super Admin for the **local mock** only |

On Vercel, set `GOOGLE_TRANSLATE_API_KEY` under Project → Settings → Environment Variables.

---

## npm scripts

| Script | What it does |
|---|---|
| `npm run dev` / `npm run client` | Vite dev server (port 5175). **Hits the live API** |
| `npm run server` | Local mock API `server-auth-test.js` on `:3001` (loads `.env` if present) |
| `npm run dev:local` | Mock API and Vite together. You still need to re-point `API_BASE` (see above) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve `dist/` on port 4173 |
| `npm run lint` | ESLint (flat config, `eslint.config.js`) |
| `npm start` | Build, then start the mock server |
| `setup`, `setup-env`, `setup-db`, `fix-relationships` | ⚠️ **Broken.** They reference files that no longer exist (`setup.js`, etc.). Don't use them |

---

## Project structure

```
.
├── index.html                 # Vite entry (title "HappiMynd")
├── vite.config.js             # Dev server, /api proxy → live API, translate proxy
├── vercel.json                # SPA rewrites + CORS headers for /api/*
├── api/translate.js           # Vercel serverless fn: Google Translate proxy
├── public/                    # Logo, mascot, store badges, sample Excel (served at /)
├── src/
│   ├── main.jsx               # Providers + prod fetch() rewrite to live API
│   ├── App.jsx                # Layout, nav, permission-based menu, routes
│   ├── components/            # All screens (see "What the app does")
│   ├── hooks/
│   │   ├── useDatabase.js     # Global data context
│   │   └── useTranslatedContent.js
│   ├── contexts/LanguageContext.jsx
│   ├── constants/languages.js # Languages in the quiz language picker
│   ├── services/
│   │   ├── api.js             # ★ API client, API_BASE lives here
│   │   ├── database.js        # Service facade over api.js
│   │   ├── rbac.js            # UI-side role/capability checks
│   │   ├── translation.js     # Batched, cached translation client
│   │   ├── pdfGenerator.jsx   # @react-pdf report generator
│   │   ├── auth.js, sqlite-database.js   # Legacy (SQLite era)
│   ├── database/sqlite.js, sqlite.js     # Legacy SQLite layer (used only by server.js)
│   ├── utils/                 # age, clipboard (+ test), guardianConsent, profileOrder
│   └── styles/                # Global CSS, typography, animations
├── server-auth-test.js        # ★ Local mock API (JSON file storage), mirrors live routes
├── server*.js                 # Older experimental servers (see Legacy)
├── data/                      # Sample mock data + saved PDF template JSONs
├── report_api/                # Standalone Python EI report generator
├── *.sql                      # Historical Supabase/Postgres migration scripts
└── *.md                       # Feature design notes (see Further documentation)
```

---

## Roles & permissions

The roles are defined in `src/services/rbac.js`. The **backend is the source of truth**; the UI only hides or disables controls.

| Role | Can |
|---|---|
| `super_admin` (HappiMynd) | Everything: manage organisations, delete users, reset passwords any time, change locked permissions, view the audit log |
| `admin` (client org) | Add users, set a user's onboarding password **once**, edit permissions while they're unlocked, see admin screens they've been granted |
| `user` | Take assigned quizzes and view their own records and reports |

Menu visibility is per permission key (in `App.jsx`). Admin-side keys: `admin_dashboard, organizations, profiles, packets, quiz_builder, assigned_quizzes, results, reports, active_tracking, pdf_templates`. User-side keys: `home, quiz_records`.

---

## Key flows

- **Sign-up:** the user enters an onboarding code. `GET /auth/verify-code` validates it, then the user fills in their details. If they're 13–17, guardian consent is required. Then `POST /auth/signup` runs.
- **Taking a quiz:** `/attempt/:quizId` loads the quiz, questions, profiles and assignments, plus the user's previous attempts. Progress is saved to `/quiz-attempts` (POST, then PUT to update).
- **Scoring:** this uses option-based marks with per-packet flexible or decimal scales. The details are in `OPTION_BASED_SCORING_SYSTEM.md`, `FLEXIBLE_SCORING_SCALE_FEATURE.md` and `DECIMAL_SCORING_SCALE_FEATURE.md`.
- **Employee bulk import (Organization Management):** the Excel sheet is parsed in the browser with SheetJS. Rows go to `/organizations/:orgId/employees/import` in **chunks of 200** to avoid HTTP 413 errors and timeouts on large files (4000+ rows). Email is optional. Failed rows can be exported.
- **Reports:** `ReportViewer` / `ReportContent` render the report, styled by the quiz's PDF template (`/pdf-templates/:quizId`). Active Tracking can generate many PDFs at once and download them as a ZIP.

---

## Translation

The quiz page can be translated into the languages listed in `src/constants/languages.js`. To add a language, append a `{ code, label }` entry there.

The flow is: `translation.js` batches strings (100 per request), caches results in memory, and POSTs to `/api/translate`. In dev, the Vite proxy adds the key. In prod, the Vercel function `api/translate.js` adds it. Neither path exposes the key to the browser.

---

## PDF reports

- Reports are generated **client-side** with `jspdf` + `html2canvas` (snapshotting the rendered report) and `@react-pdf/renderer`.
- Images must be same-origin. That's why the logo and badges are in `public/` instead of being hot-linked from happimynd.com (see `CORS_FIX_INSTRUCTIONS.md`).
- Per-quiz header, footer and section config are stored by the backend through `/pdf-templates/:quizId`. `data/pdf-template-*.json` are local samples.

---

## Deployment

### Frontend: Vercel (current)

1. Connect the repo to Vercel. The framework preset is Vite, the build command is `npm run build`, and the output directory is `dist`.
2. Set the `GOOGLE_TRANSLATE_API_KEY` env var.
3. `vercel.json` provides the SPA fallback (all non-`/api` paths go to `index.html`) and CORS headers. `api/translate.js` deploys automatically as a serverless function.

Vercel deploys from `main` of the main repo ([mayankkuthar/Assessment](https://github.com/mayankkuthar/Assessment)). A change goes live when a PR is merged there.

### Backend

The live API (`happimynd.com/new_api`) and its AWS MySQL database are deployed and managed **separately on AWS**, outside this repo. Get access to that codebase, the AWS console and the DB from the project owner.

### `deploy.sh` (legacy)

This is an older EC2 script. It installs Node 18, PM2 and nginx, then runs `server-auth-test.js` (the **mock** API) and `vite preview`. It does **not** deploy the production backend, and Node 18 is too old for the current `server` script. Treat it as a reference only.

---

## Legacy / unused files

These are kept for history. The current app does not use them.

- `server.js`, `server-simple.js`, `server-basic.js`, `server-minimal.js`, `server-production.js`: earlier Express servers from the SQLite/JSON era.
- `assessment.db`, `src/database/sqlite.js`, `src/sqlite.js`, `src/services/sqlite-database.js`, `src/services/auth.js`: the SQLite layer.
- `*.sql` at the repo root: Supabase/Postgres migrations and RLS fixes. These are **not** the live MySQL schema.
- `mock-data.backup.*.json`, `data/mock-data.json`: old mock data snapshots.
- `clear-attempts.js`: hits `localhost:3001/api/clear-all-attempts` on the mock server only.
- `assessment_template.xlsx` at the root is empty (0 bytes). Use `public/assessment_filled_sample.xlsx` as the Excel sample instead.

---

## Further documentation

Feature design notes live in the repo root:

| Topic | Files |
|---|---|
| Scoring | `SCORING_SCALE_SYSTEM.md`, `OPTION_BASED_SCORING_SYSTEM.md`, `NEW_SCORING_SYSTEM_IMPLEMENTATION.md`, `CORRECTED_MARKS_CALCULATION.md` |
| Flexible/decimal scales | `FLEXIBLE_SCORING_SCALE_FEATURE.md`, `FLEXIBLE_SCALE_QUICK_GUIDE.md`, `FLEXIBLE_SCALE_DIAGRAM.md`, `DECIMAL_*.md` |
| Reports | `PERSONALITY_QUIZ_REPORT_FEATURE.md`, `PERSONALITY_REPORT_QUICK_GUIDE.md`, `REPORT_VISIBILITY_LOGIC_UPDATE.md`, `PACKET_MARKS_DISPLAY_FEATURES.md` |
| EI assessment | `EMOTIONAL_INTELLIGENCE_ASSESSMENT_SYSTEM.md`, `report_api/` |
| Misc | `ENHANCED_QUESTION_FEATURES.md`, `IMPLEMENTATION_SUMMARY.md`, `MIGRATION_SUMMARY.md` (RBAC section still accurate), `UI_CLEANUP_ANALYSIS.md`, `CORS_FIX_INSTRUCTIONS.md` |

Some of these describe the older Supabase or SQLite setup. Where they disagree with this README, trust this README.

---

## Contributing

This project uses a **fork + PR** workflow:

- **Main repo (upstream):** https://github.com/mayankkuthar/Assessment. PRs are merged into its `main`.
- **Your fork (origin):** e.g. `https://github.com/<your-username>/Assessment`. Work on **any branch you like**, e.g. `dev`, `feature/bulk-export` or `fix/import-413`. The branch name doesn't matter, only the PR target does.

In the commands below, replace `<branch>` with your branch name.

1. Create or update your branch from the latest upstream:
   ```bash
   git fetch upstream
   git checkout -b <branch> upstream/main   # new branch
   # or, for an existing branch:
   git checkout <branch> && git merge upstream/main   # or: git rebase upstream/main
   ```
2. Commit on your branch and push to your fork: `git push -u origin <branch>`.
3. On GitHub, open a PR from `<your-username>:<branch>` into **`mayankkuthar/Assessment:main`**. With the CLI:
   ```bash
   gh pr create --repo mayankkuthar/Assessment --base main --head <your-username>:<branch>
   ```
4. Run `npm run build` before pushing. `npm run lint` already reports about 128 problems (mostly `no-undef` in Node server files and unused vars), so the goal is to add no new ones.
5. Never commit `.env`, API keys, DB credentials, or a re-pointed `API_BASE`.
6. Remember that local testing writes to the **live** database.
