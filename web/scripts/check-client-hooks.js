/*
  Simple script to list/auto-fix files under web/ that use client-only React hooks or browser globals
  Usage: node web/scripts/check-client-hooks.js --list
         node web/scripts/check-client-hooks.js --fix
*/

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function walkDir(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      if (e.name === '.next' || e.name === 'node_modules') continue;
      walkDir(path.join(dir, e.name), cb);
    } else {
      cb(path.join(dir, e.name));
    }
  }
}

const args = process.argv.slice(2);
const fix = args.includes('--fix');

const candidates = [];

walkDir(root, (filePath) => {
  if (!/\.tsx?$/.test(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  if (/"use client"|\'use client\'/.test(content)) return; // already client
  // detect hooks or browser-only APIs usage
  if (/\buseState\b|\buseEffect\b|\buseRef\b|\buseLayoutEffect\b/.test(content)
      || /\blocalStorage\b|\bwindow\b|\blocation\.href\b|\batob\b/.test(content)) {
    candidates.push(filePath);
  }
});

if (candidates.length === 0) {
  console.log('No candidate files detected (all client-hooks files already marked or none found).');
  process.exit(0);
}

console.log('Detected files that likely require "use client":');
for (const f of candidates) {
  console.log(' -', f.replace(root + path.sep, ''));
}

if (fix) {
  console.log('\nApplying auto-fix (adding "use client" at the top)');
  for (const f of candidates) {
    const content = fs.readFileSync(f, 'utf8');
    const newContent = '"use client";\n' + content;
    fs.writeFileSync(f, newContent, 'utf8');
    console.log('Fixed:', f.replace(root + path.sep, ''));
  }
  console.log('\nDone. Please review changes before committing.');
}
