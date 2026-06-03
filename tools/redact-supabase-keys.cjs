const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGET_URL = 'https://kmflgrxtfsiryqwdggpc.supabase.co';
const TARGET_KEY_PREFIX = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.name === 'node_modules' || ent.name === '.git') continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full);
    else if (ent.isFile()) processFile(full);
  }
}

function processFile(file) {
  const rel = path.relative(ROOT, file);
  const exts = ['.js', '.ts', '.tsx', '.txt', '.json', '.html'];
  if (!exts.includes(path.extname(file).toLowerCase())) return;
  let s = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (s.includes(TARGET_URL)) {
    s = s.split(TARGET_URL).join('<REDACTED_SUPABASE_URL>');
    changed = true;
  }
  const jwtRegex = new RegExp(TARGET_KEY_PREFIX + '[A-Za-z0-9-_\.]{20,}', 'g');
  if (jwtRegex.test(s)) {
    s = s.replace(jwtRegex, '<REDACTED_SUPABASE_ANON_KEY>');
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(file, s, 'utf8');
    console.log('Redacted:', rel);
  }
}

console.log('Starting redact-supabase-keys');
walk(ROOT);
console.log('Done');
