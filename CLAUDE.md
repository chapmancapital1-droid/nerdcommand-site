# CLAUDE.md — NerdCommand.info Site

Single source of truth for maintaining the **NerdCommand.info** website with Claude Code.
Claude reads this automatically when the project opens.

## Identity
| Field | Value |
|---|---|
| Site | NerdCommand.info |
| Organization | GangsterNerds LLC |
| GitHub repo | https://github.com/chapmancapital1/nerdcommand-site |
| Owner | chapmancapital1 |
| Default branch | main |
| Live URL | https://chapmancapital1.github.io/nerdcommand-site/ |
| Custom domain | nerdcommand.info — **not wired yet** (see bottom) |
| Primary file | index.html (self-contained: HTML + CSS + vanilla JS, no build step) |
| Config | site_config.json |
| Monitor | site_manager.ps1 (PowerShell — this machine has no Python) |

## How this site deploys
GitHub Pages, **Deploy from a branch** (`main` / root). Every push to `main` auto-publishes
in ~30 seconds. No build, no npm, no Actions workflow, no PAT.

## Maintenance workflow (how Claude Code updates the site)
1. Edit `index.html`.
2. Verify locally (open in a browser / preview).
3. Commit + push:
   ```
   git add index.html
   git commit -m "describe the change"
   git push
   ```
4. Live in ~30s. Or use the helper: `pwsh ./site_manager.ps1 push "describe the change"`.

## What you can ask Claude to do
**Updates**
- "Update the pricing section to add a new tier at $299/month"
- "Change the hero headline to [new text]"
- "Add a new division card for [name]"
- "Update the CTA email to [new email]" (currently `hello@nerdcommand.info`)

**Deploy**
- "Push the site" → `git push` (or `pwsh ./site_manager.ps1 push "msg"`)
- "Show me what changed since last push" → `git diff HEAD~1`
- "Roll back to the previous version" → `git revert HEAD && git push`

**Monitor**
- "Run a site health check" → `pwsh ./site_manager.ps1 check`
- "Start the monitor, every 30 min" → `pwsh ./site_manager.ps1 monitor`
- "Show me the last monitor report" → `pwsh ./site_manager.ps1 log`

## File map
```
nerdcommand-site/
├── index.html         the live site (single file — edit this)
├── CLAUDE.md          this file (operating guide)
├── README.md          publish + maintain quickstart
├── site_config.json   identity + monitor settings
├── site_manager.ps1   PowerShell deploy/monitor helper (replaces the Python version)
├── .gitignore         ignores monitor_log.json + OS cruft
└── monitor_log.json   (generated) monitor history — gitignored, never published
```

## Section anchors (for targeted edits)
`hero` → `class="hero"` · `divisions` → `id="divisions"` · `agent` → `id="agent"` ·
`trading` → `id="trading"` · `pricing` → `id="pricing"` · `cta` → `id="cta"`

## Editing rules
- `index.html` is the approved design. Keep the **dark `#0a0a0a` + gold `#F5C518`** theme and the **Inter** font.
- Pure **HTML5 + CSS3 + vanilla JS** only — no frameworks, no build tools, no npm. The file must stay self-contained.
- The contact CTA is `mailto:hello@nerdcommand.info`. If the email changes, update **every** occurrence.
- After any layout change, sanity-check responsive behavior (the grids use CSS `auto-fit`; nav collapses under 768px).

## Adding the custom domain later (nerdcommand.info)
1. Create a file named `CNAME` in the repo root containing exactly one line:
   ```
   nerdcommand.info
   ```
2. At your domain registrar, set DNS:
   ```
   A      @    185.199.108.153
   A      @    185.199.109.153
   A      @    185.199.110.153
   A      @    185.199.111.153
   CNAME  www  chapmancapital1.github.io
   ```
3. GitHub → repo **Settings → Pages → Custom domain** → `nerdcommand.info` → **Enforce HTTPS**.
4. Update `live_url` in `site_config.json` to `https://nerdcommand.info`.

## Known minor item
The footer stylesheet has an invalid `flex-wrap:gap` declaration; it's overridden by an inline
`flex-wrap:wrap`, so it's harmless. Fix on request.
