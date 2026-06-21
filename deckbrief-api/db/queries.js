const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : false,
});

const q = (text, params) => pool.query(text, params);

const leads = {
  upsert: (data) => q(
    `INSERT INTO leads (first_name, last_name, email, business_name, lead_volume, source)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (email) DO UPDATE SET
       first_name = EXCLUDED.first_name,
       last_name  = EXCLUDED.last_name,
       business_name = COALESCE(EXCLUDED.business_name, leads.business_name),
       lead_volume   = COALESCE(EXCLUDED.lead_volume, leads.lead_volume),
       updated_at = NOW()
     RETURNING *`,
    [data.first_name, data.last_name, data.email, data.business_name, data.lead_volume, data.source]
  ),

  setDraft: (id, draft) => q(
    `UPDATE leads SET ai_draft = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, draft]
  ),

  getAll: () => q(
    `SELECT * FROM leads ORDER BY
       CASE status WHEN 'new' THEN 0 WHEN 'contacted' THEN 1 WHEN 'qualified' THEN 2
                   WHEN 'proposal' THEN 3 WHEN 'closed_won' THEN 4 ELSE 5 END,
       created_at DESC`
  ),

  getById: (id) => q(
    `SELECT l.*, json_agg(e ORDER BY e.created_at DESC) FILTER (WHERE e.id IS NOT NULL) AS events
     FROM leads l LEFT JOIN pipeline_events e ON e.lead_id = l.id
     WHERE l.id = $1 GROUP BY l.id`,
    [id]
  ),

  update: (id, fields) => {
    const allowed = ['status', 'notes', 'ai_draft'];
    const sets = [], vals = [id];
    Object.entries(fields).forEach(([k, v]) => {
      if (allowed.includes(k)) { vals.push(v); sets.push(`${k} = $${vals.length}`); }
    });
    if (!sets.length) return Promise.resolve({ rows: [] });
    return q(`UPDATE leads SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`, vals);
  },

  getActive: () => q(
    `SELECT *, NOW() - updated_at AS time_since_update
     FROM leads WHERE status IN ('new','contacted','qualified')
     ORDER BY updated_at ASC`
  ),
};

const events = {
  insert: (lead_id, event_type, old_value, new_value) => q(
    `INSERT INTO pipeline_events (lead_id, event_type, old_value, new_value) VALUES ($1,$2,$3,$4) RETURNING *`,
    [lead_id, event_type, old_value, new_value]
  ),
};

const briefs = {
  insert: (brief_date, recipient_email, content) => q(
    `INSERT INTO briefs (brief_date, recipient_email, content, sent_at) VALUES ($1,$2,$3,NOW()) RETURNING *`,
    [brief_date, recipient_email, content]
  ),

  getAll: () => q(`SELECT id, brief_date, recipient_email, sent_at FROM briefs ORDER BY brief_date DESC LIMIT 30`),

  getById: (id) => q(`SELECT * FROM briefs WHERE id = $1`, [id]),
};

module.exports = { pool, leads, events, briefs };
