/**
 * DB-RLS-TRIG-001
 * Purpose: Validate signup -> profile creation -> login and ensure no "Database error saving new user" occurs.
 *
 * NOTE: This test verifies behaviors visible from the UI. If you need to confirm the profile row
 * exists in Postgres, run the MANUAL CHECK below on the staging database as there is no admin
 * endpoint available in this repository.
 *
 * MANUAL_CHECK_REQUIRED SQL (run in Supabase SQL editor against staging):
 *
 * -- Replace '<email>' with the email printed in the test output or logs
 * SELECT u.id AS auth_user_id, u.email, p.*
 * FROM auth.users u
 * LEFT JOIN public.profiles p ON p.id = u.id
 * WHERE u.email = '<email>'
 * ORDER BY u.created_at DESC
 * LIMIT 1;
 */

import { test, expect } from '@playwright/test';
import SignupPage from '../pages/SignupPage';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import { generateUniqueEmail } from '../fixtures/testUsers';
import { generateRandomPassword, redactEmail } from '../fixtures/passwordUtil';
import { info } from '../utils/logger';

test.describe('DB-RLS-TRIG-001 - Signup trigger and RLS validation (UI-level)', () => {
  test('DB-RLS-TRIG-001: signup -> dashboard -> login, and no DB save error visible', async ({ page }, testInfo) => {
    const signup = new SignupPage(page);
    const login = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    const email = generateUniqueEmail('qa');
    const password = generateRandomPassword();

    info('DB_TRIGGER_TEST_EMAIL_REDACTED', { email: redactEmail(email) });

    // Signup
    await signup.navigate();
    await signup.fillForm('QA TriggerTest', email, password);
    await Promise.all([
      page.waitForURL('**/dashboard', { timeout: 15_000 }),
      signup.submit()
    ]);

    await dashboard.waitForWidgets();

    // Ensure no DB error message is shown in UI
    const dbError = page.locator('text=Database error saving new user');
    await expect(dbError).toHaveCount(0);

    // Logout and login to verify credentials work
    await login.logout();
    await login.navigate();
    await login.login(email, password);
    await page.waitForURL('**/dashboard', { timeout: 15_000 });
    await dashboard.waitForWidgets();

    // At this point the UI-level checks passed. If you need DB-level proof of a profile row,
    // run the MANUAL_CHECK_REQUIRED SQL included at the top of this file against staging.
    if (!process.env.ADMIN_ENDPOINT) {
      testInfo.annotations.push({ type: 'manual-check', description: 'MANUAL_CHECK_REQUIRED: run SQL in file header to verify profile row exists for the test email.' });
    }
  });
});
