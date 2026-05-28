#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(), 'src');
const FEATURES = {
  dating: 'dating',
  events: 'events',
  community: 'community'
};

function walk(dir){
  const res=[];
  for(const ent of fs.readdirSync(dir, { withFileTypes: true })){
    const p = path.join(dir, ent.name);
    if(ent.isDirectory()) res.push(...walk(p));
    else if(/\.(js|ts|jsx|tsx|css|scss|svg|html|mjs)$/.test(ent.name)) res.push(p);
  }
  return res;
}

const files = walk(ROOT);
let changedFiles = [];

for(const file of files){
  const rel = path.relative(ROOT, file).replace(/\\/g,'/');
  const lower = rel.toLowerCase();
  let feature = null;
  for(const f of Object.keys(FEATURES)) if(lower.includes(`/${f}/`) || lower.startsWith(`${f}/`) || lower.includes(`-${f}`) || lower.includes(`/pages/${f}`)) feature = f;
  if(!feature) continue;
  let txt = fs.readFileSync(file,'utf8');
  let out = txt;

  // Replace bg-[var(--brand-primary)] with muted for feature (preserve opacity suffix e.g. /15)
  out = out.replace(/bg-\[var\(--brand-primary\)(\/[^\]]+)?\]/ig, (m,suffix='') => `bg-[var(--feature-${feature}-muted)${suffix||''}]`);

  // Replace bg-[var(--feature-<feature>-primary)] with muted
  const primPat = new RegExp(`bg-\\[var\\(\\--feature-${feature}-primary\\)(\\/[^\\]]+)?\\]`, 'ig');
  out = out.replace(primPat, (m,s1,suffix='') => `bg-[var(--feature-${feature}-muted)${suffix||''}]`);

  // Replace inline style background: var(--brand-primary)
  out = out.replace(/background\s*[:=]\s*var\(--brand-primary\)/ig, `background: var(--feature-${feature}-muted)`);
  out = out.replace(/var\(--brand-primary\)/ig, `var(--feature-${feature}-muted)`);

  if(out !== txt){
    fs.writeFileSync(file, out, 'utf8');
    changedFiles.push(path.relative(process.cwd(), file));
    console.log('Patched', file);
  }
}

const OUT = path.resolve(process.cwd(), '..', 'report', 'auto-migrate-primaries.md');
let report = `Auto-migrate primaries report\n\nFiles changed: ${changedFiles.length}\n\n`;
for(const f of changedFiles) report += `- ${f}\n`;
fs.writeFileSync(OUT, report, 'utf8');
console.log(report);
process.exit(0);
