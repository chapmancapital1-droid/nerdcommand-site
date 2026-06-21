const router = require('express').Router();
const { leads: leadQ, events } = require('../db/queries');
const { generateFollowUpDraft } = require('../services/ai');
const { sendDraftNotification } = require('../services/email');

function auth(req, res, next) {
  const key = (req.headers.authorization || '').replace('Bearer ', '');
  if (key !== process.env.API_SECRET_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Public — receives form submission
router.post('/', async (req, res) => {
  const { first_name, last_name, email, business_name, lead_volume, source } = req.body;
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'first_name, last_name, and email are required' });
  }

  try {
    const { rows } = await leadQ.upsert({ first_name, last_name, email, business_name, lead_volume, source: source || 'deckbrief-page' });
    const lead = rows[0];

    await events.insert(lead.id, 'status_change', null, 'new');

    // Generate draft and notify — non-blocking
    if (process.env.ANTHROPIC_API_KEY && process.env.RESEND_API_KEY) {
      setImmediate(async () => {
        try {
          const draft = await generateFollowUpDraft(lead);
          await leadQ.setDraft(lead.id, draft);
          await events.insert(lead.id, 'draft_generated', null, 'generated');
          await sendDraftNotification(lead, draft);
        } catch (err) {
          console.error('[leads] draft/notify error:', err.message);
        }
      });
    }

    res.json({ success: true, id: lead.id });
  } catch (err) {
    console.error('[leads] POST error:', err.message);
    res.status(500).json({ error: 'Failed to save lead' });
  }
});

// Protected — list all leads
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await leadQ.getAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected — get single lead with event timeline
router.get('/:id', auth, async (req, res) => {
  try {
    const { rows } = await leadQ.getById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Lead not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected — update status or notes
router.patch('/:id', auth, async (req, res) => {
  try {
    const { rows: current } = await leadQ.getById(req.params.id);
    if (!current.length) return res.status(404).json({ error: 'Lead not found' });

    const { rows } = await leadQ.update(req.params.id, req.body);
    if (!rows.length) return res.status(400).json({ error: 'No valid fields to update' });

    if (req.body.status && req.body.status !== current[0].status) {
      await events.insert(req.params.id, 'status_change', current[0].status, req.body.status);
    }
    if (req.body.notes) {
      await events.insert(req.params.id, 'note_added', null, req.body.notes);
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected — regenerate AI draft
router.post('/:id/draft', auth, async (req, res) => {
  try {
    const { rows } = await leadQ.getById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Lead not found' });

    const draft = await generateFollowUpDraft(rows[0]);
    await leadQ.setDraft(req.params.id, draft);
    await events.insert(req.params.id, 'draft_generated', null, 'regenerated');

    res.json({ draft });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
