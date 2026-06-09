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
  const t = 1541463373;
  const q = await r('query', { tabId: t, mode: 'page_text' });
  const txt = (q?.content?.value?.text || '');
  console.log('=== DASHBOARD PAGE TEXT ===');
  console.log(txt.replace(/\s+/g, ' ').substring(0, 500));
  console.log('=== END ===');
  const u = await r('get_active_tab', {});
  console.log('URL:', u?.content?.url);
})().catch(console.error);
