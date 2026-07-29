import {
  STATUS_LABELS,
  featuresForPublicSite,
  productFamilies,
  roadmapFeatures,
  statusClass,
} from "./product-registry.js";

const page = document.body.dataset.page ?? "home";

const navItems = [
  ["platform", "/platform.html", "Platform"],
  ["foundry", "/foundry.html", "Foundry"],
  ["deckbrief", "/deckbrief.html", "Deckbrief"],
  ["pricing", "/pricing.html", "Pricing"],
  ["company", "/index.html#company", "Company"],
];

function headerTemplate() {
  return `
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="site-header">
      <div class="container site-header-inner">
        <a class="brand" href="/index.html" aria-label="NerdCommand home">
          <span class="brand-mark" aria-hidden="true">N</span>
          <span class="brand-word">Nerd<span>Command</span></span>
        </a>
        <nav class="site-nav" aria-label="Primary navigation">
          ${navItems
            .map(
              ([key, href, label]) =>
                `<a href="${href}" ${page === key ? 'aria-current="page"' : ""}>${label}</a>`,
            )
            .join("")}
        </nav>
        <div class="site-actions">
          <a class="button button-ghost" href="/deckbrief-access.html">Command Audit</a>
          <a class="button button-ghost" href="/app/#overview">Sign in</a>
          <a class="button button-primary" href="/app/#overview">Open Command OS <span aria-hidden="true">↗</span></a>
          <button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false">☰</button>
        </div>
      </div>
    </div>
    <div class="mobile-nav" hidden>
      <div class="container">
        ${navItems.map(([, href, label]) => `<a href="${href}">${label}</a>`).join("")}
      </div>
    </div>
  `;
}

function footerTemplate() {
  return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a class="brand" href="/index.html">
              <span class="brand-mark" aria-hidden="true">N</span>
              <span class="brand-word">Nerd<span>Command</span></span>
            </a>
            <p>Source-included software, governed AI, reusable workflows, and operating systems for companies that need more than disconnected applications.</p>
          </div>
          <div class="footer-column"><strong>Platform</strong><a href="/platform.html">NerdCommand OS</a><a href="/app/#ai">AI Command</a><a href="/app/#briefs">Command Briefs</a></div>
          <div class="footer-column"><strong>Deckbrief</strong><a href="/deckbrief.html">Product</a><a href="/deckbrief-access.html">Request access</a><a href="/ceo.html">CEO dashboard</a><a href="/funnel-builder.html">Funnel builder</a></div>
          <div class="footer-column"><strong>Foundry</strong><a href="/foundry.html">How it works</a><a href="/app/#foundry">Business Genome</a><a href="/pricing.html">Licensing</a></div>
          <div class="footer-column"><strong>Trust</strong><a href="/index.html#trust">Security</a><a href="/index.html#trust">AI governance</a><a href="/index.html#company">Company</a></div>
        </div>
        <div class="footer-bottom">
          <span>© <span data-current-year></span> NerdCommand / GangsterNerds LLC. Stage 1 · v0.1.0.</span>
          <span>Public claims are controlled by the Product Registry.</span>
        </div>
      </div>
    </footer>
  `;
}

const header = document.querySelector("[data-site-header]");
const footer = document.querySelector("[data-site-footer]");
if (header) header.innerHTML = headerTemplate();
if (footer) footer.innerHTML = footerTemplate();

document.querySelectorAll("[data-current-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    mobileNav.hidden = open;
  });
}

function badge(status) {
  return `<span class="badge ${statusClass(status)}">${STATUS_LABELS[status] ?? status}</span>`;
}

const availableTarget = document.querySelector("[data-public-features]");
if (availableTarget) {
  const features = featuresForPublicSite();
  availableTarget.innerHTML = features.length
    ? features
        .map(
          (feature, index) => `
            <article class="card card-pad">
              <div class="card-icon" aria-hidden="true">${String(index + 1).padStart(2, "0")}</div>
              <h3>${feature.name}</h3>
              <p>${feature.summary}</p>
              <div class="card-footer"><span>${feature.module}</span>${badge(feature.status)}</div>
            </article>`,
        )
        .join("")
    : `<div class="empty-state">No public capabilities are approved yet.</div>`;
}

const roadmapTarget = document.querySelector("[data-roadmap-features]");
if (roadmapTarget) {
  roadmapTarget.innerHTML = roadmapFeatures()
    .map(
      (feature) => `
        <div class="feature-status-row">
          <div><strong>${feature.name}</strong><small>${feature.summary}</small></div>
          ${badge(feature.status)}
        </div>`,
    )
    .join("");
}

const familyTarget = document.querySelector("[data-product-families]");
if (familyTarget) {
  familyTarget.innerHTML = productFamilies
    .map(
      (family, index) => `
        <article class="card card-pad">
          <div class="card-icon" aria-hidden="true">${["OS", "F", "DB", "LS"][index] ?? "NC"}</div>
          <h3>${family.name}</h3>
          <p>${family.summary}</p>
          <div class="card-footer"><span>v${family.version}</span>${badge(family.status)}</div>
        </article>`,
    )
    .join("");
}
