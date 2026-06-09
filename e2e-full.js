const { spawn } = require('child_process');
function r(t, a) {
  return new Promise(x => {
    const p = spawn('cmd.exe', ['/c', 'mavis', 'browser', 'tool', t, JSON.stringify(a)], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let o = '';
    p.stdout.on('data', d => o += d.toString());
    p.on('close', () => { try { x(JSON.parse(o)); } catch { x({ raw: o }); } });
    setTimeout(() => { try { p.kill(); } catch {} x({ error: 'Timeout' }); }, 20000);
  });
}
(async () => {
  // Fresh tab
  const o = await r('open_tab', { url: 'http://localhost:5173/login', active: true });
  const t = o.tabId;
  console.log('Fresh tab:', t);
  await new Promise(x => setTimeout(x, 2500));
  await r('navigate', { tabId: t, url: 'http://localhost:5173/login', waitUntil: 'networkidle' });
  await new Promise(x => setTimeout(x, 1500));
  // Login
  await r('type', { tabId: t, selector: 'input[type="email"]', text: 'contact.dailystack@gmail.com', clear: true });
  await new Promise(x => setTimeout(x, 300));
  await r('type', { tabId: t, selector: 'input[type="password"]', text: 'Pick14856900*', clear: true });
  await new Promise(x => setTimeout(x, 300));
  await r('press_key', { tabId: t, selector: 'input[type="password"]', key: 'Enter' });
  await new Promise(x => setTimeout(x, 5000));
  // Check final state
  const u = await r('get_active_tab', {});
  console.log('URL:', u?.content?.url);
  console.log('On dashboard:', u?.content?.url?.includes('/dashboard') ? 'YES ✅' : 'NO ❌');
  // Get page text
  const q = await r('query', { tabId: t, mode: 'page_text' });
  const txt = (q?.content?.value?.text || '').replace(/\s+/g, ' ');
  console.log('Page text (first 400):', txt.substring(0, 400));
  console.log('Has content:', txt.length > 20 ? 'YES ✅' : 'NO ❌');
  // Check network
  const net = await r('network_requests', { tabId: t });
  if (net?.content) {
    try {
      const p = typeof net.content === 'string' ? JSON.parse(net.content) : net.content;
      const profs = (p.requests || []).filter(x => (x.url || '').includes('profiles'));
      const subs = (p.requests || []).filter(x => (x.url || '').includes('subscriptions'));
      console.log('\nProfile requests:', profs.length, profs[0]?.statusCode);
      console.log('Subscriptions requests:', subs.length, subs[0]?.statusCode);
    } catch(e) {}
  }
  console.log('\n=== FULL AUTH FLOW TEST ===');
  console.log('LOGIN:', u?.content?.url?.includes('/dashboard') ? 'PASS ✅' : 'FAIL ❌');
  console.log('PAGE_HAS_CONTENT:', txt.length > 20 ? 'PASS ✅' : 'FAIL ❌');
})().catch(console.error);
