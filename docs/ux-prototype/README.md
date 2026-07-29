# NerdCommand UX Prototype v0.1.0

This repository begins the public-facing `NerdCommand.com` experience and the UX shell for NerdCommand OS. It is a Vercel-ready, dependency-light prototype that demonstrates the approved information architecture, product-registry lock, dashboard navigation, AI runtime status, and local-model integration boundary.

## What is included

- Public website: Home, Platform, Foundry, Deckbrief, Pricing, and Company sections.
- NerdCommand OS shell with fifteen UX dashboard views.
- Shared visual language and responsive design system.
- Product Registry that controls public feature visibility.
- Vercel server functions for AI health and chat routing.
- Local AI node that supports Ollama or LM Studio through OpenAI-compatible endpoints.
- Updated architecture, UX route map, Vercel deployment, and AI integration documents.

## Important architecture rule

A production Vercel deployment cannot call `localhost` on a founder's or customer's computer. The production design therefore uses this path:

```text
Browser on Vercel
  -> NerdCommand OS AI Gateway
  -> queued, signed AI job
  -> outbound local AI node
  -> LM Studio or Ollama on localhost
  -> result returned to NerdCommand OS
  -> audited UI response
```

The included local node also offers a direct local-development bridge. Direct bridge mode must not be exposed publicly.

## Run the frontend locally

```bash
npm run dev
```

Open:

- Public website: `http://127.0.0.1:4173/`
- OS dashboard: `http://127.0.0.1:4173/app/`

## Run a local AI node

Start Ollama or LM Studio first. Copy `.env.example` to `.env` and configure the provider/model, then run:

```bash
npm run ai:local
```

The node listens on `127.0.0.1:8787` by default and proxies OpenAI-compatible model calls. The static UX falls back to a labeled demo response when the Vercel AI function is not available.

## Deploy on Vercel

Import this repository into Vercel. The root directory is the repository root. Configure `AI_MODE=mock` for the first public preview. Change to `AI_MODE=gateway` only when a reachable NerdCommand OS AI Gateway is available.

## Prototype status

The dashboards contain synthetic prototype data. They are UX specifications, not claims of a complete backend. Product statuses shown to the public are controlled by `assets/js/product-registry.js`.
