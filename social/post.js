/**
 * NerdCommand Social Auto-Poster
 * Posts rotating content to X (Twitter) via API v2.
 *
 * GitHub Secrets required:
 *   X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET
 *
 * Run: node social/post.js [studio|deckbrief|nerdcommand]
 * If no category arg is passed, category rotates by day of week.
 */
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.X_API_KEY;
const API_SECRET = process.env.X_API_SECRET;
const ACCESS_TOKEN = process.env.X_ACCESS_TOKEN;
const ACCESS_SECRET = process.env.X_ACCESS_SECRET;

if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_SECRET) {
  console.error('Missing X API credentials. Set X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET.');
  process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(path.join(__dirname, 'posts.json'), 'utf8'));

// Rotate category by day of week across all 4 brands
function pickCategory() {
  const arg = process.argv[2];
  if (arg && posts[arg]) return arg;
  const day = new Date().getDay(); // 0=Sun, 1=Mon...
  const map = {
    0: 'nerdcommand',
    1: 'studio',
    2: 'deckbrief',
    3: 'nerdcommand_ai',
    4: 'studio',
    5: 'deckbrief',
    6: 'nerdcommand_ai'
  };
  return map[day];
}

// Pick post by rotating on day-of-year
function pickPost(category) {
  const arr = posts[category];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return arr[dayOfYear % arr.length];
}

// OAuth 1.0a signature
function oauthSign(method, url, params) {
  const sorted = Object.keys(params).sort()
    .map(k => `${pct(k)}=${pct(params[k])}`).join('&');
  const base = `${method}&${pct(url)}&${pct(sorted)}`;
  const key = `${pct(API_SECRET)}&${pct(ACCESS_SECRET)}`;
  return crypto.createHmac('sha1', key).update(base).digest('base64');
}

function pct(s) {
  return encodeURIComponent(String(s)).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function buildAuthHeader(method, url, extraParams = {}) {
  const ts = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const oauthParams = {
    oauth_consumer_key: API_KEY,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: ts,
    oauth_token: ACCESS_TOKEN,
    oauth_version: '1.0',
  };
  const allParams = { ...oauthParams, ...extraParams };
  oauthParams.oauth_signature = oauthSign(method, url, allParams);
  const header = 'OAuth ' + Object.keys(oauthParams).sort()
    .map(k => `${pct(k)}="${pct(oauthParams[k])}"`).join(', ');
  return header;
}

async function tweet(text) {
  const url = 'https://api.twitter.com/2/tweets';
  const body = JSON.stringify({ text });
  const auth = buildAuthHeader('POST', url);

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('Posted:', JSON.parse(data)?.data?.id);
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  const category = pickCategory();
  const post = pickPost(category);
  console.log(`Category: ${category}`);
  console.log(`Text preview: ${post.text.slice(0, 80)}...`);

  if (process.env.DRY_RUN === '1') {
    console.log('DRY RUN — not posting. Full text:\n', post.text);
    return;
  }

  await tweet(post.text);
  console.log('Done.');
})().catch(err => {
  console.error('Post failed:', err.message);
  process.exit(1);
});
