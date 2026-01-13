const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../openapi.yaml');
const destDir = path.resolve(__dirname, '../dist');
const dest = path.resolve(destDir, 'openapi.yaml');

if (!fs.existsSync(src)) {
  console.warn('openapi.yaml not found in project root; skipping copy');
  process.exit(0);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(src, dest);
console.log(`Copied ${src} to ${dest}`);
