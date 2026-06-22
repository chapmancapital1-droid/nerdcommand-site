const router = require('express').Router();
const { pool } = require('../db/queries');
const { requireAuth } = require('../middleware/auth');

// Returns a SQL fragment + params array for scoping leads by account.
// master (accountId == null) → no filter. Pass `lead` alias when joining.
function acct(accountId, { alias = '', leading = false } = {}) {
  if (accountId == null) return { sql: '', params: [] };
  const col = alias ? `${alias}.account_id` : 'account_id';
  return { sql: `${leading ? 'WHERE' : 'AND'} ${col} = $1`, params: [accountId] };
}

// Full CEO command center data — scoped to the caller's account (master sees all)
router.get('/dashboard', requireAuth, async (req, res) => {
  const id = req.account.id;
  try {
    const [pipeline, velocity, bottlenecks, revenueRisk, weeklyTrend, topActions] = await Promise.all([
      getPipelineSnapshot(id),
      getLeadVelocity(id),
      getBottlenecks(id),
      getRevenueAtRisk(id),
      getWeeklyTrend(id),
      getTopActions(id),
    ]);

    res.json({
      generated_at: new Date().toISOString(),
      account: req.account.master ? 'ALL ACCOUNTS' : req.account.name,
      pipeline, velocity, bottlenecks,
      revenue_at_risk: revenueRisk,
      weekly_trend: weeklyTrend,
      top_actions: topActions,
    });
  } catch (err) {
    console.error('[ceo] dashboard error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/activity', requireAuth, async (req, res) => {
  const a = acct(req.account.id, { alias: 'l', leading: true });
  try {
    const { rows } = await pool.query(`
      SELECT e.*, l.first_name, l.last_name, l.business_name, l.email, l.status
      FROM pipeline_events e
      JOIN leads l ON l.id = e.lead_id
      ${a.sql}
      ORDER BY e.created_at DESC LIMIT 50
    `, a.params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/export/leads.csv', requireAuth, async (req, res) => {
  const a = acct(req.account.id, { leading: true });
  try {
    const { rows } = await pool.query(`SELECT * FROM leads ${a.sql} ORDER BY created_at DESC`, a.params);
    const headers = ['id','first_name','last_name','email','business_name','lead_volume','source','status','notes','created_at','updated_at'];
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="deckbrief-leads.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Internal analytics helpers (all account-scoped) ──────────────────────────

async function getPipelineSnapshot(id) {
  const a = acct(id, { leading: true });
  const { rows } = await pool.query(`
    SELECT status, COUNT(*) as count FROM leads ${a.sql} GROUP BY status
  `, a.params);
  const total = rows.reduce((s, r) => s + parseInt(r.count), 0);
  const byStatus = Object.fromEntries(rows.map(r => [r.status, parseInt(r.count)]));
  const winRate = total > 0 ? Math.round(((byStatus.closed_won || 0) / total) * 100) : 0;
  return { total, by_status: byStatus, win_rate_pct: winRate };
}

async function getLeadVelocity(id) {
  const a = acct(id, { leading: true });
  const { rows } = await pool.query(`
    SELECT
      ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600), 1) AS avg_hours_to_update,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS new_this_week,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS new_this_month,
      COUNT(*) FILTER (WHERE status = 'closed_won' AND updated_at > NOW() - INTERVAL '30 days') AS won_this_month
    FROM leads ${a.sql}
  `, a.params);
  return rows[0];
}

async function getBottlenecks(id) {
  const a = acct(id);
  const { rows } = await pool.query(`
    SELECT status, COUNT(*) as stuck_count,
      ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - updated_at)) / 86400), 1) AS avg_days_stale
    FROM leads
    WHERE updated_at < NOW() - INTERVAL '3 days'
      AND status NOT IN ('closed_won', 'closed_lost')
      ${a.sql}
    GROUP BY status ORDER BY avg_days_stale DESC
  `, a.params);
  return rows.map(r => ({
    stage: r.status,
    stuck_leads: parseInt(r.stuck_count),
    avg_days_stale: parseFloat(r.avg_days_stale),
    severity: r.avg_days_stale > 7 ? 'critical' : r.avg_days_stale > 3 ? 'warning' : 'ok',
  }));
}

async function getRevenueAtRisk(id) {
  const a = acct(id);
  const { rows } = await pool.query(`
    SELECT l.id, l.first_name, l.last_name, l.business_name, l.status, l.lead_volume,
      ROUND(EXTRACT(EPOCH FROM (NOW() - l.updated_at)) / 86400, 1) AS days_stale
    FROM leads l
    WHERE l.status IN ('qualified', 'proposal')
      AND l.updated_at < NOW() - INTERVAL '3 days'
      ${acct(id, { alias: 'l' }).sql}
    ORDER BY days_stale DESC LIMIT 10
  `, a.params);
  return {
    count: rows.length,
    leads: rows,
    risk_level: rows.length === 0 ? 'none' : rows.length < 3 ? 'low' : rows.length < 7 ? 'medium' : 'high',
  };
}

async function getWeeklyTrend(id) {
  const a = acct(id);
  const { rows } = await pool.query(`
    SELECT TO_CHAR(DATE_TRUNC('week', created_at), 'Mon DD') AS week_start,
      COUNT(*) AS new_leads,
      COUNT(*) FILTER (WHERE status = 'closed_won') AS won
    FROM leads
    WHERE created_at > NOW() - INTERVAL '8 weeks'
      ${a.sql}
    GROUP BY DATE_TRUNC('week', created_at)
    ORDER BY DATE_TRUNC('week', created_at)
  `, a.params);
  return rows;
}

async function getTopActions(id) {
  const actions = [];

  const cold = await pool.query(`
    SELECT first_name, last_name, business_name, status,
      ROUND(EXTRACT(EPOCH FROM (NOW() - updated_at)) / 86400, 0) AS days_cold
    FROM leads WHERE status IN ('new','contacted') AND updated_at < NOW() - INTERVAL '3 days'
      ${acct(id).sql}
    ORDER BY updated_at ASC LIMIT 3
  `, acct(id).params);
  cold.rows.forEach(l => actions.push({
    priority: 'high', type: 'follow_up',
    label: `Follow up with ${l.first_name} ${l.last_name} (${l.business_name || l.status}) — ${l.days_cold} days cold`,
  }));

  const proposals = await pool.query(`
    SELECT first_name, last_name, business_name,
      ROUND(EXTRACT(EPOCH FROM (NOW() - updated_at)) / 86400, 0) AS days_waiting
    FROM leads WHERE status = 'proposal' AND updated_at < NOW() - INTERVAL '5 days'
      ${acct(id).sql}
    ORDER BY updated_at ASC LIMIT 2
  `, acct(id).params);
  proposals.rows.forEach(l => actions.push({
    priority: 'critical', type: 'close',
    label: `Close or kill proposal with ${l.first_name} ${l.last_name} — ${l.days_waiting} days in proposal`,
  }));

  const newLeads = await pool.query(`
    SELECT COUNT(*) as c FROM leads WHERE status = 'new' AND created_at < NOW() - INTERVAL '24 hours'
      ${acct(id).sql}
  `, acct(id).params);
  if (parseInt(newLeads.rows[0].c) > 0) {
    actions.push({
      priority: 'medium', type: 'qualify',
      label: `${newLeads.rows[0].c} new lead(s) waiting to be qualified`,
    });
  }

  return actions.slice(0, 5);
}

module.exports = router;
