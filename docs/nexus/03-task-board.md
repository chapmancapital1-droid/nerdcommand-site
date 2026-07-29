# NerdCommand OS — Task Board

**Updated:** 2026-07-28  
**Pipeline:** `NEXUS-Full | Phase 0 | Sprint 0–1`  

Status legend: `TODO` · `DOING` · `BLOCKED` · `REVIEW` · `DONE`

---

## Now (execute first)

| ID | Task | Status | Agent | Acceptance |
|----|------|--------|-------|------------|
| T-001 | Superagent project pack (this docs/nexus) | DONE | Superagent | Brief/plan/arch/board exist |
| T-002 | Deckbrief audit matrix (KEEP/EXTRACT/REFACTOR/REWRITE/RETIRE) | DONE | Superagent | `docs/nexus/04-evidence/deckbrief-audit.md` |
| T-003 | Inventory every route + table in deckbrief-api | DONE | Superagent | Covered in audit + README |
| T-004 | ADR-0001 Vercel static hosting | DONE | Superagent | `docs/adr/0001-static-site-hosting-vercel.md` |
| T-004b | ADR-0009 API/worker host Railway | DONE | Superagent | `docs/adr/0009-deckbrief-api-host-railway.md` |
| T-004c | ADR-0008 nerdcommand.com domain | DONE | Superagent | `docs/adr/0008-custom-domain-nerdcommand-com.md` |
| T-005 | ADR-0002 Auth | TODO | security-architect + backend | Decision recorded |
| T-006 | Product Registry v0 schema + sample JSON | DONE | Superagent | `product-registry.json` |
| T-007 | Public claim audit of index.html | TODO | design-brand-guardian | Diff list of overclaims |
| T-008 | AGENTS.md Superagent rails at repo root | DONE | Superagent | Side agents loadable |
| T-009 | Resolve open architecture questions with owner | DONE | Superagent | Vercel site + nerdcommand.com + Railway API |
| T-010-db | DeckBrief local build (docker, seed, harden, smoke) | DONE | Superagent | verify 28/28 + smoke ALL PASS |
| T-011-db | DeckBrief Railway production deploy | TODO | owner + devops | Secrets + domain + api-config.json |
| T-012-docs | Read + lock CIO / Build Plan / UX prototype zip | DONE | Superagent | `docs/nexus/06-source-documents-read.md` |
| T-013-ux | Promote UX prototype v0.1.0 into active site (Stage 1) | DONE | Superagent | `npm run check` PASS; evidence stage1-promote |
| T-014-reg | Single Product Registry (prototype JS + JSON) | DONE | Superagent | Both present; JS drives UI; JSON for agents |
| T-015-bind | Bind OS #revenue / #briefs to deckbrief-api | TODO | frontend+backend | Replace synthetic data where live |

---

## Next (Stage 0 → 1)

| ID | Task | Status | Agent | Depends |
|----|------|--------|-------|---------|
| T-010 | CODEOWNERS + PR template + branch protection checklist | TODO | devops | T-001 |
| T-011 | Security policy stub | TODO | security-architect | — |
| T-012 | Extract design tokens from prototype | TODO | design-ui-designer / Hallmark | — |
| T-013 | Vercel project wiring + first deploy | TODO | devops / owner | T-004; runbook `docs/nexus/vercel-dns-runbook.md` |
| T-013b | Registrar DNS → Vercel for nerdcommand.com | TODO | owner + devops | T-013; ADR-0008 |
| T-014 | Health + registry endpoints on API | TODO | backend | T-006 |
| T-015 | Command Center shell map vs 15 dashboards | TODO | design-ux-architect | — |

---

## Build queue (Stage 2–4)

| ID | Task | Status | Depends |
|----|------|--------|---------|
| T-020 | Org/workspace/user/membership schema | TODO | T-002, T-004 |
| T-021 | Auth middleware + sessions | TODO | T-005, T-020 |
| T-022 | AuditEvent helper | TODO | T-020 |
| T-023 | Feature flags | TODO | T-020 |
| T-024 | Tenant isolation tests | TODO | T-021 |
| T-030 | Command entity + state machine | TODO | T-021 |
| T-031 | Evidence + outbox | TODO | T-030 |
| T-032 | Approvals policy | TODO | T-030 |
| T-033 | My Commands + Overview UI bind | TODO | T-030 |
| T-040 | Command Audit form → lead + Command | TODO | T-030, T-033 |
| T-041 | Consent/attribution + rate limits | TODO | T-040 |
| T-042 | Wire homepage CTAs to API | TODO | T-040 |

---

## Later backlog

| ID | Task | Stage |
|----|------|-------|
| T-050 | Revenue objects (opportunity, proposal) | 5 |
| T-051 | Delivery projects | 5 |
| T-060 | Promote daily-brief into Command Brief Engine | 6 |
| T-070 | AI Gateway + local node MVP | 7 |
| T-080 | Foundry core | 8 |
| T-090 | Residential Cleaning vertical beta | 9 |
| T-100 | GA / SLOs / trust center | 10 |

---

## Blocked / needs human

| Item | Why |
|------|-----|
| API/worker host | Owner preference (ADR-0009) — site host locked to Vercel |
| Auth vendor | Owner preference (ADR-0002) |
| DNS cutover execution | Owner has domain; needs Vercel project + registrar record apply |
| Secrets (Postgres, Resend, Anthropic) | Never invent; owner provides env |

---

## Evidence checklist (per completed task)

For each DONE task, drop into `04-evidence/`:

- What changed (paths)  
- How verified (command + output summary)  
- Screenshots if UI  
- Residual risk  

---

## Side-agent brief template (copy per task)

```text
Repo: C:\Users\Michael Chapman\nerdcommand-site
Goal: <one sentence>
Stack: static HTML + Express deckbrief-api + Postgres
Do:
- ...
Don't:
- No Python; no cinema pipeline; no localhost AI from Vercel
- No secret commits; no main force-push
Acceptance:
- ...
Report: files changed + how to verify
```

---

**Next action after board load:** Execute **T-002** Deckbrief audit (read-only inventory) then **T-008** AGENTS.md.
