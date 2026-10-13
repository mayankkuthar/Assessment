# Troubleshooting & Handover Guide

Common problems and their fixes, for anyone taking over this repo. Read the [README](README.md) first, especially **Live backend & data**.

---

## 0. Before you start (handover checklist)

Get these from the current owner. None of them are in the repo:

- [ ] Access to the main GitHub repo [`mayankkuthar/Assessment`](https://github.com/mayankkuthar/Assessment) (to review/merge PRs) and the Vercel project linked to it
- [ ] Your own **fork** of it to push branches and raise PRs from
- [ ] Access to the **backend codebase** behind `https://happimynd.com/new_api`. It is not in this repo
- [ ] AWS console access: the backend host and the **AWS MySQL** instance (endpoint, DB user, security group rules)
- [ ] A **Super Admin** login on the live system, plus an Admin and a User test account
- [ ] The Google Cloud Translation API key (and which GCP project owns it)
- [ ] Whether a staging DB exists. Today none is wired up, so local dev writes to **production**

---

## 1. Setup & install

| Symptom | Likely cause | Fix |
|---|---|---|
| `npm run server` fails with `bad option: --env-file-if-exists` | Node is older than 22.9 | Install Node 22.9+ (24.x works). Use `nvm install 24 && nvm use 24` |
| `npm install` fails building `better-sqlite3` (node-gyp / Python / Xcode errors) | A native module that only the legacy `server.js` uses | macOS: `xcode-select --install`. Linux: `apt install build-essential python3`. Or ignore the error if you don't need `server.js` |
| `npm run setup` / `setup-env` / `setup-db` / `fix-relationships` → "Cannot find module" | Those scripts point to deleted files | Don't use them. There's nothing to set up for the frontend beyond `npm install` |
| App isn't on `localhost:5173` | Vite is configured for port **5175**, and moves to the next free port if that's taken | Read the URL printed in the terminal |
| Vite: "Blocked request. This host is not allowed" | Request came through a tunnel or hostname not in `allowedHosts` | Add the hostname to `server.allowedHosts` in `vite.config.js`. The Cloudflare tunnel host listed there is stale |

---

## 2. Login, data & API

| Symptom | Likely cause | Fix |
|---|---|---|
| "Network error - please check your connection" everywhere | The live API (`happimynd.com/new_api`) is down or unreachable, or the browser is blocking it | Open `https://happimynd.com/new_api/...` directly. Check the backend on AWS (process running, health, logs) and the DB (below) |
| API calls return **500** / "Internal Server Error" | Usually the backend can't reach **AWS MySQL** | On AWS, check that the MySQL instance is *available* and not out of storage or connections. Check that its security group allows the backend host. Check that the DB credentials in the **backend's** env haven't been rotated |
| Logged in but menus are empty or redirect to login | `localStorage.currentUser` is stale or malformed, or the user has no permission keys | DevTools → Application → Local Storage → delete `currentUser` and `assessment_session`, then log in again. Make sure the user's permissions are set in Admin Dashboard |
| 401 / 403 on admin actions | The backend enforces RBAC through the `x-user-id` / `x-user-role` headers | Log in as an account with the right role. Some actions are Super Admin only (see README → Roles) |
| Default accounts (`admin@assessment.local`, `superadmin@happimynd.com`) don't work | Those only exist on the **local mock** server | Use real live-DB accounts |
| Default accounts don't work on the local mock either | An existing `mock-data.json` already has different users | Delete `./mock-data.json` (repo root) and restart `npm run server`. It reseeds itself |
| Changes made locally show up in production | Expected: `API_BASE` is hardcoded to the live API | See README → Live backend & data for how to point at the mock. Don't commit that change |
| Sign-up says onboarding code is invalid | Code was regenerated or belongs to another org | Super Admin → Organization Management → check or regenerate the code |
| Sign-up blocked for a 13–17 year old | Parent/Guardian consent form is incomplete | Fill in all guardian fields and tick the acknowledgement |

---

## 3. Excel import

| Symptom | Likely cause | Fix |
|---|---|---|
| **HTTP 413** (Payload Too Large) or timeouts on employee import | Payload too big for the backend or its reverse proxy | The frontend already sends **200 rows per chunk** (`OrganizationManager.jsx`). If 413s persist, lower the chunk size, or raise the body limit on the backend's nginx/ALB and app server |
| Some rows not imported | Validation failures (duplicates, bad columns) | Use the **error export** after the import to see which rows failed and why |
| Columns not detected | Header names don't match what the parser looks for | Compare against `public/assessment_filled_sample.xlsx`. Don't use the root `assessment_template.xlsx`: it's empty (0 bytes) |

---

## 4. Translation

| Symptom | Likely cause | Fix |
|---|---|---|
| Language picker does nothing / stays English, `/api/translate` returns **503** | `GOOGLE_TRANSLATE_API_KEY` isn't set | Dev: add it to `.env` and **restart** `npm run dev`. Vite reads it at startup. Prod: set it in Vercel env vars and redeploy |
| `/api/translate` returns 400/403 from Google | Key is invalid, the API isn't enabled, billing is off, or the key's restrictions block the server | GCP console → enable "Cloud Translation API", check billing and key restrictions |
| You named it `VITE_GOOGLE_TRANSLATE_API_KEY` | A `VITE_` prefix **would leak the key into the browser bundle** | Use exactly `GOOGLE_TRANSLATE_API_KEY` |

---

## 5. PDF reports

| Symptom | Likely cause | Fix |
|---|---|---|
| CORS error loading images while generating a PDF; logo missing | Image hot-linked from another origin (e.g. happimynd.com) | Put the image in `public/` and reference it as `/file.png`. See `CORS_FIX_INSTRUCTIONS.md` |
| Bulk PDF / ZIP download hangs or the tab crashes | All PDFs are generated **in the browser** (html2canvas + jsPDF), which is memory heavy | Generate smaller batches (filter first), use Chrome on a machine with plenty of RAM, and keep the tab in the foreground |
| PDF blank or cut off | Report not fully rendered (charts or fonts still loading) before capture | Wait for the report to finish loading. When changing code, make sure capture runs after charts render |
| Template changes not reflected | Template is cached in `localStorage` (`template-history-*`) or wasn't saved to the backend | Save again in PDF Templates. Clear those localStorage keys if needed |

---

## 6. Build, lint, git & deploy

| Symptom | Likely cause | Fix |
|---|---|---|
| `npm run lint` shows ~128 problems | Already present: Node globals (`process`) in server/config files under a browser-only ESLint config, plus unused vars | Not a blocker. Don't add new ones. To fix properly, add a Node-globals override in `eslint.config.js` for `server*.js`, `vite.config.js` and `api/` |
| Build warns "chunks larger than 500 kB" | One ~4 MB bundle (MUI, PDF libs, charts) | Only a warning. Lazy-load heavy screens with `React.lazy` if load time matters |
| Deep link (e.g. `/attempt/123`) 404s in prod | Missing SPA fallback | On Vercel, `vercel.json` handles it. Other hosts need `try_files $uri /index.html` (nginx) or an equivalent |
| Works in dev, API fails in prod | Prod relies on the `window.fetch` rewrite in `src/main.jsx` plus the hardcoded `API_BASE` | Check both point to the same backend. If the backend URL changes, update **all** of: `src/services/api.js`, `src/main.jsx`, `vite.config.js`, and the components that hardcode `happimynd.com` (`grep -rn "happimynd.com" src`) |
| `deploy.sh` brings up a server with fake data | It runs the **mock** server, and installs Node 18 | Don't use it for production. The frontend is on Vercel and the backend is deployed separately on AWS |

| Symptom | Likely cause | Fix |
|---|---|---|
| PR shows lots of unrelated commits or conflicts | Your fork's branch is behind `mayankkuthar/Assessment:main` | `git fetch upstream && git merge upstream/main` on your branch, resolve conflicts, then push |
| `git fetch upstream` → "no such remote" | Upstream remote not added | `git remote add upstream https://github.com/mayankkuthar/Assessment.git` |
| `gh pr create` opens the PR against your fork | `gh` defaulted to the fork as base repo | Pass `--repo mayankkuthar/Assessment --base main --head <your-username>:<branch>` |
| Merged PR but site didn't change | Vercel deploys from the main repo's `main`. The deploy may have failed or still be running | Check the deployment status and logs in the Vercel project |

---

## 7. Useful commands

```bash
# Where does the app talk to the backend?
grep -rn "happimynd.com" src vite.config.js

# Which env vars does code read?
grep -rn "process.env\|import.meta.env" --exclude-dir=node_modules --exclude-dir=dist .

# Reset local mock data
rm -f mock-data.json && npm run server

# Check the live API is up (any GET endpoint)
curl -i https://happimynd.com/new_api/profiles
```

---

## 8. Gotchas worth knowing

- **One database for dev and prod.** This is the biggest risk. Be careful with deletes, bulk imports and "clear attempts".
- **The UI's RBAC is cosmetic.** Real enforcement is in the backend, so a UI change alone never grants or revokes access.
- **Many root `.md` and `.sql` files are historical** (the Supabase and SQLite eras). The root SQL files are **not** the MySQL schema. Get the real schema from the AWS MySQL instance or the backend repo.
- **Secrets:** the frontend repo holds no DB credentials, and it should stay that way. The MySQL credentials belong only in the backend's AWS environment. If a key or password ever lands in git, rotate it. Deleting the commit is not enough.
