const { accounts } = require('../db/queries');

/**
 * Resolves the Bearer token on protected routes.
 *
 *  - Token === API_SECRET_KEY  → master/super-admin. Sees ALL accounts' data.
 *      req.account = { master: true, id: null }
 *  - Token === some account.admin_key (and active) → scoped to that account.
 *      req.account = { master: false, id, name, email }
 *  - Otherwise → 401.
 *
 * Downstream queries pass req.account.id as the scope. When master is true,
 * the scope is null and queries skip the account filter (platform-wide view).
 */
async function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  if (token === process.env.API_SECRET_KEY) {
    req.account = { master: true, id: null };
    return next();
  }

  try {
    const { rows } = await accounts.byAdminKey(token);
    if (!rows.length) return res.status(401).json({ error: 'Unauthorized' });
    const a = rows[0];
    req.account = { master: false, id: a.id, name: a.name, email: a.email };
    return next();
  } catch (err) {
    console.error('[auth] error:', err.message);
    return res.status(500).json({ error: 'Auth check failed' });
  }
}

/** Master key only — for account management endpoints. */
function requireMaster(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (token && token === process.env.API_SECRET_KEY) return next();
  return res.status(401).json({ error: 'Master key required' });
}

/**
 * Resolves the public intake_key on lead submission to an account_id.
 * Falls back to the default account so the main deckbrief.html form keeps
 * working even if no key is supplied.
 */
async function resolveIntake(req, res, next) {
  const key = (req.body.account_key || req.query.account_key || 'deckbrief-default').trim();
  try {
    const { rows } = await accounts.byIntakeKey(key);
    if (!rows.length) return res.status(400).json({ error: 'Invalid account key' });
    req.intakeAccountId = rows[0].id;
    return next();
  } catch (err) {
    console.error('[intake] error:', err.message);
    return res.status(500).json({ error: 'Intake resolution failed' });
  }
}

module.exports = { requireAuth, requireMaster, resolveIntake };
