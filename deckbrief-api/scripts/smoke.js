/**
 * Smoke test against a running DeckBrief API (default http://127.0.0.1:3000).
 * Usage: node scripts/smoke.js
 *        BASE_URL=https://your.railway.app MASTER_KEY=... node scripts/smoke.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const MASTER = process.env.MASTER_KEY || process.env.API_SECRET_KEY || 'dev-master-key-change-me-in-production';

async function req(method, path, body, auth) {
  const headers = { Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  if (auth) headers.Authorization = `Bearer ${auth}`;
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: r.status, json };
}

(async () => {
  let fail = 0;
  const pass = (name) => console.log(`  PASS  ${name}`);
  const bad = (name, detail) => { console.log(`  FAIL  ${name} — ${detail}`); fail++; };

  console.log(`[smoke] ${BASE}\n`);

  const health = await req('GET', '/health');
  if (health.status === 200 && health.json.status === 'ok') pass('GET /health');
  else bad('GET /health', JSON.stringify(health.json));

  const pub = await req('GET', '/api/config/public');
  if (pub.status === 200 && pub.json.product === 'DeckBrief') pass('GET /api/config/public');
  else bad('GET /api/config/public', JSON.stringify(pub.json));

  const email = `smoke-${Date.now()}@example.com`;
  const lead = await req('POST', '/api/leads', {
    first_name: 'Smoke',
    last_name: 'Test',
    email,
    business_name: 'NerdCommand Smoke Co',
    lead_volume: '10-50',
    source: 'smoke-test',
    account_key: 'deckbrief-default',
  });
  if (lead.status === 200 && lead.json.success && lead.json.id) pass('POST /api/leads');
  else bad('POST /api/leads', JSON.stringify(lead.json));

  const list = await req('GET', '/api/leads', null, MASTER);
  if (list.status === 200 && Array.isArray(list.json)) pass('GET /api/leads (auth)');
  else bad('GET /api/leads (auth)', `${list.status} ${JSON.stringify(list.json)}`);

  const pipe = await req('GET', '/api/pipeline', null, MASTER);
  if (pipe.status === 200 && pipe.json.stages) pass('GET /api/pipeline');
  else bad('GET /api/pipeline', JSON.stringify(pipe.json));

  const dash = await req('GET', '/api/ceo/dashboard', null, MASTER);
  if (dash.status === 200 && dash.json.pipeline) pass('GET /api/ceo/dashboard');
  else bad('GET /api/ceo/dashboard', JSON.stringify(dash.json));

  const unauth = await req('GET', '/api/leads');
  if (unauth.status === 401) pass('GET /api/leads rejects without auth');
  else bad('GET /api/leads rejects without auth', String(unauth.status));

  console.log(`\n[smoke] ${fail === 0 ? 'ALL PASS' : fail + ' FAILED'}\n`);
  process.exit(fail === 0 ? 0 : 1);
})().catch((err) => {
  console.error('[smoke] FATAL:', err.message);
  process.exit(1);
});
