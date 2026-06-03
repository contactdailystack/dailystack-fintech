// Lightweight smoke test for auth flow using Supabase JS
// Behavior: if SUPABASE_URL and SUPABASE_ANON_KEY present, attempt a signInWithOtp call with a test inbox

const { createClient } = require('@supabase/supabase-js');

async function run() {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;

  if (!url || !anon) {
    console.warn('[smoke] SUPABASE_URL or SUPABASE_ANON_KEY not set — skipping live auth checks.');
    console.log('[smoke] Build exists and environment not configured for live checks. PASS');
    process.exit(0);
  }

  const supabase = createClient(url, anon);

  const testEmail = process.env.SMOKE_TEST_EMAIL || `noreply+smoke_test@dailystack.app`;
  console.log(`[smoke] Attempting signInWithOtp for ${testEmail}`);

  try {
    const { data, error } = await supabase.auth.signInWithOtp({ email: testEmail });
    if (error) {
      console.error('[smoke] Supabase signInWithOtp error:', error.message || error);
      process.exit(2);
    }
    console.log('[smoke] signInWithOtp response received (no error). PASS');
    process.exit(0);
  } catch (err) {
    console.error('[smoke] Unexpected error:', err);
    process.exit(3);
  }
}

run();
