const router = require('express').Router();
const { leads: leadQ, briefs: briefQ } = require('../db/queries');
const { runDailyBriefForAccount } = require('../services/brief');
const { requireAuth } = require('../middleware/auth');

const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'closed_won', 'closed_lost'];

// Kanban pipeline view — leads grouped by status, scoped to the account
router.get('/pipeline', requireAuth, async (req, res) => {
  try {
    const { rows } = await leadQ.getAll(req.account.id);
    const pipeline = {};
    STAGES.forEach(s => { pipeline[s] = []; });
    rows.forEach(lead => { if (pipeline[lead.status]) pipeline[lead.status].push(lead); });
    res.json({ stages: STAGES, pipeline, total: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/briefs', requireAuth, async (req, res) => {
  try {
    const { rows } = await briefQ.getAll(req.account.id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/briefs/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await briefQ.getById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Brief not found' });
    // scoped callers may only read their own brief
    if (req.account.id != null && rows[0].account_id !== req.account.id) {
      return res.status(404).json({ error: 'Brief not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Preview today's brief for the caller's account without sending
router.post('/briefs/preview', requireAuth, async (req, res) => {
  try {
    const accountId = req.account.id || '00000000-0000-0000-0000-000000000001';
    const result = await runDailyBriefForAccount(accountId, { dryRun: true });
    res.json(result || { text: 'No active leads', html: '<p>No active leads</p>' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
