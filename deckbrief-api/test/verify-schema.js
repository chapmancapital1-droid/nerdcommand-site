/**
 * Schema + multi-tenant isolation verification.
 *
 * Runs the REAL schema.sql against a Postgres instance, then exercises the
 * query layer to prove: account scoping isolates tenants, the master view
 * sees everything, per-account email uniqueness works, and the migration
 * ALTERs are idempotent (script runs schema twice).
 *
 * Usage:
 *   TEST_DATABASE_URL=postgresql://user:pass@localhost:5432/deckbrief_test npm run verify
 *
 * No Postgres handy? Spin a throwaway one with Docker:
 *   docker run --rm -d --name db_verify -e POSTGRES_PASSWORD=test \
 *     -e POSTGRES_DB=deckbrief_test -p 5433:5432 postgres:16
 *   TEST_DATABASE_URL=postgresql://postgres:test@localhost:5433/deckbrief_test npm run verify
 *   docker stop db_verify
 *
 * Exit 0 = all checks pass. Exit 1 = a check failed (details printed).
 */
const fs = require('fs');
const path = require('path');

const url = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
if (!url) {
  console.error('Set TEST_DATABASE_URL (or DATABASE_URL) to a Postgres connection string. See header for a Docker one-liner.');
  process.exit(1);
}
process.env.DATABASE_URL = url;

const { pool, accounts, leads, briefs, events } = require('../db/queries');

const DEFAULT_ID = '00000000-0000-0000-0000-000000000001';
let passed = 0, failed = 0;

function check(name, cond) {
  if (cond) { console.log(`  PASS  ${name}`); passed++; }
  else { console.log(`  FAIL  ${name}`); failed++; }
}

async function applySchema() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
  await pool.query(sql);
}

(async () => {
  console.log('\n[verify] Applying schema (1st pass)...');
  await applySchema();

  console.log('[verify] Applying schema again (idempotency check)...');
  try {
    await applySchema();
    check('schema.sql is idempotent (runs twice without error)', true);
  } catch (err) {
    check(`schema.sql is idempotent — ERROR: ${err.message}`, false);
  }

  // Clean any prior test rows
  await pool.query(`DELETE FROM leads WHERE email LIKE '%@verify.test'`);
  await pool.query(`DELETE FROM accounts WHERE email LIKE '%@verify.test'`);

  console.log('\n[verify] Seeded default account exists...');
  const def = await accounts.getById(DEFAULT_ID);
  check('default account seeded with fixed UUID', def.rows.length === 1);
  check('default account intake_key = deckbrief-default', def.rows[0]?.intake_key === 'deckbrief-default');

  console.log('\n[verify] Create two tenant accounts...');
  const a1 = (await accounts.create('Acme Co', 'a@verify.test', 'dbk_acme_' + Date.now(), 'acme-' + Date.now())).rows[0];
  const a2 = (await accounts.create('Beta Co', 'b@verify.test', 'dbk_beta_' + Date.now(), 'beta-' + Date.now())).rows[0];
  check('account A created', !!a1.id);
  check('account B created', !!a2.id && a2.id !== a1.id);

  console.log('\n[verify] Insert leads into each account...');
  await leads.upsert(a1.id, { first_name: 'A1', last_name: 'One', email: 'lead1@verify.test', business_name: 'Acme', lead_volume: '10-50', source: 'test' });
  await leads.upsert(a1.id, { first_name: 'A2', last_name: 'Two', email: 'lead2@verify.test', business_name: 'Acme', lead_volume: '50-200', source: 'test' });
  await leads.upsert(a2.id, { first_name: 'B1', last_name: 'One', email: 'lead1@verify.test', business_name: 'Beta', lead_volume: '200+', source: 'test' });

  console.log('\n[verify] TENANT ISOLATION...');
  const a1Leads = (await leads.getAll(a1.id)).rows;
  const a2Leads = (await leads.getAll(a2.id)).rows;
  check('account A sees exactly its 2 leads', a1Leads.length === 2);
  check('account B sees exactly its 1 lead', a2Leads.length === 1);
  check('account A leads all belong to A', a1Leads.every(l => l.account_id === a1.id));
  check('account B cannot see A leads', !a2Leads.some(l => l.account_id === a1.id));

  console.log('\n[verify] SAME EMAIL across accounts is allowed (composite uniqueness)...');
  const sharedA = a1Leads.find(l => l.email === 'lead1@verify.test');
  const sharedB = a2Leads.find(l => l.email === 'lead1@verify.test');
  check('lead1@verify.test exists in BOTH accounts as distinct rows', !!sharedA && !!sharedB && sharedA.id !== sharedB.id);

  console.log('\n[verify] UPSERT same (account,email) updates, not duplicates...');
  await leads.upsert(a1.id, { first_name: 'A1-updated', last_name: 'One', email: 'lead1@verify.test', business_name: 'Acme', lead_volume: '10-50', source: 'test' });
  const a1After = (await leads.getAll(a1.id)).rows;
  check('account A still has 2 leads after re-upsert (no dupe)', a1After.length === 2);
  check('re-upsert updated first_name', a1After.some(l => l.first_name === 'A1-updated'));

  console.log('\n[verify] MASTER view sees everything...');
  const allLeads = (await leads.getAll(null)).rows;
  const testLeads = allLeads.filter(l => l.email.endsWith('@verify.test'));
  check('master (null scope) sees all 3 test leads', testLeads.length === 3);

  console.log('\n[verify] getById is account-checked...');
  const okScoped = (await leads.getById(sharedA.id, a1.id)).rows;
  const crossScoped = (await leads.getById(sharedA.id, a2.id)).rows;
  check('account A can read its own lead by id', okScoped.length === 1);
  check('account B CANNOT read account A lead by id', crossScoped.length === 0);
  check('master can read any lead by id', (await leads.getById(sharedA.id, null)).rows.length === 1);

  console.log('\n[verify] getActive scoping (brief source)...');
  const a1Active = (await leads.getActive(a1.id)).rows;
  check('account A active leads scoped to A', a1Active.every(l => l.account_id === a1.id) && a1Active.length === 2);

  console.log('\n[verify] briefs scoping...');
  await briefs.insert(a1.id, '2026-06-21', 'a@verify.test', '<p>A brief</p>');
  await briefs.insert(a2.id, '2026-06-21', 'b@verify.test', '<p>B brief</p>');
  check('account A sees only its brief', (await briefs.getAll(a1.id)).rows.length === 1);
  check('master sees both test briefs', (await briefs.getAll(null)).rows.filter(b => b.recipient_email.endsWith('@verify.test')).length === 2);

  // Cleanup
  console.log('\n[verify] Cleaning up test data...');
  await pool.query(`DELETE FROM leads WHERE email LIKE '%@verify.test'`);
  await pool.query(`DELETE FROM briefs WHERE recipient_email LIKE '%@verify.test'`);
  await pool.query(`DELETE FROM accounts WHERE email LIKE '%@verify.test'`);

  console.log(`\n[verify] ${passed} passed, ${failed} failed.\n`);
  await pool.end();
  process.exit(failed === 0 ? 0 : 1);
})().catch(async (err) => {
  console.error('\n[verify] FATAL:', err.message);
  try { await pool.end(); } catch {}
  process.exit(1);
});
