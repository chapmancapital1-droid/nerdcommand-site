const router = require('express').Router();
const crypto = require('crypto');
const { accounts } = require('../db/queries');
const { requireMaster } = require('../middleware/auth');

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'account';
}

// Create a customer account. Returns the keys ONCE — store them now.
router.post('/accounts', requireMaster, async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });

  const adminKey = 'dbk_' + crypto.randomBytes(24).toString('hex');
  const intakeKey = slugify(name) + '-' + crypto.randomBytes(4).toString('hex');

  try {
    const { rows } = await accounts.create(name, email, adminKey, intakeKey);
    const a = rows[0];
    res.json({
      id: a.id,
      name: a.name,
      email: a.email,
      admin_key: a.admin_key,      // give to the customer for their dashboard / sheet
      intake_key: a.intake_key,    // embed in their lead-capture form
      note: 'Save these keys now — admin_key is not retrievable later.',
    });
  } catch (err) {
    console.error('[admin] create error:', err.message);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// List all accounts with lead counts (keys not exposed except intake_key)
router.get('/accounts', requireMaster, async (req, res) => {
  try {
    const { rows } = await accounts.list();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Activate / deactivate an account
router.patch('/accounts/:id', requireMaster, async (req, res) => {
  try {
    const { rows } = await accounts.setActive(req.params.id, req.body.active !== false);
    if (!rows.length) return res.status(404).json({ error: 'Account not found' });
    res.json({ id: rows[0].id, active: rows[0].active });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
