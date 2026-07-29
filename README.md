# NerdCommand Site + Business OS (Stage 1)

**nerdcommand.com** front door and **NerdCommand OS** UX shell, with **DeckBrief** API as the first live backend slice.

| Surface | Path | Host |
|---------|------|------|
| Public site | `index.html`, `platform.html`, `foundry.html`, `deckbrief.html`, `pricing.html` | Vercel |
| Command Center (15 views) | `/app/` | Vercel |
| DeckBrief lead form | `deckbrief-access.html` | Vercel |
| CEO dashboard | `ceo.html` | Vercel |
| Funnel builder / player | `funnel-builder.html`, `funnel.html` | Vercel |
| DeckBrief API | `deckbrief-api/` | Railway |
| Local AI node | `connector/` | Local machine only |

## Source of truth

- `NerdCommand_CIO_Blueprint_v1.md`
- `NerdCommand_Updated_Architecture_and_Build_Plan_v1_1_0.md`
- `docs/nexus/06-source-documents-read.md`
- Product Registry: `assets/js/product-registry.js` + `product-registry.json`

## Local frontend

```powershell
npm run check
npm run dev
# http://127.0.0.1:4173/       public site
# http://127.0.0.1:4173/app/   OS shell
```

## Local DeckBrief API

```powershell
cd deckbrief-api
copy .env.example .env
npm install
npm run db:up
npm run seed:dev
npm run dev
npm run smoke
```

Point any page at the local API with `?api=http://127.0.0.1:3000` or edit `api-config.json`.

## Deploy

1. **Vercel** — import this repo (static + `/api` AI functions). Framework: Other. See `docs/ux-prototype/VERCEL_DEPLOYMENT.md` and `docs/nexus/vercel-dns-runbook.md`.
2. **Railway** — root directory `deckbrief-api`. See `deckbrief-api/DEPLOY.md`.
3. Set `api_base_url` in `api-config.json` to the Railway URL after deploy.
4. Domain: **nerdcommand.com** (owner DNS → Vercel).

## Legacy

Pre-promote marketing HTML is under `legacy/`.

## Superagent

See `AGENTS.md` and `docs/nexus/SUPERAGENT.md`.
