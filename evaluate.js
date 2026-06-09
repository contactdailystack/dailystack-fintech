const { spawn } = require('child_process');

// Evaluate JavaScript in the page to get the page content
const script = `JSON.stringify({ title: document.title, url: window.location.href, h2s: Array.from(document.querySelectorAll('h2, h3, label')).map(el => el.textContent.trim()).slice(0, 50) })`;

const proc = spawn("cmd", ["/c", "mavis.cmd", "browser", "tool", "evaluate", JSON.stringify({expression: script})], {
    cwd: "C:\\Users\\Pick\\.mavis\\bin",
    stdio: ['pipe', 'pipe', 'pipe']
});

proc.stdout.on('data', (data) => process.stdout.write(data));
proc.stderr.on('data', (data) => process.stderr.write(data));
