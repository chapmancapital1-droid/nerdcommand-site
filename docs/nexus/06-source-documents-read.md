# Source documents — read & locked for Superagent

**Read date:** 2026-07-28  
**Rule:** Superagent must not contradict these without a new ADR.  

---

## Documents ingested (repo root + UX prototype zip)

| Document | Path | Role |
|----------|------|------|
| **CIO Blueprint v1** | `NerdCommand_CIO_Blueprint_v1.md` | Strategy, 3 systems, Command object, first workflow, data model, gates, website IA, AI governance |
| **Architecture & Build Plan v1.1.0** | `NerdCommand_Updated_Architecture_and_Build_Plan_v1_1_0.md` | Stages 0–10, Vercel vs durable backend, local AI boundary, 15 OS views |
| **Same plan (txt)** | `NerdCommand_Updated_Architecture_and_Build_Plan_v1_1_0.txt` | Identical content to the `.md` |
| **UX Prototype v0.1.0** | `NerdCommand_UX_Prototype_v0_1_0.zip` | **Stage 1 reference implementation** — public site, OS shell, Product Registry JS, local AI node, Vercel config |
| **Extracted prototype** | `docs/nexus/ux-prototype-extract/nerdcommand_ux_prototype_v0_1_0/` | Unpacked for Superagent use |
| Prototype docs | `…/docs/UX_ROUTE_MAP.md`, `AI_RUNTIME_INTEGRATION.md`, `VERCEL_DEPLOYMENT.md`, `UPDATED_ARCHITECTURE_AND_BUILD_PLAN.md` | Route map + AI + deploy |
| Prototype registry | `…/assets/js/product-registry.js` | Official lifecycle + families + public claim rules |
| Site CLAUDE/README | `CLAUDE.md`, `README.md` | Legacy GitHub Pages ops (superseded for host by ADR-0001 Vercel) |
| DeckBrief API runbook | `deckbrief-api/DEPLOY.md` | Railway backend deploy |

---

## Strategic locks (from CIO Blueprint)

### Three systems (never collapse)

1. **nerdcommand.com** — company + sales front door → Command Audit  
2. **nerdcommand.ai** — customer product  
3. **NerdCommand OS** — control plane (dogfood first)

### Beachhead

Service businesses + agencies with inbound leads and tool sprawl — **not** creator-first on `.com`.

### Offer ladder

1. Command Audit → 2. Implementation → 3. Managed ops → 4. Custom build → 5. NerdCommand.ai

### Core object: Command

Intent · Owner · Context · State · Priority · Next action · Automation policy · Evidence · Outcome  

Agents **propose**; humans approve sensitive actions.

### First E2E workflow (CIO §8)

```text
Command Audit request on .com
  → contact/org match + consent + source
  → AI qualify (recommend)
  → human next action
  → audit → Command Map + proposal (human approve)
  → signed engagement → client workspace + project + billing
  → delivery template → launch monitoring/support/renewal Commands
  → executive reporting
```

### Architecture shape

**Modular monolith** + API boundary + **outbox/events**. Not microservices first. Not unrestricted agents. Not custom accounting ledger.

### Deckbrief adaptation (CIO §13)

Do **not** rewrite blindly. Gates: bootability → inventory → quality/risk → KEEP/EXTRACT/REWRITE/RETIRE → migration design → then visual rename.

### Release gates (CIO §18)

| Gate | Meaning | Our status |
|------|---------|------------|
| 0 Company architecture | Brand, beachhead, offer, AI rules | **Mostly locked** in nexus pack |
| 1 Deckbrief assessment | Runs, model, risks, reuse class | **Local PASS** (verify+smoke); audit written |
| 2 OS foundation internal | Auth, tenancy, Command, overview, lead form | **Partial** — DeckBrief CRM, not full Command/RBAC |
| 3 Lead-to-customer | Full revenue loop | Not started |
| 4 Website connected | Brand + forms + proof + a11y | Partial (static + form wiring) |
| 5–6 | Packages / customer OS | Future |

---

## Architecture locks (Build Plan v1.1.0)

### Topology

```text
nerdcommand.com + Command Center  →  Vercel
NerdCommand OS API + workers      →  durable host (Railway for DeckBrief API)
AI Gateway + signed jobs          →  Stage 7
Local AI node (outbound poll)     →  LM Studio / Ollama — never public model ports
```

### Product Registry lifecycle

`proposed → planned → internal-alpha → private-beta → public-beta → general-availability → deprecated → retired`

**Public site may advertise only:** public-beta, general-availability, deprecated.

### 15 OS dashboard views (UX spec)

Overview · My Commands · Command Briefs · Revenue · Client · Delivery · Product · Marketing · Finance · Knowledge · Automation · AI · Foundry · Governance · Settings  

**Source of truth for routes:** prototype `docs/UX_ROUTE_MAP.md` + `app/` + `assets/js/os-app.js`.

### Stages 0–10 (program backbone)

| Stage | Name | Superagent status |
|-------|------|-------------------|
| 0 | Governance + Deckbrief audit | Audit done; CODEOWNERS/PR still open |
| 1 | Public + product truth | Prototype zip **is** Stage 1 UX; root site is older marketing HTML |
| 2 | Company kernel | Partial via DeckBrief accounts |
| 3 | Command core | Not built (planned in registry) |
| 4 | Website integration | Lead form → DeckBrief API (local) |
| 5 | Revenue + delivery | Not built |
| 6 | Deckbrief / Command Brief Engine | **MVP CRM+brief path built**; full engine = templates/snapshots/approval/publish |
| 7 | AI Gateway | Prototype connector only; production outbound node later |
| 8 | Foundry | Planned |
| 9 | Vertical beta (cleaning) | Planned |
| 10 | GA | Future |

---

## UX Prototype v0.1.0 — what it contains (must use)

Extracted under `docs/nexus/ux-prototype-extract/nerdcommand_ux_prototype_v0_1_0/`:

| Piece | Purpose |
|-------|---------|
| `index.html`, `platform.html`, `foundry.html`, `deckbrief.html`, `pricing.html` | Public site IA |
| `app/index.html` + `assets/js/os-*.js` | Full OS shell (15 views, synthetic data) |
| `assets/css/nerdcommand.css` | Design system / tokens |
| `assets/js/product-registry.js` | **Official** registry implementation |
| `api/ai/*` | Vercel AI health/chat (mock/gateway modes) |
| `connector/local-ai-node.mjs` | Local LM Studio/Ollama bridge |
| `connector/outbound-worker.mjs` | Production outbound job claimer (Stage 7) |
| `vercel.json` | Static + function deploy |
| `.github/CODEOWNERS`, PR template, CI | Stage 0 governance starters |

**Prototype rule:** dashboards are UX specs with synthetic data — not backend claims.

### Deckbrief product meaning (prototype + Stage 6)

Not only “lead CRM.” Full vision:

```text
Collect metrics → Snapshot → Draft → Verify evidence → Human approve → Publish → Follow-up Commands
```

Templates: Executive · Investor/board · Customer · Operating  

Current `deckbrief-api` implements the **sales-ops brief** slice (leads + morning brief). That is **KEEP/EXTRACT** into the Command Brief Engine, not the whole engine yet.

---

## Alignment: what we built vs documents

| Doc requirement | Status |
|-----------------|--------|
| Vercel for public HTML | ADR-0001 accepted |
| Durable API separate from Vercel | ADR-0009 Railway |
| nerdcommand.com owned | ADR-0008 |
| No Vercel → localhost AI | Locked in AGENTS + architecture |
| Product Registry | Root `product-registry.json` + prototype JS (merge needed) |
| Deckbrief bootable + tests | Local PASS |
| Deckbrief KEEP/EXTRACT audit | Written |
| 15-view OS shell | **In zip only** — not yet promoted to site root |
| Full Command entity | Not built |
| Command Audit form → OS | Partial (DeckBrief lead) |
| Local AI node code | In zip `connector/` |
| Website hero/offer ladder from CIO | Root `index.html` may still over-weight older marketing — **claim audit pending** |

---

## Superagent build order (document-driven, next)

1. **Promote UX prototype into active site root** (or `apps/web`) without losing DeckBrief API wiring.  
2. **Unify Product Registry** — single source from prototype `product-registry.js` (+ JSON export).  
3. **Map DeckBrief API** into OS Revenue + Briefs views (replace synthetic data where real).  
4. **Stage 2 kernel** — User/Membership/Role beyond account keys.  
5. **Stage 3 Command** object + approval + audit.  
6. **Stage 6** expand brief engine (snapshots, templates, approve, publish).  
7. **Stage 7** wire outbound local node to real gateway jobs.

---

## Non-negotiables (from docs)

1. First customer = NerdCommand itself.  
2. Lead-to-customer before every department module.  
3. Human approval for external comms, money, access, deploy, delete.  
4. Tenant isolation.  
5. Evidence + audit for automated actions.  
6. Systems of record stay specialized; OS is control plane.  
7. No manufactured logos/metrics/testimonials.  
8. No force of production secrets into the repo.

---

**Confirmation:** CIO Blueprint (full), Architecture Plan md+txt, UX Prototype zip (README, route map, registry, AI docs, site/OS structure) have been read and are now Superagent source of truth for the NerdCommand Business OS program.
