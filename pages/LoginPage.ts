import BasePage from './BasePage';
import { Page, Locator } from '@playwright/test';

export default class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    // AuthPage.tsx login inputs use id="login-..."
    this.emailInput = this.page.locator('#login-email');
    this.passwordInput = this.page.locator('#login-password');

    // Primary submit button is the form submit
    this.submitButton = this.page.locator('form button[type="submit"]');

    this.logoutButton = this.page.locator('[data-testid="logout-button"]');
  }

  async navigate() {
    await this.goto('/login');
  }

  async fillCredentials(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async login(email: string, password: string) {
    await this.fillCredentials(email, password);
    await this.submit();
  }

  async logout() {
    if (!this.page.url().endsWith('/settings')) {
      await this.goto('/settings');
    }
    await this.logoutButton.waitFor({ state: 'visible' });
    await Promise.all([
      this.page.waitForURL('**/dashboard', { timeout: 15000 }),
      this.logoutButton.click()
    ]);
  }
}
