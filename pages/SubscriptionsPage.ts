import BasePage from './BasePage';
import { Page, Locator } from '@playwright/test';

export default class SubscriptionsPage extends BasePage {
  readonly planCard = (planId: string) => this.page.locator(`[data-testid="plan-${planId}"]`);
  readonly upgradeBtn = (planId: string) => this.page.locator(`[data-testid="plan-${planId}"] [data-testid="plan-upgrade"]`);
  readonly paymentIframe: Locator;
  readonly confirmBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.paymentIframe = this.page.locator('[data-testid="payment-iframe"]');
    this.confirmBtn = this.page.locator('[data-testid="payment-confirm"]');
  }

  async navigate() {
    await this.goto('/subscriptions');
  }

  async startUpgradeFlow(planId: string) {
    await this.upgradeBtn(planId).click();
  }

  async enterPaymentDetailsInIframe(token: string) {
    // placeholder: switch to iframe and fill provider widget if needed
    // Implementation depends on payment provider SDK
  }

  async confirmPurchase() {
    await this.confirmBtn.click();
  }

  async isPlanActive(planId: string): Promise<boolean> {
    const activeBadge = this.page.locator(`[data-testid="plan-${planId}"] [data-testid="plan-active"]`);
    return (await activeBadge.count()) > 0;
  }
}
