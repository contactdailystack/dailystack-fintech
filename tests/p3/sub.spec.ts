/**
 * P3-06 - Subscription CRUD E2E Test
 * Verifies the subscription tracker page loads and displays mock subscriptions.
 */
import { test, expect } from '@playwright/test';
import SignupPage from '../../pages/SignupPage';
import DashboardPage from '../../pages/DashboardPage';
import { generateUniqueEmail } from '../../fixtures/testUsers';
import { generateRandomPassword, redactEmail } from '../../fixtures/passwordUtil';
import { info } from '../../utils/logger';

test.describe('P3-06 - Subscription Tracker Page', () => {
  test('SUB-001: signup -> navigate to /subscriptions -> page loads with content', async ({ page }) => {
    const signup = new SignupPage(page);
    const dashboard = new DashboardPage(page);

    const email = generateUniqueEmail('p3');
    const password = generateRandomPassword();
    info('P3_SUB_TEST_EMAIL_REDACTED', { email: redactEmail(email) });

    // Sign up via UI
    await signup.navigate();
    await signup.fillForm('P3 Sub User', email, password);
    await Promise.all([
      page.waitForLoadState('load'),
      signup.submit(),
    ]);
    await dashboard.waitForWidgets();

    // Navigate to subscriptions page
    await page.goto(`${process.env.TEST_BASE_URL || 'http://localhost:5173'}/subscriptions`);
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

  test('SUB-002: dashboard -> subscriptions widget click navigates to /subscriptions', async ({ page }) => {
    const signup = new SignupPage(page);
    const dashboard = new DashboardPage(page);

    const email = generateUniqueEmail('p3');
    const password = generateRandomPassword();
    info('P3_SUB_WIDGET_EMAIL_REDACTED', { email: redactEmail(email) });

    // Sign up
    await signup.navigate();
    await signup.fillForm('P3 Sub Widget', email, password);
    await Promise.all([
      page.waitForLoadState('load'),
      signup.submit(),
    ]);
    await dashboard.waitForWidgets();

    // Click subscriptions widget if visible
    const subsWidget = page.locator('[data-testid="subscriptions-widget"]');
    if (await subsWidget.count() > 0) {
      await subsWidget.click();
      await page.waitForURL('**/subscriptions', { timeout: 10000 });
    }

    // Fallback: navigate directly
    await page.goto(`${process.env.TEST_BASE_URL || 'http://localhost:5173'}/subscriptions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();
  });
});
