import {
  AGENTS,
  CLIENTS,
  COMMANDS,
  GENOME,
  KPI,
  NAV_GROUPS,
  OPPORTUNITIES,
  PAGE_META,
  PROJECTS,
  RELEASES,
} from "./os-data.js";

import {
  STATUS_LABELS,
  productFeatures,
  statusClass,
} from "./product-registry.js";

const sidebar = document.querySelector("[data-os-sidebar]");
const nav = document.querySelector("[data-os-nav]");
const content = document.querySelector("[data-os-content]");
const mobileMenu = document.querySelector("[data-os-mobile-menu]");
const aiStatus = document.querySelector("[data-ai-status]");
const createCommandButtons = document.querySelectorAll("[data-create-command]");
const commandModal = document.querySelector("[data-command-modal]");
const paletteModal = document.querySelector("[data-command-palette]");
const paletteOpeners = document.querySelectorAll("[data-open-palette]");
const toastRegion = document.querySelector("[data-toast-region]");

const icon = (text) => `<span aria-hidden="true">${text}</span>`;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function badge(label, kind = "info") {
  return `<span class="badge badge-${kind}">${escapeHtml(label)}</span>`;
}

function statusBadge(status) {
  return `<span class="badge ${statusClass(status)}">${escapeHtml(STATUS_LABELS[status] ?? status)}</span>`;
}

function panel(title, body, options = {}) {
  const span = options.span ?? 6;
  const subtitle = options.subtitle ? `<p>${escapeHtml(options.subtitle)}</p>` : "";
  const action = options.action ?? "";
  const bodyClass = options.flush ? "panel-body flush" : "panel-body";
  return `
    <section class="panel span-${span}">
      <header class="panel-head">
        <div><h2>${escapeHtml(title)}</h2>${subtitle}</div>
        ${action}
      </header>
      <div class="${bodyClass}">${body}</div>
    </section>`;
}

function pageHeader(pageId) {
  const meta = PAGE_META[pageId] ?? PAGE_META.overview;
  return `
    <div class="prototype-banner">
      <span><strong>UX prototype:</strong> all operational values are synthetic until NerdCommand OS services are connected.</span>
      ${badge("v0.1.0-alpha.1", "warning")}
    </div>
    <header class="os-page-head">
      <div>
        <span class="eyebrow">${escapeHtml(meta.eyebrow)}</span>
        <h1>${escapeHtml(meta.title)}</h1>
        <p>${escapeHtml(meta.description)}</p>
      </div>
      <div class="os-page-actions">
        <button class="button button-ghost button-small" type="button" data-export-view>Export view</button>
        <button class="button button-primary button-small" type="button" data-create-command>+ Create Command</button>
      </div>
    </header>`;
}

function kpiGrid(pageId) {
  const items = KPI[pageId] ?? KPI.overview;
  return `
    <div class="kpi-grid">
      ${items
        .map(
          ([label, value, change, symbol, direction]) => `
            <article class="kpi-card">
              <div class="kpi-label"><span>${escapeHtml(label)}</span><span aria-hidden="true">${escapeHtml(symbol)}</span></div>
              <strong class="kpi-value">${escapeHtml(value)}</strong>
              <div class="kpi-change ${direction === "down" ? "down" : ""}">${escapeHtml(change)}</div>
            </article>`,
        )
        .join("")}
    </div>`;
}

function list(items) {
  return `<div class="list">${items
    .map(
      ([title, detail, meta, glyph = "◈"]) => `
        <div class="list-item">
          <span class="list-item-icon" aria-hidden="true">${escapeHtml(glyph)}</span>
          <div><strong>${escapeHtml(title)}</strong><small>${escapeHtml(detail)}</small></div>
          <span class="list-item-meta">${escapeHtml(meta)}</span>
        </div>`,
    )
    .join("")}</div>`;
}

function miniBars(values, labels = ["M", "T", "W", "T", "F", "S", "S"]) {
  return `<div class="mini-bars" aria-label="Synthetic trend chart">${values
    .map(
      (value, index) => `
        <div class="mini-bar">
          <span style="height:${Math.max(5, value)}%"></span>
          <span>${escapeHtml(labels[index] ?? String(index + 1))}</span>
        </div>`,
    )
    .join("")}</div>`;
}

function table(headers, rows) {
  return `
    <div style="overflow-x:auto">
      <table class="data-table">
        <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
        <tbody>${rows
          .map(
            (row) => `<tr>${row.map((cell, index) => `<td>${index === 0 ? `<strong>${escapeHtml(cell)}</strong>` : escapeHtml(cell)}</td>`).join("")}</tr>`,
          )
          .join("")}</tbody>
      </table>
    </div>`;
}

function renderOverview() {
  const attention = COMMANDS.slice(0, 4).map(([title, detail, priority, due]) => [title, `${detail} · ${priority}`, due, priority === "Critical" ? "!" : "◈"]);
  const health = [
    ["Website", "99.98%", "Healthy"],
    ["OS API", "Prototype", "Building"],
    ["AI gateway", "Mock", "Controlled"],
    ["Deckbrief", "Audit", "Review"],
  ];

  return `
    ${kpiGrid("overview")}
    <div class="dashboard-grid">
      ${panel("Requires command", list(attention), { span: 7, subtitle: "Highest-priority owner actions" })}
      ${panel(
        "Daily Command Brief",
        `<div class="command-brief">
          <span class="badge badge-success">AI draft · human review</span>
          <h3>Three outcomes need executive attention.</h3>
          <p>Deckbrief tenant isolation is blocking migration approval. The public alpha is on track, but licensing language and the local AI production connector still require named owners.</p>
          <ul><li>Approve the Deckbrief remediation plan.</li><li>Assign the source-license review.</li><li>Confirm the 0.1.0 release evidence.</li></ul>
        </div>`,
        { span: 5, subtitle: "Based on prototype operating signals" },
      )}
      ${panel("Command flow", miniBars([46, 65, 52, 76, 88, 61, 74]), { span: 7, subtitle: "Completed Commands by day" })}
      ${panel(
        "System health",
        `<div class="health-grid">${health
          .map(([name, score, state]) => `<div class="health-card"><strong>${name}</strong><div class="health-score"><b>${score}</b></div>${badge(state, state === "Healthy" ? "success" : "warning")}</div>`)
          .join("")}</div>`,
        { span: 5, subtitle: "UX-only service status" },
      )}
    </div>`;
}

function renderCommands() {
  const rows = COMMANDS.map(([title, detail, priority, due, status]) => [title, detail, priority, due, status]);
  return `
    ${kpiGrid("commands")}
    <div class="dashboard-grid">
      ${panel("Owned Commands", table(["Outcome", "Context", "Priority", "Due", "Status"], rows), { span: 8, flush: true })}
      ${panel("Workload", miniBars([42, 71, 56, 83, 64, 48, 38]), { span: 4, subtitle: "Planned owner capacity" })}
      ${panel(
        "Process queues",
        list([
          ["Lead qualification", "4 Commands waiting", "SLA 18m", "↗"],
          ["Release approval", "3 Commands waiting", "Oldest 8h", "✓"],
          ["Customer onboarding", "6 active Commands", "92% on time", "◎"],
          ["Security remediation", "2 blocked Commands", "Critical", "!"],
        ]),
        { span: 6 },
      )}
      ${panel(
        "Approval pressure",
        `<div class="funnel">
          ${[["Drafted", 100, 18], ["Submitted", 78, 14], ["Reviewed", 56, 10], ["Approved", 39, 7]].map(([label, width, count]) => `<div class="funnel-row"><span>${label}</span><div class="funnel-track"><span style="width:${width}%"></span></div><strong>${count}</strong></div>`).join("")}
        </div>`,
        { span: 6 },
      )}
    </div>`;
}

function renderBriefs() {
  const briefs = [
    ["Executive Command Brief", "Weekly", "Friday", "Ready for review"],
    ["Investor Update", "Monthly", "Aug 01", "Data collection"],
    ["Customer Implementation Report", "Biweekly", "Aug 05", "Drafting"],
    ["Release Readiness Brief", "Per release", "Aug 09", "Waiting on evidence"],
  ];
  return `
    ${kpiGrid("briefs")}
    <div class="dashboard-grid">
      ${panel("Brief calendar", table(["Template", "Cadence", "Next run", "Status"], briefs), { span: 7, flush: true })}
      ${panel(
        "Source coverage",
        `<div class="funnel">
          ${[["Metrics", 91, "91%"], ["Commands", 87, "87%"], ["Decisions", 76, "76%"], ["Evidence", 68, "68%"]].map(([label, width, value]) => `<div class="funnel-row"><span>${label}</span><div class="funnel-track"><span style="width:${width}%"></span></div><strong>${value}</strong></div>`).join("")}
        </div>`,
        { span: 5 },
      )}
      ${panel(
        "Latest approved narrative",
        `<div class="command-brief"><span class="badge badge-success">Approved</span><h3>NerdCommand Platform Alpha</h3><p>The registry-driven public experience and complete OS dashboard shell are ready for Vercel preview. Backend operational records remain synthetic until Stage 2 begins.</p><ul><li>Release evidence attached.</li><li>AI runtime remains mock by default.</li><li>Deckbrief audit remains a release dependency.</li></ul></div>`,
        { span: 7 },
      )}
      ${panel("Follow-up Commands", list([
        ["Attach tenant-isolation test evidence", "Deckbrief migration brief", "Today", "!"],
        ["Confirm 0.1.0 deployment URL", "Release readiness brief", "Tomorrow", "⬡"],
        ["Review public AI language", "Website brief", "Friday", "AI"],
      ]), { span: 5 })}
    </div>`;
}

function renderRevenue() {
  return `
    ${kpiGrid("revenue")}
    <div class="dashboard-grid">
      ${panel("Qualified pipeline", table(["Company", "Offer", "Value", "Stage", "Confidence"], OPPORTUNITIES), { span: 8, flush: true })}
      ${panel(
        "Pipeline movement",
        `<div class="funnel">
          ${[["Visitors", 100, "1,284"], ["Architect", 58, "214"], ["Qualified", 36, "74"], ["Proposal", 21, "28"], ["Won", 9, "11"]].map(([label, width, value]) => `<div class="funnel-row"><span>${label}</span><div class="funnel-track"><span style="width:${width}%"></span></div><strong>${value}</strong></div>`).join("")}
        </div>`,
        { span: 4, subtitle: "Synthetic current-quarter funnel" },
      )}
      ${panel("Lead sources", miniBars([78, 56, 44, 31, 67, 22, 49], ["Direct", "Search", "Partner", "Social", "Referral", "Email", "Other"]), { span: 7 })}
      ${panel("Next-best actions", list([
        ["Send BrightLine Blueprint", "Expected value $24K", "Today", "↗"],
        ["Request Northstar decision", "Proposal open 6 days", "Today", "⌁"],
        ["Qualify Urban Route", "Missing deployment preference", "Tomorrow", "◎"],
      ]), { span: 5 })}
    </div>`;
}

function renderClients() {
  return `
    ${kpiGrid("clients")}
    <div class="dashboard-grid">
      ${panel("Customer health", table(["Client", "Score", "Lifecycle", "Signal", "Status"], CLIENTS), { span: 8, flush: true })}
      ${panel("Health distribution", `<div class="health-grid"><div class="health-card"><strong>Healthy</strong><div class="health-score"><b>14</b><span>clients</span></div>${badge("78%", "success")}</div><div class="health-card"><strong>Watch</strong><div class="health-score"><b>1</b><span>client</span></div>${badge("6%", "warning")}</div><div class="health-card"><strong>At risk</strong><div class="health-score"><b>3</b><span>clients</span></div>${badge("16%", "danger")}</div></div>`, { span: 4 })}
      ${panel("Onboarding activity", list([
        ["BrightLine data import", "Validated 1,840 contacts", "76%", "◎"],
        ["Northstar team training", "8 of 10 seats activated", "80%", "✓"],
        ["Chapman migration", "Waiting on tenant fix", "Blocked", "!"],
      ]), { span: 6 })}
      ${panel("Renewal calendar", list([
        ["Oak & Iron", "$12K annual", "44 days", "$"],
        ["Northstar Studio", "$18K annual", "76 days", "$"],
        ["BrightLine Cleaning", "$24K annual", "103 days", "$"],
      ]), { span: 6 })}
    </div>`;
}

function renderDelivery() {
  const projectCards = PROJECTS.map(([name, progress, due, status]) => `<div class="health-card"><strong>${escapeHtml(name)}</strong><div class="health-score"><b>${progress}%</b><span>complete</span></div><div class="progress"><span style="width:${progress}%"></span></div><div class="card-footer"><span>${due}</span>${badge(status, status === "On track" ? "success" : "warning")}</div></div>`).join("");
  return `
    ${kpiGrid("delivery")}
    <div class="dashboard-grid">
      ${panel("Active projects", `<div class="health-grid">${projectCards}</div>`, { span: 8 })}
      ${panel("Team capacity", `<div class="funnel">${[["Platform", 84, "84%"], ["Website", 72, "72%"], ["Process", 61, "61%"], ["Customer", 79, "79%"]].map(([label, width, value]) => `<div class="funnel-row"><span>${label}</span><div class="funnel-track"><span style="width:${width}%"></span></div><strong>${value}</strong></div>`).join("")}</div>`, { span: 4 })}
      ${panel("Milestone risk", list([
        ["Deckbrief security disposition", "Blocks brief-engine migration", "2 days", "!"],
        ["Source-license review", "Required before paid beta", "6 days", "✓"],
        ["Vercel production smoke test", "Required for alpha tag", "8 days", "⬡"],
      ]), { span: 6 })}
      ${panel("Delivery trend", miniBars([53, 66, 72, 62, 84, 76, 87]), { span: 6, subtitle: "On-time milestone rate" })}
    </div>`;
}

function renderProduct() {
  const kanban = [
    ["Discovery", [["Deckbrief audit", "Repository facts and disposition"], ["Cleaning operator interviews", "Validate first vertical"]]],
    ["Building", [["Public UX prototype", "Vercel-ready static frontend"], ["Local AI node", "LM Studio and Ollama adapters"]]],
    ["Review", [["Product Registry", "Feature visibility rules"], ["Release manifest", "Version and evidence contract"]]],
    ["Released", [["CIO Blueprint", "Company and product architecture"]]],
  ];
  return `
    ${kpiGrid("product")}
    <div class="dashboard-grid">
      ${panel("Roadmap", `<div class="kanban">${kanban.map(([name, cards]) => `<section class="kanban-column"><div class="kanban-head"><span>${name}</span><span>${cards.length}</span></div>${cards.map(([title, detail]) => `<article class="kanban-card"><strong>${title}</strong><p>${detail}</p>${badge(name, name === "Released" ? "success" : "info")}</article>`).join("")}</section>`).join("")}</div>`, { span: 12 })}
      ${panel("Release train", table(["Version", "Scope", "Status", "Target"], RELEASES), { span: 7, flush: true })}
      ${panel("Engineering performance", `<div class="health-grid"><div class="health-card"><strong>Lead time</strong><div class="health-score"><b>2.4d</b></div>${badge("Target 3d", "success")}</div><div class="health-card"><strong>Recovery</strong><div class="health-score"><b>34m</b></div>${badge("Prototype", "info")}</div><div class="health-card"><strong>Rework</strong><div class="health-score"><b>7%</b></div>${badge("Target <10%", "success")}</div></div>`, { span: 5 })}
    </div>`;
}

function renderMarketing() {
  return `
    ${kpiGrid("marketing")}
    <div class="dashboard-grid">
      ${panel("Campaign performance", table(["Campaign", "Visitors", "Architect starts", "Qualified", "Status"], [
        ["Foundry launch thesis", "584", "94", "21", "Active"],
        ["Source ownership guide", "301", "47", "13", "Active"],
        ["Deckbrief founder reporting", "226", "39", "8", "Testing"],
        ["Local Service OS", "173", "34", "7", "Planned"],
      ]), { span: 8, flush: true })}
      ${panel("Attribution", miniBars([86, 72, 63, 48, 38, 29, 17], ["Direct", "Organic", "Partner", "Referral", "Social", "Email", "Paid"]), { span: 4 })}
      ${panel("Content command queue", list([
        ["Publish system architecture article", "Technical authority", "Review", "▦"],
        ["Record Command workflow demo", "Product education", "Building", "◇"],
        ["Interview cleaning operator", "Vertical validation", "Scheduled", "◎"],
        ["Write AI governance guide", "Trust content", "Planned", "AI"],
      ]), { span: 6 })}
      ${panel("Conversion trend", miniBars([34, 41, 38, 52, 61, 68, 74]), { span: 6, subtitle: "Qualified actions per week" })}
    </div>`;
}

function renderFinance() {
  return `
    ${kpiGrid("finance")}
    <div class="dashboard-grid">
      ${panel("Revenue trend", miniBars([38, 44, 49, 57, 63, 71, 82], ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]), { span: 7 })}
      ${panel("Cash position", `<div class="health-grid"><div class="health-card"><strong>Operating cash</strong><div class="health-score"><b>$284K</b></div>${badge("Base plan", "success")}</div><div class="health-card"><strong>Committed spend</strong><div class="health-score"><b>$47K</b></div>${badge("90 days", "info")}</div><div class="health-card"><strong>Collection risk</strong><div class="health-score"><b>$4.1K</b></div>${badge("2 overdue", "warning")}</div></div>`, { span: 5 })}
      ${panel("Open invoices", table(["Customer", "Amount", "Due", "Status"], [
        ["Northstar Studio", "$4,800", "Aug 01", "Open"],
        ["Oak & Iron", "$2,600", "Jul 23", "Overdue"],
        ["BrightLine Cleaning", "$2,000", "Aug 12", "Open"],
      ]), { span: 6, flush: true })}
      ${panel("Expense controls", list([
        ["AI inference budget", "$128 of $500", "26%", "AI"],
        ["Infrastructure", "$1,840 of $3,500", "53%", "⬡"],
        ["Contract services", "$8,900 of $12,000", "74%", "◎"],
      ]), { span: 6 })}
    </div>`;
}

function renderKnowledge() {
  return `
    ${kpiGrid("knowledge")}
    <div class="dashboard-grid">
      ${panel("Knowledge search", `<label class="field"><span class="sr-only">Search company knowledge</span><input type="search" placeholder="Search SOPs, policies, decisions, customers, architecture..." /></label><div style="margin-top:14px">${list([
        ["NerdCommand module rules", "Architecture · updated today", "v1.2", "▦"],
        ["Local AI security policy", "Security · draft", "Review", "AI"],
        ["Deckbrief repository decision", "Architecture · pending", "Blocked", "!"],
        ["Public feature lifecycle", "Product · approved", "v1.0", "✓"],
      ])}</div>`, { span: 7 })}
      ${panel("Document health", `<div class="health-grid"><div class="health-card"><strong>Current</strong><div class="health-score"><b>82%</b></div>${badge("52 docs", "success")}</div><div class="health-card"><strong>Review soon</strong><div class="health-score"><b>11%</b></div>${badge("7 docs", "warning")}</div><div class="health-card"><strong>Overdue</strong><div class="health-score"><b>7%</b></div>${badge("5 docs", "danger")}</div></div>`, { span: 5 })}
      ${panel("Recent decisions", table(["Decision", "Owner", "Date", "Status"], [
        ["Use Vercel for public frontend", "Platform", "Jul 28", "Approved"],
        ["Use local AI connector pattern", "Security", "Jul 28", "Approved"],
        ["Treat Deckbrief as Product Zero", "Product", "Jul 24", "Approved"],
        ["Start with modular monolith", "Architecture", "Jul 22", "Approved"],
      ]), { span: 12, flush: true })}
    </div>`;
}

function renderAutomations() {
  return `
    ${kpiGrid("automations")}
    <div class="dashboard-grid">
      ${panel("Workflow inventory", table(["Workflow", "Trigger", "Last run", "Success", "State"], [
        ["Website lead intake", "Form submitted", "4m ago", "99.4%", "Active"],
        ["Command approval reminder", "Every 2h", "18m ago", "100%", "Active"],
        ["Brief data collection", "Every Friday", "2d ago", "96.1%", "Watch"],
        ["Release evidence check", "Tag created", "6d ago", "100%", "Active"],
      ]), { span: 8, flush: true })}
      ${panel("Run volume", miniBars([58, 74, 66, 92, 85, 73, 96]), { span: 4 })}
      ${panel("Failure queue", list([
        ["CRM duplicate resolver", "3 retries exhausted", "12m", "!"],
        ["Deckbrief metric import", "Schema mismatch", "1h", "!"],
        ["Customer email notification", "Provider throttle", "2h", "⌁"],
      ]), { span: 6 })}
      ${panel("Integration health", `<div class="health-grid"><div class="health-card"><strong>Vercel</strong><div class="health-score"><b>OK</b></div>${badge("Connected", "success")}</div><div class="health-card"><strong>GitHub</strong><div class="health-score"><b>OK</b></div>${badge("Connected", "success")}</div><div class="health-card"><strong>Local AI</strong><div class="health-score"><b>Mock</b></div>${badge("Gateway pending", "warning")}</div></div>`, { span: 6 })}
    </div>`;
}

function renderAi() {
  const agentCards = AGENTS.map(([name, purpose, state, control, id]) => `
    <article class="agent-card">
      <div class="agent-head"><span class="agent-icon">AI</span><div><strong>${escapeHtml(name)}</strong><small>${escapeHtml(id)} · ${escapeHtml(state)}</small></div></div>
      <p>${escapeHtml(purpose)}</p>
      <div class="agent-meta"><span>${escapeHtml(control)}</span><span>Human owner assigned</span></div>
    </article>`).join("");

  return `
    ${kpiGrid("ai")}
    <div class="dashboard-grid">
      ${panel("Local model providers", `<div class="health-grid"><div class="health-card"><strong>Ollama</strong><div class="health-score"><b>11434</b><span>default port</span></div>${badge("OpenAI compatible", "success")}</div><div class="health-card"><strong>LM Studio</strong><div class="health-score"><b>1234</b><span>default port</span></div>${badge("OpenAI compatible", "success")}</div><div class="health-card"><strong>OS Gateway</strong><div class="health-score"><b>Mock</b><span>current mode</span></div>${badge("Connector pending", "warning")}</div></div>`, { span: 7, subtitle: "Production uses an outbound local node, not public localhost" })}
      ${panel("Architect console", `<div class="ai-chat"><div class="chat-log" data-chat-log><div class="chat-message">Architect AI is in safe prototype mode. Describe a business or operating problem to preview the interaction.</div></div><form class="chat-composer" data-chat-form><textarea name="message" maxlength="4000" placeholder="Example: Design an operating system for a mobile detailing company." required></textarea><button class="button button-primary" type="submit">Send</button></form></div>`, { span: 5 })}
      ${panel("Registered agents", `<div class="agent-grid">${agentCards}</div>`, { span: 12 })}
      ${panel("Recent AI runs", table(["Agent", "Purpose", "Model policy", "Outcome", "Approval"], [
        ["Command Brief AI", "Weekly executive draft", "Local preferred", "Accepted", "Reviewed"],
        ["Security QA", "Explain scan findings", "Local only", "Accepted", "Not required"],
        ["Architect AI", "Cleaning OS brief", "Prototype mock", "Draft", "Required"],
        ["Profit Optimizer", "Revenue ideas", "Disabled", "Not run", "Required"],
      ]), { span: 12, flush: true })}
    </div>`;
}

function renderFoundry() {
  const genes = GENOME.map(([name, version, state]) => `<article class="genome-gene"><strong>${escapeHtml(name)}</strong><span>v${escapeHtml(version)} · ${escapeHtml(state)}</span></article>`).join("");
  return `
    ${kpiGrid("foundry")}
    <div class="dashboard-grid">
      ${panel("Foundry pipeline", `<div class="pipeline-steps">${[["Intent", "Approved"], ["Research", "Active"], ["Blueprint", "Active"], ["Recipe", "Planned"], ["Compose", "Planned"], ["Verify", "Planned"], ["Release", "Gate"]].map(([name, state], index) => `<div class="pipeline-step ${index < 3 ? "active" : ""}"><strong>${name}</strong><span>${state}</span></div>`).join("")}</div>`, { span: 12 })}
      ${panel("Business Genome", `<div class="genome-grid">${genes}</div>`, { span: 8, subtitle: "Reusable capabilities and current maturity" })}
      ${panel("Build queue", list([
        ["NerdCommand Platform Alpha", "Reference architecture", "In review", "⬡"],
        ["Deckbrief Command Brief Engine", "Product Zero", "Audit", "DB"],
        ["Residential Cleaning OS", "First vertical", "Discovery", "LS"],
        ["Local Service OS Core", "Product family", "Planned", "F"],
      ]), { span: 4 })}
      ${panel("Product recipes", table(["Recipe", "Core", "Overlay", "State"], [
        ["nerdcommand-platform", "OS core", "Company operations", "Alpha"],
        ["deckbrief", "Brief engine", "Founder reporting", "Audit"],
        ["local-service-core", "OS core", "Job operations", "Planned"],
        ["residential-cleaning", "Local service", "Cleaning workflows", "Discovery"],
      ]), { span: 7, flush: true })}
      ${panel("Verification gates", list([
        ["Clean build", "Reproducible from lockfile", "Required", "✓"],
        ["Security", "Secrets, dependencies, permissions", "Required", "✓"],
        ["Supply chain", "SBOM, notices, provenance", "Required", "▦"],
        ["Business flow", "End-to-end value stream", "Required", "◈"],
      ]), { span: 5 })}
    </div>`;
}

function renderGovernance() {
  return `
    ${kpiGrid("governance")}
    <div class="dashboard-grid">
      ${panel("Pending approvals", table(["Request", "Policy", "Risk", "Owner", "Age"], [
        ["Publish pricing hypothesis", "Public claims", "High", "CEO", "8h"],
        ["Enable Architect private beta", "AI-004", "High", "AI Owner", "13h"],
        ["Merge Deckbrief extraction", "SEC-012", "Critical", "Security", "19h"],
        ["Increase infrastructure budget", "FIN-007", "Moderate", "Finance", "1d"],
      ]), { span: 8, flush: true })}
      ${panel("Risk profile", `<div class="health-grid"><div class="health-card"><strong>Critical</strong><div class="health-score"><b>2</b></div>${badge("Immediate", "danger")}</div><div class="health-card"><strong>High</strong><div class="health-score"><b>4</b></div>${badge("7 days", "warning")}</div><div class="health-card"><strong>Moderate</strong><div class="health-score"><b>6</b></div>${badge("30 days", "info")}</div></div>`, { span: 4 })}
      ${panel("Audit stream", `<div class="audit-stream">${[
        ["14:22", "platform.release_manifest.created", "system"],
        ["14:18", "ai.agent.permission_denied", "NCA-02"],
        ["13:51", "website.feature.promoted", "product-owner"],
        ["13:07", "command.approval.requested", "lead-developer"],
        ["12:44", "integration.vercel.health_checked", "worker"],
      ].map(([time, event, actor]) => `<div class="audit-row"><span>${time}</span><strong>${event}</strong><span>${actor}</span></div>`).join("")}</div>`, { span: 7 })}
      ${panel("Policy library", list([
        ["AI action authority", "Defines advisory, review, approval, and prohibited actions", "v1.0", "AI"],
        ["Public feature claims", "Product Registry is the source of truth", "v1.1", "✓"],
        ["Source-code intake", "License, security, and provenance review", "Draft", "▦"],
        ["Production release", "Evidence, recovery, and approvals", "v1.0", "⬡"],
      ]), { span: 5 })}
    </div>`;
}

function renderSettings() {
  return `
    ${kpiGrid("settings")}
    <div class="dashboard-grid">
      ${panel("Organization", `<div class="form-grid"><label class="field"><span>Workspace name</span><input value="NerdCommand" /></label><label class="field"><span>Workspace slug</span><input value="nerdcommand" /></label><label class="field span-2"><span>Operating purpose</span><textarea>Manufacture and operate source-included business operating systems.</textarea></label></div>`, { span: 6 })}
      ${panel("Environment", `<div class="form-grid"><label class="field"><span>Active environment</span><select><option>Prototype</option><option>Preview</option><option>Staging</option><option>Production</option></select></label><label class="field"><span>Release channel</span><select><option>Internal alpha</option><option>Private beta</option><option>Public beta</option><option>GA</option></select></label><label class="field span-2"><span>AI mode</span><select><option>Mock</option><option>NerdCommand Gateway</option><option>Disabled</option></select></label></div>`, { span: 6 })}
      ${panel("Roles and authority", table(["Role", "Members", "Authority", "Review"], [
        ["Owner", "1", "Company control", "Quarterly"],
        ["Administrator", "2", "Platform administration", "Monthly"],
        ["Operator", "7", "Assigned Commands", "Monthly"],
        ["AI Agent", "8", "Policy-scoped tools", "Per release"],
      ]), { span: 7, flush: true })}
      ${panel("Connected systems", list([
        ["Vercel", "Public frontend deployment", "Healthy", "⬡"],
        ["GitHub", "Source and release control", "Healthy", "⌁"],
        ["Ollama", "Local model provider", "Not connected", "AI"],
        ["LM Studio", "Local model provider", "Not connected", "AI"],
      ]), { span: 5 })}
    </div>`;
}

const renderers = {
  overview: renderOverview,
  commands: renderCommands,
  briefs: renderBriefs,
  revenue: renderRevenue,
  clients: renderClients,
  delivery: renderDelivery,
  product: renderProduct,
  marketing: renderMarketing,
  finance: renderFinance,
  knowledge: renderKnowledge,
  automations: renderAutomations,
  ai: renderAi,
  foundry: renderFoundry,
  governance: renderGovernance,
  settings: renderSettings,
};

function currentPage() {
  const id = window.location.hash.replace(/^#/, "") || "overview";
  return renderers[id] ? id : "overview";
}

function renderNav() {
  if (!nav) return;
  nav.innerHTML = NAV_GROUPS.map(
    (group) => `
      <div class="os-nav-group">
        <span class="os-nav-label">${escapeHtml(group.label)}</span>
        ${group.items
          .map(
            (item) => `<a class="os-nav-link" data-page-link="${item.id}" href="#${item.id}"><span class="os-nav-icon" aria-hidden="true">${escapeHtml(item.icon)}</span><span>${escapeHtml(item.label)}</span></a>`,
          )
          .join("")}
      </div>`,
  ).join("");
}

function wirePageInteractions() {
  document.querySelectorAll("[data-create-command]").forEach((button) => button.addEventListener("click", () => openModal(commandModal)));
  document.querySelector("[data-export-view]")?.addEventListener("click", () => toast("View export queued", "The production build will create a versioned PDF/JSON export with evidence."));

  const chatForm = document.querySelector("[data-chat-form]");
  if (chatForm) {
    chatForm.addEventListener("submit", handleChatSubmit);
  }
}

function renderPage() {
  const id = currentPage();
  const meta = PAGE_META[id];
  document.title = `${meta.title} · NerdCommand OS`;

  document.querySelectorAll("[data-page-link]").forEach((link) => {
    link.classList.toggle("active", link.dataset.pageLink === id);
  });

  if (content) {
    content.innerHTML = `${pageHeader(id)}${renderers[id]()}`;
    wirePageInteractions();
  }

  sidebar?.classList.remove("open");
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  const focusable = modal.querySelector("input, textarea, button");
  focusable?.focus();
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function toast(title, message) {
  if (!toastRegion) return;
  const node = document.createElement("div");
  node.className = "toast";
  node.innerHTML = `<strong>${escapeHtml(title)}</strong><br>${escapeHtml(message)}`;
  toastRegion.append(node);
  window.setTimeout(() => node.remove(), 5000);
}

async function handleChatSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const input = form.elements.message;
  const message = input.value.trim();
  if (!message) return;

  const log = document.querySelector("[data-chat-log]");
  log?.insertAdjacentHTML("beforeend", `<div class="chat-message user">${escapeHtml(message)}</div>`);
  input.value = "";
  input.disabled = true;
  form.querySelector("button")?.setAttribute("disabled", "true");

  const pending = document.createElement("div");
  pending.className = "chat-message";
  pending.textContent = "Architect is preparing a governed draft...";
  log?.append(pending);

  try {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) throw new Error(`AI route returned ${response.status}`);
    const payload = await response.json();
    pending.textContent = payload.content ?? "No response text was returned.";
  } catch {
    pending.textContent =
      "Prototype fallback: Architect AI would create a business brief, capability map, operating risks, and review Commands. The Vercel AI gateway is not connected in this static preview.";
  } finally {
    input.disabled = false;
    form.querySelector("button")?.removeAttribute("disabled");
    input.focus();
    log?.scrollTo({ top: log.scrollHeight, behavior: "smooth" });
  }
}

async function checkAiStatus() {
  if (!aiStatus) return;
  try {
    const response = await fetch("/api/ai/health", { cache: "no-store" });
    const payload = await response.json();
    if (response.ok && payload.ok) {
      aiStatus.classList.add("online");
      aiStatus.querySelector("span:last-child").textContent = payload.mode === "mock" ? "AI · Mock" : "AI · Online";
      return;
    }
  } catch {
    // Static local preview does not execute Vercel functions.
  }
  aiStatus.classList.remove("online");
  aiStatus.querySelector("span:last-child").textContent = "AI · Prototype";
}

function buildPalette() {
  const results = paletteModal?.querySelector("[data-palette-results]");
  const input = paletteModal?.querySelector("[data-palette-input]");
  if (!results || !input) return;

  const actions = [
    ...NAV_GROUPS.flatMap((group) => group.items.map((item) => ({ label: `Open ${item.label}`, hash: item.id }))),
    { label: "Create Command", action: "create" },
    { label: "Open NerdCommand.com", href: "/index.html" },
    { label: "Review public feature registry", hash: "product" },
  ];

  function draw(query = "") {
    const normalized = query.toLowerCase();
    results.innerHTML = actions
      .filter((action) => action.label.toLowerCase().includes(normalized))
      .map((action, index) => `<button class="palette-result" type="button" data-palette-index="${index}" data-label="${escapeHtml(action.label)}"><span>${escapeHtml(action.label)}</span><span>↵</span></button>`)
      .join("");

    results.querySelectorAll("[data-palette-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = actions.find((candidate) => candidate.label === button.dataset.label);
        closeModal(paletteModal);
        if (!action) return;
        if (action.hash) window.location.hash = action.hash;
        if (action.href) window.location.href = action.href;
        if (action.action === "create") openModal(commandModal);
      });
    });
  }

  input.addEventListener("input", () => draw(input.value));
  draw();
}

renderNav();
buildPalette();
renderPage();
checkAiStatus();

window.addEventListener("hashchange", renderPage);

mobileMenu?.addEventListener("click", () => sidebar?.classList.toggle("open"));
createCommandButtons.forEach((button) => button.addEventListener("click", () => openModal(commandModal)));
paletteOpeners.forEach((button) => button.addEventListener("click", () => openModal(paletteModal)));

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => closeModal(button.closest(".modal-backdrop")));
});

document.querySelectorAll(".modal-backdrop").forEach((modal) => {
  modal.addEventListener("mousedown", (event) => {
    if (event.target === modal) closeModal(modal);
  });
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openModal(paletteModal);
  }
  if (event.key === "Escape") {
    closeModal(commandModal);
    closeModal(paletteModal);
    sidebar?.classList.remove("open");
  }
});

document.querySelector("[data-command-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  closeModal(commandModal);
  event.currentTarget.reset();
  toast("Prototype Command created", "The UX accepted the Command. Stage 3 will persist it to NerdCommand OS with policy and audit records.");
});

// Keep the imported product registry in this build so the dashboard and website
// share one product truth. The Product page can later render all records directly.
void productFeatures;
