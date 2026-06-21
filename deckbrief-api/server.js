require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db/queries');
const { leads: leadQ, briefs: briefQ } = require('./db/queries');

const app = express();

app.use(cors({
  origin: [
    'https://chapmancapital1-droid.github.io',
    'https://nerdcommand.com',
    'https://deckbrief.nerdcommand.com',
    'http://localhost:3000',
    'http://127.0.0.1:5500',
  ],
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

app.use('/api/leads', require('./routes/leads'));
app.use('/api', require('./routes/pipeline'));

app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

async function start() {
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
  });
}

start();
