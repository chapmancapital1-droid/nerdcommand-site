# ADR-0001: Static site hosting on Vercel (from GitHub)

**Status:** Accepted  
**Date:** 2026-07-28  
**Owner:** Michael Chapman  
**Deciders:** Owner + Superagent  

## Context

NerdCommand.com is currently a static HTML/CSS/JS marketing and Command Center prototype in `chapmancapital1-droid/nerdcommand-site`. It was published via GitHub Pages. Production must use the owned domain **nerdcommand.com**.

## Decision

1. **Vercel** hosts the static HTML site.  
2. Source of truth is the **GitHub** repo `chapmancapital1-droid/nerdcommand-site`.  
3. Vercel imports the GitHub project and deploys on push to `main` (production) and PRs (preview).  
4. **No build step** for the current site: output = repo root static files (`index.html`, etc.).  
5. GitHub Pages remains a fallback until Vercel + DNS cutover is verified; then Pages can be disabled.

## Consequences

- Custom domain `nerdcommand.com` (and `www`) are configured in the Vercel project, not GitHub Pages.  
- Preview deployments give Superagent safe review URLs before production.  
- Light serverless functions *may* live on Vercel later for edge proxies only; durable OS API/workers stay **off** pure static hosting (see Architecture v1.1.0 / future ADR for API host).  
- Never point Vercel functions at founder `localhost` for LM Studio/Ollama.

## Implementation checklist

- [ ] Create Vercel project linked to GitHub repo  
- [ ] Framework preset: **Other** (static)  
- [ ] Root directory: `.`  
- [ ] Build command: empty / none  
- [ ] Output directory: `.` (or leave default for static root)  
- [ ] Production branch: `main`  
- [ ] Add domain `nerdcommand.com` + `www.nerdcommand.com`  
- [ ] Apply DNS at registrar (see ADR-0008)  
- [ ] Update `site_config.json` live_url after first green deploy  
- [ ] CORS on `deckbrief-api` already includes `https://nerdcommand.com`  

## Non-decision (open)

**API / worker hosting** (Railway, Fly, Render, etc.) is **not** settled by this ADR. Only the public HTML surface is locked to Vercel.
