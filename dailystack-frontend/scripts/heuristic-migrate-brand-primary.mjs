#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(), 'src');
const OUT = path.resolve(process.cwd(), '..', 'report', 'heuristic-migrate-brand-primary.md');

function walk(dir){
  const res=[];
  for(const ent of fs.readdirSync(dir, { withFileTypes: true })){
    const p = path.join(dir, ent.name);
    if(ent.isDirectory()) res.push(...walk(p));
    else if(/\.(js|ts|jsx|tsx|css|scss|svg|html|mjs)$/.test(ent.name)) res.push(p);
  }
  return res;
}

const FEATURE_KEYS = ['dating','events','community'];
const files = walk(ROOT);
const changed = [];

for(const file of files){
  const rel = path.relative(ROOT, file).replace(/\\/g,'/');
  const lower = rel.toLowerCase();
  let feature = null;
  for(const f of FEATURE_KEYS) if(lower.includes(`/${f}/`) || lower.startsWith(`${f}/`) || lower.includes(`-${f}`) || lower.includes(`/pages/${f}`)) feature = f;

  let txt = fs.readFileSync(file,'utf8');
  let out = txt;

  // Replace bg-[var(--brand-primary)] occurrences (preserve /opacity suffix)
  if(feature){
    out = out.replace(/bg-\[var\(--brand-primary\)(\/[^\]]+)?\]/ig, (m,suf='') => `bg-[var(--feature-${feature}-muted)${suf||''}]`);
    out = out.replace(new RegExp(`bg-\\[var\\(--feature-${feature}-primary\\)(\/[^\\]]+)?\\]`, 'ig'), (m,s='') => `bg-[var(--feature-${feature}-muted)${s||''}]`);
    out = out.replace(/background\s*[:=]\s*var\(--brand-primary\)/ig, `background: var(--feature-${feature}-muted)`);
    out = out.replace(/background-color\s*[:=]\s*var\(--brand-primary\)/ig, `background-color: var(--feature-${feature}-muted)`);
  } else {
    // shared / unknown files: map brand primary surfaces to semantic surface
    out = out.replace(/bg-\[var\(--brand-primary\)(\/[^\]]+)?\]/ig, (m,suf='') => `bg-[var(--semantic-surface-1)${suf||''}]`);
    out = out.replace(/background\s*[:=]\s*var\(--brand-primary\)/ig, `background: var(--semantic-surface-1)`);
    out = out.replace(/background-color\s*[:=]\s*var\(--brand-primary\)/ig, `background-color: var(--semantic-surface-1)`);
  }

  if(out !== txt){
    fs.writeFileSync(file, out, 'utf8');
    changed.push(path.relative(process.cwd(), file));
    console.log('Patched', file);
  }
}

let report = `Heuristic migrate brand-primary report\n\nFiles changed: ${changed.length}\n\n`;
for(const c of changed) report += `- ${c}\n`;
fs.writeFileSync(OUT, report, 'utf8');
console.log(report);
process.exit(0);
