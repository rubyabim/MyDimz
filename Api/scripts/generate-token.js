#!/usr/bin/env node
// scripts/generate-token.js
// Usage: node ./scripts/generate-token.js [userId] [username] [role]
require('dotenv').config();
const jwt = require('jsonwebtoken');

const args = process.argv.slice(2);
const userId = Number(args[0] || 1);
const username = args[1] || 'admin';
const role = args[2] || 'admin';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET not set in .env');
  process.exit(1);
}

const token = jwt.sign({ id: userId, username, role }, process.env.JWT_SECRET, { expiresIn: '24h' });
console.log(token);
