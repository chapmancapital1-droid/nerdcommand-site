# ADR-0008: Custom domain nerdcommand.com

**Status:** Accepted  
**Date:** 2026-07-28  
**Owner:** Michael Chapman  

## Context

Owner confirms **nerdcommand.com** DNS is owned and available. Site will be hosted on **Vercel** importing this GitHub repo (ADR-0001). Prior docs mentioned `nerdcommand.info` / GitHub Pages; production brand domain is **nerdcommand.com**.

## Decision

| Host | Role |
|------|------|
| `nerdcommand.com` | Primary company site (apex) |
| `www.nerdcommand.com` | Canonical redirect to apex (or reverse — prefer apex as canonical) |
| Vercel | SSL + domain attachment |
| Owner registrar | DNS records only |

Future surfaces (not configured in this ADR):

| Host | Role |
|------|------|
| `os.nerdcommand.com` or `command.nerdcommand.com` | Authenticated OS (later) |
| `docs.nerdcommand.com` | Docs (later) |
| `status.nerdcommand.com` | Status (later) |

## DNS records (Vercel)

After adding the domain in the Vercel project UI, use the exact values Vercel shows. Typical pattern:

### Apex (`nerdcommand.com`)

Vercel usually requires either:

**Option A — A records** (common):

```text
A     @     76.76.21.21
```

**Option B — ALIAS/ANAME** to `cname.vercel-dns.com` if the registrar supports apex CNAME flattening.

### www

```text
CNAME  www  cname.vercel-dns.com
```

> Always copy the **live** values from Vercel → Project → Settings → Domains. IPs/targets can differ by account/region.

### Do not use (for Vercel cutover)

GitHub Pages A records (`185.199.108.153` etc.) — those apply only if staying on Pages.

## SSL

- Vercel provisions HTTPS automatically once DNS validates.  
- Enforce HTTPS in Vercel domain settings.  
- No repo-root `CNAME` file required for Vercel (that file is a GitHub Pages convention).

## Site config

After DNS + SSL are green:

```json
"site": {
  "live_url": "https://nerdcommand.com",
  "custom_domain": "nerdcommand.com",
  "custom_domain_wired": true
}
```

## Contact email

Keep operational email as configured (`hello@nerdcommand.info` or migrate to `@nerdcommand.com` when mailbox is ready). Domain for **web** is nerdcommand.com; email can follow later without blocking site cutover.

## Acceptance

- [ ] `https://nerdcommand.com` serves this repo’s `index.html`  
- [ ] `https://www.nerdcommand.com` redirects correctly  
- [ ] Certificate valid (no browser warning)  
- [ ] `site_config.json` updated  
- [ ] Superagent health check points at new live_url  

## Rollback

Point DNS back to previous host (or remove Vercel domain) and restore prior `live_url`. Git history remains on GitHub.
