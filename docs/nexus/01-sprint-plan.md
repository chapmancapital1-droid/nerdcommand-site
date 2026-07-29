# NerdCommand OS — Sprint Plan

**Program:** Superagent build of NerdCommand Business OS  
**Roadmap source:** Architecture Plan v1.1.0 Stages 0–10  
**Default cadence:** Stage-gated; max 3 Dev↔QA retries per task  

---

## Program phases (map to NEXUS)

| NEXUS | Stage | Name | Outcome |
|-------|-------|------|---------|
| Phase 0 | 0 | Governance + Deckbrief audit | Rules, ADRs, KEEP/EXTRACT matrix |
| Phase 1 | 1 | Public experience + product truth | Site + registry + Command Center shell deployable |
| Phase 2 | 2 | Company kernel | Orgs, users, roles, audit, flags |
| Phase 3 | 3–4 | Command core + website integration | Commands, leads, forms, notifications |
| Phase 3 | 5–6 | Revenue + Deckbrief engine | Pipeline, briefs, evidence, publish |
| Phase 4 | 7 | AI Gateway | Providers, budgets, local node |
| Phase 4 | 8–9 | Foundry + first vertical beta | Genome, cleaning/local service overlay |
| Phase 5–6 | 10 | GA | SLOs, trust center, paid proof |

**First executable program block:** Stages **0 → 1 → 2 → 3** (kernel + command core). Later stages are backlog, not dropped.

---

## Sprint 0 — Bootstrap (this pack)

**Goal:** Superagent can run without ambiguity.

- [x] Clone repo  
- [x] Write brief / plan / architecture / task board  
- [ ] Deckbrief code audit matrix  
- [x] ADR-0001: Static site on Vercel (from GitHub)  
- [x] ADR-0008: nerdcommand.com DNS owned / cutover plan  
- [ ] ADR-0009: API + worker durable hosting  
- [ ] ADR-0002: Auth provider  
- [ ] ADR-0003: Queue/worker host  
- [ ] Confirm Product Registry schema file location  

**Exit:** All Stage 0 blockers listed with owners; no autonomous AI writes to production.

---

## Sprint 1 — Stage 0 Governance (1–2 weeks effort)

| ID | Deliverable | Owner agent | Acceptance |
|----|-------------|-------------|------------|
| S0-1 | GitHub branch protection + PR template + CODEOWNERS | engineering-devops-automator | PRs required on `main` |
| S0-2 | Security + open-source policy stub | security-architect | `docs/policies/` |
| S0-3 | Deckbrief audit matrix | engineering-software-architect | Every module classified |
| S0-4 | ADR set (auth, db, host, queue, storage, telemetry) | engineering-backend-architect | 6 ADRs merged |
| S0-5 | Superagent rails in repo `AGENTS.md` | agents-orchestrator | Side agents can load brief |

**Gate:** No Stage 2 coding that duplicates Deckbrief without EXTRACT plan.

---

## Sprint 2 — Stage 1 Public + OS shell

| ID | Deliverable | Owner agent | Acceptance |
|----|-------------|-------------|------------|
| S1-1 | Product Registry JSON/schema (lifecycle states) | product-manager + eng | Single source; site reads it or mirrors |
| S1-2 | Public claim audit vs registry | design-brand-guardian | No GA claims for planned-only |
| S1-3 | Command Center route map locked (15 dashboards) | design-ux-architect | Matches architecture doc |
| S1-4 | Vercel project from GitHub + nerdcommand.com DNS | engineering-devops-automator + owner | `*.vercel.app` + `https://nerdcommand.com` green |
| S1-5 | Telemetry/error monitoring stub | engineering-devops-automator | Client + API health visible |
| S1-6 | Design tokens package extract from prototype | design-ui-designer + Hallmark | Tokens documented |

**Gate:** Deployed shell; registry governs marketing copy.

---

## Sprint 3 — Stage 2 Company kernel

| ID | Deliverable | Owner agent | Acceptance |
|----|-------------|-------------|------------|
| S2-1 | Postgres schema: org, workspace, user, membership, role, permission | engineering-backend-architect | migrate + verify scripts green |
| S2-2 | Session/auth middleware | engineering-backend-architect | Unauthorized → 401 |
| S2-3 | Audit event table + write helper | engineering-backend-architect | Every mutating API logs |
| S2-4 | Feature flags | engineering-backend-architect | Flag gates OS routes |
| S2-5 | Tenant isolation tests | testing-api-tester | Cross-tenant access fails |

**Gate:** Multi-tenant kernel tests pass; Deckbrief extracted pieces mount under `/api/os/*` or versioned path.

---

## Sprint 4 — Stage 3 Command core

| ID | Deliverable | Owner agent | Acceptance |
|----|-------------|-------------|------------|
| S3-1 | Command entity CRUD + state machine | engineering-backend-architect | States enforced |
| S3-2 | Evidence attachments + hash | engineering-backend-architect | Evidence linked to Command |
| S3-3 | Approval policy (human / AI-assisted) | engineering-backend-architect | Sensitive states need approval |
| S3-4 | OutboxEvent transactional pattern | engineering-backend-architect | Events dual-write with domain |
| S3-5 | Command Center UI binds to API (My Commands + Overview) | engineering-frontend-developer | Real data, empty/error states |
| S3-6 | API test suite | testing-api-tester | Evidence in `04-evidence/` |

**Gate:** NerdCommand internal user can create and complete a Command end-to-end.

---

## Sprint 5 — Stage 4 Website operating integration

| ID | Deliverable | Owner agent | Acceptance |
|----|-------------|-------------|------------|
| S4-1 | Command Audit form → lead + Command | engineering-backend-architect | Creates pipeline record |
| S4-2 | Consent + attribution fields | engineering-backend-architect | Stored on lead |
| S4-3 | Abuse/rate limits | security-architect | Limits enforced |
| S4-4 | Wire `index.html` / funnel CTAs to API | engineering-frontend-developer | Live capture works |
| S4-5 | Notification stub (email) | engineering-backend-architect | Resend path proven |

**Gate:** Website lead becomes a Command in OS with owner and next action.

---

## Backlog (scheduled after Sprint 5)

- Stage 5 Revenue & delivery  
- Stage 6 Deckbrief / Command Brief Engine (promote existing daily-brief jobs)  
- Stage 7 AI Gateway + local node  
- Stage 8 Foundry  
- Stage 9 Vertical beta (Local Service / Residential Cleaning)  
- Stage 10 GA  

---

## Parallel tracks (Superagent routing)

| Track | Tools |
|-------|--------|
| UI polish / anti-slop | Hallmark skill |
| Architecture diagrams | Archify skill |
| Heavy multi-file impl | Orca worktrees + Claude/Codex |
| Cheap drafts/tests | free-ai / Ollama |
| Monitor side agents | Herdr |
| OS/files outside repo | Desktop Commander |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Static prototype vs production dual-write | Registry + tokens as single truth; migrate UI not claims |
| Deckbrief rewrite thrash | Stage 0 matrix mandatory |
| Vercel ↔ localhost AI mistake | Gateway + outbound node only |
| Scope explosion (“whole company”) | Beachhead + offer ladder; systems of record stay external |

---

## Definition of Done (program block Stages 0–4)

- [ ] Governance docs merged  
- [ ] Deckbrief classified and extracted modules listed  
- [ ] Product Registry live  
- [ ] Kernel + Commands API tested  
- [ ] Website → OS lead path works  
- [ ] Reality Checker evidence folder filled  
- [ ] No production AI without gateway policy  

**Pipeline status:** `NEXUS-Full | Sprint 0 Bootstrap | Next: S0-3 Deckbrief audit`
