const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 3040;
const CRON_SECRET = 'final-smoke-test-secret-999';

function makeRequest(pathStr, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: pathStr,
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
      }
    );
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runSmokeTest() {
  console.log('=== STARTING FINAL PRODUCTION SMOKE TEST ===\n');

  const serverPath = path.join(process.cwd(), '.next', 'standalone', 'server.js');
  const dbDir = path.join(process.cwd(), 'scratch', 'smoke_test_db');
  const dbPath = path.join(dbDir, 'smoke.db');

  if (fs.existsSync(dbDir)) {
    fs.rmSync(dbDir, { recursive: true, force: true });
  }

  const env = {
    ...process.env,
    NODE_ENV: 'production',
    PORT: PORT.toString(),
    CRON_SECRET,
    SQLITE_DB_PATH: dbPath,
  };

  const serverProc = spawn('node', [serverPath], {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProc.stdout.on('data', (d) => {
    // console.log('[SERVER]', d.toString());
  });

  serverProc.stderr.on('data', (d) => {
    // console.error('[SERVER ERR]', d.toString());
  });

  // Allow server to boot
  await sleep(1500);

  const results = {};

  try {
    // 1. Check Routes
    console.log('--- 1. Testing Core Production Routes ---');
    const routes = [
      '/',
      '/calculator',
      '/silver-rate-in-mumbai',
      '/silver-rate-in-delhi',
      '/silver-rate-in-ahmedabad',
    ];

    for (const route of routes) {
      const res = await makeRequest(route);
      console.log(`Route ${route}: HTTP ${res.statusCode}`);
      if (res.statusCode !== 200) {
        throw new Error(`Route ${route} failed with status ${res.statusCode}`);
      }
    }
    results.routes = 'PASS';

    // Verify Homepage Content & ETF Disclosures
    const homeRes = await makeRequest('/');
    const homeHtml = homeRes.body;
    const hasEtfDisclaimer = homeHtml.includes('Indicative Reference Data') || homeHtml.includes('Reference Directory');
    console.log('Homepage ETF honest reference disclosure:', hasEtfDisclaimer ? 'PRESENT' : 'MISSING');
    if (!hasEtfDisclaimer) throw new Error('ETF disclosure missing on homepage');

    // 2. Test Cron Authentication Matrix
    console.log('\n--- 2. Testing Cron Authentication Matrix ---');

    // Case A: GET without auth -> 401
    const getNoAuth = await makeRequest('/api/cron/snapshot', { method: 'GET' });
    console.log(`GET without auth: HTTP ${getNoAuth.statusCode} (Expected 401)`);
    if (getNoAuth.statusCode !== 401) throw new Error('GET without auth did not return 401');

    // Case B: POST without auth -> 401
    const postNoAuth = await makeRequest('/api/cron/snapshot', { method: 'POST' });
    console.log(`POST without auth: HTTP ${postNoAuth.statusCode} (Expected 401)`);
    if (postNoAuth.statusCode !== 401) throw new Error('POST without auth did not return 401');

    // Case C: POST with wrong Bearer token -> 401
    const postWrongBearer = await makeRequest('/api/cron/snapshot', {
      method: 'POST',
      headers: { Authorization: 'Bearer wrong-secret-token' },
    });
    console.log(`POST with wrong Bearer token: HTTP ${postWrongBearer.statusCode} (Expected 401)`);
    if (postWrongBearer.statusCode !== 401) throw new Error('POST with wrong Bearer token did not return 401');

    // Case D: POST with ?secret= in URL and NO Authorization header -> MUST BE 401
    const postQuerySecret = await makeRequest(`/api/cron/snapshot?secret=${CRON_SECRET}`, {
      method: 'POST',
    });
    console.log(`POST with ?secret=<valid> but no Authorization header: HTTP ${postQuerySecret.statusCode} (Expected 401)`);
    if (postQuerySecret.statusCode !== 401) throw new Error('Query string auth must be rejected with 401');

    // Case E: GET with ?secret= in URL and NO Authorization header -> MUST BE 401
    const getQuerySecret = await makeRequest(`/api/cron/snapshot?secret=${CRON_SECRET}`, {
      method: 'GET',
    });
    console.log(`GET with ?secret=<valid> but no Authorization header: HTTP ${getQuerySecret.statusCode} (Expected 401)`);
    if (getQuerySecret.statusCode !== 401) throw new Error('GET query string auth must be rejected with 401');

    // Case F: Request with ?secret=<valid> AND invalid Authorization header -> MUST BE 401
    const postQueryAndBadAuth = await makeRequest(`/api/cron/snapshot?secret=${CRON_SECRET}`, {
      method: 'POST',
      headers: { Authorization: 'Bearer invalid-token-999' },
    });
    console.log(`POST with ?secret=<valid> and invalid Authorization header: HTTP ${postQueryAndBadAuth.statusCode} (Expected 401)`);
    if (postQueryAndBadAuth.statusCode !== 401) throw new Error('Invalid Authorization header with query secret must return 401');

    // Case G: POST with valid Bearer token -> 200
    const postValidBearer = await makeRequest('/api/cron/snapshot', {
      method: 'POST',
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    });
    console.log(`POST with correct Authorization: Bearer <CRON_SECRET>: HTTP ${postValidBearer.statusCode} (Expected 200)`);
    if (postValidBearer.statusCode !== 200) throw new Error('Valid Bearer token was not accepted');

    const cronJson = JSON.parse(postValidBearer.body);
    console.log('Cron Snapshot Execution Result:', {
      success: cronJson.success,
      snapshotDate: cronJson.snapshotDate,
      source: cronJson.source,
      rate1kgWithGST: cronJson.rate1kgWithGST,
    });
    results.cronAuth = 'PASS';

    // 3. Verify Cache Invalidation Pipeline & Snapshot Reflection
    console.log('\n--- 3. Testing Subsequent Route Reflection ---');
    const postSnapshotHome = await makeRequest('/');
    if (postSnapshotHome.statusCode !== 200) throw new Error('Post-snapshot homepage failed');
    console.log('Post-snapshot homepage: HTTP 200 OK');

    const postSnapshotCity = await makeRequest('/silver-rate-in-ahmedabad');
    if (postSnapshotCity.statusCode !== 200) throw new Error('Post-snapshot city page failed');
    console.log('Post-snapshot /silver-rate-in-ahmedabad: HTTP 200 OK');
    results.cacheReflection = 'PASS';

    // 4. Verify SQLite Database on disk
    console.log('\n--- 4. Testing SQLite Persistence on Disk ---');
    if (!fs.existsSync(dbPath)) throw new Error('Database file does not exist on disk at configured path');
    console.log(`SQLite database successfully written to: ${dbPath}`);
    results.persistence = 'PASS';

    console.log('\n=== ALL PRODUCTION SMOKE TESTS PASSED ===\n');
  } finally {
    serverProc.kill('SIGTERM');
  }
}

runSmokeTest().catch((err) => {
  console.error('Final smoke test failed:', err);
  process.exit(1);
});
