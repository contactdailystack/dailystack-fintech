import { callAdminEndpoint } from '../helpers/apiHelper';

/**
 * Test transaction factory. Uses admin endpoint to create and delete transactions in staging safely.
 */

export type TestTransaction = {
  id: string;
  user_id: string;
  amount: string;
  category: string;
  date: string;
};

export class TestTransactionFactory {
  private created: TestTransaction[] = [];
  private adminEndpoint?: string;

  constructor(adminEndpoint?: string) {
    this.adminEndpoint = adminEndpoint ?? process.env.ADMIN_ENDPOINT;
  }

  private ensureAdmin() {
    if (!this.adminEndpoint) throw new Error('ADMIN_ENDPOINT is not configured. TestTransactionFactory requires a secure admin endpoint.');
  }

  async create(opts: { user_id: string; amount: number | string; category: string; date?: string }): Promise<TestTransaction> {
    this.ensureAdmin();
    const payload = {
      action: 'create-test-transaction',
      user_id: opts.user_id,
      amount: String(opts.amount),
      category: opts.category,
      date: opts.date ?? new Date().toISOString().slice(0, 10)
    };
    const res = await callAdminEndpoint('/create-test-transaction', payload);
    if (!res || !res.id) throw new Error(`create-test-transaction failed: ${JSON.stringify(res)}`);
    const txn: TestTransaction = { id: res.id, user_id: opts.user_id, amount: payload.amount, category: payload.category, date: payload.date };
    this.created.push(txn);
    return txn;
  }

  async delete(txnId: string): Promise<void> {
    this.ensureAdmin();
    await callAdminEndpoint('/delete-test-transaction', { action: 'delete-test-transaction', id: txnId });
    this.created = this.created.filter(t => t.id !== txnId);
  }

  async cleanupAll(): Promise<void> {
    for (const t of [...this.created].reverse()) {
      try {
        await this.delete(t.id);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('cleanupAll delete transaction failed for', t.id, err);
      }
    }
  }
}

// no default instance at import time
