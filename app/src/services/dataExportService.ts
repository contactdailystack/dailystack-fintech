import { loadSubscriptions } from './subscriptionService';
import { loadBudgets } from './budgetStore';
import { loadRules } from './ruleEngine';
import { loadConsent } from './consentStore';
import type { Transaction } from '../types';
import type { UserProfile } from '../types';

export interface ExportPayload {
  exportedAt: string;
  formatVersion: 1;
  profile: Partial<UserProfile>;
  consent: unknown;
  transactions: Transaction[];
  subscriptions: unknown;
  budgets: unknown;
  rules: unknown;
}

/**
 * Gather every piece of user data we hold and return it as a JSON payload
 * (PDPA right of access / portability).
 */
export async function buildExport(profile: UserProfile, transactions: Transaction[]): Promise<ExportPayload> {
  const [subscriptions, budgets, rules] = await Promise.all([
    loadSubscriptions().catch(() => []),
    Promise.resolve(loadBudgets()),
    loadRules().catch(() => []),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    formatVersion: 1,
    profile: {
      name: profile.name,
      email: profile.email,
      balance: profile.balance,
      monthlyBudget: profile.monthlyBudget,
      paydayDay: profile.paydayDay,
      creditScore: profile.creditScore,
    },
    consent: loadConsent(),
    transactions,
    subscriptions,
    budgets,
    rules,
  };
}

export function downloadExport(payload: ExportPayload): void {
  const date = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pickswise-export-${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
