const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const example = path.join(root, '.env.example');
const envFile = path.join(root, '.env');

if (!fs.existsSync(example)) {
  console.error('.env.example not found, please create an .env with DATABASE_URL and JWT_SECRET');
  process.exit(1);
}

if (!fs.existsSync(envFile)) {
  fs.copyFileSync(example, envFile);
  console.log('Created .env from .env.example');
} else {
  console.log('.env already exists');
}

// Quick check for DATABASE_URL and JWT_SECRET
const content = fs.readFileSync(envFile, 'utf8');
const hasDb = /DATABASE_URL\s*=/.test(content);
const hasJwt = /JWT_SECRET\s*=/.test(content);
if (!hasDb || !hasJwt) {
  console.warn('Warning: Your .env may be missing DATABASE_URL or JWT_SECRET. Please check');
}

process.exit(0);
