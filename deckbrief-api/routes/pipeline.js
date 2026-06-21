const router = require('express').Router();
const { leads: leadQ, briefs: briefQ } = require('../db/queries');
const { runDailyBrief } = require('../services/brief');

function auth(req, res, next) {
  const key = (req.headers.authorization || '').replace('Bearer ', '');
  if (key !== process.env.API_SECRET_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'closed_won', 'closed_lost'];

// Kanban pipeline view — leads grouped by status
router.get('/pipeline', auth, async (req, res) => {
  try {
    const { rows } = await leadQ.getAll();
    const pipeline = {};
    STAGES.forEach(s => { pipeline[s] = []; });
    rows.forEach(lead => { if (pipeline[lead.status]) pipeline[lead.status].push(lead); });
    res.json({ stages: STAGES, pipeline, total: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List past briefs
router.get('/briefs', auth, async (req, res) => {
  try {
    const { rows } = await briefQ.getAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single brief content
router.get('/briefs/:id', auth, async (req, res) => {
  try {
    const { rows } = await briefQ.getById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Brief not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Preview today's brief without sending
router.post('/briefs/preview', auth, async (req, res) => {
  try {
    const result = await runDailyBrief({ dryRun: true });
    res.json(result || { text: 'No active leads', html: '<p>No active leads</p>' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
