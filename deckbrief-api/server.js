require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db/queries');
const { hasAi } = require('./services/ai');
const { hasEmail } = require('./services/email');

const app = express();

const staticOrigins = [
  'https://chapmancapital1-droid.github.io',
  'https://nerdcommand.com',
  'https://www.nerdcommand.com',
  'https://deckbrief.nerdcommand.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
];

function isAllowedOrigin(origin) {
  if (!origin) return true; // curl / server-to-server
  if (staticOrigins.includes(origin)) return true;
  // Vercel previews + production project domains
  if (/^https:\/\/[\w-]+(-[\w]+)*\.vercel\.app$/.test(origin)) return true;
  if (/^https:\/\/[\w.-]+\.github\.io$/.test(origin)) return true;
  return false;
}

app.use(cors({
  origin(origin, cb) {
    if (isAllowedOrigin(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Capture raw body so webhook HMAC signatures can be verified against exact bytes
app.use(express.json({
  limit: '25mb',
  verify: (req, _res, buf) => { req.rawBody = buf; },
}));
app.use(express.urlencoded({ extended: true }));

app.get('/health', async (req, res) => {
  let db = 'unknown';
  try {
    await pool.query('SELECT 1');
    db = 'ok';
  } catch (err) {
    db = `error: ${err.message}`;
  }
  const ok = db === 'ok';
  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'degraded',
    product: 'DeckBrief',
    version: '1.0.0',
    ts: new Date().toISOString(),
    db,
    features: {
      ai: hasAi(),
      email: hasEmail(),
      master_key: Boolean(process.env.API_SECRET_KEY),
    },
  });
});

app.get('/api/config/public', (req, res) => {
  res.json({
    product: 'DeckBrief',
    version: '1.0.0',
    intake_key_hint: 'deckbrief-default',
    features: { ai: hasAi(), email: hasEmail() },
  });
});

app.use('/api/leads', require('./routes/leads'));
app.use('/api', require('./routes/pipeline'));
app.use('/api/ceo', require('./routes/ceo'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/funnels', require('./routes/funnels'));

app.use((err, req, res, next) => {
  if (err && String(err.message || '').startsWith('CORS blocked')) {
    return res.status(403).json({ error: err.message });
  }
  console.error('[error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

async function start() {
  if (!process.env.DATABASE_URL) {
    console.error('[deckbrief-api] DATABASE_URL is required. See .env.example');
    process.exit(1);
  }
  if (!process.env.API_SECRET_KEY) {
    console.warn('[deckbrief-api] WARNING: API_SECRET_KEY not set — protected routes will reject all tokens');
  }

  // Run migrations on startup
  try {
    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('[db] schema ready');
  } catch (err) {
    console.error('[db] migration error:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`[deckbrief-api] listening on port ${PORT}`);
    console.log(`[deckbrief-api] health → http://127.0.0.1:${PORT}/health`);
    console.log(`[deckbrief-api] features ai=${hasAi()} email=${hasEmail()}`);
  });
}

start();
