import { test, expect } from '@playwright/test';
import SignupPage from '../../pages/SignupPage';
import LoginPage from '../../pages/LoginPage';
import DashboardPage from '../../pages/DashboardPage';
import { generateUniqueEmail } from '../../fixtures/testUsers';
import { generateRandomPassword, redactEmail } from '../../fixtures/passwordUtil';
import { info } from '../../utils/logger';

test.describe('P0 - AUTH-LOGIN-001 - Login after signup (production/staging)', () => {
  test('AUTH-LOGIN-001: signup -> logout -> login succeeds', async ({ page }) => {
    const signup = new SignupPage(page);
    const login = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    const email = generateUniqueEmail('p0');
    const password = generateRandomPassword();

    info('P0_LOGIN_TEST_EMAIL_REDACTED', { email: redactEmail(email) });

    // Create account via UI against staging
    await signup.navigate();
    await signup.fillForm('P0 User', email, password);
    await Promise.all([
      page.waitForURL('**/dashboard', { timeout: 15_000 }),
      signup.submit()
    ]);

    await dashboard.waitForWidgets();

    // Logout then login
    await login.logout();
    await login.navigate();
    await login.login(email, password);
    await page.waitForURL('**/dashboard', { timeout: 15_000 });
    await dashboard.waitForWidgets();

    const dbError = page.locator('text=Database error saving new user');
    await expect(dbError).toHaveCount(0);
  });
});
