const { spawn } = require('child_process');

// Navigate to email provider settings
const url = "https://supabase.com/dashboard/project/pexcvfhuvqrwrabpgkzi/auth/providers?method=email";
const jsonArgs = JSON.stringify({ url });

const proc = spawn("cmd", ["/c", "mavis.cmd", "browser", "tool", "navigate", jsonArgs], {
    cwd: "C:\\Users\\Pick\\.mavis\\bin",
    stdio: ['pipe', 'pipe', 'pipe']
});

proc.stdout.on('data', (data) => process.stdout.write(data));
proc.stderr.on('data', (data) => process.stderr.write(data));
