import { test, expect } from '@playwright/test';
import SignupPage from '../pages/SignupPage';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import { generateUniqueEmail } from '../fixtures/testUsers';
import { generateRandomPassword, redactEmail } from '../fixtures/passwordUtil';
import { info } from '../utils/logger';

test.describe('AUTH-LOGIN-001 - Login flow', () => {
  test('AUTH-LOGIN-001: user can login after signup', async ({ page }) => {
    const signup = new SignupPage(page);
    const login = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    const email = generateUniqueEmail('qa');
    const password = generateRandomPassword();

    info('AUTH_LOGIN_TEST_EMAIL_REDACTED', { email: redactEmail(email) });

    // Create account via UI
    await signup.navigate();
    await signup.fillForm('QA User', email, password);
    await Promise.all([
      page.waitForURL('**/dashboard', { timeout: 15_000 }),
      signup.submit()
    ]);

    await dashboard.waitForWidgets();

    // Logout (use LoginPage.logout which targets the common logout button)
    await login.logout();

    // Now login
    await login.navigate();
    await login.login(email, password);
    await page.waitForURL('**/dashboard', { timeout: 15_000 });

    // Ensure dashboard loaded
    await dashboard.waitForWidgets();
    const dbError = page.locator('text=Database error saving new user');
    await expect(dbError).toHaveCount(0);
  });
});
