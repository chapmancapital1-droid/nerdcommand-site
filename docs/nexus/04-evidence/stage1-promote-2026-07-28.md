# Evidence — Stage 1 UX prototype promote

**Date:** 2026-07-28  
**Task:** T-013 promote UX prototype into active site root  
**Result:** PASS (local check)

## Actions

1. Backed up prior root marketing HTML → `legacy/` (`index.html`, `deckbrief.html`, `studio.html`)
2. Copied UX Prototype v0.1.0 into root: `app/`, `assets/`, `api/`, `connector/`, `scripts/`, public HTML, `vercel.json`, `package.json`
3. Preserved: `deckbrief-api/`, `ceo.html`, funnels, `docs/nexus/`, blueprints, `api-config.json`, `js/deckbrief-config.js`
4. Restored lead intake as `deckbrief-access.html` (wired to DeckBrief API config)
5. Linked Deckbrief product page + footer/header to access, CEO, Command Audit CTA
6. Relaxed Vercel CSP enough for Railway API + inline ops scripts
7. Updated `scripts/check-project.mjs` required file set for hybrid repo

## Verification

```text
npm run check
→ Project check passed. 20 required files found.
→ Stage 1 UX prototype promoted + DeckBrief API preserved.
```

## Routes (local `npm run dev` → :4173)

| URL | Purpose |
|-----|---------|
| `/` | New public site (registry-driven) |
| `/app/` | 15-view Command Center shell |
| `/deckbrief.html` | Command Brief product |
| `/deckbrief-access.html` | Live lead form → deckbrief-api |
| `/ceo.html` | Live CEO dashboard |
| `/platform.html` `/foundry.html` `/pricing.html` | Product IA |

## Residual risk

- OS shell still uses **synthetic** data until T-015 bind to API
- Production Railway URL still placeholder in `api-config.json`
- Old marketing under `legacy/` not linked publicly (intentional)
