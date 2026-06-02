const { execSync } = require('child_process');
const fs = require('fs');

function fail(msg) {
  console.error('\n[pre-commit-secret-scan] ' + msg + '\n');
  process.exit(1);
}

try {
  // get list of staged files
  const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
  const files = output.split(/\r?\n/).filter(Boolean);
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    if (/VITE_SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY|VAPID_PRIVATE_KEY/.test(content)) {
      fail(`Possible secret found in staged file: ${file}`);
    }
  }
  process.exit(0);
} catch (err) {
  console.error('[pre-commit-secret-scan] error', err);
  process.exit(1);
}
