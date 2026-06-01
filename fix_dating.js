import fs from 'fs';
const path = 'D:/Coding Folder/dailystack/dailystack-frontend/src/app/pages/Dating.tsx';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');
// Fix line 27: replace the bad import line
lines[26] = "import { useTheme } from 'next-themes';";
const fixed = lines.join('\n');
fs.writeFileSync(path, fixed);
console.log('Line 27 fixed:', fixed.split('\n')[26]);
