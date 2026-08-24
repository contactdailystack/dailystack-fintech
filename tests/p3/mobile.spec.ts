/**
 * P3-08 - Mobile Responsive Test
 * Verifies the app renders correctly on common mobile viewport sizes.
 */
import { test, expect } from '@playwright/test';
import SignupPage from '../../pages/SignupPage';
import DashboardPage from '../../pages/DashboardPage';
import { generateUniqueEmail } from '../../fixtures/testUsers';
import { generateRandomPassword, redactEmail } from '../../fixtures/passwordUtil';
import { info } from '../../utils/logger';

const MOBILE_DEVICES = [
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'Pixel 5', width: 393, height: 851 },
];

test.describe('P3-08 - Mobile Responsive', () => {
  for (const device of MOBILE_DEVICES) {
    test(`${device.name} (${device.width}x${device.height}): signup and dashboard render`, async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: device.width, height: device.height });

      const signup = new SignupPage(page);
      const dashboard = new DashboardPage(page);

      const email = generateUniqueEmail('p3m');
      const password = generateRandomPassword();
      info(`P3_MOBILE_${device.name.replace(' ', '_')}_EMAIL_REDACTED`, { email: redactEmail(email) });

      // Sign up
      await signup.navigate();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      // Verify signup form visible on mobile
      const root = page.locator('#root');
      await expect(root).not.toBeEmpty();

      await signup.fillForm('P3 Mobile', email, password);
      await Promise.all([
        page.waitForLoadState('load'),
        signup.submit(),
      ]);
      await dashboard.waitForWidgets({ timeout: 20000 });

      // Verify dashboard renders on mobile
      await expect(page.locator('[data-testid="dashboard-widgets"]')).toBeVisible({ timeout: 10000 });

      // Verify no overflow issues — page should be scrollable
      const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
      const viewportHeight = device.height;
      expect(scrollHeight).toBeGreaterThanOrEqual(viewportHeight);
    });
  }
});
