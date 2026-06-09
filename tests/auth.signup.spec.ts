import { test, expect } from '@playwright/test';
import SignupPage from '../pages/SignupPage';
import DashboardPage from '../pages/DashboardPage';
import { generateUniqueEmail } from '../fixtures/testUsers';
import { generateRandomPassword, redactEmail } from '../fixtures/passwordUtil';
import { info } from '../utils/logger';

test.describe('AUTH-SIGN-001 - Signup flow', () => {
  test('AUTH-SIGN-001: user can sign up and be redirected to dashboard', async ({ page }) => {
    const signup = new SignupPage(page);
    const dashboard = new DashboardPage(page);

    const email = generateUniqueEmail('qa');
    const password = generateRandomPassword();

    info('AUTH_SIGNUP_TEST_EMAIL_REDACTED', { email: redactEmail(email) });

    await signup.navigate();
    await signup.fillForm('QA User', email, password);

    await Promise.all([
      page.waitForURL('**/dashboard', { timeout: 15_000 }),
      signup.submit()
    ]);

    await dashboard.waitForWidgets();

    // Assert there is no visible DB error message on the page
    const dbError = page.locator('text=Database error saving new user');
    await expect(dbError).toHaveCount(0);

    // Basic dashboard assertion
    expect(page.url()).toContain('/dashboard');
  });
});
