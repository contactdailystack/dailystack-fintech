/**
 * P0 - DB-RLS-TRIG-001
 * UI-level verification of signup trigger and RLS behavior.
 *
 * This test intentionally avoids DB admin calls and must be run against staging.
 * If DB-level confirmation is required, run the MANUAL_CHECK SQL (see tests/p0/README.md).
 */
import { test, expect } from '@playwright/test';
import SignupPage from '../../pages/SignupPage';
import LoginPage from '../../pages/LoginPage';
import DashboardPage from '../../pages/DashboardPage';
import { generateUniqueEmail } from '../../fixtures/testUsers';
import { generateRandomPassword, redactEmail } from '../../fixtures/passwordUtil';
import { info } from '../../utils/logger';

test.describe('P0 - DB-RLS-TRIG-001 - Signup trigger (UI-level)', () => {
  test('DB-RLS-TRIG-001: signup then login; no DB save error visible', async ({ page }, testInfo) => {
    const signup = new SignupPage(page);
    const login = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    const email = generateUniqueEmail('p0');
    const password = generateRandomPassword();

    info('P0_DB_TRIGGER_TEST_EMAIL_REDACTED', { email: redactEmail(email) });

    await signup.navigate();
    await signup.fillForm('P0 Trigger', email, password);
    await Promise.all([
      page.waitForURL('**/dashboard', { timeout: 15_000 }),
      signup.submit()
    ]);

    await dashboard.waitForWidgets();
    const dbError = page.locator('text=Database error saving new user');
    await expect(dbError).toHaveCount(0);

    // Verify login works after signup
    await login.logout();
    await login.navigate();
    await login.login(email, password);
    await page.waitForURL('**/dashboard', { timeout: 15_000 });
    await dashboard.waitForWidgets();

    // If DB proof required, run manual SQL documented in tests/p0/README.md
    if (!process.env.TEST_BASE_URL) {
      testInfo.annotations.push({ type: 'manual-check', description: 'MANUAL_CHECK: Run the SQL in tests/p0/README.md to verify profile row.' });
    }
  });
});
