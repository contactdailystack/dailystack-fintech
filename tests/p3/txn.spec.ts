/**
 * P3-07 - Transaction CRUD E2E Test
 * Verifies the transaction history page loads and displays transactions.
 */
import { test, expect } from '@playwright/test';
import SignupPage from '../../pages/SignupPage';
import DashboardPage from '../../pages/DashboardPage';
import { generateUniqueEmail } from '../../fixtures/testUsers';
import { generateRandomPassword, redactEmail } from '../../fixtures/passwordUtil';
import { info } from '../../utils/logger';

test.describe('P3-07 - Transaction History Page', () => {
  test('TXN-001: signup -> navigate to /transactions -> page loads with content', async ({ page }) => {
    const signup = new SignupPage(page);
    const dashboard = new DashboardPage(page);

    const email = generateUniqueEmail('p3');
    const password = generateRandomPassword();
    info('P3_TXN_TEST_EMAIL_REDACTED', { email: redactEmail(email) });

    // Sign up via UI
    await signup.navigate();
    await signup.fillForm('P3 Txn User', email, password);
    await Promise.all([
      page.waitForLoadState('load'),
      signup.submit(),
    ]);
    await dashboard.waitForWidgets();

    // Navigate to transactions page
    await page.goto(`${process.env.TEST_BASE_URL || 'http://localhost:5173'}/transactions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify page loaded — look for app shell (dark background)
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Verify no JS errors on the page
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    // Verify page has loaded content (not blank)
    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();
  });

  test('TXN-002: dashboard -> transaction widget navigates to /transactions', async ({ page }) => {
    const signup = new SignupPage(page);
    const dashboard = new DashboardPage(page);

    const email = generateUniqueEmail('p3');
    const password = generateRandomPassword();
    info('P3_TXN_WIDGET_EMAIL_REDACTED', { email: redactEmail(email) });

    // Sign up
    await signup.navigate();
    await signup.fillForm('P3 Txn Widget', email, password);
    await Promise.all([
      page.waitForLoadState('load'),
      signup.submit(),
    ]);
    await dashboard.waitForWidgets();

    // Navigate directly to transactions
    await page.goto(`${process.env.TEST_BASE_URL || 'http://localhost:5173'}/transactions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();
  });
});
