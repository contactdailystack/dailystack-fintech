import { callAdminEndpoint } from '../helpers/apiHelper';

/**
 * Test subscription factory for creating and tearing down subscriptions safely on staging.
 */

export type TestSubscription = {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
};

export class TestSubscriptionFactory {
  private created: TestSubscription[] = [];
  private adminEndpoint?: string;

  constructor(adminEndpoint?: string) {
    this.adminEndpoint = adminEndpoint ?? process.env.ADMIN_ENDPOINT;
  }

  private ensureAdmin() {
    if (!this.adminEndpoint) throw new Error('ADMIN_ENDPOINT is not configured. TestSubscriptionFactory requires a secure admin endpoint.');
  }

  async create(opts: { user_id: string; plan_id: string; status?: string }): Promise<TestSubscription> {
    this.ensureAdmin();
    const payload = { action: 'create-test-subscription', user_id: opts.user_id, plan_id: opts.plan_id, status: opts.status ?? 'active' };
    const res = await callAdminEndpoint('/create-test-subscription', payload);
    if (!res || !res.id) throw new Error(`create-test-subscription failed: ${JSON.stringify(res)}`);
    const sub: TestSubscription = { id: res.id, user_id: opts.user_id, plan_id: opts.plan_id, status: payload.status };
    this.created.push(sub);
    return sub;
  }

  async delete(subId: string): Promise<void> {
    this.ensureAdmin();
    await callAdminEndpoint('/delete-test-subscription', { action: 'delete-test-subscription', id: subId });
    this.created = this.created.filter(s => s.id !== subId);
  }

  async cleanupAll(): Promise<void> {
    for (const s of [...this.created].reverse()) {
      try {
        await this.delete(s.id);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('cleanupAll delete subscription failed for', s.id, err);
      }
    }
  }
}

// no default instance at import time
