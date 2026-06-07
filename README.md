# NerdCommand.info

Marketing site for **GangsterNerds LLC** — a single self-contained `index.html`
(HTML + CSS + vanilla JS, no build step) hosted on **GitHub Pages**.

**Live (after publish):** https://chapmancapital1.github.io/nerdcommand-site/

---

## Publish (one-time)

1. On github.com, create an **empty public** repo named **`nerdcommand-site`**
   (do **not** add a README, .gitignore, or license — keep it empty so the first push is clean).
2. From this folder, push:
   ```
   git push -u origin main
   ```
   The `origin` remote is already set to `https://github.com/chapmancapital1/nerdcommand-site.git`.
3. On github.com → repo **Settings → Pages**:
   - **Source:** Deploy from a branch
   - **Branch:** `main` · folder **`/ (root)`** → **Save**
4. Wait ~1 minute. The site is live at the URL above.

## Update the site

Every push to `main` auto-publishes in ~30s.

- **With Claude Code (easiest):** "Change the hero headline to …", "Add a $299 pricing tier", etc.
- **Manually:** edit `index.html`, then
  ```
  git add -A && git commit -m "your message" && git push
  ```
- **Helper:** `pwsh ./site_manager.ps1 push "your message"`

## Health monitoring (PowerShell — no Python)

```
pwsh ./site_manager.ps1 check     # one-shot: uptime, response time, title, contact link, sections, ssl
pwsh ./site_manager.ps1 monitor   # loop on the interval in site_config.json (default 30 min)
pwsh ./site_manager.ps1 log       # last 10 results
```

## Custom domain (nerdcommand.info)

Not wired yet — launching on the github.io URL first. To add it later, see
**CLAUDE.md → Adding the custom domain later** (one `CNAME` file + DNS records).

---
Maintained with Claude Code. See [`CLAUDE.md`](CLAUDE.md) for the full operating guide.
