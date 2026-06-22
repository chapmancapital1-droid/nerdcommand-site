const { leads: leadQ, briefs: briefQ, events, accounts } = require('../db/queries');
const { generateBriefContent } = require('./ai');
const { sendDailyBrief } = require('./email');

// Generate + send the brief for a single account.
async function runDailyBriefForAccount(accountId, { dryRun = false } = {}) {
  const { rows: account } = await accounts.getById(accountId);
  if (!account.length) {
    console.log(`[brief] account ${accountId} not found — skipping.`);
    return null;
  }
  const acct = account[0];

  const { rows: activeLeads } = await leadQ.getActive(accountId);
  if (!activeLeads.length) {
    console.log(`[brief] ${acct.name}: no active leads — skipping.`);
    return null;
  }

  console.log(`[brief] ${acct.name}: generating brief for ${activeLeads.length} active leads...`);
  const { text, html } = await generateBriefContent(activeLeads);

  if (dryRun) {
    console.log(`\n--- BRIEF PREVIEW (${acct.name}) ---\n`);
    console.log(text);
    console.log('\n--- END PREVIEW ---\n');
    return { text, html, account: acct.name };
  }

  const today = new Date().toISOString().split('T')[0];
  await sendDailyBrief(html, text, today, acct.email);
  const { rows } = await briefQ.insert(accountId, today, acct.email, html);

  for (const lead of activeLeads) {
    await events.insert(lead.id, 'brief_included', null, today);
  }

  console.log(`[brief] ${acct.name}: sent to ${acct.email} (id: ${rows[0]?.id})`);
  return rows[0];
}

// Run the brief for every active account (the cron entry point).
async function runAllDailyBriefs({ dryRun = false } = {}) {
  const { rows: activeAccounts } = await accounts.listActive();
  console.log(`[brief] ${activeAccounts.length} active account(s) to process.`);

  const results = [];
  for (const acct of activeAccounts) {
    try {
      const r = await runDailyBriefForAccount(acct.id, { dryRun });
      if (r) results.push({ account: acct.name, ok: true });
    } catch (err) {
      console.error(`[brief] ${acct.name} failed:`, err.message);
      results.push({ account: acct.name, ok: false, error: err.message });
    }
  }
  return results;
}

module.exports = { runDailyBriefForAccount, runAllDailyBriefs };
