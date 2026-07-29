# DeckBrief code audit — KEEP / EXTRACT / REFACTOR / REWRITE / RETIRE

**Date:** 2026-07-28  
**Scope:** `deckbrief-api/` + DeckBrief-related static HTML

| Module | Classification | Notes |
|--------|----------------|-------|
| `db/schema.sql` accounts/leads/events/briefs | **KEEP** | Multi-tenant core solid |
| `db/queries.js` | **KEEP** | Scope helper is correct pattern for OS |
| `middleware/auth.js` | **KEEP** → later **EXTRACT** into OS auth package | Master + admin_key model works for MVP |
| `routes/leads.js` | **KEEP** | Intake + CRM |
| `routes/pipeline.js` | **KEEP** | Pipeline + brief preview |
| `routes/ceo.js` | **KEEP** | Dashboard analytics |
| `routes/admin.js` | **KEEP** | Account provisioning |
| `routes/webhooks.js` | **KEEP** | Social lead adapters |
| `routes/funnels.js` | **KEEP** | Landing builder |
| `services/ai.js` | **KEEP** + **REFACTOR** done (template fallback) | Later → AI Gateway |
| `services/email.js` | **KEEP** + **REFACTOR** done (skip without key) | Resend remains SoR |
| `services/brief.js` | **KEEP** → Stage 6 Command Brief Engine | |
| `jobs/daily-brief.js` | **KEEP** | Cron entry |
| `tools/business-os-sheet.js` | **KEEP** | Google Sheets bridge |
| Static `deckbrief.html` | **KEEP** | Marketing + intake |
| Static `ceo.html` | **KEEP** | Internal dashboard |
| Funnel HTML | **KEEP** | |
| Hardcoded Railway URL in HTML | **REWRITE** done | → `api-config.json` + loader |
| Full OS Commands model | **REWRITE** later (Stage 3) | Not in DeckBrief MVP |
| Localhost AI from Vercel | **RETIRE** as idea | Never implement |

## Summary

DeckBrief is the **first production product slice** of NerdCommand OS, not a throwaway. Kernel extracts cleanly into OS later; do not rewrite the CRM/brief path without a migration plan.
