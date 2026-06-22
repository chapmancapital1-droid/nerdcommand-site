# DeckBrief — Deployment Runbook

Everything needed to take the DeckBrief backend from repo → live, in order.
Estimated time: ~45 minutes. You need 4 accounts: Railway, Resend, Anthropic, GitHub (have).

---

## Overview — what's getting deployed

| Piece | Hosted on | Purpose |
|---|---|---|
| `deckbrief-api/` (Express + Postgres) | Railway | Lead capture, AI drafts, CRM, CEO dashboard data |
| Postgres database | Railway plugin | Stores accounts, leads, pipeline, briefs |
| Static site (`*.html`) | GitHub Pages | deckbrief.html, ceo.html, funnels |
| Daily brief cron | GitHub Actions | 7AM brief per account |

---

## STEP 1 — Create the API keys you'll need (~10 min)

### 1a. Anthropic (Claude Haiku — drafts + briefs)
1. Go to https://console.anthropic.com
2. Sign in → **Settings → API Keys → Create Key**
3. Name it `deckbrief-prod`, copy the key (starts `sk-ant-...`)
4. Add billing: **Settings → Billing** → add $5-10 credit (Haiku is ~$0.001/draft)

### 1b. Resend (email delivery)
1. Go to https://resend.com → sign up (free: 3,000 emails/mo)
2. **API Keys → Create API Key** → copy it (starts `re_...`)
3. **Domains → Add Domain** → enter `nerdcommand.info`
4. Resend shows DNS records (SPF, DKIM). Add them at your domain registrar.
   - Until verified, email only sends to your own verified address — fine for testing.
   - The `FROM` address in code is `noreply@nerdcommand.info` — must match this domain.

### 1c. Generate your MASTER key
Run this anywhere (or use any 64-char random hex):
```bash
openssl rand -hex 32
```
Save the output. This is `API_SECRET_KEY` — your platform super-admin key.

---

## STEP 2 — Deploy the backend to Railway (~10 min)

1. Go to https://railway.app → sign in with GitHub
2. **New Project → Deploy from GitHub repo** → pick `chapmancapital1-droid/nerdcommand-site`
3. After it imports, open the service → **Settings**:
   - **Root Directory**: set to `deckbrief-api`
   - **Start Command**: leave blank (uses `npm start` from package.json)
4. **Add the database**: in the project, click **New → Database → PostgreSQL**.
   Railway auto-injects `DATABASE_URL` into your service. No manual wiring.
5. Open the API service → **Variables** → add these (Raw Editor is fastest):
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   RESEND_API_KEY=re_...
   API_SECRET_KEY=<your openssl hex from step 1c>
   BRIEF_RECIPIENT_EMAIL=chapmancapital1@gmail.com
   ```
   (DATABASE_URL is already there from the Postgres plugin.)
6. Railway redeploys automatically. Watch **Deployments → View Logs** for:
   ```
   [db] schema ready
   [deckbrief-api] listening on port ...
   ```
   `[db] schema ready` = migrations ran, accounts table + default account created.
7. **Settings → Networking → Generate Domain**. Copy the URL, e.g.
   `https://deckbrief-api-production-xxxx.up.railway.app`

### 2a. Smoke-test the live API
```bash
# Health check
curl https://YOUR-RAILWAY-URL/health
# → {"status":"ok","ts":"..."}

# Submit a test lead (public, no auth)
curl -X POST https://YOUR-RAILWAY-URL/api/leads \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"Lead","email":"test@example.com","account_key":"deckbrief-default"}'
# → {"success":true,"id":"..."}

# View leads as master
curl https://YOUR-RAILWAY-URL/api/leads \
  -H "Authorization: Bearer YOUR_MASTER_KEY"
# → [ { ...the test lead... } ]
```

---

## STEP 3 — Point the frontend at the live API (~5 min)

Two files have a hardcoded placeholder URL `https://deckbrief-api.up.railway.app`.
Replace with your real Railway URL:

1. `deckbrief.html` — find `const DECKBRIEF_API =`
2. `ceo.html` — find `const API =`

Then commit + push:
```bash
cd D:/nerdcommand-site
git add deckbrief.html ceo.html
git commit -m "chore: point frontend at live Railway API URL"
git push origin main
```

---

## STEP 4 — Enable GitHub Pages (static site live) (~3 min)

1. GitHub repo → **Settings → Pages**
2. **Source**: Deploy from a branch → **Branch: main** → **/ (root)** → Save
3. Wait ~1 min. Your site is live at:
   `https://chapmancapital1-droid.github.io/nerdcommand-site/`
   - `/deckbrief.html` — DeckBrief funnel (form now posts to Railway)
   - `/ceo.html` — CEO dashboard (log in with your master key)
   - `/studio.html`, `/funnel/nerdcommand-ai/` — other funnels

### 4a. (Optional) custom domain
Settings → Pages → Custom domain → `nerdcommand.com` → add the CNAME/A records
GitHub shows at your registrar.

---

## STEP 5 — Turn on the 7AM daily brief cron (~5 min)

1. GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**.
   Add four secrets:
   ```
   DECKBRIEF_DATABASE_URL   = <Railway Postgres URL — copy from Railway DB → Connect → Postgres Connection URL>
   ANTHROPIC_API_KEY        = sk-ant-...
   RESEND_API_KEY           = re_...
   BRIEF_RECIPIENT_EMAIL    = chapmancapital1@gmail.com
   ```
2. Test it now without waiting for 7AM: repo → **Actions → "DeckBrief — Daily Brief"
   → Run workflow** → set `dry_run` = `true` → Run.
   - Dry run prints the brief to the Actions log, sends nothing.
   - Set `dry_run=false` (or wait for the 12:00 UTC cron) to actually send.

---

## STEP 6 — Onboard a customer (per customer, ~2 min each)

1. Create their account (uses your master key):
   ```bash
   curl -X POST https://YOUR-RAILWAY-URL/api/admin/accounts \
     -H "Authorization: Bearer YOUR_MASTER_KEY" \
     -H "Content-Type: application/json" \
     -d '{"name":"Acme Sales Co","email":"ceo@acme.com"}'
   ```
   Response (save it — `admin_key` is shown ONCE):
   ```json
   {
     "id": "uuid",
     "admin_key": "dbk_xxxxxxxx",      // their dashboard + sheet key
     "intake_key": "acme-sales-co-9f3a" // goes in their lead form
   }
   ```
2. Give the customer:
   - **`admin_key`** → they paste into their Business OS sheet (`DECKBRIEF_API_KEY`)
     and use to log into `ceo.html`
   - **`intake_key`** → embed in their lead-capture form's `account_key` field
3. Hand them `deckbrief-api/tools/business-os-sheet.js`:
   - Google Sheets → Extensions → Apps Script → paste → set `DECKBRIEF_API_URL`
     (your Railway URL) and `DECKBRIEF_API_KEY` (their admin_key) → run `buildBusinessOS()`.

---

## STEP 7 — Pre-deploy / regression check (anytime)

Before pushing schema changes, prove tenant isolation still holds:
```bash
docker run --rm -d --name db_verify -e POSTGRES_PASSWORD=test \
  -e POSTGRES_DB=deckbrief_test -p 5433:5432 postgres:16
cd deckbrief-api
TEST_DATABASE_URL=postgresql://postgres:test@localhost:5433/deckbrief_test npm run verify
docker stop db_verify
```
Expect: `19 passed, 0 failed.`

---

## Environment variables reference

| Var | Where | What |
|---|---|---|
| `DATABASE_URL` | Railway (auto) | Postgres connection |
| `ANTHROPIC_API_KEY` | Railway + GH secret | Claude Haiku |
| `RESEND_API_KEY` | Railway + GH secret | Email |
| `API_SECRET_KEY` | Railway only | Master super-admin key |
| `BRIEF_RECIPIENT_EMAIL` | Railway + GH secret | Default brief/notification inbox |
| `DECKBRIEF_DATABASE_URL` | GH secret | Same as DATABASE_URL, for the cron |

---

## Troubleshooting

- **`[db] migration error` in Railway logs** → the Postgres plugin isn't linked, or
  DATABASE_URL is missing. Confirm the DB service is in the same project.
- **Form submits but no email** → Resend domain not verified yet; emails only go to
  your own verified address until DNS records propagate.
- **CEO dashboard says "Error — check API key"** → the key entered doesn't match
  `API_SECRET_KEY` (master) or any account `admin_key`. Also confirm `ceo.html`'s
  `API` constant points at the live Railway URL, not the placeholder.
- **CORS error in browser console** → add your GitHub Pages origin to the `cors()`
  origins list in `server.js` (the github.io and nerdcommand.com origins are already there).
- **Cron didn't send** → check Actions logs; most common cause is a missing/incorrect
  `DECKBRIEF_DATABASE_URL` secret.
