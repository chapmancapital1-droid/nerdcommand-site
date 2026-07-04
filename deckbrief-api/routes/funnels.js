const router = require('express').Router();
const crypto = require('crypto');
const { funnels: fQ, funnelSteps: sQ, funnelMedia: mQ, leads: leadQ, events, accounts } = require('../db/queries');
const { generateFollowUpDraft } = require('../services/ai');
const { sendDraftNotification } = require('../services/email');
const { requireAuth } = require('../middleware/auth');

function slugify(name) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'funnel';
  return `${base}-${crypto.randomBytes(3).toString('hex')}`;
}

// ── Protected CRUD (account-scoped) ──────────────────────────────────────────

router.post('/', requireAuth, async (req, res) => {
  if (req.account.id == null) return res.status(400).json({ error: 'Create funnels from a specific account, not the master key' });
  const { name, type } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const { rows } = await fQ.create(req.account.id, name, slugify(name), type);
    const funnel = rows[0];
    // seed one step
    await sQ.create(funnel.id, 0, 'Step 1', [], type === 'multistep' ? 'Continue' : 'Submit');
    res.json(funnel);
  } catch (err) {
    console.error('[funnels] create error:', err.message);
    res.status(500).json({ error: 'Failed to create funnel' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await fQ.list(req.account.id);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await fQ.getById(req.params.id, req.account.id);
    if (!rows.length) return res.status(404).json({ error: 'Funnel not found' });
    const { rows: steps } = await sQ.listByFunnel(req.params.id);
    res.json({ ...rows[0], steps });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await fQ.update(req.params.id, req.account.id, req.body);
    if (!rows.length) return res.status(404).json({ error: 'Funnel not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await fQ.remove(req.params.id, req.account.id);
    if (!rows.length) return res.status(404).json({ error: 'Funnel not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/publish', requireAuth, async (req, res) => {
  try {
    const { rows } = await fQ.update(req.params.id, req.account.id, { status: 'published' });
    if (!rows.length) return res.status(404).json({ error: 'Funnel not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/unpublish', requireAuth, async (req, res) => {
  try {
    const { rows } = await fQ.update(req.params.id, req.account.id, { status: 'draft' });
    if (!rows.length) return res.status(404).json({ error: 'Funnel not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Ownership guard for step/media ops
async function ownFunnel(req, res, next) {
  const { rows } = await fQ.getById(req.params.id, req.account.id);
  if (!rows.length) return res.status(404).json({ error: 'Funnel not found' });
  next();
}

router.post('/:id/steps', requireAuth, ownFunnel, async (req, res) => {
  try {
    const { rows: existing } = await sQ.listByFunnel(req.params.id);
    const order = existing.length;
    const { rows } = await sQ.create(req.params.id, order, req.body.title || `Step ${order + 1}`, req.body.blocks || [], req.body.cta_button_text);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/steps/:stepId', requireAuth, ownFunnel, async (req, res) => {
  try {
    const { rows } = await sQ.update(req.params.stepId, req.params.id, req.body);
    if (!rows.length) return res.status(404).json({ error: 'Step not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id/steps/:stepId', requireAuth, ownFunnel, async (req, res) => {
  try {
    const { rows } = await sQ.remove(req.params.stepId, req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Step not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Media upload — base64 in body { media_type, filename, mime_type, data_base64 }
router.post('/:id/media', requireAuth, ownFunnel, async (req, res) => {
  const { media_type, filename, mime_type, data_base64 } = req.body;
  if (!media_type || !data_base64) return res.status(400).json({ error: 'media_type and data_base64 required' });
  try {
    const buf = Buffer.from(data_base64, 'base64');
    const { rows } = await mQ.create(req.params.id, media_type, filename, mime_type, buf);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Media serve — public (used inside funnel pages)
router.get('/media/:mediaId', async (req, res) => {
  try {
    const { rows } = await mQ.get(req.params.mediaId);
    if (!rows.length) return res.sendStatus(404);
    res.setHeader('Content-Type', rows[0].mime_type || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(rows[0].data);
  } catch (err) { res.sendStatus(500); }
});

// Analytics
router.get('/:id/analytics', requireAuth, async (req, res) => {
  try {
    const { rows } = await fQ.getById(req.params.id, req.account.id);
    if (!rows.length) return res.status(404).json({ error: 'Funnel not found' });
    const f = rows[0];
    const conv = f.views > 0 ? Math.round((f.submissions / f.views) * 100) : 0;
    res.json({ views: f.views, submissions: f.submissions, conversion_pct: conv });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Public (no auth) — serve funnel + capture lead ───────────────────────────

router.get('/public/:slug', async (req, res) => {
  try {
    const { rows } = await fQ.getBySlug(req.params.slug);
    if (!rows.length || rows[0].status !== 'published') return res.status(404).json({ error: 'Funnel not found' });
    const funnel = rows[0];
    await fQ.incViews(funnel.id);
    const { rows: steps } = await sQ.listByFunnel(funnel.id);
    // Do not leak account_id to the public payload
    const { account_id, ...safe } = funnel;
    res.json({ ...safe, steps });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/public/:slug/submit', async (req, res) => {
  try {
    const { rows } = await fQ.getBySlug(req.params.slug);
    if (!rows.length || rows[0].status !== 'published') return res.status(404).json({ error: 'Funnel not found' });
    const funnel = rows[0];

    const { first_name, last_name, email, business_name, lead_volume } = req.body;
    if (!email && !first_name) return res.status(400).json({ error: 'email or name required' });

    const platform = detectPlatform(req);
    const { rows: lr } = await leadQ.upsert(funnel.account_id, {
      first_name: first_name || 'Unknown',
      last_name: last_name || '',
      email: email || `funnel-${Date.now()}@no-email.lead`,
      business_name: business_name || null,
      lead_volume: lead_volume || null,
      source: `funnel:${funnel.slug}:${platform}`,
    });
    const saved = lr[0];
    await events.insert(saved.id, 'status_change', null, 'new');
    await fQ.incSubmissions(funnel.id);

    if (process.env.ANTHROPIC_API_KEY && process.env.RESEND_API_KEY) {
      setImmediate(async () => {
        try {
          const draft = await generateFollowUpDraft(saved);
          await leadQ.setDraft(saved.id, draft);
          await events.insert(saved.id, 'draft_generated', null, 'generated');
          const { rows: acctRows } = await accounts.getById(funnel.account_id);
          await sendDraftNotification(saved, draft, acctRows[0]?.email);
        } catch (err) { console.error('[funnels] draft error:', err.message); }
      });
    }

    res.json({ success: true, thank_you_message: funnel.thank_you_message });
  } catch (err) {
    console.error('[funnels] submit error:', err.message);
    res.status(500).json({ error: 'Submission failed' });
  }
});

function detectPlatform(req) {
  const explicit = (req.body.platform || req.query.platform || '').toLowerCase();
  if (explicit) return explicit;
  const utm = (req.query.utm_source || req.body.utm_source || '').toLowerCase();
  if (utm) return utm;
  const ref = (req.headers.referer || req.headers.referrer || '').toLowerCase();
  if (ref.includes('facebook') || ref.includes('fb.')) return 'facebook';
  if (ref.includes('instagram')) return 'instagram';
  if (ref.includes('tiktok')) return 'tiktok';
  if (ref.includes('snapchat')) return 'snapchat';
  if (ref.includes('linkedin')) return 'linkedin';
  if (ref.includes('t.co') || ref.includes('twitter') || ref.includes('x.com')) return 'twitter';
  return 'direct';
}

module.exports = router;
