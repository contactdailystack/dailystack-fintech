/*
 * BasePage
 * Minimal Page Object Model base class. Extend in concrete page objects.
 * Do not implement business logic here — stubs only.
 */
import { Page, Locator } from '@playwright/test';

export default class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string) {
    const url = path.includes('?') ? `${path}&playwright=true` : `${path}?playwright=true`;
    await this.page.goto(url);
  }

  locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  async click(selector: string) {
    await this.page.locator(selector).click();
  }

  async fill(selector: string, value: string) {
    await this.page.locator(selector).fill(value);
  }

  async getText(selector: string): Promise<string> {
    return (await this.page.locator(selector).innerText()).trim();
  }

  async waitForSelector(selector: string, options?: { timeout?: number }) {
    await this.page.locator(selector).waitFor(options);
  }

  // capture a screenshot for debugging; tests decide when to call
  async screenshot(path: string) {
    await this.page.screenshot({ path, fullPage: true });
  }
}
