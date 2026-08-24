/**
 * DailyStack — budgetStore.ts
 * Shared budget state persisted in localStorage (#4, #5).
 *
 * BudgetManagementPage edits it; DashboardPage reads it to render
 * Rocket Money-style category progress rings. A tiny pub-sub keeps
 * both views in sync without a global state library.
 */

export interface UserBudget {
  key: string;
  nameEn: string;
  nameTh: string;
  color: string;
  limit: number;
}

const STORAGE_KEY = 'pickswise.budgets.v1';
const listeners = new Set<() => void>();

export const DEFAULT_BUDGETS: UserBudget[] = [
  { key: 'food', nameEn: 'Food & Dining', nameTh: 'อาหารและเครื่องดื่ม', color: '#F97316', limit: 8000 },
  { key: 'transport', nameEn: 'Transportation', nameTh: 'การเดินทาง', color: '#1786C2', limit: 4000 },
  { key: 'shopping', nameEn: 'Shopping', nameTh: 'ช้อปปิ้ง', color: '#EC4899', limit: 6000 },
  { key: 'entertainment', nameEn: 'Entertainment', nameTh: 'บันเทิง', color: '#8B5CF6', limit: 3000 },
];

/** Transaction category strings → budget keys (lowercase substring match) */
const ALIASES: Record<string, string[]> = {
  food: ['food', 'dining', 'restaurant', 'cafe', 'coffee', 'grocery', 'อาหาร', 'กิน'],
  transport: ['transport', 'travel', 'taxi', 'bus', 'train', 'fuel', 'gas', 'เดินทาง', 'การเดินทาง'],
  shopping: ['shopping', 'shop', 'clothes', 'mall', 'ช้อป', 'ช้อปปิ้ง'],
  entertainment: ['entertainment', 'movie', 'music', 'game', 'streaming', 'บันเทิง'],
};

export function categoryToBudgetKey(category: string): string | null {
  const c = (category || '').toLowerCase().trim();
  if (!c) return null;
  for (const [key, words] of Object.entries(ALIASES)) {
    if (words.some((w) => c.includes(w))) return key;
  }
  return null;
}

export function loadBudgets(): UserBudget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_BUDGETS];
    const stored = JSON.parse(raw) as UserBudget[];
    if (!Array.isArray(stored)) return [...DEFAULT_BUDGETS];
    // Merge: defaults keep ordering/labels with stored limits; custom keys preserved
    const merged: UserBudget[] = DEFAULT_BUDGETS.map((def) => {
      const s = stored.find((x) => x.key === def.key);
      return s && typeof s.limit === 'number' && s.limit >= 0 ? { ...def, limit: s.limit } : def;
    });
    for (const item of stored) {
      if (!DEFAULT_BUDGETS.some((d) => d.key === item.key) && item.key && typeof item.limit === 'number') {
        merged.push(item);
      }
    }
    return merged;
  } catch {
    return [...DEFAULT_BUDGETS];
  }
}

export function saveBudgets(budgets: UserBudget[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
    listeners.forEach((fn) => fn());
  } catch {
    /* storage full/blocked — budgets stay in-memory for the session */
  }
}

export function subscribeBudgets(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Sum this month's spend per budget key from UI transactions.
 * Returns Map<budgetKey, spent>.
 */
export function monthSpendByBudgetKey(
  transactions: { amount: number; date: string; category: string }[]
): Map<string, number> {
  const now = new Date();
  const spend = new Map<string, number>();
  for (const t of transactions) {
    if (t.amount >= 0) continue; // expenses only
    const d = new Date(t.date);
    if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) continue;
    const key = categoryToBudgetKey(t.category);
    if (!key) continue;
    spend.set(key, (spend.get(key) || 0) + Math.abs(t.amount));
  }
  return spend;
}
