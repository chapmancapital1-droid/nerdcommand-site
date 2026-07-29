import { existsSync, readFileSync } from "node:fs";

const required = [
  "index.html",
  "platform.html",
  "foundry.html",
  "deckbrief.html",
  "pricing.html",
  "app/index.html",
  "assets/css/nerdcommand.css",
  "assets/js/product-registry.js",
  "assets/js/os-app.js",
  "api/ai/chat.js",
  "connector/local-ai-node.mjs",
  "docs/ux-prototype/UPDATED_ARCHITECTURE_AND_BUILD_PLAN.md",
  "docs/nexus/06-source-documents-read.md",
  "product-registry.json",
  "api-config.json",
  "deckbrief-api/server.js",
  "deckbrief-access.html",
  "ceo.html",
  "js/deckbrief-config.js",
  "vercel.json",
];

const missing = required.filter((path) => !existsSync(path));
if (missing.length) {
  console.error("Missing required files:", missing);
  process.exit(1);
}

const registry = readFileSync("assets/js/product-registry.js", "utf8");
for (const status of ["planned", "private-beta", "public-beta", "general-availability"]) {
  if (!registry.includes(status)) {
    console.error(`Product Registry is missing status: ${status}`);
    process.exit(1);
  }
}

const apiCfg = JSON.parse(readFileSync("api-config.json", "utf8"));
if (!apiCfg.api_base_url) {
  console.error("api-config.json missing api_base_url");
  process.exit(1);
}

console.log(`Project check passed. ${required.length} required files found.`);
console.log("Stage 1 UX prototype promoted + DeckBrief API preserved.");
