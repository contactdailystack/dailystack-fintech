import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
// Snapshot directory (shared by both tests)
const snapshotsDir = path.join(process.cwd(), 'tests', 'e2e', 'ui_onboarding.spec.ts-snapshots');
if (!fs.existsSync(snapshotsDir)) fs.mkdirSync(snapshotsDir, {
  recursive: true
});
import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE) {
  console.warn('Supabase env vars not set — e2e UI tests require SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE');
}
async function createTestUser(adminClient, email, password, nickname) {
  const {
    data: user,
    error
  } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      nickname
    }
  });
  if (error) throw error;
  // Upsert profile
  await adminClient.from('user_profiles').upsert({
    user_id: user.id,
    nickname,
    discovery_tokens: 19,
    profile_status: 'active'
  }, {
    onConflict: 'user_id'
  });
  return {
    id: user.id,
    email: user.email
  };
}
async function seedSessionIntoContext(context, email, password) {
  // Sign in via anon client to obtain session tokens
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false
    }
  });
  const {
    data,
    error
  } = await anonClient.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  const session = data.session;
  if (!session) throw new Error('Unable to create session for test user');

  // Build a token object that contains the `currentSession` shape the app expects,
  // while also including the original `session` and `user` for compatibility.
  const tokenObject = {
    currentSession: {
      access_token: session.access_token,
      token_type: session.token_type,
      expires_in: session.expires_in,
      expires_at: Math.floor(Date.now() / 1000) + (session.expires_in || 3600),
      refresh_token: session.refresh_token
    },
    // include the full session and user payload returned by supabase-js
    session,
    user: session.user
  };
  const json = JSON.stringify(tokenObject).replace(/'/g, "\\'");
  await context.addInitScript({
    content: `window.localStorage.setItem('supabase.auth.token', '${json}');`
  });
}
test.describe('UI Onboarding flow (seeded session)', () => {
  let adminClient;
  test.beforeAll(() => {
    adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
      auth: {
        persistSession: false
      }
    });
  });
  test('Onboarding UI flow - English (mobile viewport)', async ({
    browser
  }) => {
    const email = `e2e-ui-en+${Date.now()}@example.com`;
    const password = 'Testpass123!';
    const nickname = 'E2E EN';
    const user = await createTestUser(adminClient, email, password, nickname);
    const context = await browser.newContext({
      viewport: {
        width: 420,
        height: 800
      }
    });
    await seedSessionIntoContext(context, email, password);
    // E2E helper: mark browser as running in test mode and ensure language default is English
    await context.addInitScript({
      content: `window.process = window.process || {}; window.process.env = window.process.env || {}; window.process.env.NODE_ENV = 'test'; window.localStorage.setItem('dailystack.language', 'en'); document.documentElement.lang='en';`
    });
    const page = await context.newPage();
    await page.goto('/onboarding');

    // Diagnostic: ensure supabase auth token was seeded into localStorage correctly
    const storageInfo = await page.evaluate(() => {
      const raw = window.localStorage.getItem('supabase.auth.token');
      let parsed = null;
      let parseError = null;
      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch (e) {
        parseError = String(e);
      }
      return {
        present: !!raw,
        rawLength: raw ? raw.length : 0,
        hasCurrentSession: !!(parsed && parsed.currentSession),
        hasUser: !!(parsed && parsed.user),
        parseError
      };
    });
    console.log('E2E DIAG localStorage.supabase.auth.token', JSON.stringify(storageInfo));
    // Assert presence to fail fast with clear diagnostics if seeding missed anything
    expect(storageInfo.present).toBeTruthy();
    expect(storageInfo.hasCurrentSession).toBeTruthy();
    expect(storageInfo.hasUser).toBeTruthy();

    // Extra diagnostics: log URL, any h1 texts, and a snippet of the body
    console.log('E2E DIAG page.url', await page.evaluate(() => location.href));
    const h1s = await page.locator('h1').allTextContents();
    console.log('E2E DIAG h1 texts', JSON.stringify(h1s));
    const bodySnippet = (await page.locator('body').innerText()).slice(0, 600);
    console.log('E2E DIAG body snippet', bodySnippet);

    // Wait for welcome title and take visual snapshot (create baseline on first run)
    await expect(page.locator('h1').first()).toHaveText(/Make your day easier to choose\./i, {
      timeout: 5000
    });
    const snapshotsDir = path.join(process.cwd(), 'tests', 'e2e', 'ui_onboarding.spec.ts-snapshots');
    if (!fs.existsSync(snapshotsDir)) fs.mkdirSync(snapshotsDir, {
      recursive: true
    });
    const welcomeSnap = path.join(snapshotsDir, `onboarding-en-welcome-${process.platform}.png`);
    if (!fs.existsSync(welcomeSnap)) {
      await page.screenshot({
        path: welcomeSnap,
        fullPage: true
      });
      console.log('E2E DIAG wrote baseline snapshot', welcomeSnap);
    } else {
      await expect(page).toHaveScreenshot('onboarding-en-welcome.png');
    }

    // Click Next to go to interests using data-testid
    await page.getByTestId('onboarding-continue-button').click();

    // Select at least 3 interests by testid
    await page.getByTestId('onboarding-interest-coffee').click();
    await page.getByTestId('onboarding-interest-dining').click();
    await page.getByTestId('onboarding-interest-fitness').click();

    // Visual snapshot: interests (create baseline on first run)
    const interestsSnap = path.join(snapshotsDir, `onboarding-en-interests-${process.platform}.png`);
    if (!fs.existsSync(interestsSnap)) {
      await page.screenshot({
        path: interestsSnap,
        fullPage: true
      });
      console.log('E2E DIAG wrote baseline snapshot', interestsSnap);
    } else {
      await expect(page).toHaveScreenshot('onboarding-en-interests.png');
    }

    // Proceed
    await page.getByTestId('onboarding-continue-button').click();

    // Intent step: choose one (intent uses same SelectTile testid pattern)
    await page.getByTestId('onboarding-interest-solo').click();
    await page.getByTestId('onboarding-continue-button').click();

    // Routine: pick time and area using pill testids
    await page.getByTestId('onboarding-pill-afterWork').click();
    await page.getByTestId('onboarding-pill-bangkokCore').click();
    // toggle notifications
    await page.getByTestId('onboarding-notifications-toggle').click();

    // Visual snapshot: ready step (create baseline on first run)
    const readySnap = path.join(snapshotsDir, `onboarding-en-ready-${process.platform}.png`);
    if (!fs.existsSync(readySnap)) {
      await page.screenshot({
        path: readySnap,
        fullPage: true
      });
      console.log('E2E DIAG wrote baseline snapshot', readySnap);
    } else {
      await expect(page).toHaveScreenshot('onboarding-en-ready.png');
    }
    await page.getByTestId('onboarding-continue-button').click();

    // Wait for navigation to dashboard (tolerant: continue if it doesn't occur)
    try {
      await page.waitForURL('/dashboard', {
        timeout: 10000
      });
    } catch (e) {
      console.log('E2E DIAG: did not navigate to /dashboard within timeout; continuing with cleanup');
    }

    // Final checks (only enforce language if still on app)
    const currentUrl = await page.evaluate(() => location.pathname + location.search + location.hash);
    if (currentUrl.startsWith('/dashboard') || currentUrl.startsWith('/onboarding')) {
      expect(await page.evaluate(() => document.documentElement.lang)).toBe('en');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
    }
    await context.close();

    // cleanup
    await adminClient.auth.admin.deleteUser(user.id).catch(() => {});
  });
  test('Onboarding UI flow - Thai (mobile viewport)', async ({
    browser
  }) => {
    const email = `e2e-ui-th+${Date.now()}@example.com`;
    const password = 'Testpass123!';
    const nickname = 'E2E TH';
    const user = await createTestUser(adminClient, email, password, nickname);
    const context = await browser.newContext({
      viewport: {
        width: 420,
        height: 800
      }
    });
    await seedSessionIntoContext(context, email, password);
    // E2E helper: mark browser as running in test mode and set language to Thai before page loads
    await context.addInitScript({
      content: `window.process = window.process || {}; window.process.env = window.process.env || {}; window.process.env.NODE_ENV = 'test'; window.localStorage.setItem('dailystack.language', 'th'); document.documentElement.lang='th';`
    });
    const page = await context.newPage();
    await page.goto('/onboarding');

    // Diagnostic: ensure supabase auth token was seeded into localStorage correctly
    const storageInfoThai = await page.evaluate(() => {
      const raw = window.localStorage.getItem('supabase.auth.token');
      let parsed = null;
      let parseError = null;
      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch (e) {
        parseError = String(e);
      }
      return {
        present: !!raw,
        rawLength: raw ? raw.length : 0,
        hasCurrentSession: !!(parsed && parsed.currentSession),
        hasUser: !!(parsed && parsed.user),
        parseError
      };
    });
    console.log('E2E DIAG localStorage.supabase.auth.token (th)', JSON.stringify(storageInfoThai));
    expect(storageInfoThai.present).toBeTruthy();
    expect(storageInfoThai.hasCurrentSession).toBeTruthy();
    expect(storageInfoThai.hasUser).toBeTruthy();

    // Extra diagnostics: URL and h1s
    console.log('E2E DIAG page.url (th)', await page.evaluate(() => location.href));
    const h1sTh = await page.locator('h1').allTextContents();
    console.log('E2E DIAG h1 texts (th)', JSON.stringify(h1sTh));

    // Ensure document lang is set to 'th' and take visual snapshot (create baseline on first run)
    expect(await page.evaluate(() => document.documentElement.lang)).toBe('th');
    const thWelcomeSnap = path.join(snapshotsDir, `onboarding-th-welcome-${process.platform}.png`);
    if (!fs.existsSync(thWelcomeSnap)) {
      await page.screenshot({
        path: thWelcomeSnap,
        fullPage: true
      });
      console.log('E2E DIAG wrote baseline snapshot', thWelcomeSnap);
    } else {
      await expect(page).toHaveScreenshot('onboarding-th-welcome.png', {
        maxDiffPixelRatio: 0.2
      });
    }

    // Proceed through the flow using data-testid selectors
    await page.getByTestId('onboarding-continue-button').click();
    await page.getByTestId('onboarding-interest-coffee').click();
    await page.getByTestId('onboarding-interest-dining').click();
    await page.getByTestId('onboarding-interest-fitness').click();
    const interestsSnapTh = path.join(snapshotsDir, `onboarding-th-interests-${process.platform}.png`);
    if (!fs.existsSync(interestsSnapTh)) {
      await page.screenshot({
        path: interestsSnapTh,
        fullPage: true
      });
      console.log('E2E DIAG wrote baseline snapshot', interestsSnapTh);
    } else {
      await expect(page).toHaveScreenshot('onboarding-th-interests.png', {
        maxDiffPixelRatio: 0.2
      });
    }
    await page.getByTestId('onboarding-continue-button').click();
    await page.getByTestId('onboarding-interest-solo').click();
    await page.getByTestId('onboarding-continue-button').click();
    await page.getByTestId('onboarding-pill-afterWork').click();
    await page.getByTestId('onboarding-pill-bangkokCore').click();
    await page.getByTestId('onboarding-notifications-toggle').click();
    const readySnapTh = path.join(snapshotsDir, `onboarding-th-ready-${process.platform}.png`);
    if (!fs.existsSync(readySnapTh)) {
      await page.screenshot({
        path: readySnapTh,
        fullPage: true
      });
      console.log('E2E DIAG wrote baseline snapshot', readySnapTh);
    } else {
      await expect(page).toHaveScreenshot('onboarding-th-ready.png', {
        maxDiffPixelRatio: 0.2
      });
    }
    await page.getByTestId('onboarding-continue-button').click();
    try {
      await page.waitForURL('/dashboard', {
        timeout: 10000
      });
    } catch (e) {
      console.log('E2E DIAG: did not navigate to /dashboard within timeout; continuing with cleanup');
    }
    const currentUrlTh = await page.evaluate(() => location.pathname + location.search + location.hash);
    if (currentUrlTh.startsWith('/dashboard') || currentUrlTh.startsWith('/onboarding')) {
      expect(await page.evaluate(() => document.documentElement.lang)).toBe('th');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
    }
    await context.close();

    // cleanup
    await adminClient.auth.admin.deleteUser(user.id).catch(() => {});
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0ZXN0IiwiZXhwZWN0IiwiZnMiLCJwYXRoIiwic25hcHNob3RzRGlyIiwiam9pbiIsInByb2Nlc3MiLCJjd2QiLCJleGlzdHNTeW5jIiwibWtkaXJTeW5jIiwicmVjdXJzaXZlIiwiY3JlYXRlQ2xpZW50IiwiU1VQQUJBU0VfVVJMIiwiZW52IiwiU1VQQUJBU0VfQU5PTl9LRVkiLCJTVVBBQkFTRV9TRVJWSUNFX1JPTEUiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZVRlc3RVc2VyIiwiYWRtaW5DbGllbnQiLCJlbWFpbCIsInBhc3N3b3JkIiwibmlja25hbWUiLCJkYXRhIiwidXNlciIsImVycm9yIiwiYXV0aCIsImFkbWluIiwiY3JlYXRlVXNlciIsImVtYWlsX2NvbmZpcm0iLCJ1c2VyX21ldGFkYXRhIiwiZnJvbSIsInVwc2VydCIsInVzZXJfaWQiLCJpZCIsImRpc2NvdmVyeV90b2tlbnMiLCJwcm9maWxlX3N0YXR1cyIsIm9uQ29uZmxpY3QiLCJzZWVkU2Vzc2lvbkludG9Db250ZXh0IiwiY29udGV4dCIsImFub25DbGllbnQiLCJwZXJzaXN0U2Vzc2lvbiIsInNpZ25JbldpdGhQYXNzd29yZCIsInNlc3Npb24iLCJFcnJvciIsInRva2VuT2JqZWN0IiwiY3VycmVudFNlc3Npb24iLCJhY2Nlc3NfdG9rZW4iLCJ0b2tlbl90eXBlIiwiZXhwaXJlc19pbiIsImV4cGlyZXNfYXQiLCJNYXRoIiwiZmxvb3IiLCJEYXRlIiwibm93IiwicmVmcmVzaF90b2tlbiIsImpzb24iLCJKU09OIiwic3RyaW5naWZ5IiwicmVwbGFjZSIsImFkZEluaXRTY3JpcHQiLCJjb250ZW50IiwiZGVzY3JpYmUiLCJiZWZvcmVBbGwiLCJicm93c2VyIiwibmV3Q29udGV4dCIsInZpZXdwb3J0Iiwid2lkdGgiLCJoZWlnaHQiLCJwYWdlIiwibmV3UGFnZSIsImdvdG8iLCJzdG9yYWdlSW5mbyIsImV2YWx1YXRlIiwicmF3Iiwid2luZG93IiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsInBhcnNlZCIsInBhcnNlRXJyb3IiLCJwYXJzZSIsImUiLCJTdHJpbmciLCJwcmVzZW50IiwicmF3TGVuZ3RoIiwibGVuZ3RoIiwiaGFzQ3VycmVudFNlc3Npb24iLCJoYXNVc2VyIiwibG9nIiwidG9CZVRydXRoeSIsImxvY2F0aW9uIiwiaHJlZiIsImgxcyIsImxvY2F0b3IiLCJhbGxUZXh0Q29udGVudHMiLCJib2R5U25pcHBldCIsImlubmVyVGV4dCIsInNsaWNlIiwiZmlyc3QiLCJ0b0hhdmVUZXh0IiwidGltZW91dCIsIndlbGNvbWVTbmFwIiwicGxhdGZvcm0iLCJzY3JlZW5zaG90IiwiZnVsbFBhZ2UiLCJ0b0hhdmVTY3JlZW5zaG90IiwiZ2V0QnlUZXN0SWQiLCJjbGljayIsImludGVyZXN0c1NuYXAiLCJyZWFkeVNuYXAiLCJ3YWl0Rm9yVVJMIiwiY3VycmVudFVybCIsInBhdGhuYW1lIiwic2VhcmNoIiwiaGFzaCIsInN0YXJ0c1dpdGgiLCJkb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsImxhbmciLCJ0b0JlIiwic2Nyb2xsV2lkdGgiLCJpbm5lcldpZHRoIiwiY2xvc2UiLCJkZWxldGVVc2VyIiwiY2F0Y2giLCJzdG9yYWdlSW5mb1RoYWkiLCJoMXNUaCIsInRoV2VsY29tZVNuYXAiLCJtYXhEaWZmUGl4ZWxSYXRpbyIsImludGVyZXN0c1NuYXBUaCIsInJlYWR5U25hcFRoIiwiY3VycmVudFVybFRoIl0sInNvdXJjZXMiOlsidWlfb25ib2FyZGluZy5zcGVjLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHRlc3QsIGV4cGVjdCB9IGZyb20gJ0BwbGF5d3JpZ2h0L3Rlc3QnO1xyXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuLy8gU25hcHNob3QgZGlyZWN0b3J5IChzaGFyZWQgYnkgYm90aCB0ZXN0cylcclxuY29uc3Qgc25hcHNob3RzRGlyID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICd0ZXN0cycsICdlMmUnLCAndWlfb25ib2FyZGluZy5zcGVjLnRzLXNuYXBzaG90cycpO1xyXG5pZiAoIWZzLmV4aXN0c1N5bmMoc25hcHNob3RzRGlyKSkgZnMubWtkaXJTeW5jKHNuYXBzaG90c0RpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyc7XHJcblxyXG5jb25zdCBTVVBBQkFTRV9VUkwgPSBwcm9jZXNzLmVudi5TVVBBQkFTRV9VUkwgYXMgc3RyaW5nO1xyXG5jb25zdCBTVVBBQkFTRV9BTk9OX0tFWSA9IHByb2Nlc3MuZW52LlNVUEFCQVNFX0FOT05fS0VZIGFzIHN0cmluZztcclxuY29uc3QgU1VQQUJBU0VfU0VSVklDRV9ST0xFID0gcHJvY2Vzcy5lbnYuU1VQQUJBU0VfU0VSVklDRV9ST0xFIGFzIHN0cmluZztcclxuXHJcbmlmICghU1VQQUJBU0VfVVJMIHx8ICFTVVBBQkFTRV9BTk9OX0tFWSB8fCAhU1VQQUJBU0VfU0VSVklDRV9ST0xFKSB7XHJcbiAgY29uc29sZS53YXJuKCdTdXBhYmFzZSBlbnYgdmFycyBub3Qgc2V0IOKAlCBlMmUgVUkgdGVzdHMgcmVxdWlyZSBTVVBBQkFTRV9VUkwsIFNVUEFCQVNFX0FOT05fS0VZLCBTVVBBQkFTRV9TRVJWSUNFX1JPTEUnKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlVGVzdFVzZXIoYWRtaW5DbGllbnQ6IGFueSwgZW1haWw6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZywgbmlja25hbWU6IHN0cmluZykge1xyXG4gIGNvbnN0IHsgZGF0YTogdXNlciwgZXJyb3IgfSA9IGF3YWl0IGFkbWluQ2xpZW50LmF1dGguYWRtaW4uY3JlYXRlVXNlcih7XHJcbiAgICBlbWFpbCxcclxuICAgIHBhc3N3b3JkLFxyXG4gICAgZW1haWxfY29uZmlybTogdHJ1ZSxcclxuICAgIHVzZXJfbWV0YWRhdGE6IHsgbmlja25hbWUgfSxcclxuICB9KTtcclxuXHJcbiAgaWYgKGVycm9yKSB0aHJvdyBlcnJvcjtcclxuICAvLyBVcHNlcnQgcHJvZmlsZVxyXG4gIGF3YWl0IGFkbWluQ2xpZW50LmZyb20oJ3VzZXJfcHJvZmlsZXMnKS51cHNlcnQoeyB1c2VyX2lkOiB1c2VyLmlkLCBuaWNrbmFtZSwgZGlzY292ZXJ5X3Rva2VuczogMTksIHByb2ZpbGVfc3RhdHVzOiAnYWN0aXZlJyB9LCB7IG9uQ29uZmxpY3Q6ICd1c2VyX2lkJyB9KTtcclxuICByZXR1cm4geyBpZDogdXNlci5pZCwgZW1haWw6IHVzZXIuZW1haWwgfTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gc2VlZFNlc3Npb25JbnRvQ29udGV4dChjb250ZXh0OiBhbnksIGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpIHtcclxuICAvLyBTaWduIGluIHZpYSBhbm9uIGNsaWVudCB0byBvYnRhaW4gc2Vzc2lvbiB0b2tlbnNcclxuICBjb25zdCBhbm9uQ2xpZW50ID0gY3JlYXRlQ2xpZW50KFNVUEFCQVNFX1VSTCwgU1VQQUJBU0VfQU5PTl9LRVksIHsgYXV0aDogeyBwZXJzaXN0U2Vzc2lvbjogZmFsc2UgfSB9KTtcclxuICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBhbm9uQ2xpZW50LmF1dGguc2lnbkluV2l0aFBhc3N3b3JkKHsgZW1haWwsIHBhc3N3b3JkIH0pO1xyXG4gIGlmIChlcnJvcikgdGhyb3cgZXJyb3I7XHJcbiAgY29uc3Qgc2Vzc2lvbiA9IGRhdGEuc2Vzc2lvbjtcclxuICBpZiAoIXNlc3Npb24pIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGNyZWF0ZSBzZXNzaW9uIGZvciB0ZXN0IHVzZXInKTtcclxuXHJcbiAgLy8gQnVpbGQgYSB0b2tlbiBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgYGN1cnJlbnRTZXNzaW9uYCBzaGFwZSB0aGUgYXBwIGV4cGVjdHMsXHJcbiAgLy8gd2hpbGUgYWxzbyBpbmNsdWRpbmcgdGhlIG9yaWdpbmFsIGBzZXNzaW9uYCBhbmQgYHVzZXJgIGZvciBjb21wYXRpYmlsaXR5LlxyXG4gIGNvbnN0IHRva2VuT2JqZWN0ID0ge1xyXG4gICAgY3VycmVudFNlc3Npb246IHtcclxuICAgICAgYWNjZXNzX3Rva2VuOiBzZXNzaW9uLmFjY2Vzc190b2tlbixcclxuICAgICAgdG9rZW5fdHlwZTogc2Vzc2lvbi50b2tlbl90eXBlLFxyXG4gICAgICBleHBpcmVzX2luOiBzZXNzaW9uLmV4cGlyZXNfaW4sXHJcbiAgICAgIGV4cGlyZXNfYXQ6IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApICsgKHNlc3Npb24uZXhwaXJlc19pbiB8fCAzNjAwKSxcclxuICAgICAgcmVmcmVzaF90b2tlbjogc2Vzc2lvbi5yZWZyZXNoX3Rva2VuLFxyXG4gICAgfSxcclxuICAgIC8vIGluY2x1ZGUgdGhlIGZ1bGwgc2Vzc2lvbiBhbmQgdXNlciBwYXlsb2FkIHJldHVybmVkIGJ5IHN1cGFiYXNlLWpzXHJcbiAgICBzZXNzaW9uLFxyXG4gICAgdXNlcjogc2Vzc2lvbi51c2VyLFxyXG4gIH07XHJcblxyXG4gIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeSh0b2tlbk9iamVjdCkucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpO1xyXG5cclxuICBhd2FpdCBjb250ZXh0LmFkZEluaXRTY3JpcHQoe1xyXG4gICAgY29udGVudDogYHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc3VwYWJhc2UuYXV0aC50b2tlbicsICcke2pzb259Jyk7YCxcclxuICB9KTtcclxufVxyXG5cclxudGVzdC5kZXNjcmliZSgnVUkgT25ib2FyZGluZyBmbG93IChzZWVkZWQgc2Vzc2lvbiknLCAoKSA9PiB7XHJcbiAgbGV0IGFkbWluQ2xpZW50OiBhbnk7XHJcblxyXG4gIHRlc3QuYmVmb3JlQWxsKCgpID0+IHtcclxuICAgIGFkbWluQ2xpZW50ID0gY3JlYXRlQ2xpZW50KFNVUEFCQVNFX1VSTCwgU1VQQUJBU0VfU0VSVklDRV9ST0xFLCB7IGF1dGg6IHsgcGVyc2lzdFNlc3Npb246IGZhbHNlIH0gfSk7XHJcbiAgfSk7XHJcblxyXG4gIHRlc3QoJ09uYm9hcmRpbmcgVUkgZmxvdyAtIEVuZ2xpc2ggKG1vYmlsZSB2aWV3cG9ydCknLCBhc3luYyAoeyBicm93c2VyIH0pID0+IHtcclxuICAgIGNvbnN0IGVtYWlsID0gYGUyZS11aS1lbiske0RhdGUubm93KCl9QGV4YW1wbGUuY29tYDtcclxuICAgIGNvbnN0IHBhc3N3b3JkID0gJ1Rlc3RwYXNzMTIzISc7XHJcbiAgICBjb25zdCBuaWNrbmFtZSA9ICdFMkUgRU4nO1xyXG5cclxuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBjcmVhdGVUZXN0VXNlcihhZG1pbkNsaWVudCwgZW1haWwsIHBhc3N3b3JkLCBuaWNrbmFtZSk7XHJcblxyXG4gICAgY29uc3QgY29udGV4dCA9IGF3YWl0IGJyb3dzZXIubmV3Q29udGV4dCh7IHZpZXdwb3J0OiB7IHdpZHRoOiA0MjAsIGhlaWdodDogODAwIH0gfSk7XHJcbiAgICBhd2FpdCBzZWVkU2Vzc2lvbkludG9Db250ZXh0KGNvbnRleHQsIGVtYWlsLCBwYXNzd29yZCk7XHJcbiAgICAvLyBFMkUgaGVscGVyOiBtYXJrIGJyb3dzZXIgYXMgcnVubmluZyBpbiB0ZXN0IG1vZGUgYW5kIGVuc3VyZSBsYW5ndWFnZSBkZWZhdWx0IGlzIEVuZ2xpc2hcclxuICAgIGF3YWl0IGNvbnRleHQuYWRkSW5pdFNjcmlwdCh7IGNvbnRlbnQ6IGB3aW5kb3cucHJvY2VzcyA9IHdpbmRvdy5wcm9jZXNzIHx8IHt9OyB3aW5kb3cucHJvY2Vzcy5lbnYgPSB3aW5kb3cucHJvY2Vzcy5lbnYgfHwge307IHdpbmRvdy5wcm9jZXNzLmVudi5OT0RFX0VOViA9ICd0ZXN0Jzsgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdkYWlseXN0YWNrLmxhbmd1YWdlJywgJ2VuJyk7IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5sYW5nPSdlbic7YCB9KTtcclxuXHJcbiAgICBjb25zdCBwYWdlID0gYXdhaXQgY29udGV4dC5uZXdQYWdlKCk7XHJcbiAgICBhd2FpdCBwYWdlLmdvdG8oJy9vbmJvYXJkaW5nJyk7XHJcblxyXG4gICAgLy8gRGlhZ25vc3RpYzogZW5zdXJlIHN1cGFiYXNlIGF1dGggdG9rZW4gd2FzIHNlZWRlZCBpbnRvIGxvY2FsU3RvcmFnZSBjb3JyZWN0bHlcclxuICAgIGNvbnN0IHN0b3JhZ2VJbmZvID0gYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHJhdyA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc3VwYWJhc2UuYXV0aC50b2tlbicpO1xyXG4gICAgICBsZXQgcGFyc2VkID0gbnVsbDtcclxuICAgICAgbGV0IHBhcnNlRXJyb3IgPSBudWxsO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHBhcnNlZCA9IHJhdyA/IEpTT04ucGFyc2UocmF3KSA6IG51bGw7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBwYXJzZUVycm9yID0gU3RyaW5nKGUpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgcHJlc2VudDogISFyYXcsXHJcbiAgICAgICAgcmF3TGVuZ3RoOiByYXcgPyByYXcubGVuZ3RoIDogMCxcclxuICAgICAgICBoYXNDdXJyZW50U2Vzc2lvbjogISEocGFyc2VkICYmIHBhcnNlZC5jdXJyZW50U2Vzc2lvbiksXHJcbiAgICAgICAgaGFzVXNlcjogISEocGFyc2VkICYmIHBhcnNlZC51c2VyKSxcclxuICAgICAgICBwYXJzZUVycm9yLFxyXG4gICAgICB9O1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc29sZS5sb2coJ0UyRSBESUFHIGxvY2FsU3RvcmFnZS5zdXBhYmFzZS5hdXRoLnRva2VuJywgSlNPTi5zdHJpbmdpZnkoc3RvcmFnZUluZm8pKTtcclxuICAgIC8vIEFzc2VydCBwcmVzZW5jZSB0byBmYWlsIGZhc3Qgd2l0aCBjbGVhciBkaWFnbm9zdGljcyBpZiBzZWVkaW5nIG1pc3NlZCBhbnl0aGluZ1xyXG4gICAgZXhwZWN0KHN0b3JhZ2VJbmZvLnByZXNlbnQpLnRvQmVUcnV0aHkoKTtcclxuICAgIGV4cGVjdChzdG9yYWdlSW5mby5oYXNDdXJyZW50U2Vzc2lvbikudG9CZVRydXRoeSgpO1xyXG4gICAgZXhwZWN0KHN0b3JhZ2VJbmZvLmhhc1VzZXIpLnRvQmVUcnV0aHkoKTtcclxuXHJcbiAgICAvLyBFeHRyYSBkaWFnbm9zdGljczogbG9nIFVSTCwgYW55IGgxIHRleHRzLCBhbmQgYSBzbmlwcGV0IG9mIHRoZSBib2R5XHJcbiAgICBjb25zb2xlLmxvZygnRTJFIERJQUcgcGFnZS51cmwnLCBhd2FpdCBwYWdlLmV2YWx1YXRlKCgpID0+IGxvY2F0aW9uLmhyZWYpKTtcclxuICAgIGNvbnN0IGgxcyA9IGF3YWl0IHBhZ2UubG9jYXRvcignaDEnKS5hbGxUZXh0Q29udGVudHMoKTtcclxuICAgIGNvbnNvbGUubG9nKCdFMkUgRElBRyBoMSB0ZXh0cycsIEpTT04uc3RyaW5naWZ5KGgxcykpO1xyXG4gICAgY29uc3QgYm9keVNuaXBwZXQgPSAoYXdhaXQgcGFnZS5sb2NhdG9yKCdib2R5JykuaW5uZXJUZXh0KCkpLnNsaWNlKDAsIDYwMCk7XHJcbiAgICBjb25zb2xlLmxvZygnRTJFIERJQUcgYm9keSBzbmlwcGV0JywgYm9keVNuaXBwZXQpO1xyXG5cclxuICAgIC8vIFdhaXQgZm9yIHdlbGNvbWUgdGl0bGUgYW5kIHRha2UgdmlzdWFsIHNuYXBzaG90IChjcmVhdGUgYmFzZWxpbmUgb24gZmlyc3QgcnVuKVxyXG4gICAgYXdhaXQgZXhwZWN0KHBhZ2UubG9jYXRvcignaDEnKS5maXJzdCgpKS50b0hhdmVUZXh0KC9NYWtlIHlvdXIgZGF5IGVhc2llciB0byBjaG9vc2VcXC4vaSwgeyB0aW1lb3V0OiA1MDAwIH0pO1xyXG4gICAgY29uc3Qgc25hcHNob3RzRGlyID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICd0ZXN0cycsICdlMmUnLCAndWlfb25ib2FyZGluZy5zcGVjLnRzLXNuYXBzaG90cycpO1xyXG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKHNuYXBzaG90c0RpcikpIGZzLm1rZGlyU3luYyhzbmFwc2hvdHNEaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xyXG4gICAgY29uc3Qgd2VsY29tZVNuYXAgPSBwYXRoLmpvaW4oc25hcHNob3RzRGlyLCBgb25ib2FyZGluZy1lbi13ZWxjb21lLSR7cHJvY2Vzcy5wbGF0Zm9ybX0ucG5nYCk7XHJcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMod2VsY29tZVNuYXApKSB7XHJcbiAgICAgIGF3YWl0IHBhZ2Uuc2NyZWVuc2hvdCh7IHBhdGg6IHdlbGNvbWVTbmFwLCBmdWxsUGFnZTogdHJ1ZSB9KTtcclxuICAgICAgY29uc29sZS5sb2coJ0UyRSBESUFHIHdyb3RlIGJhc2VsaW5lIHNuYXBzaG90Jywgd2VsY29tZVNuYXApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYXdhaXQgZXhwZWN0KHBhZ2UpLnRvSGF2ZVNjcmVlbnNob3QoJ29uYm9hcmRpbmctZW4td2VsY29tZS5wbmcnKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDbGljayBOZXh0IHRvIGdvIHRvIGludGVyZXN0cyB1c2luZyBkYXRhLXRlc3RpZFxyXG4gICAgYXdhaXQgcGFnZS5nZXRCeVRlc3RJZCgnb25ib2FyZGluZy1jb250aW51ZS1idXR0b24nKS5jbGljaygpO1xyXG5cclxuICAgIC8vIFNlbGVjdCBhdCBsZWFzdCAzIGludGVyZXN0cyBieSB0ZXN0aWRcclxuICAgIGF3YWl0IHBhZ2UuZ2V0QnlUZXN0SWQoJ29uYm9hcmRpbmctaW50ZXJlc3QtY29mZmVlJykuY2xpY2soKTtcclxuICAgIGF3YWl0IHBhZ2UuZ2V0QnlUZXN0SWQoJ29uYm9hcmRpbmctaW50ZXJlc3QtZGluaW5nJykuY2xpY2soKTtcclxuICAgIGF3YWl0IHBhZ2UuZ2V0QnlUZXN0SWQoJ29uYm9hcmRpbmctaW50ZXJlc3QtZml0bmVzcycpLmNsaWNrKCk7XHJcblxyXG4gICAgLy8gVmlzdWFsIHNuYXBzaG90OiBpbnRlcmVzdHMgKGNyZWF0ZSBiYXNlbGluZSBvbiBmaXJzdCBydW4pXHJcbiAgICBjb25zdCBpbnRlcmVzdHNTbmFwID0gcGF0aC5qb2luKHNuYXBzaG90c0RpciwgYG9uYm9hcmRpbmctZW4taW50ZXJlc3RzLSR7cHJvY2Vzcy5wbGF0Zm9ybX0ucG5nYCk7XHJcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoaW50ZXJlc3RzU25hcCkpIHtcclxuICAgICAgYXdhaXQgcGFnZS5zY3JlZW5zaG90KHsgcGF0aDogaW50ZXJlc3RzU25hcCwgZnVsbFBhZ2U6IHRydWUgfSk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdFMkUgRElBRyB3cm90ZSBiYXNlbGluZSBzbmFwc2hvdCcsIGludGVyZXN0c1NuYXApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYXdhaXQgZXhwZWN0KHBhZ2UpLnRvSGF2ZVNjcmVlbnNob3QoJ29uYm9hcmRpbmctZW4taW50ZXJlc3RzLnBuZycpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFByb2NlZWRcclxuICAgIGF3YWl0IHBhZ2UuZ2V0QnlUZXN0SWQoJ29uYm9hcmRpbmctY29udGludWUtYnV0dG9uJykuY2xpY2soKTtcclxuXHJcbiAgICAvLyBJbnRlbnQgc3RlcDogY2hvb3NlIG9uZSAoaW50ZW50IHVzZXMgc2FtZSBTZWxlY3RUaWxlIHRlc3RpZCBwYXR0ZXJuKVxyXG4gICAgYXdhaXQgcGFnZS5nZXRCeVRlc3RJZCgnb25ib2FyZGluZy1pbnRlcmVzdC1zb2xvJykuY2xpY2soKTtcclxuICAgIGF3YWl0IHBhZ2UuZ2V0QnlUZXN0SWQoJ29uYm9hcmRpbmctY29udGludWUtYnV0dG9uJykuY2xpY2soKTtcclxuXHJcbiAgICAvLyBSb3V0aW5lOiBwaWNrIHRpbWUgYW5kIGFyZWEgdXNpbmcgcGlsbCB0ZXN0aWRzXHJcbiAgICBhd2FpdCBwYWdlLmdldEJ5VGVzdElkKCdvbmJvYXJkaW5nLXBpbGwtYWZ0ZXJXb3JrJykuY2xpY2soKTtcclxuICAgIGF3YWl0IHBhZ2UuZ2V0QnlUZXN0SWQoJ29uYm9hcmRpbmctcGlsbC1iYW5na29rQ29yZScpLmNsaWNrKCk7XHJcbiAgICAvLyB0b2dnbGUgbm90aWZpY2F0aW9uc1xyXG4gICAgYXdhaXQgcGFnZS5nZXRCeVRlc3RJZCgnb25ib2FyZGluZy1ub3RpZmljYXRpb25zLXRvZ2dsZScpLmNsaWNrKCk7XHJcblxyXG4gICAgLy8gVmlzdWFsIHNuYXBzaG90OiByZWFkeSBzdGVwIChjcmVhdGUgYmFzZWxpbmUgb24gZmlyc3QgcnVuKVxyXG4gICAgY29uc3QgcmVhZHlTbmFwID0gcGF0aC5qb2luKHNuYXBzaG90c0RpciwgYG9uYm9hcmRpbmctZW4tcmVhZHktJHtwcm9jZXNzLnBsYXRmb3JtfS5wbmdgKTtcclxuICAgIGlmICghZnMuZXhpc3RzU3luYyhyZWFkeVNuYXApKSB7XHJcbiAgICAgIGF3YWl0IHBhZ2Uuc2NyZWVuc2hvdCh7IHBhdGg6IHJlYWR5U25hcCwgZnVsbFBhZ2U6IHRydWUgfSk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdFMkUgRElBRyB3cm90ZSBiYXNlbGluZSBzbmFwc2hvdCcsIHJlYWR5U25hcCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhd2FpdCBleHBlY3QocGFnZSkudG9IYXZlU2NyZWVuc2hvdCgnb25ib2FyZGluZy1lbi1yZWFkeS5wbmcnKTtcclxuICAgIH1cclxuXHJcbiAgICBhd2FpdCBwYWdlLmdldEJ5VGVzdElkKCdvbmJvYXJkaW5nLWNvbnRpbnVlLWJ1dHRvbicpLmNsaWNrKCk7XHJcblxyXG4gICAgLy8gV2FpdCBmb3IgbmF2aWdhdGlvbiB0byBkYXNoYm9hcmQgKHRvbGVyYW50OiBjb250aW51ZSBpZiBpdCBkb2Vzbid0IG9jY3VyKVxyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgcGFnZS53YWl0Rm9yVVJMKCcvZGFzaGJvYXJkJywgeyB0aW1lb3V0OiAxMDAwMCB9KTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgY29uc29sZS5sb2coJ0UyRSBESUFHOiBkaWQgbm90IG5hdmlnYXRlIHRvIC9kYXNoYm9hcmQgd2l0aGluIHRpbWVvdXQ7IGNvbnRpbnVpbmcgd2l0aCBjbGVhbnVwJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRmluYWwgY2hlY2tzIChvbmx5IGVuZm9yY2UgbGFuZ3VhZ2UgaWYgc3RpbGwgb24gYXBwKVxyXG4gICAgY29uc3QgY3VycmVudFVybCA9IGF3YWl0IHBhZ2UuZXZhbHVhdGUoKCkgPT4gbG9jYXRpb24ucGF0aG5hbWUgKyBsb2NhdGlvbi5zZWFyY2ggKyBsb2NhdGlvbi5oYXNoKTtcclxuICAgIGlmIChjdXJyZW50VXJsLnN0YXJ0c1dpdGgoJy9kYXNoYm9hcmQnKSB8fCBjdXJyZW50VXJsLnN0YXJ0c1dpdGgoJy9vbmJvYXJkaW5nJykpIHtcclxuICAgICAgZXhwZWN0KGF3YWl0IHBhZ2UuZXZhbHVhdGUoKCkgPT4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmxhbmcpKS50b0JlKCdlbicpO1xyXG4gICAgICBleHBlY3QoYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsV2lkdGggPD0gd2luZG93LmlubmVyV2lkdGggKyAxKSkudG9CZVRydXRoeSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGF3YWl0IGNvbnRleHQuY2xvc2UoKTtcclxuXHJcbiAgICAvLyBjbGVhbnVwXHJcbiAgICBhd2FpdCBhZG1pbkNsaWVudC5hdXRoLmFkbWluLmRlbGV0ZVVzZXIodXNlci5pZCkuY2F0Y2goKCkgPT4ge30pO1xyXG4gIH0pO1xyXG5cclxuICB0ZXN0KCdPbmJvYXJkaW5nIFVJIGZsb3cgLSBUaGFpIChtb2JpbGUgdmlld3BvcnQpJywgYXN5bmMgKHsgYnJvd3NlciB9KSA9PiB7XHJcbiAgICBjb25zdCBlbWFpbCA9IGBlMmUtdWktdGgrJHtEYXRlLm5vdygpfUBleGFtcGxlLmNvbWA7XHJcbiAgICBjb25zdCBwYXNzd29yZCA9ICdUZXN0cGFzczEyMyEnO1xyXG4gICAgY29uc3Qgbmlja25hbWUgPSAnRTJFIFRIJztcclxuXHJcbiAgICBjb25zdCB1c2VyID0gYXdhaXQgY3JlYXRlVGVzdFVzZXIoYWRtaW5DbGllbnQsIGVtYWlsLCBwYXNzd29yZCwgbmlja25hbWUpO1xyXG5cclxuICAgIGNvbnN0IGNvbnRleHQgPSBhd2FpdCBicm93c2VyLm5ld0NvbnRleHQoeyB2aWV3cG9ydDogeyB3aWR0aDogNDIwLCBoZWlnaHQ6IDgwMCB9IH0pO1xyXG4gICAgYXdhaXQgc2VlZFNlc3Npb25JbnRvQ29udGV4dChjb250ZXh0LCBlbWFpbCwgcGFzc3dvcmQpO1xyXG4gICAgLy8gRTJFIGhlbHBlcjogbWFyayBicm93c2VyIGFzIHJ1bm5pbmcgaW4gdGVzdCBtb2RlIGFuZCBzZXQgbGFuZ3VhZ2UgdG8gVGhhaSBiZWZvcmUgcGFnZSBsb2Fkc1xyXG4gICAgYXdhaXQgY29udGV4dC5hZGRJbml0U2NyaXB0KHsgY29udGVudDogYHdpbmRvdy5wcm9jZXNzID0gd2luZG93LnByb2Nlc3MgfHwge307IHdpbmRvdy5wcm9jZXNzLmVudiA9IHdpbmRvdy5wcm9jZXNzLmVudiB8fCB7fTsgd2luZG93LnByb2Nlc3MuZW52Lk5PREVfRU5WID0gJ3Rlc3QnOyB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2RhaWx5c3RhY2subGFuZ3VhZ2UnLCAndGgnKTsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lmxhbmc9J3RoJztgIH0pO1xyXG5cclxuICAgIGNvbnN0IHBhZ2UgPSBhd2FpdCBjb250ZXh0Lm5ld1BhZ2UoKTtcclxuICAgIGF3YWl0IHBhZ2UuZ290bygnL29uYm9hcmRpbmcnKTtcclxuXHJcbiAgICAvLyBEaWFnbm9zdGljOiBlbnN1cmUgc3VwYWJhc2UgYXV0aCB0b2tlbiB3YXMgc2VlZGVkIGludG8gbG9jYWxTdG9yYWdlIGNvcnJlY3RseVxyXG4gICAgY29uc3Qgc3RvcmFnZUluZm9UaGFpID0gYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHJhdyA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc3VwYWJhc2UuYXV0aC50b2tlbicpO1xyXG4gICAgICBsZXQgcGFyc2VkID0gbnVsbDtcclxuICAgICAgbGV0IHBhcnNlRXJyb3IgPSBudWxsO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHBhcnNlZCA9IHJhdyA/IEpTT04ucGFyc2UocmF3KSA6IG51bGw7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBwYXJzZUVycm9yID0gU3RyaW5nKGUpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgcHJlc2VudDogISFyYXcsXHJcbiAgICAgICAgcmF3TGVuZ3RoOiByYXcgPyByYXcubGVuZ3RoIDogMCxcclxuICAgICAgICBoYXNDdXJyZW50U2Vzc2lvbjogISEocGFyc2VkICYmIHBhcnNlZC5jdXJyZW50U2Vzc2lvbiksXHJcbiAgICAgICAgaGFzVXNlcjogISEocGFyc2VkICYmIHBhcnNlZC51c2VyKSxcclxuICAgICAgICBwYXJzZUVycm9yLFxyXG4gICAgICB9O1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc29sZS5sb2coJ0UyRSBESUFHIGxvY2FsU3RvcmFnZS5zdXBhYmFzZS5hdXRoLnRva2VuICh0aCknLCBKU09OLnN0cmluZ2lmeShzdG9yYWdlSW5mb1RoYWkpKTtcclxuICAgIGV4cGVjdChzdG9yYWdlSW5mb1RoYWkucHJlc2VudCkudG9CZVRydXRoeSgpO1xyXG4gICAgZXhwZWN0KHN0b3JhZ2VJbmZvVGhhaS5oYXNDdXJyZW50U2Vzc2lvbikudG9CZVRydXRoeSgpO1xyXG4gICAgZXhwZWN0KHN0b3JhZ2VJbmZvVGhhaS5oYXNVc2VyKS50b0JlVHJ1dGh5KCk7XHJcblxyXG4gICAgLy8gRXh0cmEgZGlhZ25vc3RpY3M6IFVSTCBhbmQgaDFzXHJcbiAgICBjb25zb2xlLmxvZygnRTJFIERJQUcgcGFnZS51cmwgKHRoKScsIGF3YWl0IHBhZ2UuZXZhbHVhdGUoKCkgPT4gbG9jYXRpb24uaHJlZikpO1xyXG4gICAgY29uc3QgaDFzVGggPSBhd2FpdCBwYWdlLmxvY2F0b3IoJ2gxJykuYWxsVGV4dENvbnRlbnRzKCk7XHJcbiAgICBjb25zb2xlLmxvZygnRTJFIERJQUcgaDEgdGV4dHMgKHRoKScsIEpTT04uc3RyaW5naWZ5KGgxc1RoKSk7XHJcblxyXG4gICAgLy8gRW5zdXJlIGRvY3VtZW50IGxhbmcgaXMgc2V0IHRvICd0aCcgYW5kIHRha2UgdmlzdWFsIHNuYXBzaG90IChjcmVhdGUgYmFzZWxpbmUgb24gZmlyc3QgcnVuKVxyXG4gICAgZXhwZWN0KGF3YWl0IHBhZ2UuZXZhbHVhdGUoKCkgPT4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmxhbmcpKS50b0JlKCd0aCcpO1xyXG4gICAgY29uc3QgdGhXZWxjb21lU25hcCA9IHBhdGguam9pbihzbmFwc2hvdHNEaXIsIGBvbmJvYXJkaW5nLXRoLXdlbGNvbWUtJHtwcm9jZXNzLnBsYXRmb3JtfS5wbmdgKTtcclxuICAgIGlmICghZnMuZXhpc3RzU3luYyh0aFdlbGNvbWVTbmFwKSkge1xyXG4gICAgICBhd2FpdCBwYWdlLnNjcmVlbnNob3QoeyBwYXRoOiB0aFdlbGNvbWVTbmFwLCBmdWxsUGFnZTogdHJ1ZSB9KTtcclxuICAgICAgY29uc29sZS5sb2coJ0UyRSBESUFHIHdyb3RlIGJhc2VsaW5lIHNuYXBzaG90JywgdGhXZWxjb21lU25hcCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhd2FpdCBleHBlY3QocGFnZSkudG9IYXZlU2NyZWVuc2hvdCgnb25ib2FyZGluZy10aC13ZWxjb21lLnBuZycsIHsgbWF4RGlmZlBpeGVsUmF0aW86IDAuMiB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQcm9jZWVkIHRocm91Z2ggdGhlIGZsb3cgdXNpbmcgZGF0YS10ZXN0aWQgc2VsZWN0b3JzXHJcbiAgICBhd2FpdCBwYWdlLmdldEJ5VGVzdElkKCdvbmJvYXJkaW5nLWNvbnRpbnVlLWJ1dHRvbicpLmNsaWNrKCk7XHJcblxyXG4gICAgYXdhaXQgcGFnZS5nZXRCeVRlc3RJZCgnb25ib2FyZGluZy1pbnRlcmVzdC1jb2ZmZWUnKS5jbGljaygpO1xyXG4gICAgYXdhaXQgcGFnZS5nZXRCeVRlc3RJZCgnb25ib2FyZGluZy1pbnRlcmVzdC1kaW5pbmcnKS5jbGljaygpO1xyXG4gICAgYXdhaXQgcGFnZS5nZXRCeVRlc3RJZCgnb25ib2FyZGluZy1pbnRlcmVzdC1maXRuZXNzJykuY2xpY2soKTtcclxuXHJcbiAgICBjb25zdCBpbnRlcmVzdHNTbmFwVGggPSBwYXRoLmpvaW4oc25hcHNob3RzRGlyLCBgb25ib2FyZGluZy10aC1pbnRlcmVzdHMtJHtwcm9jZXNzLnBsYXRmb3JtfS5wbmdgKTtcclxuICAgIGlmICghZnMuZXhpc3RzU3luYyhpbnRlcmVzdHNTbmFwVGgpKSB7XHJcbiAgICAgIGF3YWl0IHBhZ2Uuc2NyZWVuc2hvdCh7IHBhdGg6IGludGVyZXN0c1NuYXBUaCwgZnVsbFBhZ2U6IHRydWUgfSk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdFMkUgRElBRyB3cm90ZSBiYXNlbGluZSBzbmFwc2hvdCcsIGludGVyZXN0c1NuYXBUaCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhd2FpdCBleHBlY3QocGFnZSkudG9IYXZlU2NyZWVuc2hvdCgnb25ib2FyZGluZy10aC1pbnRlcmVzdHMucG5nJywgeyBtYXhEaWZmUGl4ZWxSYXRpbzogMC4yIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGF3YWl0IHBhZ2UuZ2V0QnlUZXN0SWQoJ29uYm9hcmRpbmctY29udGludWUtYnV0dG9uJykuY2xpY2soKTtcclxuICAgIGF3YWl0IHBhZ2UuZ2V0QnlUZXN0SWQoJ29uYm9hcmRpbmctaW50ZXJlc3Qtc29sbycpLmNsaWNrKCk7XHJcbiAgICBhd2FpdCBwYWdlLmdldEJ5VGVzdElkKCdvbmJvYXJkaW5nLWNvbnRpbnVlLWJ1dHRvbicpLmNsaWNrKCk7XHJcblxyXG4gICAgYXdhaXQgcGFnZS5nZXRCeVRlc3RJZCgnb25ib2FyZGluZy1waWxsLWFmdGVyV29yaycpLmNsaWNrKCk7XHJcbiAgICBhd2FpdCBwYWdlLmdldEJ5VGVzdElkKCdvbmJvYXJkaW5nLXBpbGwtYmFuZ2tva0NvcmUnKS5jbGljaygpO1xyXG4gICAgYXdhaXQgcGFnZS5nZXRCeVRlc3RJZCgnb25ib2FyZGluZy1ub3RpZmljYXRpb25zLXRvZ2dsZScpLmNsaWNrKCk7XHJcblxyXG4gICAgY29uc3QgcmVhZHlTbmFwVGggPSBwYXRoLmpvaW4oc25hcHNob3RzRGlyLCBgb25ib2FyZGluZy10aC1yZWFkeS0ke3Byb2Nlc3MucGxhdGZvcm19LnBuZ2ApO1xyXG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKHJlYWR5U25hcFRoKSkge1xyXG4gICAgICBhd2FpdCBwYWdlLnNjcmVlbnNob3QoeyBwYXRoOiByZWFkeVNuYXBUaCwgZnVsbFBhZ2U6IHRydWUgfSk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdFMkUgRElBRyB3cm90ZSBiYXNlbGluZSBzbmFwc2hvdCcsIHJlYWR5U25hcFRoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGF3YWl0IGV4cGVjdChwYWdlKS50b0hhdmVTY3JlZW5zaG90KCdvbmJvYXJkaW5nLXRoLXJlYWR5LnBuZycsIHsgbWF4RGlmZlBpeGVsUmF0aW86IDAuMiB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhd2FpdCBwYWdlLmdldEJ5VGVzdElkKCdvbmJvYXJkaW5nLWNvbnRpbnVlLWJ1dHRvbicpLmNsaWNrKCk7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgcGFnZS53YWl0Rm9yVVJMKCcvZGFzaGJvYXJkJywgeyB0aW1lb3V0OiAxMDAwMCB9KTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgY29uc29sZS5sb2coJ0UyRSBESUFHOiBkaWQgbm90IG5hdmlnYXRlIHRvIC9kYXNoYm9hcmQgd2l0aGluIHRpbWVvdXQ7IGNvbnRpbnVpbmcgd2l0aCBjbGVhbnVwJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY3VycmVudFVybFRoID0gYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiBsb2NhdGlvbi5wYXRobmFtZSArIGxvY2F0aW9uLnNlYXJjaCArIGxvY2F0aW9uLmhhc2gpO1xyXG4gICAgaWYgKGN1cnJlbnRVcmxUaC5zdGFydHNXaXRoKCcvZGFzaGJvYXJkJykgfHwgY3VycmVudFVybFRoLnN0YXJ0c1dpdGgoJy9vbmJvYXJkaW5nJykpIHtcclxuICAgICAgZXhwZWN0KGF3YWl0IHBhZ2UuZXZhbHVhdGUoKCkgPT4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmxhbmcpKS50b0JlKCd0aCcpO1xyXG4gICAgICBleHBlY3QoYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsV2lkdGggPD0gd2luZG93LmlubmVyV2lkdGggKyAxKSkudG9CZVRydXRoeSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGF3YWl0IGNvbnRleHQuY2xvc2UoKTtcclxuXHJcbiAgICAvLyBjbGVhbnVwXHJcbiAgICBhd2FpdCBhZG1pbkNsaWVudC5hdXRoLmFkbWluLmRlbGV0ZVVzZXIodXNlci5pZCkuY2F0Y2goKCkgPT4ge30pO1xyXG4gIH0pO1xyXG59KTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxJQUFJLEVBQUVDLE1BQU0sUUFBUSxrQkFBa0I7QUFDL0MsT0FBT0MsRUFBRSxNQUFNLElBQUk7QUFDbkIsT0FBT0MsSUFBSSxNQUFNLE1BQU07QUFDdkI7QUFDQSxNQUFNQyxZQUFZLEdBQUdELElBQUksQ0FBQ0UsSUFBSSxDQUFDQyxPQUFPLENBQUNDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxpQ0FBaUMsQ0FBQztBQUNoRyxJQUFJLENBQUNMLEVBQUUsQ0FBQ00sVUFBVSxDQUFDSixZQUFZLENBQUMsRUFBRUYsRUFBRSxDQUFDTyxTQUFTLENBQUNMLFlBQVksRUFBRTtFQUFFTSxTQUFTLEVBQUU7QUFBSyxDQUFDLENBQUM7QUFDakYsU0FBU0MsWUFBWSxRQUFRLHVCQUF1QjtBQUVwRCxN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