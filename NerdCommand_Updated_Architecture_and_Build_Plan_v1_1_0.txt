# NerdCommand Updated Architecture and Build Plan

Version: 1.1.0  
Prototype release: 0.1.0-alpha.1  
Scope: Vercel public frontend, NerdCommand OS UX, local AI runtime boundary, and staged backend implementation.

## Decision summary

The existing plan remains strategically valid. The main technical correction is the local-AI network boundary.

A Vercel deployment cannot use `localhost` to reach LM Studio or Ollama running on a founder's or customer's computer. `localhost` inside a Vercel function refers to that function's own runtime, not the remote user's machine. Production therefore requires a NerdCommand OS AI Gateway and a local node that initiates outbound authenticated communication.

The approved structure is:

```text
NerdCommand.com and Command Center on Vercel
    |
    v
NerdCommand OS API and durable workflow services
    |
    +-- Product Registry, Commands, permissions, audit, events
    |
    +-- AI Gateway and signed job queue
              |
              v
       Outbound local AI node
              |
              +-- LM Studio at 127.0.0.1:1234/v1
              +-- Ollama at 127.0.0.1:11434/v1
```

## Frontend decision

This prototype is dependency-light static HTML, CSS, and JavaScript so the team can review the complete experience immediately and deploy it to Vercel without waiting for backend framework decisions.

The production frontend may be migrated into the planned Next.js monorepo. The route map, Product Registry, UX components, statuses, and control language in this prototype are the specification for that migration.

## Product lock

The Product Registry is shared product truth. It controls:

- Public feature visibility.
- Beta and availability labels.
- Product family status.
- Version display.
- Edition and entitlement mapping.
- Documentation and release links.
- Deprecation and retirement behavior.

A feature follows this lifecycle:

```text
proposed
-> planned
-> internal-alpha
-> private-beta
-> public-beta
-> general-availability
-> deprecated
-> retired
```

The website may advertise only public beta, generally available, or deprecated features. Planned items belong only on a clearly labeled roadmap.

## Deployment topology

### Vercel

Host:

- NerdCommand.com.
- The Command Center frontend.
- Documentation and release center.
- Light server functions that proxy authenticated requests to NerdCommand OS.

### Separate durable backend

Host outside the static frontend:

- PostgreSQL and migrations.
- Identity and organization controls.
- Command engine.
- Durable workflow workers.
- Event outbox and consumers.
- AI job queue.
- Integration workers.
- Audit and telemetry storage.
- Backup and recovery services.

### Local AI node

Run beside LM Studio or Ollama. It must:

1. Authenticate as a registered node.
2. Send heartbeat and model inventory.
3. Claim only jobs permitted for its organization and node policy.
4. Verify the job signature, model allowlist, data class, tool scope, budget, and approval state.
5. Call the local provider.
6. Return output, timing, usage, model identity, prompt version, and evidence hash.
7. Never open the local model port to the public internet as the standard production design.

## UX dashboard coverage

The prototype includes:

1. Executive Overview.
2. My Commands.
3. Command Briefs.
4. Revenue Command.
5. Client Command.
6. Delivery Command.
7. Product Command.
8. Marketing Command.
9. Finance Command.
10. Knowledge Command.
11. Automation Command.
12. AI Command.
13. Foundry Command.
14. Governance Command.
15. Workspace Settings.

## Stage review

### Stage 0: Governance and Deckbrief audit

Required before Deckbrief code migration or autonomous AI.

Deliverables:

- GitHub rules, CODEOWNERS, pull-request and RFC process.
- Architecture decisions.
- Security and open-source policy.
- Complete Deckbrief repository audit.
- KEEP, EXTRACT, REFACTOR, REWRITE, or RETIRE classification.

### Stage 1: Public experience and product truth

This prototype begins Stage 1.

Deliverables:

- Public site.
- OS dashboard UX shell.
- Product Registry.
- Vercel deployment.
- Preview and production environments.
- Telemetry and error monitoring.
- Documentation and release center.

### Stage 2: Company kernel

Deliverables:

- Organizations, workspaces, users, memberships, teams, roles, permissions, sessions, audit, feature flags, file contracts, and tenant tests.

### Stage 3: Command core

Deliverables:

- Commands, dependencies, evidence, processes, process versions, policies, approvals, recurring Commands, notifications, and transactional domain events.

### Stage 4: Website operating integration

Deliverables:

- Command Audit and Architect forms.
- Contact and company matching.
- Consent and attribution.
- Lead qualification.
- Commands and notifications.
- Failure and abuse controls.

### Stage 5: Revenue and delivery

Deliverables:

- Opportunities, audits, Blueprints, proposals, approval, contracts, payments, customer workspaces, onboarding, projects, support, health, and renewal.

### Stage 6: Deckbrief and Command Brief Engine

Deliverables:

- Configurable metrics, source snapshots, templates, AI drafts, evidence, human review, approval, multi-format publishing, history, and follow-up Commands.

### Stage 7: AI Gateway

Deliverables:

- Providers, models, prompts, agents, data and tool permissions, approvals, evaluations, budgets, activity history, kill switches, and local node registration.

### Stage 8: Foundry core

Deliverables:

- Business Genome, capability graph, module manifests, recipes, compatibility, repository derivation, verification, SBOM, provenance, licenses, source packages, and updates.

### Stage 9: First vertical beta

Deliverables:

- Local Service Company OS core and Residential Cleaning Company OS overlay.

### Stage 10: General availability

Deliverables:

- Production licenses, provisioning, source delivery, updates, support, SLOs, incidents, recovery, trust center, and paid customer proof.

## Code transition plan

The static prototype should be used as a UX and information-architecture source. Production migration should preserve:

- CSS tokens and spacing decisions.
- Page hierarchy.
- Navigation grouping.
- Product Registry schema and visibility rules.
- Command language.
- AI provider and node status surfaces.
- Empty, loading, error, permission-denied, and approval states.

The production Next.js version should replace string templates with accessible React components and bind each view to typed NerdCommand OS APIs.

## Immediate team Commands

1. Deploy this prototype to a Vercel Preview project.
2. Review all public claims against the Product Registry.
3. Review dashboard route ownership with each business owner.
4. Complete the Deckbrief audit.
5. Decide authentication, database, API hosting, worker, queue, storage, and telemetry through ADRs.
6. Convert the visual tokens into the production design-system package.
7. Implement the Organization, Membership, Permission, AuditEvent, Command, and OutboxEvent contracts.
8. Implement a real OS API health surface.
9. Implement the Vercel-to-OS gateway boundary.
10. Implement local AI node registration and outbound job polling before enabling non-mock AI in production.
