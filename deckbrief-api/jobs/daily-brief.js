require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { runDailyBrief } = require('../services/brief');
const { pool } = require('../db/queries');

(async () => {
  const dryRun = process.env.DRY_RUN === '1';
  console.log(`[daily-brief] Starting${dryRun ? ' (DRY RUN)' : ''}...`);
  try {
    await runDailyBrief({ dryRun });
    console.log('[daily-brief] Done.');
  } catch (err) {
    console.error('[daily-brief] Failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
