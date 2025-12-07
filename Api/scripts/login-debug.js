#!/usr/bin/env node
// scripts/login-debug.js
const http = require('http');

const data = JSON.stringify({ username: 'admin', password: 'admin123' });
const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
};

const req = http.request(options, (res) => {
  console.log('statusCode:', res.statusCode);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('body:', body);
  });
});

req.on('error', (err) => console.error('Request error', err));
req.write(data);
req.end();
