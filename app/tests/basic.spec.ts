import { test, expect } from '@playwright/test';

test('app loads and has root element', async ({ page }) => {
  await page.goto('/');
  const root = await page.locator('#root');
  await expect(root).toBeVisible();
});
