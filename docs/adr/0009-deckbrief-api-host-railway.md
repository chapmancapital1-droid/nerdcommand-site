# ADR-0009: DeckBrief API + workers on Railway

**Status:** Accepted  
**Date:** 2026-07-28  
**Owner:** Michael Chapman  

## Context

Static HTML ships on **Vercel** (ADR-0001). DeckBrief needs durable Node + Postgres + cron-friendly jobs. That cannot live as static files alone.

## Decision

| Piece | Host |
|-------|------|
| Public HTML | Vercel ← GitHub |
| `deckbrief-api` Express | **Railway** (root dir `deckbrief-api`) |
| Postgres | Railway Postgres plugin |
| Daily brief cron | GitHub Actions → `jobs/daily-brief.js` (or Railway cron later) |

## Consequences

- Frontends read API URL from `api-config.json` (not hard-coded forever).  
- CORS must allow `nerdcommand.com`, Vercel previews, and local dev.  
- Secrets stay in Railway / GitHub Actions — never in static HTML.  
- Superagent builds features in `deckbrief-api/`; deploy is Railway on push once linked.

## Acceptance

- [ ] Railway service healthy: `GET /health` → db:ok  
- [ ] Lead form on Vercel posts successfully  
- [ ] CEO dashboard authenticates with master/admin key  
