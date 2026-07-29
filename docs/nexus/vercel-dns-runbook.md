# Vercel + nerdcommand.com runbook

**Decisions locked:** ADR-0001 (Vercel hosts static HTML from GitHub), ADR-0008 (nerdcommand.com owned).

## A. Connect GitHub → Vercel (once)

1. Log in at [vercel.com](https://vercel.com) (GitHub auth recommended).  
2. **Add New… → Project** → import `chapmancapital1-droid/nerdcommand-site`.  
3. Configure:

| Setting | Value |
|---------|--------|
| Framework Preset | Other |
| Root Directory | `.` |
| Build Command | *(leave empty)* |
| Output Directory | *(leave empty / `.`)* |
| Install Command | *(leave empty)* |
| Production Branch | `main` |

4. Deploy. Confirm the `*.vercel.app` URL serves `index.html`.  
5. Every push to `main` = production; PRs = preview URLs.

## B. Attach nerdcommand.com

1. Vercel project → **Settings → Domains**.  
2. Add `nerdcommand.com` and `www.nerdcommand.com`.  
3. Prefer apex as primary; set www → redirect to apex (Vercel UI).  
4. Copy the DNS records Vercel displays (do not invent IPs).

## C. Registrar DNS (owner)

At the registrar that holds **nerdcommand.com**:

1. Remove conflicting A/CNAME/AAAA for `@` and `www` (old Pages or parking).  
2. Add Vercel’s apex + www records.  
3. Wait for propagation (often minutes; up to 48h worst case).  
4. In Vercel Domains, wait until status is **Valid** + SSL issued.

## D. After go-live

```powershell
# From repo root
# 1. Update site_config.json live_url + custom_domain_wired true
# 2. Optional: site health against new domain
pwsh ./site_manager.ps1 check
```

Also verify:

- [ ] Homepage, studio, deckbrief, funnel pages load  
- [ ] `mailto:` / contact still correct  
- [ ] API CORS already allows `https://nerdcommand.com` (`deckbrief-api/server.js`)  

## E. Superagent notes

- Static site only on Vercel for now.  
- `deckbrief-api` stays on a **separate** durable host (still open — not Vercel-static).  
- No localhost AI from Vercel.  
- Evidence of first green prod deploy: drop URL + timestamp in `docs/nexus/04-evidence/`.
