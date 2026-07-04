const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : false,
});

const q = (text, params) => pool.query(text, params);

// Builds a WHERE/AND clause that scopes by account unless accountId is null (master).
// Returns { clause, params } where clause is '' for master or 'account_id = $N'.
function scope(accountId, startIdx = 1) {
  if (accountId == null) return { clause: '', param: null, nextIdx: startIdx };
  return { clause: `account_id = $${startIdx}`, param: accountId, nextIdx: startIdx + 1 };
}

const accounts = {
  create: (name, email, adminKey, intakeKey) => q(
    `INSERT INTO accounts (name, email, admin_key, intake_key)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [name, email, adminKey, intakeKey]
  ),
  byAdminKey: (key) => q(`SELECT * FROM accounts WHERE admin_key = $1 AND active = TRUE`, [key]),
  byIntakeKey: (key) => q(`SELECT * FROM accounts WHERE intake_key = $1 AND active = TRUE`, [key]),
  getById: (id) => q(`SELECT * FROM accounts WHERE id = $1`, [id]),
  list: () => q(`SELECT id, name, email, intake_key, active, created_at,
                   (SELECT COUNT(*) FROM leads WHERE leads.account_id = accounts.id) AS lead_count
                 FROM accounts ORDER BY created_at DESC`),
  listActive: () => q(`SELECT * FROM accounts WHERE active = TRUE ORDER BY created_at`),
  setActive: (id, active) => q(`UPDATE accounts SET active = $2 WHERE id = $1 RETURNING *`, [id, active]),
};

const leads = {
  // account_id is required on insert (resolved from intake_key)
  upsert: (accountId, data) => q(
    `INSERT INTO leads (account_id, first_name, last_name, email, business_name, lead_volume, source)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (account_id, email) DO UPDATE SET
       first_name = EXCLUDED.first_name,
       last_name  = EXCLUDED.last_name,
       business_name = COALESCE(EXCLUDED.business_name, leads.business_name),
       lead_volume   = COALESCE(EXCLUDED.lead_volume, leads.lead_volume),
       updated_at = NOW()
     RETURNING *`,
    [accountId, data.first_name, data.last_name, data.email, data.business_name, data.lead_volume, data.source]
  ),

  setDraft: (id, draft) => q(
    `UPDATE leads SET ai_draft = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, draft]
  ),

  getAll: (accountId) => {
    const s = scope(accountId);
    const where = s.clause ? `WHERE ${s.clause}` : '';
    return q(
      `SELECT * FROM leads ${where} ORDER BY
         CASE status WHEN 'new' THEN 0 WHEN 'contacted' THEN 1 WHEN 'qualified' THEN 2
                     WHEN 'proposal' THEN 3 WHEN 'closed_won' THEN 4 ELSE 5 END,
         created_at DESC`,
      s.param != null ? [s.param] : []
    );
  },

  // getById is account-checked: master (null) sees any; scoped must match account.
  getById: (id, accountId) => {
    const params = [id];
    let extra = '';
    if (accountId != null) { params.push(accountId); extra = ' AND l.account_id = $2'; }
    return q(
      `SELECT l.*, json_agg(e ORDER BY e.created_at DESC) FILTER (WHERE e.id IS NOT NULL) AS events
       FROM leads l LEFT JOIN pipeline_events e ON e.lead_id = l.id
       WHERE l.id = $1${extra} GROUP BY l.id`,
      params
    );
  },

  update: (id, fields) => {
    const allowed = ['status', 'notes', 'ai_draft'];
    const sets = [], vals = [id];
    Object.entries(fields).forEach(([k, v]) => {
      if (allowed.includes(k)) { vals.push(v); sets.push(`${k} = $${vals.length}`); }
    });
    if (!sets.length) return Promise.resolve({ rows: [] });
    return q(`UPDATE leads SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`, vals);
  },

  getActive: (accountId) => {
    const s = scope(accountId);
    const where = s.clause ? `WHERE status IN ('new','contacted','qualified') AND ${s.clause}`
                           : `WHERE status IN ('new','contacted','qualified')`;
    return q(
      `SELECT *, NOW() - updated_at AS time_since_update
       FROM leads ${where} ORDER BY updated_at ASC`,
      s.param != null ? [s.param] : []
    );
  },
};

const events = {
  insert: (lead_id, event_type, old_value, new_value) => q(
    `INSERT INTO pipeline_events (lead_id, event_type, old_value, new_value) VALUES ($1,$2,$3,$4) RETURNING *`,
    [lead_id, event_type, old_value, new_value]
  ),

  recent: (accountId, limit = 50) => {
    const params = [];
    let where = '';
    if (accountId != null) { params.push(accountId); where = 'WHERE l.account_id = $1'; }
    params.push(limit);
    return q(
      `SELECT e.*, l.first_name, l.last_name, l.business_name, l.email, l.status
       FROM pipeline_events e JOIN leads l ON l.id = e.lead_id
       ${where} ORDER BY e.created_at DESC LIMIT $${params.length}`,
      params
    );
  },
};

const briefs = {
  insert: (accountId, brief_date, recipient_email, content) => q(
    `INSERT INTO briefs (account_id, brief_date, recipient_email, content, sent_at)
     VALUES ($1,$2,$3,$4,NOW()) RETURNING *`,
    [accountId, brief_date, recipient_email, content]
  ),

  getAll: (accountId) => {
    const s = scope(accountId);
    const where = s.clause ? `WHERE ${s.clause}` : '';
    return q(
      `SELECT id, account_id, brief_date, recipient_email, sent_at FROM briefs ${where}
       ORDER BY brief_date DESC LIMIT 30`,
      s.param != null ? [s.param] : []
    );
  },

  getById: (id) => q(`SELECT * FROM briefs WHERE id = $1`, [id]),
};

const funnels = {
  create: (accountId, name, slug, type) => q(
    `INSERT INTO funnels (account_id, name, slug, type) VALUES ($1,$2,$3,$4) RETURNING *`,
    [accountId, name, slug, type || 'single']
  ),

  list: (accountId) => {
    const s = scope(accountId);
    const where = s.clause ? `WHERE ${s.clause}` : '';
    return q(`SELECT * FROM funnels ${where} ORDER BY created_at DESC`, s.param != null ? [s.param] : []);
  },

  // Full funnel with steps, account-checked (null accountId = master/public-internal)
  getById: (id, accountId) => {
    const params = [id];
    let extra = '';
    if (accountId != null) { params.push(accountId); extra = ' AND account_id = $2'; }
    return q(`SELECT * FROM funnels WHERE id = $1${extra}`, params);
  },

  getBySlug: (slug) => q(`SELECT * FROM funnels WHERE slug = $1`, [slug]),

  update: (id, accountId, fields) => {
    const allowed = ['name', 'type', 'status', 'theme', 'thank_you_message'];
    const sets = [], vals = [id, accountId];
    Object.entries(fields).forEach(([k, v]) => {
      if (allowed.includes(k)) {
        vals.push(k === 'theme' ? JSON.stringify(v) : v);
        sets.push(`${k} = $${vals.length}${k === 'theme' ? '::jsonb' : ''}`);
      }
    });
    if (!sets.length) return Promise.resolve({ rows: [] });
    return q(`UPDATE funnels SET ${sets.join(', ')} WHERE id = $1 AND account_id = $2 RETURNING *`, vals);
  },

  remove: (id, accountId) => q(`DELETE FROM funnels WHERE id = $1 AND account_id = $2 RETURNING id`, [id, accountId]),

  incViews: (id) => q(`UPDATE funnels SET views = views + 1 WHERE id = $1`, [id]),
  incSubmissions: (id) => q(`UPDATE funnels SET submissions = submissions + 1 WHERE id = $1`, [id]),
};

const funnelSteps = {
  listByFunnel: (funnelId) => q(
    `SELECT * FROM funnel_steps WHERE funnel_id = $1 ORDER BY step_order ASC`, [funnelId]
  ),
  create: (funnelId, stepOrder, title, blocks, ctaText) => q(
    `INSERT INTO funnel_steps (funnel_id, step_order, title, blocks, cta_button_text)
     VALUES ($1,$2,$3,$4::jsonb,$5) RETURNING *`,
    [funnelId, stepOrder, title, JSON.stringify(blocks || []), ctaText || 'Submit']
  ),
  update: (id, funnelId, fields) => {
    const sets = [], vals = [id, funnelId];
    if (fields.title !== undefined) { vals.push(fields.title); sets.push(`title = $${vals.length}`); }
    if (fields.blocks !== undefined) { vals.push(JSON.stringify(fields.blocks)); sets.push(`blocks = $${vals.length}::jsonb`); }
    if (fields.cta_button_text !== undefined) { vals.push(fields.cta_button_text); sets.push(`cta_button_text = $${vals.length}`); }
    if (fields.step_order !== undefined) { vals.push(fields.step_order); sets.push(`step_order = $${vals.length}`); }
    if (!sets.length) return Promise.resolve({ rows: [] });
    return q(`UPDATE funnel_steps SET ${sets.join(', ')} WHERE id = $1 AND funnel_id = $2 RETURNING *`, vals);
  },
  remove: (id, funnelId) => q(`DELETE FROM funnel_steps WHERE id = $1 AND funnel_id = $2 RETURNING id`, [id, funnelId]),
  removeAllForFunnel: (funnelId) => q(`DELETE FROM funnel_steps WHERE funnel_id = $1`, [funnelId]),
};

const funnelMedia = {
  create: (funnelId, mediaType, filename, mimeType, data) => q(
    `INSERT INTO funnel_media (funnel_id, media_type, filename, mime_type, data)
     VALUES ($1,$2,$3,$4,$5) RETURNING id, media_type, filename, mime_type`,
    [funnelId, mediaType, filename, mimeType, data]
  ),
  get: (id) => q(`SELECT * FROM funnel_media WHERE id = $1`, [id]),
};

module.exports = { pool, scope, accounts, leads, events, briefs, funnels, funnelSteps, funnelMedia };
