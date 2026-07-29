/**
 * Shared DeckBrief API config loader for static pages.
 * Usage:
 *   <script src="js/deckbrief-config.js"></script>
 *   const API = await window.DeckBriefConfig.getApiBase();
 *
 * Overrides (highest wins):
 *   1. ?api=https://... query param
 *   2. localStorage DECKBRIEF_API
 *   3. hostname localhost / 127.0.0.1 → api_base_url_local
 *   4. api-config.json api_base_url
 *   5. hardcoded fallback
 */
(function (global) {
  const FALLBACK = 'https://deckbrief-api.up.railway.app';
  const CONFIG_PATHS = ['api-config.json', '/api-config.json', './api-config.json'];

  function queryApi() {
    try {
      const u = new URL(global.location.href);
      return u.searchParams.get('api');
    } catch {
      return null;
    }
  }

  function isLocalHost() {
    const h = global.location.hostname;
    return h === 'localhost' || h === '127.0.0.1' || h === '';
  }

  async function loadJson() {
    for (const p of CONFIG_PATHS) {
      try {
        const r = await fetch(p, { cache: 'no-store' });
        if (r.ok) return await r.json();
      } catch {}
    }
    return null;
  }

  async function getApiBase() {
    const q = queryApi();
    if (q) return q.replace(/\/$/, '');

    try {
      const stored = global.localStorage && global.localStorage.getItem('DECKBRIEF_API');
      if (stored) return stored.replace(/\/$/, '');
    } catch {}

    const cfg = await loadJson();
    if (isLocalHost() && cfg && cfg.api_base_url_local) {
      return String(cfg.api_base_url_local).replace(/\/$/, '');
    }
    if (cfg && cfg.api_base_url) {
      return String(cfg.api_base_url).replace(/\/$/, '');
    }
    return FALLBACK;
  }

  async function getIntakeKey() {
    const cfg = await loadJson();
    return (cfg && cfg.intake_key_default) || 'deckbrief-default';
  }

  global.DeckBriefConfig = { getApiBase, getIntakeKey, loadJson };
})(typeof window !== 'undefined' ? window : globalThis);
