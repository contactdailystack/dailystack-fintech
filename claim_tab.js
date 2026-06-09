const { spawn } = require('child_process');

const proc = spawn("cmd", ["/c", "mavis.cmd", "browser", "tool", "claim_tab", JSON.stringify({tabId: 1541463920})], {
    cwd: "C:\\Users\\Pick\\.mavis\\bin",
    stdio: ['pipe', 'pipe', 'pipe']
});

proc.stdout.on('data', (data) => process.stdout.write(data));
proc.stderr.on('data', (data) => process.stderr.write(data));
