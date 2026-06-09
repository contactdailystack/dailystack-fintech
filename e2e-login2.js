const { spawn } = require('child_process');

function runMavis(tool, args) {
  return new Promise((resolve) => {
    const json = JSON.stringify(args);
    const proc = spawn('cmd.exe', ['/c', 'mavis', 'browser', 'tool', tool, json], {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    let stdout = '';
    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.on('close', () => {
      try { resolve(JSON.parse(stdout)); }
      catch { resolve({ raw: stdout }); }
    });
    proc.on('error', e => { resolve({ error: e.message }); });
    setTimeout(() => { try { proc.kill(); } catch {} resolve({ error: 'Timeout' }); }, 20000);
  });
}

async function main() {
  const o = await runMavis('open_tab', { url: 'http://localhost:5173/login', active: true });
  const tabId = o.tabId;
  console.log('Tab:', tabId);

  await new Promise(x => setTimeout(x, 2500));
  await runMavis('navigate', { tabId, url: 'http://localhost:5173/login', waitUntil: 'networkidle' });
  await new Promise(x => setTimeout(x, 1500));

  await runMavis('type', { tabId, selector: 'input[type="email"]', text: 'contact.dailystack@gmail.com', clear: true });
  await new Promise(x => setTimeout(x, 400));
  await runMavis('type', { tabId, selector: 'input[type="password"]', text: 'Pick14856900*', clear: true });
  await new Promise(x => setTimeout(x, 400));
  await runMavis('press_key', { tabId, selector: 'input[type="password"]', key: 'Enter' });

  console.log('Waiting 6s for redirect...');
  await new Promise(x => setTimeout(x, 6000));

  const u = await runMavis('get_active_tab', {});
  const finalUrl = u?.content?.url;
  console.log('\n=== LOGIN RESULT ===');
  console.log('Final URL:', finalUrl);
  console.log('Redirected to /dashboard:', finalUrl?.includes('/dashboard') ? 'YES ✅' : 'NO ❌');
  console.log('Still on /login:', finalUrl?.includes('/login') ? 'STUCK ❌' : 'OK');

  const q = await runMavis('query', { tabId, mode: 'page_text' });
  const txt = (q?.content?.value?.text || '').replace(/\s+/g, ' ');
  console.log('Page text:', txt.substring(0, 300));

  const net = await runMavis('network_requests', { tabId });
  if (net?.content) {
    try {
      const p = typeof net.content === 'string' ? JSON.parse(net.content) : net.content;
      const s = (p.requests || []).filter(x => (x.url || '').includes('profiles'));
      console.log('\nProfile requests:');
      s.forEach(x => console.log(`  ${x.method} ${x.statusCode} ${x.url?.substring(0, 120)}`));
    } catch(e) { console.log('Parse error'); }
  }
}

main().catch(console.error);
