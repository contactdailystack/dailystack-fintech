#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(), 'src');
const OUT = path.resolve(process.cwd(), '..', 'report', 'primary-surface-report.md');

function walk(dir){
  const res=[];
  for(const name of fs.readdirSync(dir, { withFileTypes: true })){
    const p = path.join(dir, name.name);
    if(name.isDirectory()) res.push(...walk(p));
    else if(/\.(js|ts|jsx|tsx|css|scss|svg|html|mjs)$/.test(name.name)) res.push(p);
  }
  return res;
}

const files = walk(ROOT);
const matches = [];

// files to ignore (relative to src)
const IGNORE = [
  'styles/design-tokens.css',
  'app/utils/chartColors.ts',
  'app/utils/chartColors.tsx'
];

const primaryTokenPatterns = [
  /bg-\[var\(--feature-[a-z0-9-]+-primary\)(\/[^\]]+)?\]/i,
  /bg-\[var\(--brand-primary\)(\/[^\]]+)?\]/i,
  /background\s*[:=]\s*var\(--feature-[a-z0-9-]+-primary\)/i,
  /background(-color)?\s*[:=]\s*var\(--brand-primary\)/i,
  /style=[^>]*background[^>]*var\(--feature-[a-z0-9-]+-primary\)/i
];

for(const file of files){
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if(IGNORE.some(p => rel.endsWith(p))) continue;
  const txt = fs.readFileSync(file, 'utf8');
  const lines = txt.split(/\r?\n/);
  for(let i=0;i<lines.length;i++){
    const line = lines[i];
    for(const pat of primaryTokenPatterns){
      if(pat.test(line)){
        matches.push({ file, line: i+1, text: line.trim() });
        break;
      }
    }
  }
}

let out = `# Primary-as-surface Report\n\n`;
out += `Scanned ${files.length} files\n\n`;
if(matches.length===0){
  out += `No usages of primary tokens found in background/bg declarations.\n`;
  fs.writeFileSync(OUT, out, 'utf8');
  console.log('No primary-as-surface usages detected.');
  process.exit(0);
}

out += `Found ${matches.length} matches:\n\n`;
for(const m of matches){
  out += `- ${path.relative(process.cwd(), m.file)}:${m.line} -> ${m.text}\n`;
}

fs.writeFileSync(OUT, out, 'utf8');
console.log(`Found ${matches.length} primary usages; report written to ${OUT}`);
process.exit(1);
