#!/usr/bin/env node
// scripts/get-token.js
// Usage: node ./scripts/get-token.js [username] [password]
const args = process.argv.slice(2);
const username = args[0] || 'admin';
const password = args[1] || 'admin123';
const baseUrl = process.env.API_URL || 'http://localhost:5000';

// pick global fetch if available, otherwise require node-fetch
let fetchFn = globalThis.fetch;
if (!fetchFn) fetchFn = require('node-fetch');

async function main() {
  try {
    const res = await fetchFn(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const json = await res.json();
    if (!res.ok) {
      console.error('Login failed', JSON.stringify(json, null, 2));
      process.exit(1);
    }
    console.log(json.token);
  } catch (err) {
    console.error('Request error', err.message || err);
    process.exit(1);
  }
}

main();
