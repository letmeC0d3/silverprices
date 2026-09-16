const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 3031;

function makeRequest(pathStr) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: pathStr,
        method: 'GET',
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ statusCode: res.statusCode, body }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// We can launch a node script with --expose-gc that imports next standalone server programmatically or inspects it
async function main() {
  const serverPath = path.join(process.cwd(), '.next', 'standalone', 'server.js');
  
  // We will run the server with an inspector or a small wrapper that logs memoryUsage()
  const wrapperScript = `
    const { createServer } = require('http');
    process.env.NODE_ENV = 'production';
    process.env.PORT = '${PORT}';
    
    // Intercept memory logging on demand
    require('${serverPath}');
    
    process.on('message', (msg) => {
      if (msg === 'get-mem') {
        if (global.gc) global.gc();
        const mem = process.memoryUsage();
        process.send(mem);
      }
    });
  `;

  const child = spawn('node', ['--expose-gc', '-e', wrapperScript], {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    env: { ...process.env, NODE_ENV: 'production', PORT: PORT.toString() },
  });

  await sleep(1500);

  function getMem() {
    return new Promise((resolve) => {
      child.once('message', (mem) => resolve(mem));
      child.send('get-mem');
    });
  }

  const memStartup = await getMem();
  console.log('STARTUP_MEM:', JSON.stringify(memStartup));

  await makeRequest('/');
  const memHome = await getMem();
  console.log('HOME_MEM:', JSON.stringify(memHome));

  await makeRequest('/calculator');
  await makeRequest('/silver-rate-in-mumbai');
  await makeRequest('/silver-rate-in-delhi');
  await makeRequest('/silver-rate-in-bangalore');
  const memRoutes = await getMem();
  console.log('ROUTES_MEM:', JSON.stringify(memRoutes));

  for (let i = 0; i < 100; i++) {
    await makeRequest(i % 2 === 0 ? '/' : '/silver-rate-in-mumbai');
  }
  const mem100 = await getMem();
  console.log('REQ100_MEM:', JSON.stringify(mem100));

  for (let i = 0; i < 400; i++) {
    await makeRequest(i % 3 === 0 ? '/' : '/calculator');
  }
  const mem500 = await getMem();
  console.log('REQ500_MEM:', JSON.stringify(mem500));

  for (let i = 0; i < 500; i++) {
    await makeRequest(i % 2 === 0 ? '/' : '/silver-rate-in-delhi');
  }
  const mem1000 = await getMem();
  console.log('REQ1000_MEM:', JSON.stringify(mem1000));

  child.kill();
}

main().catch(console.error);
