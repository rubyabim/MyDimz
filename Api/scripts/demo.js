#!/usr/bin/env node
// scripts/demo.js
// Start server (if not already), wait for health, login and print token
const { spawn } = require('child_process');
const http = require('http');
const fetch = global.fetch || require('node-fetch');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const port = (args[0] && Number(args[0])) || 5000;
const username = args[1] || 'admin';
const password = args[2] || 'admin123';
const baseUrl = `http://127.0.0.1:${port}`;
const distServer = path.resolve(__dirname, '../dist/server.js');
let serverProcess = null;

function urlCheck(url, timeout = 250) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve(res.statusCode));
    });
    req.on('error', () => resolve(null));
    req.setTimeout(timeout, () => {
      req.destroy();
      resolve(null);
    });
  });
}

async function waitForHealth(url, timeoutMs = 20_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const status = await urlCheck(url);
    if (status === 200) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function ensureDistBuilt() {
  if (!fs.existsSync(distServer)) {
    console.log('dist/server.js not found — building TypeScript...');
    const tsc = spawn(process.execPath, [path.resolve(__dirname, '../node_modules/typescript/bin/tsc')], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
    });
    await new Promise((resolve, reject) => {
      tsc.on('exit', (code) => (code === 0 ? resolve() : reject(new Error('tsc build failed'))));
    });
  }
}

async function startServerIfNeeded() {
  const healthUrl = `${baseUrl}/health`;
  const status = await urlCheck(healthUrl, 200);
  if (status === 200) {
    console.log('Server already running at', baseUrl);
    return false; // didn't start
  }

  console.log('Starting server...');
  serverProcess = spawn(process.execPath, [distServer], {
    cwd: path.resolve(__dirname, '..'),
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(port) },
  });

  serverProcess.stdout.on('data', (d) => {
    process.stdout.write(`[server] ${d}`);
  });
  serverProcess.stderr.on('data', (d) => {
    process.stderr.write(`[server-err] ${d}`);
  });

  return true; // started
}

async function loginAndPrintToken() {
  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const json = await res.json();
    if (!res.ok) {
      console.error('Login failed:', json);
      return null;
    }
    console.log('Token:');
    console.log(json.token);
    return json.token;
  } catch (err) {
    console.error('Login request error:', err.message || err);
    return null;
  }
}

(async () => {
  try {
    await ensureDistBuilt();
    const started = await startServerIfNeeded();
    const ok = await waitForHealth(`${baseUrl}/health`, 20000);
    if (!ok) {
      throw new Error('Server did not respond on /health within timeout');
    }
    await loginAndPrintToken();
    if (started && serverProcess) {
      console.log('Stopping server started by demo script');
      serverProcess.kill();
    }
    process.exit(0);
  } catch (err) {
    console.error('Demo failed:', err.message || err);
    if (serverProcess) serverProcess.kill();
    process.exit(1);
  }
})();
