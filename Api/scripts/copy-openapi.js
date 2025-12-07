const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../openapi.yaml');
const destDir = path.resolve(__dirname, '../dist');
const dest = path.resolve(destDir, 'openapi.yaml');

if (!fs.existsSync(src)) {
  console.error('openapi.yaml not found in project root');
  process.exit(1);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(src, dest);
console.log(`Copied ${src} to ${dest}`);
