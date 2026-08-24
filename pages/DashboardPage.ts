import BasePage from './BasePage';
import { Page, Locator } from '@playwright/test';

export default class DashboardPage extends BasePage {
  readonly balanceCard: Locator;
  readonly widgetsContainer: Locator;
  readonly subscriptionsWidget: Locator;

  constructor(page: Page) {
    super(page);
    this.balanceCard = this.page.locator('[data-testid="balance-card"]');
    this.widgetsContainer = this.page.locator('[data-testid="dashboard-widgets"]');
    this.subscriptionsWidget = this.page.locator('[data-testid="subscriptions-widget"]');
  }

  async navigate() {
    await this.goto('/dashboard');
  }

  async waitForWidgets(timeout = 10000) {
    await this.widgetsContainer.waitFor({ timeout });
  }

  async getBalanceText(): Promise<string> {
    return (await this.balanceCard.innerText()).trim();
  }

  async openSubscriptions() {
    await this.subscriptionsWidget.click();
  }
}
