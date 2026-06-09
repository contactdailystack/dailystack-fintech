const { spawn } = require('child_process');

function runMavis(tool, args) {
  return new Promise((resolve, reject) => {
    const json = JSON.stringify(args);
    const proc = spawn('cmd.exe', ['/c', 'mavis', 'browser', 'tool', tool, json], {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('close', code => {
      try { resolve(JSON.parse(stdout)); }
      catch { resolve({ raw: stdout, stderr }); }
    });
    proc.on('error', e => { resolve({ error: e.message }); });
    setTimeout(() => { try { proc.kill(); } catch {} resolve({ error: 'Timeout' }); }, 20000);
  });
}

async function main() {
  const timestamp = Date.now();
  const testEmail = `e2etest_${timestamp}@test.com`;
  const testPassword = 'Test1234!';

  // Open tab
  console.log('=== Opening signup page ===');
  const open = await runMavis('open_tab', { url: 'http://localhost:5173/signup', active: true });
  const tabId = open?.tabId;
  console.log('Tab:', tabId);
  
  if (!tabId) {
    console.log('Failed to open tab:', JSON.stringify(open));
    return;
  }

  // Navigate
  console.log('=== Navigating to signup ===');
  await runMavis('navigate', { tabId, url: 'http://localhost:5173/signup', waitUntil: 'networkidle' });
  
  // Wait for load
  await new Promise(r => setTimeout(r, 2000));

  // Check page
  const page = await runMavis('query', { tabId, mode: 'page_text' });
  console.log('Page title:', page?.content?.value?.title);
  console.log('Page text:', (page?.content?.value?.text || '').replace(/\s+/g, ' ').substring(0, 150));

  // Fill form
  console.log('\n=== Filling form ===');
  const name = await runMavis('type', { tabId, selector: 'input[placeholder*="ชื่อ"]', text: 'E2E Test User', clear: true });
  console.log('Name:', name?.content || JSON.stringify(name));
  await new Promise(r => setTimeout(r, 500));

  const email = await runMavis('type', { tabId, selector: 'input[type="email"]', text: testEmail, clear: true });
  console.log('Email:', email?.content || JSON.stringify(email));
  await new Promise(r => setTimeout(r, 500));

  const pw = await runMavis('type', { tabId, selector: 'input[type="password"]', text: testPassword, clear: true });
  console.log('Password:', pw?.content || JSON.stringify(pw));
  await new Promise(r => setTimeout(r, 500));

  // Submit via Enter
  console.log('\n=== Submitting (Enter key) ===');
  const enter = await runMavis('press_key', { tabId, selector: 'input[type="password"]', key: 'Enter' });
  console.log('Enter:', enter?.content || JSON.stringify(enter));

  // Wait for response
  await new Promise(r => setTimeout(r, 6000));

  // Check URL
  const tabs = await runMavis('get_tabs', {});
  console.log('\n=== Final state ===');
  console.log('Active tab URL:', tabs?.content?.[0]?.url);

  // Check errors
  const errors = await runMavis('errors', { tabId });
  console.log('JS Errors:', errors?.content?.length || 0);

  // Check console logs
  const logs = await runMavis('console', { tabId });
  if (logs?.content) {
    try {
      const parsed = JSON.parse(logs.content);
      const signupLogs = parsed.filter(l => l.text?.includes('[Signup]') || l.type === 'error');
      if (signupLogs.length > 0) {
        console.log('\nSignup logs:');
        signupLogs.forEach(l => console.log(`  [${l.type}] ${l.text?.substring(0, 200)}`));
      } else {
        console.log('\nNo [Signup] logs found.');
        parsed.slice(-5).forEach(l => console.log(`  [${l.type}] ${l.text?.substring(0, 200)}`));
      }
    } catch(e) {
      console.log('Parse error:', logs.content?.substring(0, 200));
    }
  }

  // Check network
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
  console.log('TEST EMAIL:', testEmail);
  console.log('TEST PASSWORD:', testPassword);
  console.log('========================================');
}

main().catch(console.error);
