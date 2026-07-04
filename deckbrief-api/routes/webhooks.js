const router = require('express').Router();
const crypto = require('crypto');
const { leads: leadQ, events, accounts } = require('../db/queries');
const { generateFollowUpDraft } = require('../services/ai');
const { sendDraftNotification } = require('../services/email');

/**
 * Universal social lead-ad webhook receiver.
 *
 *   POST /api/webhooks/leads/:platform?account_key=<intake_key>
 *
 * One codebase handles Facebook, Instagram, TikTok, Snapchat, LinkedIn,
 * Google Forms, and a generic fallback. Each platform posts a different
 * payload shape; a per-platform parser normalizes it to our lead schema.
 * Leads route to an account via the intake_key (same key the funnel/form use)
 * and flow into the exact same pipeline as every other lead — event log +
 * async Claude draft + owner notification.
 *
 * Signature verification is optional: if the platform's secret env var is set,
 * the HMAC is enforced; if not, the webhook still accepts leads (so you can
 * wire the ad platform before finishing OAuth/app review). Meta verify handshake
 * (GET) is supported for subscription setup.
 */

const PLATFORM_SECRET_ENV = {
  facebook: 'META_APP_SECRET',
  instagram: 'META_APP_SECRET',
  tiktok: 'TIKTOK_APP_SECRET',
  snapchat: 'SNAPCHAT_CLIENT_SECRET',
  linkedin: 'LINKEDIN_CLIENT_SECRET',
};

// Meta subscription verification handshake
router.get('/leads/:platform', (req, res) => {
  const { platform } = req.params;
  if (platform === 'facebook' || platform === 'instagram') {
    const verifyToken = process.env.META_VERIFY_TOKEN || 'deckbrief-verify';
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === verifyToken) {
      return res.status(200).send(req.query['hub.challenge']);
    }
    return res.sendStatus(403);
  }
  res.json({ ok: true, platform });
});

router.post('/leads/:platform', async (req, res) => {
  const { platform } = req.params;

  // Optional HMAC verification when the platform secret is configured
  const secretEnv = PLATFORM_SECRET_ENV[platform];
  const secret = secretEnv ? process.env[secretEnv] : null;
  if (secret) {
    const ok = verifySignature(platform, req, secret);
    if (!ok) return res.status(403).json({ error: 'Signature verification failed' });
  }

  // Resolve target account from intake_key (defaults to the DeckBrief account)
  const key = (req.query.account_key || req.body.account_key || 'deckbrief-default').trim();
  let accountId;
  try {
    const { rows } = await accounts.byIntakeKey(key);
    if (!rows.length) return res.status(400).json({ error: 'Invalid account key' });
    accountId = rows[0].id;
  } catch (err) {
    return res.status(500).json({ error: 'Account resolution failed' });
  }

  // Parse platform-specific payload into normalized lead(s)
  let parsed;
  try {
    parsed = parsePayload(platform, req.body);
  } catch (err) {
    console.error(`[webhooks:${platform}] parse error:`, err.message);
    return res.status(400).json({ error: 'Could not parse payload' });
  }
  if (!parsed || !parsed.length) {
    // Acknowledge (some platforms send verification/empty pings) — don't 4xx
    return res.json({ success: true, created: 0 });
  }

  let created = 0;
  for (const lead of parsed) {
    if (!lead.email && !lead.first_name) continue;
    try {
      const { rows } = await leadQ.upsert(accountId, {
        first_name: lead.first_name || 'Unknown',
        last_name: lead.last_name || '',
        email: lead.email || `${platform}-${Date.now()}@no-email.lead`,
        business_name: lead.business_name || null,
        lead_volume: lead.lead_volume || null,
        source: `${platform}_ads`,
      });
      const saved = rows[0];
      await events.insert(saved.id, 'status_change', null, 'new');
      created++;

      if (process.env.ANTHROPIC_API_KEY && process.env.RESEND_API_KEY) {
        setImmediate(async () => {
          try {
            const draft = await generateFollowUpDraft(saved);
            await leadQ.setDraft(saved.id, draft);
            await events.insert(saved.id, 'draft_generated', null, 'generated');
            const { rows: acctRows } = await accounts.getById(accountId);
            await sendDraftNotification(saved, draft, acctRows[0]?.email);
          } catch (err) {
            console.error(`[webhooks:${platform}] draft error:`, err.message);
          }
        });
      }
    } catch (err) {
      console.error(`[webhooks:${platform}] upsert error:`, err.message);
    }
  }

  res.json({ success: true, created });
});

// ── Signature verification ───────────────────────────────────────────────────

function verifySignature(platform, req, secret) {
  const raw = req.rawBody || Buffer.from(JSON.stringify(req.body));
  if (platform === 'facebook' || platform === 'instagram') {
    const header = req.headers['x-hub-signature-256'] || '';
    if (!header.startsWith('sha256=')) return false;
    const expected = header.split('=', 2)[1];
    const computed = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    return safeEqual(expected, computed);
  }
  if (platform === 'linkedin') {
    const header = req.headers['x-li-signature'] || '';
    const computed = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    return safeEqual(header, computed);
  }
  if (platform === 'snapchat') {
    const header = req.headers['x-snap-signature'] || '';
    const computed = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    return safeEqual(header, computed);
  }
  if (platform === 'tiktok') {
    const header = req.headers['x-tt-signature'] || '';
    const computed = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    return safeEqual(header, computed);
  }
  return true;
}

function safeEqual(a, b) {
  if (!a || !b) return false;
  const ab = Buffer.from(a), bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// ── Per-platform payload parsers → [{first_name,last_name,email,business_name,lead_volume}] ──

function parsePayload(platform, body) {
  switch (platform) {
    case 'facebook':
    case 'instagram': return parseMeta(body);
    case 'tiktok': return parseTikTok(body);
    case 'snapchat': return parseSnapchat(body);
    case 'linkedin': return parseLinkedIn(body);
    case 'google_forms': return parseGoogleForms(body);
    default: return parseGeneric(body);
  }
}

function fieldMap(fields) {
  // fields: [{name,values:[...]}] or {name:value}
  const out = {};
  if (Array.isArray(fields)) {
    fields.forEach(f => {
      const name = (f.name || f.key || '').toLowerCase();
      const val = Array.isArray(f.values) ? f.values[0] : (f.value ?? f.values);
      out[name] = val;
    });
  } else if (fields && typeof fields === 'object') {
    Object.entries(fields).forEach(([k, v]) => { out[k.toLowerCase()] = v; });
  }
  return out;
}

function normalize(m) {
  const full = m['full_name'] || m['name'] || '';
  let first = m['first_name'] || m['firstname'] || '';
  let last = m['last_name'] || m['lastname'] || '';
  if (!first && full) { const p = String(full).split(' '); first = p[0]; last = p.slice(1).join(' '); }
  return {
    first_name: first || '',
    last_name: last || '',
    email: m['email'] || m['email_address'] || m['work_email'] || '',
    business_name: m['company'] || m['company_name'] || m['business_name'] || m['business'] || null,
    lead_volume: m['lead_volume'] || m['volume'] || null,
  };
}

function parseMeta(body) {
  // Real Meta webhook: entry[].changes[].value.field_data (via Graph API fetch in full impl).
  // Here we accept either already-resolved field_data or a test flat body.
  const leads = [];
  if (body.entry) {
    body.entry.forEach(e => (e.changes || []).forEach(c => {
      const v = c.value || {};
      if (v.field_data) leads.push(normalize(fieldMap(v.field_data)));
    }));
  }
  if (body.field_data) leads.push(normalize(fieldMap(body.field_data)));
  if (!leads.length && (body.email || body.first_name)) leads.push(normalize(fieldMap(body)));
  return leads;
}

function parseTikTok(body) {
  const src = body.data?.field_data || body.field_data || body.fields || body;
  return [normalize(fieldMap(src))];
}

function parseSnapchat(body) {
  const src = body.form_response?.fields || body.fields || body.field_data || body;
  return [normalize(fieldMap(src))];
}

function parseLinkedIn(body) {
  const src = body.leadGenForm?.responses || body.responses || body.field_data || body;
  return [normalize(fieldMap(src))];
}

function parseGoogleForms(body) {
  // Google Apps Script posts {responses:{Question:Answer}} or flat body
  const src = body.responses || body.fields || body;
  return [normalize(fieldMap(src))];
}

function parseGeneric(body) {
  const src = body.fields || body.field_data || body;
  return [normalize(fieldMap(src))];
}

module.exports = router;
