import { test, expect } from '@playwright/test';
import SignupPage from '../../pages/SignupPage';
import DashboardPage from '../../pages/DashboardPage';
import { generateUniqueEmail } from '../../fixtures/testUsers';
import { generateRandomPassword, redactEmail } from '../../fixtures/passwordUtil';
import { info } from '../../utils/logger';

test.describe('P0 - AUTH-SIGN-001 - Signup happy path (production/staging)', () => {
  test('AUTH-SIGN-001: signup creates user and redirects to dashboard', async ({ page }, testInfo) => {
    const signup = new SignupPage(page);
    const dashboard = new DashboardPage(page);

    const email = generateUniqueEmail('p0');
    const password = generateRandomPassword();

    // Log a redacted identifier for diagnostics only
    info('P0_SIGNUP_TEST_EMAIL_REDACTED', { email: redactEmail(email) });

    await signup.navigate();
    await signup.fillForm('P0 User', email, password);

    await Promise.all([
      page.waitForURL('**/dashboard', { timeout: 15_000 }),
      signup.submit()
    ]);

    await dashboard.waitForWidgets();

    const dbError = page.locator('text=Database error saving new user');
    await expect(dbError).toHaveCount(0);
    expect(page.url()).toContain('/dashboard');
  });
});

test.describe('P1 - AUTH-SIGN-002 - Signup validation errors', () => {
  /**
   * All validation is client-side (AuthPage.tsx handleSubmit).
   * These tests verify the UI shows the right error without hitting Supabase.
   */

  test('AUTH-SIGN-002a: empty name shows validation error', async ({ page }) => {
    const signup = new SignupPage(page);
    const email = generateUniqueEmail('val');
    const password = generateRandomPassword();

    await signup.navigate();
    // Fill email + password but leave name empty
    await signup.emailInput.fill(email);
    await signup.passwordInput.fill(password);
    await signup.submit();

    const errorMsg = await signup.getErrorMessage();
    expect(errorMsg).toMatch(/please enter your full name|กรุณากรอกชื่อ/i);
    // Must still be on the signup page
    await expect(page).not.toHaveURL('**/dashboard', { timeout: 2000 });
  });

  test('AUTH-SIGN-002b: invalid email format shows validation error', async ({ page }) => {
    const signup = new SignupPage(page);

    await signup.navigate();
    await signup.fullNameInput.fill('Valid Name');
    await signup.emailInput.fill('not-an-email');
    await signup.passwordInput.fill(generateRandomPassword());
    await signup.submit();

    const errorMsg = await signup.getErrorMessage();
    expect(errorMsg).toMatch(/invalid email format|รูปแบบอีเมลไม่ถูกต้อง/i);
    await expect(page).not.toHaveURL('**/dashboard', { timeout: 2000 });
  });

  test('AUTH-SIGN-002c: password under 8 chars shows validation error', async ({ page }) => {
    const signup = new SignupPage(page);

    await signup.navigate();
    await signup.fullNameInput.fill('Valid Name');
    await signup.emailInput.fill(generateUniqueEmail('val'));
    await signup.passwordInput.fill('abc123'); // 6 chars — below 8 minimum
    await signup.submit();

    const errorMsg = await signup.getErrorMessage();
    expect(errorMsg).toMatch(/password must be at least 8|รหัสผ่านต้องมีอย่างน้อย 8/i);
    await expect(page).not.toHaveURL('**/dashboard', { timeout: 2000 });
  });

  test('AUTH-SIGN-002d: empty email shows validation error', async ({ page }) => {
    const signup = new SignupPage(page);

    await signup.navigate();
    await signup.fullNameInput.fill('Valid Name');
    await signup.passwordInput.fill(generateRandomPassword());
    // Leave email blank
    await signup.submit();

    const errorMsg = await signup.getErrorMessage();
    expect(errorMsg).toMatch(/please enter your email|กรุณากรอกอีเมล/i);
    await expect(page).not.toHaveURL('**/dashboard', { timeout: 2000 });
  });

  test('AUTH-SIGN-002e: empty password shows validation error', async ({ page }) => {
    const signup = new SignupPage(page);

    await signup.navigate();
    await signup.fullNameInput.fill('Valid Name');
    await signup.emailInput.fill(generateUniqueEmail('val'));
    // Leave password blank
    await signup.submit();

    const errorMsg = await signup.getErrorMessage();
    expect(errorMsg).toMatch(/please enter your password|กรุณากรอกรหัสผ่าน/i);
    await expect(page).not.toHaveURL('**/dashboard', { timeout: 2000 });
  });

  test('AUTH-SIGN-002f: clearing error on input change works', async ({ page }) => {
    const signup = new SignupPage(page);

    await signup.navigate();
    await signup.fullNameInput.fill('Valid Name');
    await signup.emailInput.fill('not-an-email');
    await signup.passwordInput.fill(generateRandomPassword());
    await signup.submit();

    // Error should be shown
    await expect(signup.errorBox).toBeVisible();

    // Fix the email
    await signup.emailInput.fill(generateUniqueEmail('val'));
    // Trigger input change by typing in name field
    await signup.fullNameInput.click();
    await page.waitForTimeout(200);

    // Error should disappear (useReducedMotion: false, animation plays)
    await expect(signup.errorBox).toBeHidden({ timeout: 3000 });
  });
});
