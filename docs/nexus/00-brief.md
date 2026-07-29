# NerdCommand Business OS — Superagent Brief

**Product:** NerdCommand Business Operating System  
**Company:** GangsterNerds LLC / NerdCommand  
**Repo:** https://github.com/chapmancapital1-droid/nerdcommand-site  
**Local path:** `C:\Users\Michael Chapman\nerdcommand-site`  
**Mode:** NEXUS-Full (greenfield OS on existing site + Deckbrief kernel)  
**Owner:** Michael Chapman  
**Orchestrator:** Superagent (Grok) + NEXUS Agency roster  

---

## One-sentence mission

Build **nerdcommand.com** as the company front door and **NerdCommand OS** as the control plane that runs NerdCommand itself (lead → customer → delivery → brief → AI), then productizes that model for customers.

---

## Three systems (do not collapse)

| Surface | Job | Primary audience |
|---------|-----|------------------|
| **nerdcommand.com** | Authority, education, sales front door | Business owners, agencies, buyers |
| **nerdcommand.ai** | Customer product (signup, usage) | Product users |
| **NerdCommand OS** (`command` / `os`) | Sales, delivery, finance visibility, Commands, AI gateway | Internal team; later portals |

Shared data only via controlled APIs and events.

---

## Strategic beachhead

Service businesses and agencies with inbound leads, tool sprawl, and slow follow-up — **not** “everyone including creators” on the homepage.

### Offer ladder (homepage priority order)

1. Command Audit  
2. Command Implementation  
3. Managed Command Operations  
4. Custom Software Build  
5. NerdCommand.ai (product-led entry)

---

## What already exists in this repo

| Asset | Status | Superagent action |
|-------|--------|-------------------|
| `index.html` + static pages | Live marketing / prototype shell | Stage 1 polish + Product Registry truth |
| `studio.html`, `ceo.html`, `deckbrief.html`, funnels | UX prototypes | Spec for production OS migration |
| `deckbrief-api/` Express + Postgres | Lead CRM, CEO, funnels, webhooks, AI brief | **BUILT local MVP** — KEEP → EXTRACT into OS; Railway prod next |
| `NerdCommand_CIO_Blueprint_v1.md` | Strategy | Source of truth for product definition |
| `NerdCommand_Updated_Architecture_and_Build_Plan_v1_1_0.md` | Topology + stages 0–10 | Build roadmap |
| UX prototype zip | v0.1.0-alpha | Reference IA / tokens |
| GitHub Pages deploy | Working fallback | Cut over to Vercel (ADR-0001) |
| Custom domain nerdcommand.com | **Owner owns DNS** — not wired yet | Vercel Domains + registrar (ADR-0008) |

---

## Architecture lock (v1.1.0)

```text
NerdCommand.com + Command Center (Vercel / static → Next.js later)
        |
        v
NerdCommand OS API + durable workers (NOT pure Vercel serverless only)
        |
        +-- Product Registry, Commands, permissions, audit, events
        +-- AI Gateway + signed job queue
                    |
                    v
             Local AI node (outbound poll)
                    +-- LM Studio / Ollama on user machine
```

**Hard rule:** Production must never call founder `localhost` from Vercel. Local models only via registered outbound node.

---

## Core domain object: Command

Intent · Owner · Context · State · Priority · Next action · Automation policy · Evidence · Outcome  

Agents propose; humans approve sensitive actions; system records everything.

---

## Success metrics (MVP of the OS)

1. NerdCommand can run **own** lead-to-brief loop in OS (not only static HTML).  
2. Product Registry is single source of public feature truth.  
3. Health surface + audit log for any automated action.  
4. One authenticated Command Center shell bound to real APIs (not mock-only).  
5. Deckbrief KEEP/EXTRACT classification complete before rewrite thrash.

---

## Non-goals (this super program phase)

- Full accounting ledger replacement  
- Opening local model ports to the public internet  
- Monolith that owns every business function  
- Shipping “run the whole company” claims without Product Registry truth  
- Cinema/ffmpeg pipeline work (separate skill family)

---

## Stack defaults (unless ADR changes them)

| Layer | Default |
|-------|---------|
| Public site now | Static HTML/CSS/JS (existing) |
| Production front later | Next.js monorepo (planned) |
| OS API now | Node Express (`deckbrief-api` seed) |
| DB | PostgreSQL |
| Email | Resend |
| AI (cloud) | Anthropic (existing) + gateway abstraction |
| AI (local) | LM Studio / Ollama via outbound node |
| Deploy site | **Vercel** from GitHub (static HTML, no build) — ACCEPTED |
| Production domain | **nerdcommand.com** (DNS owned; wire at cutover) |
| Deploy API | Separate durable host (Railway/Fly/Render/etc. — still open) |
| Agent ops | Superagent + Orca/Herdr + free-ai routing |

---

## Immediate Superagent Commands (ordered)

1. Complete Stage 0 Deckbrief audit (KEEP / EXTRACT / REFACTOR / REWRITE / RETIRE).  
2. Align public claims on `index.html` with Product Registry.  
3. Scaffold `docs/nexus` evidence + ADRs for auth, DB host, queue, telemetry.  
4. Implement OS API health + org/membership/permission contracts.  
5. Bind Command Center prototype routes to real APIs.  
6. AI Gateway stub + local node registration design (no fake localhost production).  
7. Execute Vercel import + nerdcommand.com DNS cutover (runbook ready).

---

## Handoff to pipeline

- **Plan:** `01-sprint-plan.md`  
- **Architecture:** `02-architecture.md`  
- **Tasks:** `03-task-board.md`  
- **Evidence:** `04-evidence/`  
- **Ship gate:** `05-reality-check.md` (fill before any production claim)

**Pipeline status seed:** `NEXUS-Full | Phase 0 Discovery → Stage 0 Governance | Ready to execute`
