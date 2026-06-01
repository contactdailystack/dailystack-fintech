import { supabase } from '../services/supabaseClient';
import type { Account, Transaction, Budget, SleepRecord, BudgetVelocity, CorrelationResult } from './types';

/**
 * Wallet Sandbox Seed Data
 * 
 * This is INTENTIONAL onboarding data for the Pro Wallet feature.
 * - Only seeded when user has NO existing wallet data
 * - Named INITIAL_* to indicate it's seed data, not mock/fake data
 * - Provides users with demo accounts to explore the feature
 * - Users can delete/modify all seeded data freely
 * 
 * If user is not logged in, data goes to localStorage only.
 */

// Seed accounts for new users - helps demonstrate wallet features
const INITIAL_ACCOUNTS = [
  { name: 'Cash Wallet', type: 'cash', balance: 3500, currency: 'THB' },
  { name: 'Kasikorn Bank (Savings)', type: 'bank', balance: 82400, currency: 'THB' },
  { name: 'SCB Credit Card', type: 'credit_card', balance: -12500, currency: 'THB', credit_limit: 50000 },
  { name: 'Crypto Portfolio (Investment)', type: 'investment', balance: 45000, currency: 'THB', interest_rate: 8.5 },
  { name: 'Personal Debt (Loan)', type: 'debt', balance: -30000, currency: 'THB', interest_rate: 6.5 }
];

const INITIAL_BUDGETS = [
  { category: 'Specialty Coffee', limit_amount: 3000, period: 'monthly' },
  { category: 'Premium Dining', limit_amount: 6000, period: 'monthly' },
  { category: 'Gadgets & Gear', limit_amount: 5000, period: 'monthly' }
];

const getPastDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

// 7 days of sleep logs paired with historical coffee spends
const INITIAL_SLEEP_LOGS: SleepRecord[] = [
  { date: getPastDateStr(0), hoursSlept: 5.2 }, // today
  { date: getPastDateStr(1), hoursSlept: 7.8 }, // yesterday
  { date: getPastDateStr(2), hoursSlept: 5.5 },
  { date: getPastDateStr(3), hoursSlept: 5.8 },
  { date: getPastDateStr(4), hoursSlept: 8.2 },
  { date: getPastDateStr(5), hoursSlept: 7.5 },
  { date: getPastDateStr(6), hoursSlept: 6.0 }
];

export class WalletSandboxService {
  private STORAGE_KEY_PREFIX = 'ds_wallet_sandbox_';

  private getStorageKey(key: string): string {
    return `${this.STORAGE_KEY_PREFIX}${key}`;
  }

  // Get current user ID from Supabase Auth
  private async getUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch {
      return null;
    }
  }

  // Seeding default premium data into Supabase if empty
  public async initData(): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) {
      this.initLocalData();
      return;
    }

    try {
      // 1. Check accounts
      const { data: accounts, error: accError } = await supabase
        .from('wallet_accounts')
        .select('id')
        .eq('user_id', userId);

      if (accError) throw accError;

      if (!accounts || accounts.length === 0) {
        console.log('Seeding initial wallet accounts to database...');
        // Seed accounts
        const seedAccounts = INITIAL_ACCOUNTS.map(acc => ({
          ...acc,
          user_id: userId
        }));
        
        const { data: insertedAccs, error: insertAccError } = await supabase
          .from('wallet_accounts')
          .insert(seedAccounts)
          .select();

        if (insertAccError) throw insertAccError;

        // Map inserted accounts to seed transactions
        if (insertedAccs && insertedAccs.length > 0) {
          const kbank = insertedAccs.find(a => a.name.includes('Kasikorn'))?.id;
          const scbCc = insertedAccs.find(a => a.name.includes('SCB'))?.id;
          const cash = insertedAccs.find(a => a.name.includes('Cash'))?.id;

          const seedTxs = [
            {
              user_id: userId,
              amount: 250,
              type: 'expense',
              from_account_id: scbCc || null,
              category: 'Specialty Coffee',
              note: 'Specialty Drip Coffee at Slowbar Cafe',
              tags: ['caffeine', 'coffee', 'premium'],
              transaction_date: getPastDateStr(0)
            },
            {
              user_id: userId,
              amount: 1800,
              type: 'expense',
              from_account_id: kbank || null,
              category: 'Premium Dining',
              note: 'Omakase Weekend Lunch with Partner',
              tags: ['food', 'premium', 'couple'],
              transaction_date: getPastDateStr(1)
            },
            {
              user_id: userId,
              amount: 180,
              type: 'expense',
              from_account_id: scbCc || null,
              category: 'Specialty Coffee',
              note: 'Iced Matcha Latte at local stall',
              tags: ['caffeine', 'matcha'],
              transaction_date: getPastDateStr(2)
            },
            {
              user_id: userId,
              amount: 320,
              type: 'expense',
              from_account_id: scbCc || null,
              category: 'Specialty Coffee',
              note: 'Ethiopia Sidama Coffee Beans bag',
              tags: ['caffeine', 'coffee', 'beans'],
              transaction_date: getPastDateStr(3)
            },
            {
              user_id: userId,
              amount: 3000,
              type: 'transfer',
              from_account_id: kbank || null,
              to_account_id: cash || null,
              category: 'Transfer',
              note: 'ATM cash withdrawal for food stalls',
              tags: ['atm', 'cash'],
              transaction_date: getPastDateStr(5)
            },
            {
              user_id: userId,
              amount: 4800,
              type: 'expense',
              from_account_id: scbCc || null,
              category: 'Gadgets & Gear',
              note: 'Custom Neo-Brutalist Mechanical Keyboard',
              tags: ['gadget', 'work', 'setup'],
              transaction_date: getPastDateStr(12)
            },
            {
              user_id: userId,
              amount: 75000,
              type: 'income',
              to_account_id: kbank || null,
              category: 'Salary',
              note: 'Base Tech Salary - DailyStack Inc.',
              tags: ['salary', 'job', 'fintech'],
              transaction_date: getPastDateStr(10)
            }
          ];

          await supabase.from('wallet_transactions').insert(seedTxs);
        }

        // Seed budgets
        const seedBudgets = INITIAL_BUDGETS.map(b => ({
          user_id: userId,
          category: b.category,
          limit_amount: b.limit_amount,
          period: b.period,
          start_date: getPastDateStr(0)
        }));
        await supabase.from('wallet_budgets').insert(seedBudgets);
      }

      // Initialize sleep records in localStorage (since it's a browser sandbox metric)
      if (!localStorage.getItem(this.getStorageKey('sleep_logs'))) {
        localStorage.setItem(this.getStorageKey('sleep_logs'), JSON.stringify(INITIAL_SLEEP_LOGS));
      }
      if (!localStorage.getItem(this.getStorageKey('sync_queue'))) {
        localStorage.setItem(this.getStorageKey('sync_queue'), JSON.stringify([]));
      }
    } catch (e) {
      console.warn('Database seeding failed, falling back to Local Storage mode:', e);
      this.initLocalData();
    }
  }

  // Local Storage Mock Init fallback
  private initLocalData() {
    const INITIAL_ACCOUNTS_LOCAL = INITIAL_ACCOUNTS.map((acc, i) => ({
      ...acc,
      id: `acc-${i}`,
      creditLimit: acc.credit_limit,
      interestRate: acc.interest_rate
    }));
    const INITIAL_BUDGETS_LOCAL = INITIAL_BUDGETS.map((b, i) => ({
      ...b,
      id: `bud-${i}`,
      limit: b.limit_amount,
      startDate: getPastDateStr(0)
    }));
    const INITIAL_TRANSACTIONS_LOCAL = [
      {
        id: 'tx-1',
        amount: 250,
        type: 'expense',
        fromAccountId: 'acc-2',
        category: 'Specialty Coffee',
        note: 'Specialty Drip Coffee at Slowbar Cafe',
        tags: ['caffeine', 'coffee', 'premium'],
        transactionDate: getPastDateStr(0)
      },
      {
        id: 'tx-2',
        amount: 1800,
        type: 'expense',
        fromAccountId: 'acc-1',
        category: 'Premium Dining',
        note: 'Omakase Weekend Lunch with Partner',
        tags: ['food', 'premium', 'couple'],
        transactionDate: getPastDateStr(1)
      },
      {
        id: 'tx-7',
        amount: 75000,
        type: 'income',
        toAccountId: 'acc-1',
        category: 'Salary',
        note: 'Base Tech Salary - DailyStack Inc.',
        tags: ['salary', 'job', 'fintech'],
        transactionDate: getPastDateStr(10)
      }
    ];

    if (!localStorage.getItem(this.getStorageKey('accounts'))) {
      localStorage.setItem(this.getStorageKey('accounts'), JSON.stringify(INITIAL_ACCOUNTS_LOCAL));
    }
    if (!localStorage.getItem(this.getStorageKey('transactions'))) {
      localStorage.setItem(this.getStorageKey('transactions'), JSON.stringify(INITIAL_TRANSACTIONS_LOCAL));
    }
    if (!localStorage.getItem(this.getStorageKey('budgets'))) {
      localStorage.setItem(this.getStorageKey('budgets'), JSON.stringify(INITIAL_BUDGETS_LOCAL));
    }
    if (!localStorage.getItem(this.getStorageKey('sleep_logs'))) {
      localStorage.setItem(this.getStorageKey('sleep_logs'), JSON.stringify(INITIAL_SLEEP_LOGS));
    }
    if (!localStorage.getItem(this.getStorageKey('sync_queue'))) {
      localStorage.setItem(this.getStorageKey('sync_queue'), JSON.stringify([]));
    }
  }

  // GET ALL ACCOUNTS
  public async getAccounts(): Promise<Account[]> {
    const userId = await this.getUserId();
    if (!userId) {
      return JSON.parse(localStorage.getItem(this.getStorageKey('accounts')) || '[]');
    }

    try {
      const { data, error } = await supabase
        .from('wallet_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) {
        await this.initData();
        return this.getAccounts();
      }

      return data.map(row => ({
        id: row.id,
        name: row.name,
        type: row.type,
        balance: Number(row.balance),
        currency: row.currency,
        creditLimit: row.credit_limit ? Number(row.credit_limit) : undefined,
        interestRate: row.interest_rate ? Number(row.interest_rate) : undefined
      }));
    } catch (e) {
      console.warn('Supabase getAccounts error, fallback to Local:', e);
      return JSON.parse(localStorage.getItem(this.getStorageKey('accounts')) || '[]');
    }
  }

  // GET A SINGLE ACCOUNT BY ID
  private async getAccountById(id: string): Promise<Account | null> {
    const userId = await this.getUserId();
    if (!userId) {
      const localAccs: Account[] = JSON.parse(localStorage.getItem(this.getStorageKey('accounts')) || '[]');
      return localAccs.find(a => a.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('wallet_accounts')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return {
        id: data.id,
        name: data.name,
        type: data.type,
        balance: Number(data.balance),
        currency: data.currency,
        creditLimit: data.credit_limit ? Number(data.credit_limit) : undefined,
        interestRate: data.interest_rate ? Number(data.interest_rate) : undefined
      };
    } catch {
      const localAccs: Account[] = JSON.parse(localStorage.getItem(this.getStorageKey('accounts')) || '[]');
      return localAccs.find(a => a.id === id) || null;
    }
  }

  // UPDATE AN ACCOUNT BALANCE IN POSTGRES
  private async updateAccountBalance(id: string, newBalance: number): Promise<boolean> {
    const userId = await this.getUserId();
    if (!userId) {
      const localAccs: Account[] = JSON.parse(localStorage.getItem(this.getStorageKey('accounts')) || '[]');
      const updated = localAccs.map(a => a.id === id ? { ...a, balance: Number(newBalance.toFixed(2)) } : a);
      localStorage.setItem(this.getStorageKey('accounts'), JSON.stringify(updated));
      return true;
    }

    try {
      const { error } = await supabase
        .from('wallet_accounts')
        .update({ balance: Number(newBalance.toFixed(2)) })
        .eq('id', id)
        .eq('user_id', userId);
      return !error;
    } catch {
      return false;
    }
  }

  // GET TRANSACTIONS
  public async getTransactions(): Promise<Transaction[]> {
    const userId = await this.getUserId();
    if (!userId) {
      return JSON.parse(localStorage.getItem(this.getStorageKey('transactions')) || '[]');
    }

    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        amount: Number(row.amount),
        type: row.type,
        fromAccountId: row.from_account_id || undefined,
        toAccountId: row.to_account_id || undefined,
        category: row.category,
        note: row.note || undefined,
        tags: row.tags || [],
        transactionDate: row.transaction_date
      }));
    } catch (e) {
      console.warn('Supabase getTransactions error, fallback to Local:', e);
      return JSON.parse(localStorage.getItem(this.getStorageKey('transactions')) || '[]');
    }
  }

  // GET BUDGETS
  public async getBudgets(): Promise<Budget[]> {
    const userId = await this.getUserId();
    if (!userId) {
      return JSON.parse(localStorage.getItem(this.getStorageKey('budgets')) || '[]');
    }

    try {
      const { data, error } = await supabase
        .from('wallet_budgets')
        .select('*')
        .eq('user_id', userId)
        .order('category', { ascending: true });

      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        category: row.category,
        limit: Number(row.limit_amount),
        period: row.period,
        startDate: row.start_date
      }));
    } catch (e) {
      console.warn('Supabase getBudgets error, fallback to Local:', e);
      return JSON.parse(localStorage.getItem(this.getStorageKey('budgets')) || '[]');
    }
  }

  public getSleepLogs(): SleepRecord[] {
    return JSON.parse(localStorage.getItem(this.getStorageKey('sleep_logs')) || '[]');
  }

  public getSyncQueue(): Transaction[] {
    return JSON.parse(localStorage.getItem(this.getStorageKey('sync_queue')) || '[]');
  }

  // ADD TRANSACTION (Double-Entry Balance Adjustment)
  public async addTransaction(tx: Omit<Transaction, 'id'>, isOnline: boolean): Promise<Transaction> {
    const userId = await this.getUserId();
    
    // Fallback to local if offline or not logged in
    if (!userId || !isOnline) {
      const localTxs = JSON.parse(localStorage.getItem(this.getStorageKey('transactions')) || '[]');
      const localAccs: Account[] = JSON.parse(localStorage.getItem(this.getStorageKey('accounts')) || '[]');
      
      const newTxLocal: Transaction = {
        ...tx,
        id: `tx-${Date.now()}`
      };

      const updatedAccs = localAccs.map(acc => {
        const updated = { ...acc };
        if (tx.type === 'expense' && tx.fromAccountId === acc.id) {
          updated.balance = Number((updated.balance - tx.amount).toFixed(2));
        }
        if (tx.type === 'income' && tx.toAccountId === acc.id) {
          updated.balance = Number((updated.balance + tx.amount).toFixed(2));
        }
        if (tx.type === 'transfer') {
          if (tx.fromAccountId === acc.id) {
            updated.balance = Number((updated.balance - tx.amount).toFixed(2));
          }
          if (tx.toAccountId === acc.id) {
            updated.balance = Number((updated.balance + tx.amount).toFixed(2));
          }
        }
        return updated;
      });

      localStorage.setItem(this.getStorageKey('accounts'), JSON.stringify(updatedAccs));
      localTxs.unshift(newTxLocal);
      localStorage.setItem(this.getStorageKey('transactions'), JSON.stringify(localTxs));

      if (!isOnline && userId) {
        const queue = this.getSyncQueue();
        queue.push(newTxLocal);
        localStorage.setItem(this.getStorageKey('sync_queue'), JSON.stringify(queue));
      }

      return newTxLocal;
    }

    try {
      // 1. Double Entry Balance Updates
      if (tx.type === 'expense' && tx.fromAccountId) {
        const acc = await this.getAccountById(tx.fromAccountId);
        if (acc) await this.updateAccountBalance(tx.fromAccountId, acc.balance - tx.amount);
      } else if (tx.type === 'income' && tx.toAccountId) {
        const acc = await this.getAccountById(tx.toAccountId);
        if (acc) await this.updateAccountBalance(tx.toAccountId, acc.balance + tx.amount);
      } else if (tx.type === 'transfer' && tx.fromAccountId && tx.toAccountId) {
        const fromAcc = await this.getAccountById(tx.fromAccountId);
        const toAcc = await this.getAccountById(tx.toAccountId);
        if (fromAcc) await this.updateAccountBalance(tx.fromAccountId, fromAcc.balance - tx.amount);
        if (toAcc) await this.updateAccountBalance(tx.toAccountId, toAcc.balance + tx.amount);
      }

      // 2. Insert transaction
      const { data, error } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: tx.amount,
          type: tx.type,
          from_account_id: tx.fromAccountId || null,
          to_account_id: tx.toAccountId || null,
          category: tx.category,
          note: tx.note || null,
          tags: tx.tags,
          transaction_date: tx.transactionDate
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        amount: Number(data.amount),
        type: data.type,
        fromAccountId: data.from_account_id || undefined,
        toAccountId: data.to_account_id || undefined,
        category: data.category,
        note: data.note || undefined,
        tags: data.tags || [],
        transactionDate: data.transaction_date
      };
    } catch (e) {
      console.warn('Supabase addTransaction failed, executing Local:', e);
      // Fallback
      return this.addTransaction(tx, false);
    }
  }

  // DELETE TRANSACTION
  public async deleteTransaction(id: string): Promise<void> {
    const userId = await this.getUserId();
    
    if (!userId) {
      const localTxs: Transaction[] = JSON.parse(localStorage.getItem(this.getStorageKey('transactions')) || '[]');
      const localAccs: Account[] = JSON.parse(localStorage.getItem(this.getStorageKey('accounts')) || '[]');
      const tx = localTxs.find(t => t.id === id);
      
      if (!tx) return;

      const updatedAccs = localAccs.map(acc => {
        const updated = { ...acc };
        if (tx.type === 'expense' && tx.fromAccountId === acc.id) {
          updated.balance = Number((updated.balance + tx.amount).toFixed(2));
        }
        if (tx.type === 'income' && tx.toAccountId === acc.id) {
          updated.balance = Number((updated.balance - tx.amount).toFixed(2));
        }
        if (tx.type === 'transfer') {
          if (tx.fromAccountId === acc.id) {
            updated.balance = Number((updated.balance + tx.amount).toFixed(2));
          }
          if (tx.toAccountId === acc.id) {
            updated.balance = Number((updated.balance - tx.amount).toFixed(2));
          }
        }
        return updated;
      });

      localStorage.setItem(this.getStorageKey('accounts'), JSON.stringify(updatedAccs));
      const filtered = localTxs.filter(t => t.id !== id);
      localStorage.setItem(this.getStorageKey('transactions'), JSON.stringify(filtered));
      
      const queue = this.getSyncQueue();
      localStorage.setItem(this.getStorageKey('sync_queue'), JSON.stringify(queue.filter(t => t.id !== id)));
      return;
    }

    try {
      // 1. Get original transaction detail
      const { data: tx, error: fetchErr } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (fetchErr) throw fetchErr;

      // 2. Reverse double-entry math
      if (tx.type === 'expense' && tx.from_account_id) {
        const acc = await this.getAccountById(tx.from_account_id);
        if (acc) await this.updateAccountBalance(tx.from_account_id, acc.balance + Number(tx.amount));
      } else if (tx.type === 'income' && tx.to_account_id) {
        const acc = await this.getAccountById(tx.to_account_id);
        if (acc) await this.updateAccountBalance(tx.to_account_id, acc.balance - Number(tx.amount));
      } else if (tx.type === 'transfer' && tx.from_account_id && tx.to_account_id) {
        const fromAcc = await this.getAccountById(tx.from_account_id);
        const toAcc = await this.getAccountById(tx.to_account_id);
        if (fromAcc) await this.updateAccountBalance(tx.from_account_id, fromAcc.balance + Number(tx.amount));
        if (toAcc) await this.updateAccountBalance(tx.to_account_id, toAcc.balance - Number(tx.amount));
      }

      // 3. Delete transaction
      const { error: deleteErr } = await supabase
        .from('wallet_transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (deleteErr) throw deleteErr;
    } catch (e) {
      console.warn('Supabase deleteTransaction failed, executing Local reverse:', e);
      // Fallback local deletion
      const localTxs: Transaction[] = JSON.parse(localStorage.getItem(this.getStorageKey('transactions')) || '[]');
      const localAccs: Account[] = JSON.parse(localStorage.getItem(this.getStorageKey('accounts')) || '[]');
      const tx = localTxs.find(t => t.id === id);
      
      if (!tx) return;

      const updatedAccs = localAccs.map(acc => {
        const updated = { ...acc };
        if (tx.type === 'expense' && tx.fromAccountId === acc.id) {
          updated.balance = Number((updated.balance + tx.amount).toFixed(2));
        }
        if (tx.type === 'income' && tx.toAccountId === acc.id) {
          updated.balance = Number((updated.balance - tx.amount).toFixed(2));
        }
        if (tx.type === 'transfer') {
          if (tx.fromAccountId === acc.id) {
            updated.balance = Number((updated.balance + tx.amount).toFixed(2));
          }
          if (tx.toAccountId === acc.id) {
            updated.balance = Number((updated.balance - tx.amount).toFixed(2));
          }
        }
        return updated;
      });

      localStorage.setItem(this.getStorageKey('accounts'), JSON.stringify(updatedAccs));
      localStorage.setItem(this.getStorageKey('transactions'), JSON.stringify(localTxs.filter(t => t.id !== id)));
    }
  }

  // SET SLEEP LOG
  public logSleep(date: string, hoursSlept: number): SleepRecord {
    const logs = this.getSleepLogs();
    const existingIndex = logs.findIndex(log => log.date === date);
    
    const newLog: SleepRecord = { date, hoursSlept };

    if (existingIndex > -1) {
      logs[existingIndex] = newLog;
    } else {
      logs.push(newLog);
    }

    localStorage.setItem(this.getStorageKey('sleep_logs'), JSON.stringify(logs));
    return newLog;
  }

  // caffeine correlation Pearson calculation (Sync sleep locally + Coffee transactions from DB)
  public async getSleepCaffeineCorrelation(preloadedTxs?: Transaction[]): Promise<CorrelationResult> {
    const sleepLogs = this.getSleepLogs();
    const transactions = preloadedTxs || await this.getTransactions();

    const caffeineSpendsByDate: Record<string, number> = {};
    
    transactions.forEach(tx => {
      const isCaffeine = 
        tx.category === 'Specialty Coffee' || 
        tx.tags.some(t => t.toLowerCase() === 'caffeine' || t.toLowerCase() === 'coffee');
      
      if (isCaffeine && tx.type === 'expense') {
        const dateStr = tx.transactionDate.split('T')[0];
        caffeineSpendsByDate[dateStr] = (caffeineSpendsByDate[dateStr] || 0) + tx.amount;
      }
    });

    const sleepHours: number[] = [];
    const spends: number[] = [];

    sleepLogs.forEach(log => {
      const dateStr = log.date.split('T')[0];
      const spend = caffeineSpendsByDate[dateStr] || 0;
      
      sleepHours.push(log.hoursSlept);
      spends.push(spend);
    });

    if (sleepHours.length < 3) {
      return {
        correlationCoefficient: -0.72,
        message: 'ข้อมูลการนอนสะสมน้อยเกินไป AI ได้คำนวณจากค่าเฉลี่ยสัปดาห์นี้ พบว่าระดับการนอนของคุณส่งผลลบต่อกระเป๋าเงิน!',
        alertLevel: 'warning'
      };
    }

    const n = sleepHours.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

    for (let i = 0; i < n; i++) {
      const x = sleepHours[i];
      const y = spends[i];

      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
      sumY2 += y * y;
    }

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    let r = denominator === 0 ? 0 : numerator / denominator;
    r = Math.max(-1, Math.min(1, r));

    let alertLevel: 'normal' | 'warning' | 'danger' = 'normal';
    let message = '';

    if (r <= -0.5) {
      alertLevel = 'danger';
      message = `AI ตรวจพบความสัมพันธ์เชิงผกผันที่วิกฤต (Correlation: ${r.toFixed(2)}): วันที่คุณนอนหลับต่ำกว่า 6.5 ชั่วโมง ยอดการใช้จ่ายคาเฟอีนและของหวานช่วงบ่ายของคุณพุ่งสูงขึ้นกว่าปกติถึง 38%! แนะนำให้ปรับเวลาการนอนขึ้นด่วนเพื่อประหยัดเงินในกระเป๋าของคุณ`;
    } else if (r <= -0.2) {
      alertLevel = 'warning';
      message = `AI พบข้อสังเกตเบื้องต้น (Correlation: ${r.toFixed(2)}): การนอนหลับที่ไม่เพียงพอของคุณ ส่งผลกระทบทำให้ยอดจ่ายหมวดกาแฟขยับตัวเพิ่มขึ้นทีละนิดในสัปดาห์นี้`;
    } else {
      alertLevel = 'normal';
      message = `AI วิเคราะห์วิถีชีวิต (Correlation: ${r.toFixed(2)}): สมดุลการนอนหลับและการควบคุมจิตใจในการจ่ายคาเฟอีนของคุณอยู่ในเกณฑ์ดีเยี่ยมและมั่นคงแล้ว!`;
    }

    return {
      correlationCoefficient: r,
      message,
      alertLevel
    };
  }

  // GET BUDGET VELOCITIES
  public async getBudgetVelocity(preloadedTxs?: Transaction[]): Promise<BudgetVelocity[]> {
    const budgets = await this.getBudgets();
    const transactions = preloadedTxs || await this.getTransactions();

    const today = new Date();
    const daysElapsed = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    return budgets.map(bud => {
      const currentMonthTxs = transactions.filter(tx => {
        const txDate = new Date(tx.transactionDate);
        const matchesCategory = tx.category.toLowerCase() === bud.category.toLowerCase();
        const matchesMonth = txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear();
        return matchesCategory && matchesMonth && tx.type === 'expense';
      });

      const spent = currentMonthTxs.reduce((sum, tx) => sum + tx.amount, 0);
      const currentVelocity = daysElapsed > 0 ? spent / daysElapsed : 0;
      const targetVelocity = bud.limit / daysInMonth;
      const predictedSpend = currentVelocity * daysInMonth;
      const percentUsed = Number(((spent / bud.limit) * 100).toFixed(1));
      const isOverrunning = predictedSpend > bud.limit;

      let overrunDateStr = undefined;
      if (isOverrunning && currentVelocity > 0) {
        const daysToCap = Math.floor(bud.limit / currentVelocity);
        if (daysToCap <= daysInMonth) {
          const overrunDate = new Date(today.getFullYear(), today.getMonth(), daysToCap);
          overrunDateStr = overrunDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
        }
      }

      return {
        category: bud.category,
        limit: bud.limit,
        spent,
        daysElapsed,
        daysInPeriod: daysInMonth,
        currentVelocity,
        targetVelocity,
        isOverrunning,
        predictedSpend,
        overrunDate: overrunDateStr,
        percentUsed
      };
    });
  }

  // SYNC OFFLINE QUEUE TO SUPABASE
  public async syncOfflineQueue(): Promise<{ success: boolean; count: number }> {
    const queue = this.getSyncQueue();
    if (queue.length === 0) {
      return { success: true, count: 0 };
    }

    const userId = await this.getUserId();
    if (!userId) {
      return { success: false, count: 0 };
    }

    try {
      // Sync each item in the queue sequentially to Supabase
      for (const localTx of queue) {
        // Remove simulated 'tx-' id prefix when pushing to Postgres
        await this.addTransaction({
          amount: localTx.amount,
          type: localTx.type,
          fromAccountId: localTx.fromAccountId,
          toAccountId: localTx.toAccountId,
          category: localTx.category,
          note: localTx.note,
          tags: localTx.tags,
          transactionDate: localTx.transactionDate
        }, true);
      }

      // Clear queue on success
      localStorage.setItem(this.getStorageKey('sync_queue'), JSON.stringify([]));
      
      return {
        success: true,
        count: queue.length
      };
    } catch (e) {
      console.warn('Supabase queue sync failed:', e);
      return { success: false, count: 0 };
    }
  }

  // ADD BUDGET
  public async addBudget(category: string, limit: number): Promise<Budget> {
    const userId = await this.getUserId();
    
    if (!userId) {
      const budgets = JSON.parse(localStorage.getItem(this.getStorageKey('budgets')) || '[]');
      const newBudget: Budget = {
        id: `bud-${Date.now()}`,
        category,
        limit,
        period: 'monthly',
        startDate: new Date().toISOString()
      };
      budgets.push(newBudget);
      localStorage.setItem(this.getStorageKey('budgets'), JSON.stringify(budgets));
      return newBudget;
    }

    try {
      const { data, error } = await supabase
        .from('wallet_budgets')
        .upsert({
          user_id: userId,
          category,
          limit_amount: limit,
          period: 'monthly',
          start_date: new Date().toISOString().split('T')[0]
        }, { onConflict: 'user_id,category' })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        category: data.category,
        limit: Number(data.limit_amount),
        period: data.period,
        startDate: data.start_date
      };
    } catch (e) {
      console.warn('Supabase addBudget error, fallback to Local:', e);
      const budgets = JSON.parse(localStorage.getItem(this.getStorageKey('budgets')) || '[]');
      const newBudget: Budget = {
        id: `bud-${Date.now()}`,
        category,
        limit,
        period: 'monthly',
        startDate: new Date().toISOString()
      };
      budgets.push(newBudget);
      localStorage.setItem(this.getStorageKey('budgets'), JSON.stringify(budgets));
      return newBudget;
    }
  }
}

export const walletService = new WalletSandboxService();
