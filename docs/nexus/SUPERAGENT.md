# Superagent entry — NerdCommand Business OS

## Clone

```powershell
# Already cloned to:
# C:\Users\Michael Chapman\nerdcommand-site
# origin: https://github.com/chapmancapital1-droid/nerdcommand-site.git
```

## Start a session

```text
1. Open repo root
2. Read AGENTS.md + docs/nexus/00-brief.md
3. Read docs/nexus/06-source-documents-read.md (CIO + Build Plan + UX prototype map)
4. If UX work: open docs/nexus/ux-prototype-extract/nerdcommand_ux_prototype_v0_1_0/
5. Check 03-task-board.md for next TODO
6. Run NEXUS-Full from current stage
7. Never ship without 05-reality-check.md evidence
```

## Slash intents

| Intent | Mode |
|--------|------|
| Build the OS / company OS | NEXUS-Full or NEXUS-Sprint Stages 0–4 |
| Small bug / one API | NEXUS-Micro |
| Full arsenal | /superagent-builder |

## Pipeline status (live)

```
NEXUS-Full | Stage 1 PROMOTED + DeckBrief local MVP
Last: UX prototype → site root (npm run check PASS)
Next: T-015 bind OS to deckbrief-api · Vercel deploy · Railway · DNS
```

## Decisions locked

| Item | Decision |
|------|----------|
| Static HTML host | **Vercel** ← GitHub repo (no build) |
| Domain | **nerdcommand.com** (owner owns DNS) |
| Runbook | `docs/nexus/vercel-dns-runbook.md` |
| ADRs | `docs/adr/0001-*.md`, `docs/adr/0008-*.md` |

## Still need from owner

1. **API/worker** host preference (Railway/Fly/Render/other) — not Vercel static  
2. Auth preference  
3. **When to cut DNS** (now vs after Vercel preview review)  
4. Env secrets for deckbrief-api  
5. Vercel account login to import the GitHub repo (or invite Superagent path if CLI token exists)

Until cutover, Superagent continues **audits, registry, schema, ADRs**; live DNS apply is owner + Vercel UI (or `vercel` CLI if installed/authenticated).
