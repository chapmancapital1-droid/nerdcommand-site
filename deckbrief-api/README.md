# DeckBrief API

Lead capture → AI follow-up drafts → pipeline CRM → CEO dashboard → daily morning brief.

Part of the **NerdCommand Business OS**. Static UI on Vercel; this service on **Railway** (ADR-0009).

## Quick start (local)

```powershell
cd deckbrief-api
copy .env.example .env
npm install
npm run db:up          # Docker Postgres on :5432
npm run seed:dev       # schema + pin local admin key
npm run dev            # http://127.0.0.1:3000
npm run smoke          # end-to-end API checks
npm run verify         # multi-tenant schema isolation tests
```

Default local `.env` values:

| Key | Value |
|-----|--------|
| DATABASE_URL | `postgresql://deckbrief:deckbrief@localhost:5432/deckbrief` |
| API_SECRET_KEY | `dev-master-key-change-me-in-production` |
| DEV_ADMIN_KEY | `dbk_local_dev_admin_key_change_in_prod` |

Open CEO UI: `ceo.html?api=http://127.0.0.1:3000` and paste the master or admin key.

## Product surface

| Route | Auth | Purpose |
|-------|------|---------|
| `GET /health` | public | liveness + db + feature flags |
| `POST /api/leads` | intake key | public form capture |
| `GET/PATCH /api/leads` | admin/master | CRM |
| `GET /api/pipeline` | admin/master | kanban |
| `GET /api/ceo/dashboard` | admin/master | command center |
| `POST /api/briefs/preview` | admin/master | dry-run brief |
| `/api/funnels/*` | admin + public slug | landing builder |
| `/api/webhooks/leads/:platform` | intake key | ad/form webhooks |
| `/api/admin/accounts` | master only | multi-tenant accounts |

## Production

See `DEPLOY.md` and `docs/adr/0009-deckbrief-api-host-railway.md`.

After Railway URL is known, set `api_base_url` in repo root `api-config.json` and redeploy the Vercel site.
