export const FEATURE_STATUSES = Object.freeze([
  "proposed",
  "planned",
  "internal-alpha",
  "private-beta",
  "public-beta",
  "general-availability",
  "deprecated",
  "retired",
]);

export const STATUS_LABELS = Object.freeze({
  proposed: "Proposed",
  planned: "Planned",
  "internal-alpha": "Internal alpha",
  "private-beta": "Private beta",
  "public-beta": "Public beta",
  "general-availability": "Available",
  deprecated: "Deprecated",
  retired: "Retired",
});

export const PUBLIC_FEATURE_STATUSES = new Set([
  "public-beta",
  "general-availability",
  "deprecated",
]);

export const productFamilies = Object.freeze([
  {
    slug: "nerdcommand-os",
    name: "NerdCommand OS",
    status: "internal-alpha",
    summary: "The governed command plane for running a company.",
    version: "0.1.0-alpha.1",
  },
  {
    slug: "foundry",
    name: "NerdCommand Foundry",
    status: "planned",
    summary: "The manufacturing system for source-included business operating systems.",
    version: "0.0.1",
  },
  {
    slug: "deckbrief",
    name: "Deckbrief",
    status: "private-beta",
    summary: "Evidence-backed operating, board, investor, and customer briefings.",
    version: "repository-audit",
  },
  {
    slug: "local-service-os",
    name: "Local Service Company OS",
    status: "planned",
    summary: "A reusable operating core for job-based local service companies.",
    version: "0.0.1",
  },
]);

export const productFeatures = Object.freeze([
  {
    slug: "public-command-site",
    name: "Registry-driven public website",
    module: "website",
    family: "nerdcommand-os",
    status: "public-beta",
    public: true,
    summary: "NerdCommand.com evolves from the same versioned product truth used by the OS.",
    introducedIn: "0.1.0-alpha.1",
    editions: ["platform"],
  },
  {
    slug: "command-center-ux",
    name: "Command Center UX",
    module: "command-center",
    family: "nerdcommand-os",
    status: "public-beta",
    public: true,
    summary: "A complete UX shell for executive, revenue, client, delivery, product, finance, AI, and governance operations.",
    introducedIn: "0.1.0-alpha.1",
    editions: ["platform"],
  },
  {
    slug: "commands",
    name: "Governed Commands",
    module: "commands",
    family: "nerdcommand-os",
    status: "planned",
    public: true,
    summary: "Convert signals into owned work with policies, approvals, evidence, and outcomes.",
    editions: ["platform", "professional", "enterprise"],
  },
  {
    slug: "processes",
    name: "Processes and SOPs",
    module: "processes",
    family: "nerdcommand-os",
    status: "planned",
    public: true,
    summary: "Versioned processes, standard operating procedures, checklists, and improvement history.",
    editions: ["professional", "enterprise"],
  },
  {
    slug: "local-ai-runtime",
    name: "Local AI Runtime",
    module: "ai-gateway",
    family: "nerdcommand-os",
    status: "private-beta",
    public: true,
    summary: "Provider-neutral routing to LM Studio or Ollama through a governed local AI node.",
    editions: ["professional", "enterprise"],
    limitations: ["Production connector backend is not included in this UX prototype."],
  },
  {
    slug: "architect-ai",
    name: "Architect AI",
    module: "agents",
    family: "foundry",
    status: "planned",
    public: true,
    summary: "Turns a business intent into a reviewable operating brief, capability map, risks, and Foundry project.",
    editions: ["foundry"],
  },
  {
    slug: "business-genome",
    name: "Business Genome",
    module: "genome-registry",
    family: "foundry",
    status: "planned",
    public: true,
    summary: "A versioned registry of reusable software, workflow, policy, AI, and playbook modules.",
    editions: ["foundry"],
  },
  {
    slug: "repository-composer",
    name: "Repository Composer",
    module: "foundry-builds",
    family: "foundry",
    status: "planned",
    public: true,
    summary: "Derives reproducible customer products from approved module recipes instead of unmanaged copying.",
    editions: ["foundry", "enterprise"],
  },
  {
    slug: "command-briefs",
    name: "Command Briefs",
    module: "brief-engine",
    family: "deckbrief",
    status: "private-beta",
    public: true,
    summary: "Creates executive, board, investor, and customer briefings from versioned operational data.",
    editions: ["professional", "enterprise"],
  },
  {
    slug: "cleaning-os",
    name: "Residential Cleaning Company OS",
    module: "verticals",
    family: "local-service-os",
    status: "planned",
    public: true,
    summary: "The first proposed vertical pack built on the Local Service Company OS core.",
    editions: ["foundry-pack"],
  },
]);

export function canAdvertiseFeature(feature) {
  return Boolean(feature?.public) && PUBLIC_FEATURE_STATUSES.has(feature.status);
}

export function featuresForPublicSite() {
  return productFeatures.filter(canAdvertiseFeature);
}

export function roadmapFeatures() {
  return productFeatures.filter((feature) =>
    ["planned", "private-beta", "public-beta", "general-availability"].includes(feature.status),
  );
}

export function statusClass(status) {
  if (status === "general-availability" || status === "public-beta") return "badge-success";
  if (status === "private-beta" || status === "planned") return "badge-warning";
  if (status === "deprecated" || status === "retired") return "badge-danger";
  return "badge-info";
}
