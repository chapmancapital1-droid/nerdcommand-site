# NerdCommand UX Route Map

## Public website

| Route | Purpose | Backend dependency |
|---|---|---|
| `/` | Company thesis, products, Command loop, local AI, roadmap, trust | Product Registry |
| `/platform` | NerdCommand OS architecture and control model | Product Registry, release data |
| `/foundry` | Foundry pipeline, Business Genome, roadmap | Product Registry, Foundry catalog |
| `/deckbrief` | Deckbrief positioning and Command Brief Engine | Deckbrief registry and releases |
| `/pricing` | Source, cloud, implementation, and enterprise packaging | Pricing and entitlement service |
| `/app` | NerdCommand OS shell | Identity and OS APIs |

## OS views

| Hash route | View | Primary records |
|---|---|---|
| `#overview` | Executive Command Center | Commands, metrics, risks, approvals, health |
| `#commands` | My Commands | Commands, ownership, dependencies, evidence |
| `#briefs` | Command Briefs | Brief templates, snapshots, approvals, delivery |
| `#revenue` | Revenue Command | Contacts, companies, leads, opportunities, proposals |
| `#clients` | Client Command | Customers, onboarding, health, cases, renewals |
| `#delivery` | Delivery Command | Projects, milestones, capacity, evidence, risk |
| `#product` | Product Command | Roadmap, releases, defects, engineering metrics |
| `#marketing` | Marketing Command | Campaigns, content, attribution, conversion |
| `#finance` | Finance Command | Revenue, invoices, costs, budgets, collections |
| `#knowledge` | Knowledge Command | SOPs, policies, decisions, research, docs |
| `#automations` | Automation Command | Workflows, schedules, runs, failures, integrations |
| `#ai` | AI Command | Providers, nodes, models, agents, policies, runs |
| `#foundry` | Foundry Command | Genome, recipes, builds, verification, releases |
| `#governance` | Governance Command | Approvals, risks, policies, audit, incidents |
| `#settings` | Workspace settings | Organization, roles, environments, integrations |

## Required state design

Each production page must define:

- Loading.
- Empty.
- Partial data.
- Error.
- Offline integration.
- Permission denied.
- Approval required.
- Destructive action confirmation.
- Successful change.
- Audit link.
- Mobile and keyboard behavior.
