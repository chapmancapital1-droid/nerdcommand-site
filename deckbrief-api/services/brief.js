const { leads: leadQ, briefs: briefQ, events } = require('../db/queries');
const { generateBriefContent } = require('./ai');
const { sendDailyBrief } = require('./email');

async function runDailyBrief({ dryRun = false } = {}) {
  const { rows: activeLeads } = await leadQ.getActive();

  if (!activeLeads.length) {
    console.log('[brief] No active leads — skipping.');
    return null;
  }

  console.log(`[brief] Generating brief for ${activeLeads.length} active leads...`);
  const { text, html } = await generateBriefContent(activeLeads);

  if (dryRun) {
    console.log('\n--- BRIEF PREVIEW ---\n');
    console.log(text);
    console.log('\n--- END PREVIEW ---\n');
    return { text, html };
  }

  const today = new Date().toISOString().split('T')[0];
  const recipient = process.env.BRIEF_RECIPIENT_EMAIL || 'chapmancapital1@gmail.com';

  await sendDailyBrief(html, text, today);
  const { rows } = await briefQ.insert(today, recipient, html);

  for (const lead of activeLeads) {
    await events.insert(lead.id, 'brief_included', null, today);
  }

  console.log(`[brief] Sent to ${recipient} and saved (id: ${rows[0]?.id})`);
  return rows[0];
}

module.exports = { runDailyBrief };
