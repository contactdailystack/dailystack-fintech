import { test, expect } from '@playwright/test';
import SignupPage from '../../pages/SignupPage';
import DashboardPage from '../../pages/DashboardPage';
import { generateUniqueEmail } from '../../fixtures/testUsers';
import { generateRandomPassword, redactEmail } from '../../fixtures/passwordUtil';
import { info } from '../../utils/logger';

test.describe('P0 - AUTH-SIGN-001 - Signup (production/staging)', () => {
  test('AUTH-SIGN-001: signup creates user and redirects to dashboard', async ({ page }, testInfo) => {
    const signup = new SignupPage(page);
    const dashboard = new DashboardPage(page);

    const email = generateUniqueEmail('p0');
    const password = generateRandomPassword();

    // Log a redacted identifier for diagnostics only
    info('P0_SIGNUP_TEST_EMAIL_REDACTED', { email: redactEmail(email) });

    await signup.navigate();
    await signup.fillForm('P0 User', email, password);

    await Promise.all([
      page.waitForURL('**/dashboard', { timeout: 15_000 }),
      signup.submit()
    ]);

    await dashboard.waitForWidgets();

    const dbError = page.locator('text=Database error saving new user');
    await expect(dbError).toHaveCount(0);
    expect(page.url()).toContain('/dashboard');
  });
});
