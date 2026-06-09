const { spawn, exec } = require('child_process');
const http = require('http');

const HOST = 'localhost';
const PORT = 5173;
const URL = `http://${HOST}:${PORT}`;
const HEALTH_INTERVAL = 5000; // ms
const CRASH_RESTART_DELAY = 2000; // ms

// Safety and configuration
const MAX_RETRIES_PER_MINUTE = Number(process.env.DEV_SERVER_MAX_RETRIES) || 3;
const COOLDOWN_MS = Number(process.env.DEV_SERVER_COOLDOWN_MS) || 10000; // ms when limit exceeded

let child = null;
let healthInterval = null;
let restarting = false;
let failureTimestamps = [];

function log(level, msg) {
  const t = new Date().toISOString();
  // Normalize level names to concise tags
  const L = (level || 'INFO').toUpperCase();
  console.log(`[${L}] ${msg}`);
}

function now() { return Date.now(); }

function pruneFailures() {
  const cutoff = now() - 60_000;
  failureTimestamps = failureTimestamps.filter(ts => ts >= cutoff);
}

function shouldBackoff() {
  pruneFailures();
  return failureTimestamps.length >= MAX_RETRIES_PER_MINUTE;
}

function getPidsOnPort(port) {
  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      exec('netstat -ano', (err, stdout) => {
        if (err) return resolve([]);
        const lines = stdout.split(/\r?\n/);
        const pids = new Set();
        for (const line of lines) {
          if (!line.includes(`:${port}`)) continue;
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (/^\d+$/.test(pid)) pids.add(Number(pid));
        }
        resolve(Array.from(pids));
      });
    } else {
      exec(`lsof -i :${port} -t 2>/dev/null || true`, (err, stdout) => {
        if (err) return resolve([]);
        const lines = stdout.split(/\r?\n/).filter(Boolean);
        resolve(lines.map(l => Number(l)));
      });
    }
  });
}

function killPid(pid) {
  return new Promise((resolve) => {
    if (!pid || isNaN(pid)) return resolve(false);
    if (process.platform === 'win32') {
      exec(`taskkill /PID ${pid} /F`, (err) => resolve(!err));
    } else {
      try {
        process.kill(pid, 'SIGKILL');
        resolve(true);
      } catch (e) {
        resolve(false);
      }
    }
  });
}

async function enforceSingleOnPort() {
  const pids = await getPidsOnPort(PORT);
  if (pids.length <= 1) return;
  // Keep the highest PID (likely newest), kill others
  const keep = Math.max(...pids);
  for (const pid of pids) {
    if (pid === keep) continue;
    log('WARNING', `Multiple instances detected on port ${PORT}, killing duplicate PID ${pid}`);
    await killPid(pid);
  }
}

function spawnVite() {
  if (child) {
    try { child.kill(); } catch (e) {}
    child = null;
  }

  // Respect kill switch
  const enabled = (process.env.DEV_SERVER_ENABLED ?? '1').toString().toLowerCase();
  if (enabled === '0' || enabled === 'false') {
    log('INFO', 'DEV_SERVER_ENABLED is false — manager will not start Vite');
    return;
  }

  restarting = false;
  log('INFO', 'Starting Vite server...');

  // Ensure no other process is listening on the port
  getPidsOnPort(PORT).then(async (pids) => {
    if (pids.length > 0) {
      log('WARNING', `Port ${PORT} occupied by PID(s): ${pids.join(', ')}; killing them`);
      for (const pid of pids) await killPid(pid);
    }

    // Start via npx to respect local install
    child = spawn('npx vite --host', { shell: true });

    child.stdout.on('data', (d) => {
      process.stdout.write(d);
    });
    child.stderr.on('data', (d) => {
      process.stderr.write(d);
    });

    child.on('spawn', () => {
      log('INFO', `Vite process started (PID ${child.pid})`);
    });

    child.on('error', (err) => {
      log('ERROR', `Failed to start process: ${err.message}`);
      failureTimestamps.push(now());
      scheduleRestart();
    });

    child.on('exit', (code, signal) => {
      log('ERROR', `Process crashed with code: ${code ?? signal}`);
      failureTimestamps.push(now());
      scheduleRestart();
    });
  });
}

function scheduleRestart() {
  if (restarting) return;
  restarting = true;
  pruneFailures();
  if (shouldBackoff()) {
    log('WARNING', `Repeated failures >= ${MAX_RETRIES_PER_MINUTE} in 1 minute, cooling down ${COOLDOWN_MS}ms before retry`);
    setTimeout(() => {
      // Reset failure counters after cooldown so we don't immediately re-trigger
      failureTimestamps = [];
      restarting = false;
      spawnVite();
    }, COOLDOWN_MS);
  } else {
    log('WARNING', 'Server not responding, restarting...');
    setTimeout(() => {
      restarting = false;
      spawnVite();
    }, CRASH_RESTART_DELAY);
  }
}

function healthCheck() {
  // Respect kill switch while running
  const enabled = (process.env.DEV_SERVER_ENABLED ?? '1').toString().toLowerCase();
  if (enabled === '0' || enabled === 'false') {
    log('INFO', 'DEV_SERVER_ENABLED is false — stopping manager');
    stopAll();
    return;
  }

  const req = http.get(URL, (res) => {
    if (res.statusCode === 200) {
      // If we had failures before, this counts as a recovery
      if (failureTimestamps.length > 0) {
        log('RECOVERY', 'Restart successful');
        failureTimestamps = [];
      } else {
        log('INFO', 'Health check OK');
      }
    } else {
      log('WARNING', `Health check returned ${res.statusCode}, restarting`);
      failureTimestamps.push(now());
      restartManaged();
    }
    res.resume();
  });
  req.on('error', (e) => {
    log('WARNING', `Health check error: ${e.message}`);
    failureTimestamps.push(now());
    restartManaged();
  });
  req.setTimeout(3000, () => {
    req.abort();
  });
}

function restartManaged() {
  if (child) {
    try { child.kill(); } catch (e) {}
    child = null;
  }
  scheduleRestart();
}

function startMonitoring() {
  // Ensure single instance on port
  enforceSingleOnPort().then(() => {
    spawnVite();

    if (healthInterval) clearInterval(healthInterval);
    healthInterval = setInterval(healthCheck, HEALTH_INTERVAL);
  });
}

function stopAll() {
  log('STATUS', 'Stopping manager and any Vite instance');
  if (healthInterval) clearInterval(healthInterval);
  if (child) {
    try { child.kill(); } catch (e) {}
    child = null;
  }
  process.exit(0);
}

process.on('SIGINT', () => {
  log('STATUS', 'Received SIGINT — stopping');
  stopAll();
});

// Allow sending 'stop' on stdin
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => {
  const s = d.toString().trim().toLowerCase();
  if (s === 'stop' || s === 'exit' || s === 'quit') stopAll();
});

// Start immediately
startMonitoring();

// Keep process alive
setInterval(() => {}, 1 << 30);
