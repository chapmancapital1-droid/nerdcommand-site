# NerdCommand OS — Architecture Package

**Version:** Superagent scaffold 2026-07-28  
**Sources:** CIO Blueprint v1 · Architecture & Build Plan v1.1.0 · live `deckbrief-api`  

---

## 1. System context

```text
[Visitor] --> nerdcommand.com (public)
                 |  Command Audit / contact
                 v
            [Edge / API Gateway]
                 |
                 v
         [NerdCommand OS API] -----> [Postgres]
                 |                        |
                 |                        +-- audit, outbox
                 +--> [Workers] --> email, webhooks, briefs
                 |
                 +--> [AI Gateway] --> cloud providers
                 |                       |
                 |                       +--> [Local AI Node] --> LM Studio / Ollama
                 v
         [Command Center UI] (auth)
                 |
                 v
         [Integrations] Stripe/accounting/email/CRM (systems of record)
```

**Principle:** OS is control plane (Commands, ownership, status, approvals, cross-system reporting). It does not reimplement full accounting or email infrastructure.

---

## 2. Deployment topology

| Component | Host | Notes |
|-----------|------|-------|
| Public site + Command Center static | **Vercel** (GitHub import, no build) | GH Pages fallback until cutover; domain **nerdcommand.com** |
| OS API + workers | Durable Node host (ADR) | Not static-only |
| Postgres | Managed Postgres (ADR) | Migrations on deploy |
| Object storage | S3-compatible (ADR) | Evidence files |
| Queue | DB outbox first; Redis/SQS later if needed | Prefer simple until scale |
| Local AI node | Customer/founder machine | Outbound poll only |

### Network boundary (non-negotiable)

- Vercel/server code **must not** call user `localhost` for models.  
- Local node: register → heartbeat → claim signed jobs → return evidence hash.  
- Never expose LM Studio/Ollama ports to the public internet as the standard design.

---

## 3. Current codebase map (as-is)

```text
nerdcommand-site/
├── index.html, studio.html, ceo.html, deckbrief.html, funnel*.html  # public / prototype UI
├── deckbrief-api/          # seed OS backend
│   ├── server.js           # Express entry, CORS, /health
│   ├── db/                 # schema.sql, migrate, queries
│   ├── routes/             # leads, pipeline, ceo, admin, webhooks, funnels
│   ├── services/           # ai, brief, email
│   ├── jobs/               # daily-brief
│   └── tools/              # business-os-sheet
├── funnel/, social/        # growth surfaces
├── docs/nexus/             # Superagent program (this pack)
└── blueprints (*.md)       # strategy source
```

### Proposed target layout (incremental — do not big-bang rewrite)

```text
/
├── apps/
│   ├── web/                # Next.js later (migrate from static)
│   └── command-center/     # OS UI
├── services/
│   └── os-api/             # evolved from deckbrief-api
├── packages/
│   ├── product-registry/
│   ├── design-tokens/
│   └── contracts/          # shared types / OpenAPI
├── workers/
│   └── jobs/
├── local-ai-node/          # Stage 7
└── docs/
    ├── nexus/
    ├── adr/
    └── policies/
```

Migration rule: **extract and rename in place** from `deckbrief-api` until monorepo justified.

---

## 4. Product Registry (product truth)

Lifecycle:

`proposed → planned → internal-alpha → private-beta → public-beta → general-availability → deprecated → retired`

**Website may advertise only:** public-beta, general-availability, deprecated (with label).  
**Roadmap-only:** planned / proposed (clearly labeled).

Registry controls: visibility, beta labels, family status, version, edition/entitlements, docs links, deprecation.

---

## 5. Domain model (kernel)

### Identity & tenancy

- Organization  
- Workspace  
- User  
- Membership  
- Team  
- Role / Permission  
- Session  
- FeatureFlag  
- AuditEvent  

### Command core

- Command (intent, owner, context refs, state, priority, due, next_action, automation_policy)  
- CommandDependency  
- Evidence  
- Process / ProcessVersion  
- Policy / Approval  
- Notification  
- OutboxEvent  

### Revenue (Stage 5+)

- Lead / Contact / Opportunity  
- Audit (Command Audit engagement)  
- Proposal / Contract / Payment refs  
- Project / Milestone  

### Deckbrief (Stage 6 — evolve existing)

- MetricSource / Snapshot  
- BriefTemplate  
- BriefDraft / BriefPublished  
- Review / Approval  

### AI Gateway (Stage 7)

- Provider / Model  
- PromptVersion / Agent  
- NodeRegistration  
- Job / Budget / Eval / KillSwitch  

---

## 6. Command state machine

```text
proposed
  → awaiting_approval
  → active
  → blocked
  → completed | failed | canceled
```

Automation policy: `human_only | ai_assisted | approval_required | preauthorized`

---

## 7. API surface (v0 target)

| Area | Prefix | Seed today |
|------|--------|------------|
| Health | `GET /health` | exists |
| Leads | `/api/leads` | deckbrief-api |
| Pipeline | `/api/*` pipeline routes | deckbrief-api |
| CEO / brief | `/api/ceo` | deckbrief-api |
| Funnels | `/api/funnels` | deckbrief-api |
| Webhooks | `/api/webhooks` | deckbrief-api |
| Admin | `/api/admin` | deckbrief-api |
| **OS Commands** | `/api/os/commands` | **to build** |
| **OS Auth** | `/api/os/auth` | **to build** |
| **Registry** | `/api/os/registry` | **to build** |
| **AI jobs** | `/api/os/ai/*` | **Stage 7** |

Version header or `/api/v1/` when public clients ship.

---

## 8. UX Command Center (15 surfaces)

1. Executive Overview  
2. My Commands  
3. Command Briefs  
4. Revenue Command  
5. Client Command  
6. Delivery Command  
7. Product Command  
8. Marketing Command  
9. Finance Command  
10. Knowledge Command  
11. Automation Command  
12. AI Command  
13. Foundry Command  
14. Governance Command  
15. Workspace Settings  

Prototype CSS tokens and empty/loading/error/permission/approval states are **spec**, not throwaway.

---

## 9. Security baseline

- Tenant isolation on every query  
- AuthN before AuthZ; deny by default  
- Audit all mutations  
- Webhook HMAC (pattern already in server raw body)  
- Rate limits on public forms  
- AI: data class, tool scope, budget, approval before execution  
- Secrets only in env / secret manager — never in static HTML  

---

## 10. ADRs required (create under `docs/adr/`)

| ADR | Decision |
|-----|----------|
| 0001 | **ACCEPTED** — Static site on Vercel from GitHub |
| 0002 | Auth provider (custom session vs Clerk/Auth.js/etc.) |
| 0003 | Postgres host + backup |
| 0004 | Queue strategy (outbox-only vs Redis/SQS) |
| 0005 | File/evidence storage |
| 0006 | Telemetry (Sentry, etc.) |
| 0007 | Frontend migration timing (static → Next.js) |
| 0008 | **ACCEPTED** — nerdcommand.com custom domain (owner DNS) |
| 0009 | API + worker hosting platform (durable — not Vercel static) |

---

## 11. Superagent implementation rules

1. Pure PowerShell + Node for this machine’s automation (no Python requirement).  
2. Per-task briefs for Orca/side agents; Superagent integrates.  
3. Evidence for every gate under `docs/nexus/04-evidence/`.  
4. Reality Checker defaults to **NEEDS WORK**.  
5. Cinema skills off-limits unless user explicitly asks for film work.

---

## 12. Decisions locked (Sprint 0)

1. **Static HTML host:** Vercel ← GitHub (ADR-0001).  
2. **Domain:** nerdcommand.com owned; DNS ready to point at Vercel (ADR-0008).  

## 13. Open questions (remaining)

1. Is `deckbrief-api` production-deployed anywhere today?  
2. Preferred durable host for **API/workers** (Railway / Fly / Render / AWS)?  
3. Auth preference for first internal users?  
4. Priority vertical for Stage 9 (cleaning vs general local service)?  
5. When to cut DNS live (now vs after first Vercel preview review)?  

---

**Pipeline status:** Architecture package ready · ADRs pending · Stage 0 audit next
