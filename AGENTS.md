# AGENTS.md — NerdCommand Business OS

Instructions for Superagent, Orca, Claude, Codex, and any side agent working this repo.

## Product

**NerdCommand Business Operating System** for GangsterNerds LLC.  
Three surfaces: **nerdcommand.com** (sales), **nerdcommand.ai** (product), **NerdCommand OS** (control plane).  
First customer: **NerdCommand itself**.

## Program pack (read first)

| File | Purpose |
|------|---------|
| `docs/nexus/00-brief.md` | Mission, scope, non-goals |
| `docs/nexus/01-sprint-plan.md` | Stages and sprints |
| `docs/nexus/02-architecture.md` | Topology and domain |
| `docs/nexus/03-task-board.md` | Task IDs and status |
| `docs/nexus/04-evidence/` | Gate proof only |
| `docs/nexus/05-reality-check.md` | Ship gate |

Strategy sources (do not contradict without ADR) — **read before coding**:

| Priority | Document |
|----------|----------|
| 1 | `NerdCommand_CIO_Blueprint_v1.md` (full — strategy, Command, gates, website, AI governance) |
| 2 | `NerdCommand_Updated_Architecture_and_Build_Plan_v1_1_0.md` (+ `.txt` same content) |
| 3 | `NerdCommand_UX_Prototype_v0_1_0.zip` / extract `docs/nexus/ux-prototype-extract/nerdcommand_ux_prototype_v0_1_0/` |
| 4 | Prototype docs: `UX_ROUTE_MAP.md`, `AI_RUNTIME_INTEGRATION.md`, `VERCEL_DEPLOYMENT.md` |
| 5 | Prototype registry: `assets/js/product-registry.js` → root `product-registry.json` |
| 6 | Alignment map: `docs/nexus/06-source-documents-read.md` |

**Deckbrief vision (docs):** Collect → Snapshot → Draft → Verify → Approve → Publish → Command — not only lead CRM.  
**Current MVP:** `deckbrief-api` sales-ops CRM + morning brief (KEEP/EXTRACT into Stage 6 engine).

## Repo layout

- Public/prototype UI: root `*.html` (static, no build step for current site)
- Seed API: `deckbrief-api/` (Express + Postgres + Resend + Anthropic)
- Do not invent secrets; use `.env` from `.env.example` patterns only

## Hard rails

1. **No Python** requirement for automation on owner machine — PowerShell + Node.  
2. **No Vercel → localhost AI.** Local models only via outbound registered node (Stage 7).  
3. **Product Registry** is public claim truth.  
4. **Evidence required** for every gate under `docs/nexus/04-evidence/`.  
5. **No force-push to main.** Prefer PRs when protection is on.  
6. **Cinema/ffmpeg skills are out of scope** unless user asks for film work.  
7. Max **3** Dev↔QA retries, then escalate with options.  
8. Reality Checker defaults to **NEEDS WORK**.

## Stack

- Site: HTML/CSS/vanilla JS → Next.js later  
- **Site host: Vercel** importing this GitHub repo (static, no build)  
- **Domain: nerdcommand.com** (owner DNS; see `docs/adr/0008` + `docs/nexus/vercel-dns-runbook.md`)  
- API: Node Express (`deckbrief-api`) on a **separate durable host** (not decided)  
- DB: PostgreSQL  
- Email: Resend  
- AI: Anthropic cloud; LM Studio/Ollama local via gateway later  

## Theme (public site)

Dark `#0a0a0a` + gold `#F5C518`, Inter font — preserve unless brand ADR.

## How to work a task

1. Pick task ID from `docs/nexus/03-task-board.md`  
2. Read architecture section that applies  
3. Implement minimal change  
4. Verify (migrate/verify scripts, curl health, etc.)  
5. Write evidence file  
6. Update task status to DONE or REVIEW  
7. Return a Handoff block:

```markdown
## Handoff
- From: <agent>
- To: <next>
- Phase: <0-6>
- Summary: ...
- Artifacts: ...
- Acceptance criteria: ...
- Evidence so far: ...
- Blockers: ...
- Recommended next action: ...
```

## Superagent orchestration

- Plan stays in Superagent  
- Heavy multi-file → Orca worktree agents  
- Monitor → Herdr  
- UI quality → Hallmark  
- Diagrams → Archify  
- Free drafts → Ollama / free-ai  

## Owner

Michael Chapman — filmmaker & founder; full-auto software build unless destructive git/shared ops need care.
