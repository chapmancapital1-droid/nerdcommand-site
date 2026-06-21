const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-haiku-4-5-20251001';

async function generateFollowUpDraft(lead) {
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

  const msg = await client.messages.create({
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

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text;
  const html = `<pre style="font-family:monospace;font-size:14px;line-height:1.6;white-space:pre-wrap;">${text}</pre>`;
  return { text, html };
}

module.exports = { generateFollowUpDraft, generateBriefContent };
