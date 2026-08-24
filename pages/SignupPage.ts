import { Page, Locator } from '@playwright/test';
import BasePage from './BasePage';

export default class SignupPage extends BasePage {
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorBox: Locator;

  constructor(page: Page) {
    super(page);
    // AuthPage.tsx register inputs use id="register-..."
    this.fullNameInput = this.page.locator('#register-name');
    this.emailInput = this.page.locator('#register-email');
    this.passwordInput = this.page.locator('#register-password');

    // Primary submit button is the form submit
    this.submitButton = this.page.locator('form button[type="submit"]');

    // Error message in AuthPage register screen uses role="alert"
    this.errorBox = this.page.locator('[role="alert"]');
  }

  async navigate() {
    // Some environments may render login by default and require clicking "Sign Up".
    await this.goto('/signup');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1500); // Wait for React hydration + dynamic content

    const registerName = this.page.locator('#register-name');
    if ((await registerName.count()) === 0) {
      // Try fallback: click "Sign Up" CTA on the login screen
      const signUpBtn = this.page.locator('button:has-text("Sign Up"), button:has-text("Sign up"), a:has-text("Sign Up")').first();
      await signUpBtn.waitFor({ state: 'visible', timeout: 15000 });
      await signUpBtn.click();

      await registerName.waitFor({ state: 'visible', timeout: 15000 });
    } else {
      await registerName.waitFor({ state: 'visible', timeout: 15000 });
    }
  }

  async fillForm(fullName: string, email: string, password: string) {
    await this.fullNameInput.fill(fullName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }


  async submit() {
    await this.submitButton.click();
  }

  async getErrorMessage(): Promise<string | null> {
    if ((await this.errorBox.count()) === 0) return null;
    const txt = await this.errorBox.innerText();
    return txt.trim();
  }
}
