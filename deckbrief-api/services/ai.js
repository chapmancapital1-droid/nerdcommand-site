const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-haiku-4-5-20251001';

let _client = null;
function getClient() {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

function hasAi() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function templateFollowUp(lead) {
  const name = lead.first_name || 'there';
  const biz = lead.business_name || 'your business';
  const vol = lead.lead_volume || 'your inbound';
  return `Subject: Quick setup for ${biz}

Hi ${name},

Thanks for requesting DeckBrief. With roughly ${vol} leads/month, the win is simple: every new lead gets a draft follow-up in minutes, your pipeline stays visible, and you get a morning brief on what needs attention.

I'll keep this short — reply with a 15-minute window this week and we'll wire your first intake path.

— The DeckBrief Team`;
}

function templateBrief(leads) {
  const active = leads.length;
  const overdue = leads.filter((l) => {
    const days = l.time_since_update ? Math.floor(parseFloat(l.time_since_update) / 86400) : 0;
    return days >= 3;
  }).length;
  const top = leads[0];
  const topName = top ? `${top.first_name} ${top.last_name}` : '—';
  const lines = leads.slice(0, 8).map((l) => {
    const days = l.time_since_update ? Math.floor(parseFloat(l.time_since_update) / 86400) : 0;
    return `• ${l.first_name} ${l.last_name} at ${l.business_name || 'Unknown'} — status ${l.status}, ${days}d since update`;
  });
  const text = `PIPELINE SNAPSHOT
- ${active} leads active (new/contacted/qualified)
- ${overdue} leads overdue (no update in 3+ days)
- Top priority today: ${topName}

ACTION LIST (ordered by urgency)
${lines.join('\n') || '• No actions'}

DEALS TO WATCH
Review qualified and proposal stages for stale owners. AI draft was offline — this brief is template-generated.`;
  const html = `<pre style="font-family:monospace;font-size:14px;line-height:1.6;white-space:pre-wrap;">${text}</pre>`;
  return { text, html };
}

async function generateFollowUpDraft(lead) {
  if (!hasAi()) {
    console.warn('[ai] ANTHROPIC_API_KEY missing — using template follow-up');
    return templateFollowUp(lead);
  }
  const prompt = `You are a professional B2B sales assistant writing a follow-up email on behalf of NerdCommand / DeckBrief.

A new lead just signed up. Write a warm, concise follow-up email (3 short paragraphs, no fluff) to send from the DeckBrief team.

Lead details:
- Name: ${lead.first_name} ${lead.last_name}
- Business: ${lead.business_name || 'their company'}
- Monthly lead volume: ${lead.lead_volume || 'unknown'}
- How they found us: ${lead.source || 'DeckBrief website'}

Rules:
- Address them by first name
- Reference their lead volume and what DeckBrief will do for their specific situation
- End with a clear single call-to-action: schedule a 15-minute setup call
- Tone: direct, confident, zero corporate speak
- Subject line on the first line prefixed with "Subject: "
- Then a blank line, then the email body
- Sign off as "The DeckBrief Team"`;

  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  });
  return msg.content[0].text;
}

async function generateBriefContent(leads) {
  if (!leads.length) {
    return { text: 'No active leads today.', html: '<p>No active leads today.</p>' };
  }
  if (!hasAi()) {
    console.warn('[ai] ANTHROPIC_API_KEY missing — using template brief');
    return templateBrief(leads);
  }

  const leadSummaries = leads.map((l, i) => {
    const daysSince = l.time_since_update
      ? Math.floor(parseFloat(l.time_since_update) / 86400)
      : 0;
    return `${i + 1}. ${l.first_name} ${l.last_name} (${l.business_name || 'Unknown Co'})
   Status: ${l.status} | Volume: ${l.lead_volume || 'unknown'} leads/mo
   Days since last update: ${daysSince}
   Notes: ${l.notes || 'none'}`;
  }).join('\n\n');

  const prompt = `You are writing the 7AM DeckBrief daily sales brief for Michael Chapman at NerdCommand.

Active pipeline leads:
${leadSummaries}

Write a clear, scannable morning brief in this exact format:

PIPELINE SNAPSHOT
- X leads active (new/contacted/qualified)
- X leads overdue (no update in 3+ days)
- Top priority today: [name reason]

ACTION LIST (ordered by urgency)
For each lead, one line: "• [Name] at [Company] — [specific action to take today in 10 words or less]"

DEALS TO WATCH
One sentence on any lead showing buying signals or at risk of going cold.

Keep it punchy. No filler. This gets read in 60 seconds.`;

  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text;
  const html = `<pre style="font-family:monospace;font-size:14px;line-height:1.6;white-space:pre-wrap;">${text}</pre>`;
  return { text, html };
}

module.exports = { generateFollowUpDraft, generateBriefContent, hasAi };
