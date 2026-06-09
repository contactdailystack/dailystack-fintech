const { spawn } = require('child_process');

const url = "https://supabase.com/dashboard/project/pexcvfhuvqrwrabpgkzi/auth/providers?method=github";

const proc = spawn("cmd", ["/c", "mavis.cmd", "browser", "tool", "navigate"], {
    cwd: "C:\\Users\\Pick\\.mavis\\bin",
    stdio: ['pipe', 'pipe', 'pipe']
});

proc.stdin.write(JSON.stringify({ url }));
proc.stdin.end();

proc.stdout.on('data', (data) => process.stdout.write(data));
proc.stderr.on('data', (data) => process.stderr.write(data));
