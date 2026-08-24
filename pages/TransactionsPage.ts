import BasePage from './BasePage';
import { Page, Locator } from '@playwright/test';

export default class TransactionsPage extends BasePage {
  readonly addBtn: Locator;
  readonly amountInput: Locator;
  readonly categoryInput: Locator;
  readonly dateInput: Locator;
  readonly saveBtn: Locator;
  readonly rows: Locator;

  constructor(page: Page) {
    super(page);
    this.addBtn = this.page.locator('[data-testid="txn-add"]');
    this.amountInput = this.page.locator('[data-testid="txn-amount"]');
    this.categoryInput = this.page.locator('[data-testid="txn-category"]');
    this.dateInput = this.page.locator('[data-testid="txn-date"]');
    this.saveBtn = this.page.locator('[data-testid="txn-save"]');
    this.rows = this.page.locator('[data-testid="txn-row"]');
  }

  async navigate() {
    await this.goto('/transactions');
  }

  async openAddForm() {
    await this.addBtn.click();
  }

  async addTransaction(amount: number | string, category: string, date: string) {
    await this.openAddForm();
    await this.amountInput.fill(String(amount));
    await this.categoryInput.fill(category);
    await this.dateInput.fill(date);
    await this.saveBtn.click();
  }

  async findTransactionRowByAmount(amount: number | string): Promise<Locator | null> {
    const text = String(amount);
    const row = this.page.locator(`[data-testid="txn-row"]:has-text("${text}")`);
    if (await row.count() > 0) return row.first();
    return null;
  }

  async getTransactionCount(): Promise<number> {
    return this.rows.count();
  }
}
