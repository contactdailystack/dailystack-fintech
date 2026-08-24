import BasePage from './BasePage';
import { Page, Locator } from '@playwright/test';

export default class SettingsPage extends BasePage {
  readonly profileNameInput: Locator;
  readonly emailInput: Locator;
  readonly saveBtn: Locator;
  readonly changePasswordBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.profileNameInput = this.page.locator('[data-testid="settings-fullname"]');
    this.emailInput = this.page.locator('[data-testid="settings-email"]');
    this.saveBtn = this.page.locator('[data-testid="settings-save"]');
    this.changePasswordBtn = this.page.locator('[data-testid="settings-change-password"]');
  }

  async navigate() {
    await this.goto('/settings');
  }

  async updateProfile(fullName?: string, email?: string) {
    if (fullName !== undefined) await this.profileNameInput.fill(fullName);
    if (email !== undefined) await this.emailInput.fill(email);
    await this.saveBtn.click();
  }

  async openChangePassword() {
    await this.changePasswordBtn.click();
  }
}
