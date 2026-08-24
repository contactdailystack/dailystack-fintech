import { callAdminEndpoint } from '../helpers/apiHelper';
import { generateRandomPassword } from './passwordUtil';

/**
 * Test user factory for creating and cleaning up users on staging via a secure admin endpoint.
 *
 * NOTE: This module expects a secure admin endpoint to be available (ADMIN_ENDPOINT) which
 * exposes whitelisted operations such as create-test-user and delete-test-user. Do NOT
 * embed service_role keys in tests. The admin endpoint must validate CI-signed requests.
 */

export type TestUser = {
  id: string;
  email: string;
  password?: string;
  full_name?: string;
};

function uniqueSuffix(): string {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}`;
}

export function generateUniqueEmail(prefix = 'qa'): string {
  return `${prefix}+${uniqueSuffix()}@example.com`;
}

export class TestUserFactory {
  private created: TestUser[] = [];
  private adminEndpoint?: string;

  constructor(adminEndpoint?: string) {
    this.adminEndpoint = adminEndpoint ?? process.env.ADMIN_ENDPOINT;
  }

  private ensureAdmin() {
    if (!this.adminEndpoint) throw new Error('ADMIN_ENDPOINT is not configured. TestUserFactory requires a secure admin endpoint to create staging users.');
  }

  async create(opts?: { email?: string; password?: string; full_name?: string }): Promise<TestUser> {
    this.ensureAdmin();
    const email = opts?.email ?? generateUniqueEmail('qa');
    const password = opts?.password ?? generateRandomPassword();
    const full_name = opts?.full_name ?? 'QA User';

    const payload = { action: 'create-test-user', email, password, full_name };
    const res = await callAdminEndpoint('/create-test-user', payload);
    if (!res || !res.id) throw new Error(`create-test-user failed: ${JSON.stringify(res)}`);

    const user: TestUser = { id: res.id, email: res.email ?? email, password, full_name };
    this.created.push(user);
    return user;
  }

  async delete(userId: string): Promise<void> {
    this.ensureAdmin();
    await callAdminEndpoint('/delete-test-user', { action: 'delete-test-user', id: userId });
    this.created = this.created.filter(u => u.id !== userId);
  }

  async cleanupAll(): Promise<void> {
    for (const u of [...this.created].reverse()) {
      try {
        await this.delete(u.id);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('cleanupAll delete failed for', u.id, err);
      }
    }
  }
}

// do not instantiate at module load; tests may only import helpers like `generateUniqueEmail`
