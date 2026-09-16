const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 3030;
const CRON_SECRET = 'prod-hardening-secret-xyz';

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

function getProcessMemory(pid) {
  return new Promise((resolve, reject) => {
    const ps = spawn('ps', ['-p', pid.toString(), '-o', 'rss=']);
    let out = '';
    ps.stdout.on('data', (d) => (out += d.toString()));
    ps.on('close', (code) => {
      if (code === 0) {
        const kb = parseInt(out.trim(), 10) || 0;
        resolve((kb / 1024).toFixed(2)); // MB
      } else {
        reject(new Error(`ps exited with code ${code}`));
      }
    });
  });
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('=== STARTING PRODUCTION HARDENING V1 RUNTIME VERIFICATION ===\n');

  // Spawn standalone server with --expose-gc enabled
  const serverPath = path.join(process.cwd(), '.next', 'standalone', 'server.js');
  const env = {
    ...process.env,
    NODE_ENV: 'production',
    PORT: PORT.toString(),
    CRON_SECRET,
    SQLITE_DB_PATH: path.join(process.cwd(), 'data', 'silver.db'),
  };

  const serverProc = spawn('node', ['--expose-gc', serverPath], {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProc.stdout.on('data', (d) => {
    const str = d.toString();
    if (str.includes('Listening') || str.includes('Ready') || str.includes('started')) {
      // server is ready
    }
  });

  serverProc.stderr.on('data', (d) => {
    // console.error('[SERVER STDERR]', d.toString());
  });

  // Wait for server to boot
  await sleep(1500);

  const pid = serverProc.pid;
  console.log(`Server launched with PID: ${pid} on port ${PORT}`);

  try {
    // 1. Startup RSS
    const startupRss = await getProcessMemory(pid);
    console.log(`1. Startup RSS: ${startupRss} MB`);

    await sleep(2000);
    const idleRss = await getProcessMemory(pid);
    console.log(`2. Idle RSS (after 2s): ${idleRss} MB`);

    // 3. Homepage Request
    const homeRes = await makeRequest('/');
    const afterHomeRss = await getProcessMemory(pid);
    console.log(`3. Homepage Request: Status ${homeRes.statusCode}, RSS: ${afterHomeRss} MB`);

    // Check Security Headers
    console.log('\n--- HTTP Security Headers Verification ---');
    console.log('x-content-type-options:', homeRes.headers['x-content-type-options']);
    console.log('x-frame-options:', homeRes.headers['x-frame-options']);
    console.log('referrer-policy:', homeRes.headers['referrer-policy']);
    console.log('permissions-policy:', homeRes.headers['permissions-policy'] ? 'present' : 'missing');
    console.log('x-powered-by header:', homeRes.headers['x-powered-by'] || 'absent (correct)');

    // 4. Calculator Request
    const calcRes = await makeRequest('/calculator');
    const afterCalcRss = await getProcessMemory(pid);
    console.log(`\n4. Calculator Request: Status ${calcRes.statusCode}, RSS: ${afterCalcRss} MB`);

    // 5. Unique City Routes
    const cityRoutes = [
      '/silver-rate-in-mumbai',
      '/silver-rate-in-delhi',
      '/silver-rate-in-chennai',
      '/silver-rate-in-kolkata',
      '/silver-rate-in-bengaluru',
    ];
    for (const route of cityRoutes) {
      const res = await makeRequest(route);
      if (res.statusCode !== 200) console.error(`Error on ${route}: ${res.statusCode}`);
    }
    const afterCitiesRss = await getProcessMemory(pid);
    console.log(`5. After 5 Unique City Routes: RSS: ${afterCitiesRss} MB`);

    // 6. 100 Requests
    console.log('\nRunning 100 requests...');
    for (let i = 0; i < 100; i++) {
      const route = cityRoutes[i % cityRoutes.length];
      await makeRequest(route);
    }
    const after100Rss = await getProcessMemory(pid);
    console.log(`6. After 100 requests: RSS: ${after100Rss} MB`);

    // 7. 500 Requests
    console.log('Running 400 more requests (total 500)...');
    for (let i = 0; i < 400; i++) {
      const route = i % 2 === 0 ? '/' : cityRoutes[i % cityRoutes.length];
      await makeRequest(route);
    }
    const after500Rss = await getProcessMemory(pid);
    console.log(`7. After 500 requests: RSS: ${after500Rss} MB`);

    // 8. 1000 Requests
    console.log('Running 500 more requests (total 1000)...');
    for (let i = 0; i < 500; i++) {
      const route = i % 3 === 0 ? '/calculator' : (i % 3 === 1 ? '/' : cityRoutes[i % cityRoutes.length]);
      await makeRequest(route);
    }
    const after1000Rss = await getProcessMemory(pid);
    console.log(`8. After 1000 requests: RSS: ${after1000Rss} MB`);

    // 9. Cron Endpoint Auth Verification
    console.log('\n--- Cron Endpoint Authentication Verification ---');
    // A. Unauthorized (no token)
    const cronNoAuth = await makeRequest('/api/cron/snapshot', { method: 'POST' });
    console.log(`Cron (no auth): Status ${cronNoAuth.statusCode} (Expected 401)`);

    // B. Invalid token
    const cronBadAuth = await makeRequest('/api/cron/snapshot', {
      method: 'POST',
      headers: { Authorization: 'Bearer invalid-token-123' },
    });
    console.log(`Cron (bad token): Status ${cronBadAuth.statusCode} (Expected 401)`);

    // C. Valid Bearer token
    const cronValidAuth = await makeRequest('/api/cron/snapshot', {
      method: 'POST',
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    });
    console.log(`Cron (valid Bearer): Status ${cronValidAuth.statusCode} (Expected 200)`);
    try {
      const body = JSON.parse(cronValidAuth.body);
      console.log('Cron response:', JSON.stringify(body, null, 2));
    } catch (e) {
      console.log('Cron raw response:', cronValidAuth.body);
    }

    // 10. Memory Stabilization Test after 1000 requests & forced GC
    console.log('\nChecking memory stabilization after load...');
    await sleep(2000);
    const postLoadRss = await getProcessMemory(pid);
    console.log(`RSS 2s post-load: ${postLoadRss} MB`);

    console.log('\n=== RUNTIME VERIFICATION COMPLETE ===\n');
  } finally {
    serverProc.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
