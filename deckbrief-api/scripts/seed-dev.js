/**
 * Pins known keys on the default DeckBrief account for local/CEO testing.
 * Safe to re-run. Production: only run if you intentionally set DEV_SEED=1.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { pool, accounts } = require('../db/queries');

const DEFAULT_ID = '00000000-0000-0000-0000-000000000001';

(async () => {
  if (process.env.DEV_SEED !== '1' && process.env.NODE_ENV === 'production') {
    console.error('[seed-dev] Refusing: set DEV_SEED=1 explicitly (not for prod by default).');
    process.exit(1);
  }

  const adminKey = process.env.DEV_ADMIN_KEY || 'dbk_local_dev_admin_key_change_in_prod';
  const intakeKey = 'deckbrief-default';

  // Ensure schema exists
  const fs = require('fs');
  const path = require('path');
  const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
  await pool.query(sql);

  await pool.query(
    `UPDATE accounts
     SET admin_key = $2, intake_key = $3, active = TRUE, name = COALESCE(name, 'NerdCommand (DeckBrief)')
     WHERE id = $1`,
    [DEFAULT_ID, adminKey, intakeKey]
  );

  const { rows } = await accounts.getById(DEFAULT_ID);
  if (!rows.length) {
    console.error('[seed-dev] Default account missing after schema apply.');
    process.exit(1);
  }

  console.log('[seed-dev] Default account ready');
  console.log('  id:         ', rows[0].id);
  console.log('  name:       ', rows[0].name);
  console.log('  intake_key: ', rows[0].intake_key);
  console.log('  admin_key:  ', rows[0].admin_key);
  console.log('  master key: ', process.env.API_SECRET_KEY ? '(set in .env as API_SECRET_KEY)' : '(NOT SET)');
  console.log('\nCEO dashboard: open ceo.html?api=http://127.0.0.1:3000 and paste admin_key or master key.');

  await pool.end();
})().catch(async (err) => {
  console.error('[seed-dev] FATAL:', err.message);
  try { await pool.end(); } catch {}
  process.exit(1);
});
