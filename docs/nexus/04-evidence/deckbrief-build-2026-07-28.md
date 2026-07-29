# Evidence — DeckBrief build (local MVP)

**Task:** Build DeckBrief product kernel  
**Date:** 2026-07-28  
**Result:** PASS (local)

## What shipped

| Area | Change |
|------|--------|
| Local stack | `docker-compose.yml` Postgres 16 |
| Dev seed | `scripts/seed-dev.js` pins admin + intake keys |
| AI | Template fallback when no Anthropic key |
| Email | Skip gracefully when no Resend key |
| Health | `/health` reports db + feature flags |
| Public config | `/api/config/public` |
| Frontends | `js/deckbrief-config.js` + `api-config.json` |
| CORS | Vercel previews + nerdcommand.com |
| Smoke | `npm run smoke` |
| Verify | `npm run verify` (28 checks) |
| Hosting ADR | API on Railway (0009); site on Vercel (0001) |

## Commands run

```text
docker compose up -d
npm install
npm run seed:dev
npm run verify   → 28 passed, 0 failed
npm run smoke    → ALL PASS against http://127.0.0.1:3000
```

## Health sample

```json
{
  "status": "ok",
  "product": "DeckBrief",
  "version": "1.0.0",
  "db": "ok",
  "features": { "ai": false, "email": false, "master_key": true }
}
```

## Local keys (dev only — not production)

| Key | Value |
|-----|--------|
| Master | `dev-master-key-change-me-in-production` |
| Admin | `dbk_local_dev_admin_key_change_in_prod` |
| Intake | `deckbrief-default` |

## Residual risk / next

1. Railway production deploy still needed (owner Railway account + secrets).  
2. Set real `api_base_url` in `api-config.json` after Railway domain exists.  
3. Anthropic + Resend keys for AI/email path.  
4. Production `API_SECRET_KEY` must replace dev master key.  
5. Funnel builder requires **account admin key** (not master) for create — by design.

## Verdict

**Local DeckBrief MVP: SHIP-ready for local demo.**  
**Production: NEEDS WORK** until Railway + secrets + `api-config.json` URL cutover.
