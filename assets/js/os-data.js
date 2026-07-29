export const NAV_GROUPS = Object.freeze([
  {
    label: "Command",
    items: [
      { id: "overview", icon: "◈", label: "Overview" },
      { id: "commands", icon: "⌁", label: "My Commands" },
      { id: "briefs", icon: "▤", label: "Command Briefs" },
    ],
  },
  {
    label: "Operate",
    items: [
      { id: "revenue", icon: "↗", label: "Revenue" },
      { id: "clients", icon: "◎", label: "Clients" },
      { id: "delivery", icon: "◇", label: "Delivery" },
      { id: "product", icon: "⬡", label: "Product" },
      { id: "marketing", icon: "⌁", label: "Marketing" },
      { id: "finance", icon: "$", label: "Finance" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { id: "knowledge", icon: "▦", label: "Knowledge" },
      { id: "automations", icon: "⚙", label: "Automations" },
      { id: "ai", icon: "AI", label: "AI Command" },
      { id: "foundry", icon: "F", label: "Foundry" },
    ],
  },
  {
    label: "Control",
    items: [
      { id: "governance", icon: "✓", label: "Governance" },
      { id: "settings", icon: "⋯", label: "Settings" },
    ],
  },
]);

export const PAGE_META = Object.freeze({
  overview: {
    eyebrow: "Executive command",
    title: "Company overview",
    description: "What needs attention, what creates value, and what changed across NerdCommand.",
  },
  commands: {
    eyebrow: "Execution",
    title: "My Commands",
    description: "Owned outcomes, approval gates, blockers, evidence, and next actions.",
  },
  briefs: {
    eyebrow: "Deckbrief engine",
    title: "Command Briefs",
    description: "Versioned executive, board, investor, customer, and operating briefings.",
  },
  revenue: {
    eyebrow: "Lead to revenue",
    title: "Revenue Command",
    description: "Attribution, opportunities, proposals, commitments, and predictable next actions.",
  },
  clients: {
    eyebrow: "Customer lifecycle",
    title: "Client Command",
    description: "Customer health, onboarding, support, outcomes, renewals, and expansion.",
  },
  delivery: {
    eyebrow: "Execution health",
    title: "Delivery Command",
    description: "Projects, milestones, capacity, risk, evidence, and customer-visible progress.",
  },
  product: {
    eyebrow: "Idea to release",
    title: "Product Command",
    description: "Roadmap, releases, reliability, defects, feedback, and engineering performance.",
  },
  marketing: {
    eyebrow: "Market to lead",
    title: "Marketing Command",
    description: "Campaigns, content, attribution, conversion, and the next growth experiments.",
  },
  finance: {
    eyebrow: "Cash and control",
    title: "Finance Command",
    description: "Revenue, collections, costs, forecasts, budgets, and policy exceptions.",
  },
  knowledge: {
    eyebrow: "Company memory",
    title: "Knowledge Command",
    description: "SOPs, policies, decisions, research, technical documentation, and lessons learned.",
  },
  automations: {
    eyebrow: "Workflow runtime",
    title: "Automation Command",
    description: "Workflow runs, schedules, failures, integrations, service levels, and recovery.",
  },
  ai: {
    eyebrow: "Governed intelligence",
    title: "AI Command",
    description: "Local models, providers, agents, policies, approvals, evaluations, and usage.",
  },
  foundry: {
    eyebrow: "Software manufacturing",
    title: "Foundry Command",
    description: "Business Genome modules, product recipes, builds, verification, and releases.",
  },
  governance: {
    eyebrow: "Authority and evidence",
    title: "Governance Command",
    description: "Approvals, policies, risks, audit records, incidents, and decision rights.",
  },
  settings: {
    eyebrow: "Administration",
    title: "Workspace settings",
    description: "Organization, team, roles, integrations, environments, notifications, and data.",
  },
});

export const KPI = Object.freeze({
  overview: [
    ["Active Commands", "42", "+8 this week", "◈"],
    ["Qualified pipeline", "$185K", "+14.2%", "↗"],
    ["Projects at risk", "3", "2 need approval", "!", "down"],
    ["AI nodes", "2 / 2", "Prototype healthy", "AI"],
  ],
  commands: [
    ["Owned by you", "12", "4 due today", "⌁"],
    ["Awaiting approval", "5", "Oldest 19h", "✓"],
    ["Blocked", "3", "1 critical", "!", "down"],
    ["Completed this week", "27", "+18%", "◈"],
  ],
  briefs: [
    ["Briefs this month", "8", "+2", "▤"],
    ["Metric coverage", "91%", "+6%", "◎"],
    ["Awaiting review", "3", "Oldest 1d", "✓"],
    ["Follow-up Commands", "14", "9 complete", "⌁"],
  ],
  revenue: [
    ["Qualified pipeline", "$185K", "+14.2%", "↗"],
    ["Weighted forecast", "$72K", "Next 90 days", "$"],
    ["Proposal win rate", "38%", "+5.4%", "✓"],
    ["Lead response", "18m", "-22%", "⌁"],
  ],
  clients: [
    ["Active clients", "18", "+3 quarter", "◎"],
    ["Healthy accounts", "14", "78%", "✓"],
    ["At risk", "3", "2 need action", "!", "down"],
    ["Renewal value", "$48K", "Next 120 days", "$"],
  ],
  delivery: [
    ["Active projects", "11", "4 launching", "◇"],
    ["On-time milestones", "87%", "+4%", "✓"],
    ["Blocked work", "7", "Oldest 3d", "!", "down"],
    ["Team utilization", "76%", "Within target", "◎"],
  ],
  product: [
    ["Current release", "0.1.0", "Alpha 1", "⬡"],
    ["Deployment frequency", "4/wk", "+1", "↗"],
    ["Change failure rate", "5%", "Target <10%", "✓"],
    ["Open defects", "19", "3 high", "!", "down"],
  ],
  marketing: [
    ["Qualified visitors", "1,284", "+21%", "↗"],
    ["Architect starts", "214", "16.7%", "AI"],
    ["Audit conversion", "8.4%", "+1.1%", "✓"],
    ["Content in queue", "17", "6 need review", "▦"],
  ],
  finance: [
    ["Monthly revenue", "$42.8K", "+12%", "$"],
    ["Recurring revenue", "$18.6K", "+9%", "↗"],
    ["Open invoices", "$9.4K", "2 overdue", "!", "down"],
    ["Runway", "14.2 mo", "Base plan", "◎"],
  ],
  knowledge: [
    ["Published SOPs", "64", "+7", "▦"],
    ["Policy coverage", "82%", "+4%", "✓"],
    ["Decisions recorded", "31", "This quarter", "◇"],
    ["Docs needing review", "9", "3 overdue", "!", "down"],
  ],
  automations: [
    ["Workflow runs", "12.4K", "30 days", "⚙"],
    ["Success rate", "98.7%", "+0.3%", "✓"],
    ["Failed runs", "23", "5 unresolved", "!", "down"],
    ["Hours returned", "418", "Estimated", "↗"],
  ],
  ai: [
    ["Registered agents", "8", "3 enabled", "AI"],
    ["Local providers", "2", "LM Studio + Ollama", "◎"],
    ["Accepted outputs", "86%", "+4%", "✓"],
    ["Monthly inference", "$128", "Prototype estimate", "$"],
  ],
  foundry: [
    ["Genome modules", "32", "11 verified", "F"],
    ["Product recipes", "4", "2 active", "▦"],
    ["Build candidates", "7", "3 passing", "⬡"],
    ["Average reuse", "68%", "Measured in prototype", "↗"],
  ],
  governance: [
    ["Pending approvals", "9", "3 high impact", "✓"],
    ["Open risks", "12", "2 critical", "!", "down"],
    ["Policy exceptions", "4", "All time-bound", "◇"],
    ["Audit events", "84.2K", "30 days", "▤"],
  ],
  settings: [
    ["Workspace users", "14", "3 pending", "◎"],
    ["Active roles", "8", "Least privilege", "✓"],
    ["Integrations", "12", "10 healthy", "⚙"],
    ["Environments", "4", "Local to production", "⬡"],
  ],
});

export const COMMANDS = Object.freeze([
  ["Approve Foundry Pack licensing copy", "Legal and product approval", "High", "Today", "approval"],
  ["Resolve Deckbrief tenant-isolation findings", "Security review", "Critical", "Today", "blocked"],
  ["Review Command Audit prototype", "Website intake", "Normal", "Tomorrow", "active"],
  ["Publish release 0.1.0-alpha.1 notes", "Product release", "Normal", "Friday", "ready"],
  ["Validate local AI node with Ollama", "AI runtime", "High", "Friday", "active"],
]);

export const OPPORTUNITIES = Object.freeze([
  ["BrightLine Cleaning", "Local Service OS", "$24,000", "Blueprint", "72%"],
  ["Northstar Studio", "Command OS", "$18,500", "Proposal", "61%"],
  ["Chapman Capital", "Deckbrief", "$12,000", "Audit", "48%"],
  ["Urban Route Co.", "Foundry Pack", "$31,000", "Discovery", "35%"],
]);

export const CLIENTS = Object.freeze([
  ["BrightLine Cleaning", "92", "Implementation", "Milestone 4 of 6", "Healthy"],
  ["Northstar Studio", "81", "Adoption", "8 active users", "Healthy"],
  ["Oak & Iron", "64", "Support", "3 open cases", "Watch"],
  ["Chapman Capital", "49", "Migration", "Data import blocked", "At risk"],
]);

export const PROJECTS = Object.freeze([
  ["NerdCommand.com alpha", 78, "Aug 09", "On track"],
  ["Deckbrief repository audit", 62, "Aug 02", "At risk"],
  ["Identity and organization kernel", 34, "Aug 23", "On track"],
  ["Local AI node", 56, "Aug 12", "On track"],
]);

export const RELEASES = Object.freeze([
  ["0.1.0-alpha.1", "Website + OS UX", "In review", "Aug 09"],
  ["0.2.0", "Identity + Organizations", "Planned", "Aug 30"],
  ["0.3.0", "Command Core", "Planned", "Sep 27"],
  ["0.4.0", "Website Intake + CRM", "Proposed", "Oct 25"],
]);

export const AGENTS = Object.freeze([
  ["Architect AI", "Creates business briefs and capability maps", "Private beta", "Human approval", "NCA-01"],
  ["Software Planner", "Turns approved capabilities into engineering plans", "Disabled", "Human approval", "NCA-02"],
  ["Command Brief AI", "Drafts evidence-backed operating narratives", "Enabled", "Review required", "NCA-03"],
  ["Profit Optimizer", "Suggests monetization experiments", "Disabled", "Advisory only", "NCA-04"],
  ["Repository Composer", "Resolves approved modules and recipes", "Disabled", "Release gate", "NCA-05"],
  ["Security QA", "Explains scan results and release gaps", "Enabled", "No write access", "NCA-06"],
]);

export const GENOME = Object.freeze([
  ["Identity", "0.1.0", "Internal alpha"],
  ["Organizations", "0.1.0", "Internal alpha"],
  ["Permissions", "0.1.0", "Planned"],
  ["Audit", "0.1.0", "Planned"],
  ["Commands", "0.1.0", "Planned"],
  ["Processes", "0.1.0", "Proposed"],
  ["Approvals", "0.1.0", "Proposed"],
  ["Metrics", "0.1.0", "Proposed"],
  ["CRM", "0.1.0", "Proposed"],
  ["Brief Engine", "0.1.0", "Audit"],
  ["AI Gateway", "0.1.0", "Prototype"],
  ["Product Registry", "0.1.0", "Public beta"],
]);
