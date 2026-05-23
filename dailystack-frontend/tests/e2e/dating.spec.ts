import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Environment variables required for test run:
// SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY as string;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE) {
  console.warn('Supabase env vars not set — e2e tests will fail if run without setup.');
}

// Helper to create test users and profiles using service role key
async function createTestUser(supabaseAdmin: any, email: string, password: string, nickname: string) {
  // Create user via admin API
  const { data: userData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nickname },
  });
  if (createErr) throw createErr;

  // Normalize response shape: some Supabase SDK responses nest the user under a `user` key.
  const user = (userData && (userData.user ?? userData)) as any;

  // Insert profile
  const profile = {
    user_id: user.id,
    nickname,
    photos: [],
    discovery_tokens: 19,
    profile_status: 'active'
  };
  const { error: profileErr } = await supabaseAdmin.from('user_profiles').upsert(profile, { onConflict: 'user_id' });
  if (profileErr) throw profileErr;

  return user;
}

test.describe('Dating mutual pick flow (API-driven)', () => {
  let supabaseAdmin: any;
  let supabaseClientA: any;
  let supabaseClientB: any;
  let userA: any;
  let userB: any;

  test.beforeAll(async () => {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } });

    const emailA = `e2e+a_${Date.now()}@example.com`;
    const emailB = `e2e+b_${Date.now()}@example.com`;
    const password = 'Testpass123!';

    userA = await createTestUser(supabaseAdmin, emailA, password, 'Alice E2E');
    userB = await createTestUser(supabaseAdmin, emailB, password, 'Bob E2E');

    // Sign in as users via anon client to get session tokens
    supabaseClientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    supabaseClientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });

    await supabaseClientA.auth.signInWithPassword({ email: userA.email, password });
    await supabaseClientB.auth.signInWithPassword({ email: userB.email, password });
  });

  test('mutual pick creates chat room and notifications', async () => {
    // User A picks User B
    const { data: aSession } = await supabaseClientA.auth.getSession();
    expect(aSession?.user?.id).toBeTruthy();

    const rpcA = await supabaseClientA.rpc('rpc_submit_pick_action', {
      p_user_id: userA.id,
      p_target_id: userB.id,
      p_action: 'pick',
    });
    expect(rpcA).toBeTruthy();

    // User B picks User A
    const rpcB = await supabaseClientB.rpc('rpc_submit_pick_action', {
      p_user_id: userB.id,
      p_target_id: userA.id,
      p_action: 'pick',
    });
    expect(rpcB).toBeTruthy();

    // Verify that chat_room exists for pair
    const { data: rooms } = await supabaseAdmin.from('chat_rooms').select('*').or(`and(user1_id.eq.${userA.id},user2_id.eq.${userB.id}),and(user1_id.eq.${userB.id},user2_id.eq.${userA.id})`);
    expect(Array.isArray(rooms) && rooms.length > 0).toBeTruthy();

    // Verify notifications for both users
    const { data: notesA } = await supabaseAdmin.from('notifications').select('*').eq('user_id', userA.id);
    const { data: notesB } = await supabaseAdmin.from('notifications').select('*').eq('user_id', userB.id);
    expect(notesA && notesA.length > 0).toBeTruthy();
    expect(notesB && notesB.length > 0).toBeTruthy();
  });

  test.afterAll(async () => {
    // Cleanup: delete test users and related rows
    try {
      await supabaseAdmin.from('notifications').delete().or(`user_id.eq.${userA.id},user_id.eq.${userB.id}`);
      await supabaseAdmin.from('chat_rooms').delete().or(`user1_id.eq.${userA.id},user1_id.eq.${userB.id}`);
      await supabaseAdmin.from('picks').delete().or(`user_id.eq.${userA.id},user_id.eq.${userB.id}`);
      await supabaseAdmin.from('user_profiles').delete().or(`user_id.eq.${userA.id},user_id.eq.${userB.id}`);
      await supabaseAdmin.auth.admin.deleteUser(userA.id);
      await supabaseAdmin.auth.admin.deleteUser(userB.id);
    } catch (e) {
      console.warn('Cleanup warnings', e);
    }
  });
});
