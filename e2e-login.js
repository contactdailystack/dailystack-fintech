const { spawn } = require('child_process');

function runMavis(tool, args) {
  return new Promise((resolve) => {
    const json = JSON.stringify(args);
    const proc = spawn('cmd.exe', ['/c', 'mavis', 'browser', 'tool', tool, json], {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('close', () => {
      try { resolve(JSON.parse(stdout)); }
      catch { resolve({ raw: stdout, stderr }); }
    });
    proc.on('error', e => { resolve({ error: e.message }); });
    setTimeout(() => { try { proc.kill(); } catch {} resolve({ error: 'Timeout' }); }, 20000);
  });
}

async function main() {
  const testEmail = 'contact.dailystack@gmail.com';
  const testPassword = 'Pick14856900*';

  // Open fresh tab
  console.log('=== Opening login page ===');
  const open = await runMavis('open_tab', { url: 'http://localhost:5173/login', active: true });
  const tabId = open?.tabId;
  console.log('Tab:', tabId);
  
  // Wait for load
  await new Promise(r => setTimeout(r, 2500));

  // Check page
  const page = await runMavis('query', { tabId, mode: 'page_text' });
  console.log('Page title:', page?.content?.value?.title);
  const pageText = (page?.content?.value?.text || '').replace(/\s+/g, ' ');
  console.log('Page text:', pageText.substring(0, 150));
  console.log('Dark theme:', pageText.includes('ผู้ช่วยบริหาร') ? 'YES ✅' : 'NO ❌');

  // Fill email
  console.log('\n=== Filling credentials ===');
  const email = await runMavis('type', { tabId, selector: 'input[type="email"]', text: testEmail, clear: true });
  console.log('Email:', email?.content ? 'OK ✅' : 'FAIL ❌');
  await new Promise(r => setTimeout(r, 400));

  // Fill password
  const pw = await runMavis('type', { tabId, selector: 'input[type="password"]', text: testPassword, clear: true });
  console.log('Password:', pw?.content ? 'OK ✅' : 'FAIL ❌');
  await new Promise(r => setTimeout(r, 400));

  // Submit via Enter
  console.log('\n=== Submitting login ===');
  const enter = await runMavis('press_key', { tabId, selector: 'input[type="password"]', key: 'Enter' });
  console.log('Enter key:', enter?.content ? 'OK ✅' : 'FAIL ❌');

  // Wait for redirect
  console.log('Waiting 6s for redirect...');
  await new Promise(r => setTimeout(r, 6000));

  // Check final URL
  const tabs = await runMavis('get_tabs', {});
  const activeTab = tabs?.content?.find(t => t.active);
  const finalUrl = activeTab?.url;
  console.log('\n=== RESULT ===');
  console.log('Final URL:', finalUrl);
  console.log('Redirected to /dashboard:', finalUrl?.includes('/dashboard') ? 'YES ✅' : 'NO ❌');
  console.log('Still on /login:', finalUrl?.includes('/login') ? 'STUCK ❌' : 'OK');

  // Check console logs
  const logs = await runMavis('console', { tabId });
  if (logs?.content) {
    try {
      const parsed = JSON.parse(logs.content);
      const errs = parsed.filter(l => l.type === 'error');
      if (errs.length > 0) {
        console.log('\nConsole errors:');
        errs.forEach(l => console.log(`  [error] ${l.text?.substring(0, 150)}`));
      }
    } catch(e) {}
  }

  // Check network for Supabase
  const net = await runMavis('network_requests', { tabId });
  if (net?.content) {
    try {
      const parsed = typeof net.content === 'string' ? JSON.parse(net.content) : net.content;
      const supabaseReqs = (parsed.requests || []).filter(r => (r.url || '').includes('supabase'));
      console.log('\nSupabase requests:');
      supabaseReqs.slice(-5).forEach(r => console.log(`  ${r.method} ${r.statusCode} ${r.url?.substring(0, 100)}`));
    } catch(e) {}
  }

  console.log('\n========================================');
  console.log('LOGIN TEST COMPLETE');
  console.log('Email:', testEmail);
  console.log('========================================');
}

main().catch(console.error);
