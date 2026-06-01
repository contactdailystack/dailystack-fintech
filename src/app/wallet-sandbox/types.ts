export type AccountType = 'cash' | 'bank' | 'credit_card' | 'investment' | 'debt';
export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  creditLimit?: number; // for credit_card
  interestRate?: number; // for investment/debt
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  fromAccountId?: string;
  toAccountId?: string;
  category: string;
  note?: string;
  tags: string[];
  transactionDate: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: 'weekly' | 'monthly';
  startDate: string;
}

export interface SleepRecord {
  date: string;
  hoursSlept: number;
}

export interface BudgetVelocity {
  category: string;
  limit: number;
  spent: number;
  daysElapsed: number;
  daysInPeriod: number;
  currentVelocity: number; // spend per day
  targetVelocity: number;  // allowable spend per day
  isOverrunning: boolean;
  predictedSpend: number;
  overrunDate?: string;
  percentUsed: number;
}

export interface CorrelationResult {
  correlationCoefficient: number;
  message: string;
  alertLevel: 'normal' | 'warning' | 'danger';
}
