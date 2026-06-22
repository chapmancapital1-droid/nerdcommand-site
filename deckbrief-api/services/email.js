const { Resend } = require('resend');

let _resend = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || 'placeholder');
  return _resend;
}
const FROM = 'DeckBrief <noreply@nerdcommand.info>';
const OWNER = process.env.BRIEF_RECIPIENT_EMAIL || 'chapmancapital1@gmail.com';

async function sendDraftNotification(lead, draft, recipient) {
  const to = recipient || OWNER;
  const lines = draft.split('\n');
  const subjectLine = lines.find(l => l.startsWith('Subject:')) || 'Subject: New Lead Follow-Up';
  const subject = subjectLine.replace('Subject:', '').trim();
  const body = lines.filter(l => !l.startsWith('Subject:')).join('\n').trim();

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `[DeckBrief] New lead: ${lead.first_name} ${lead.last_name} — draft ready`,
    html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
  <div style="background:#F5A623;padding:12px 20px;border-radius:8px 8px 0 0;">
    <strong style="color:#fff;font-size:16px;">New Lead — DeckBrief</strong>
  </div>
  <div style="background:#f9f9f9;padding:20px;border:1px solid #e0e0e0;">
    <table style="width:100%;font-size:14px;border-collapse:collapse;">
      <tr><td style="padding:4px 0;color:#666;">Name</td><td style="padding:4px 0;font-weight:600;">${lead.first_name} ${lead.last_name}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Email</td><td style="padding:4px 0;"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
      <tr><td style="padding:4px 0;color:#666;">Business</td><td style="padding:4px 0;">${lead.business_name || '—'}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Lead volume</td><td style="padding:4px 0;">${lead.lead_volume || '—'}/month</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Source</td><td style="padding:4px 0;">${lead.source || '—'}</td></tr>
    </table>
  </div>
  <div style="background:#fff;padding:20px;border:1px solid #e0e0e0;border-top:none;">
    <p style="font-size:13px;color:#888;margin:0 0 8px;">CLAUDE-DRAFTED FOLLOW-UP — review and send</p>
    <p style="font-size:13px;color:#666;margin:0 0 4px;"><strong>Subject:</strong> ${subject}</p>
    <hr style="border:none;border-top:1px solid #eee;margin:12px 0;">
    <div style="font-size:14px;line-height:1.7;white-space:pre-wrap;">${body}</div>
  </div>
  <div style="padding:12px 20px;background:#f0f0f0;border-radius:0 0 8px 8px;font-size:12px;color:#999;">
    Reply to this email to send to ${lead.email} — or log into DeckBrief to update pipeline status.
  </div>
</div>`,
  });
}

async function sendDailyBrief(briefHtml, briefText, date, recipient) {
  const to = recipient || OWNER;
  const dateStr = new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  await getResend().emails.send({
    from: FROM,
    to,
    subject: `DeckBrief — ${dateStr}`,
    html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
  <div style="background:#0A0A0E;padding:16px 20px;border-radius:8px 8px 0 0;display:flex;align-items:center;gap:12px;">
    <strong style="color:#F5A623;font-size:18px;">DeckBrief</strong>
    <span style="color:#888;font-size:13px;">${dateStr}</span>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px;">
    ${briefHtml}
  </div>
</div>`,
    text: `DeckBrief — ${dateStr}\n\n${briefText}`,
  });
}

module.exports = { sendDraftNotification, sendDailyBrief };
