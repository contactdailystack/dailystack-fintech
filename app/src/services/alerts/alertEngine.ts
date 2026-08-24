/**
 * alertEngine.ts — Behavioral Alert Evaluation Engine
 * DailyStack FinTech — Core Alert Logic
 */

import { 
  AlertRule, 
  BehavioralAlert, 
  ThresholdCondition, 
  AlertMetric,
  AlertSeverity,
  AlertTrigger,
  Transaction
} from './alertTypes';
import { Transaction as TransactionType } from '../../types';
import { loadBudgets, monthSpendByBudgetKey } from '../budgetStore';

// ─── Metric Calculator ───────────────────────────────────────────────────

interface MetricResult {
  value: number;
  breakdown?: Record<string, number>;
}

/** Minimal subscription shape the engine needs (mirrors SubscriptionTrackerPage) */
export interface AlertRuntimeSub {
  id: string;
  name: string;
  amount: number;
  dueDate: number; // day of month
}

/** Runtime data the engine cannot derive from transactions alone */
export interface AlertRuntimeContext {
  /** Current wallet balance — enables low-balance alerts */
  balance?: number;
  /** Active subscriptions — enables bill-due-soon reminders */
  subscriptions?: AlertRuntimeSub[];
}

class MetricCalculator {
  private transactions: TransactionType[];
  private dateRange: { start: Date; end: Date };
  /** Runtime context injected by the caller (balance, subscriptions) */
  private ctx: AlertRuntimeContext;

  constructor(transactions: TransactionType[], days: number = 30, ctx: AlertRuntimeContext = {}) {
    this.transactions = transactions;
    this.ctx = ctx;
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    this.dateRange = { start, end };
  }

  /**
   * Get transactions within the configured date range
   */
  private getFilteredTransactions(): TransactionType[] {
    return this.transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= this.dateRange.start && txDate <= this.dateRange.end;
    });
  }

  /**
   * Calculate total spending (absolute value of negative transactions)
   */
  calculateSpendingTotal(): MetricResult {
    const filtered = this.getFilteredTransactions();
    const total = Math.abs(
      filtered
        .filter(tx => tx.amount < 0)
        .reduce((sum, tx) => sum + tx.amount, 0)
    );
    return { value: total };
  }

  /**
   * Max over-budget percentage across budget categories this month (P1-7).
   * 0 when every category is within its limit.
   */
  calculateBudgetVariance(): MetricResult {
    try {
      const budgets = loadBudgets();
      if (budgets.length === 0) return { value: 0 };
      const spend = monthSpendByBudgetKey(this.transactions);
      let worst = 0;
      for (const b of budgets) {
        if (b.limit <= 0) continue;
        const spent = spend.get(b.key) || 0;
        const pct = (spent / b.limit) * 100;
        if (pct > worst) worst = pct;
      }
      return { value: Math.round(worst) };
    } catch {
      return { value: 0 };
    }
  }

  /**
   * Calculate spending by category
   */
  calculateSpendingByCategory(): Record<string, MetricResult> {
    const filtered = this.getFilteredTransactions();
    const result: Record<string, MetricResult> = {};
    
    const byCategory = filtered
      .filter(tx => tx.amount < 0)
      .reduce((acc, tx) => {
        const cat = tx.category || 'Other';
        acc[cat] = (acc[cat] || 0) + Math.abs(tx.amount);
        return acc;
      }, {} as Record<string, number>);

    for (const [category, value] of Object.entries(byCategory)) {
      result[category] = { value };
    }
    
    return result;
  }

  /**
   * Count late-night transactions (after 10pm)
   */
  calculateLateNightCount(): MetricResult {
    const filtered = this.getFilteredTransactions();
    const count = filtered.filter(tx => {
      const time = tx.timeOfDay;
      return time === 'Midnight' || time === 'Evening';
    }).length;
    return { value: count };
  }

  /**
   * Count transactions
   */
  calculateTransactionCount(): MetricResult {
    return { value: this.getFilteredTransactions().length };
  }

  /**
   * Current wallet balance (injected via runtime context).
   * Undefined balance → -1 so `lt threshold` rules never fire on missing data.
   */
  calculateBalance(): MetricResult {
    return { value: typeof this.ctx.balance === 'number' ? this.ctx.balance : -1 };
  }

  /**
   * Suspected duplicate charges: same merchant (description) + same amount,
   * posted within 48h of each other. Counts distinct flagged transactions.
   */
  calculateDuplicateCount(): MetricResult {
    const expenses = this.transactions.filter(t => t.amount < 0);
    const flagged = new Set<string>();
    for (let i = 0; i < expenses.length; i++) {
      for (let j = i + 1; j < expenses.length; j++) {
        const a = expenses[i];
        const b = expenses[j];
        if (a.id === b.id) continue;
        if (a.amount !== b.amount) continue;
        const da = new Date(a.date).getTime();
        const dbb = new Date(b.date).getTime();
        if (Math.abs(da - dbb) > 48 * 60 * 60 * 1000) continue;
        // Merchant match: exact merchant or one contains the other (case-insensitive)
        const na = (a.merchant || '').trim().toLowerCase();
        const nb = (b.merchant || '').trim().toLowerCase();
        if (!na || !nb) continue;
        if (na !== nb && !na.includes(nb) && !nb.includes(na)) continue;
        flagged.add(a.id);
        flagged.add(b.id);
      }
    }
    return { value: flagged.size };
  }

  /**
   * Active subscriptions due within the next 7 days.
   */
  calculateBillsDue7d(): MetricResult {
    const subs = this.ctx.subscriptions;
    if (!subs || subs.length === 0) return { value: 0 };
    const today = new Date();
    const cur = today.getDate();
    const dim = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    let count = 0;
    for (const s of subs) {
      let dueIn = s.dueDate - cur;
      if (dueIn < 0) dueIn += dim;
      if (dueIn <= 7) count++;
    }
    return { value: count };
  }

  /**
   * Calculate metric by name
   */
  calculate(metric: AlertMetric): MetricResult {
    switch (metric) {
      case 'spending_total':
        return this.calculateSpendingTotal();
      case 'late_night_count':
        return this.calculateLateNightCount();
      case 'transaction_count':
        return this.calculateTransactionCount();
      case 'spending_category':
        return this.calculateSpendingTotal(); // Will be overridden per-category
      case 'balance':
        return this.calculateBalance();
      case 'duplicate_count':
        return this.calculateDuplicateCount();
      case 'bills_due_7d':
        return this.calculateBillsDue7d();
      default:
        return { value: 0 };
    }
  }
}

// ─── Condition Evaluator ──────────────────────────────────────────────────

export class ConditionEvaluator {
  /**
   * Evaluate a single threshold condition against current metric value
   */
  static evaluate(condition: ThresholdCondition, currentValue: number): boolean {
    const { operator, value } = condition;

    switch (operator) {
      case 'gt':
        return currentValue > (value as number);
      case 'lt':
        return currentValue < (value as number);
      case 'eq':
        return currentValue === (value as number);
      case 'gte':
        return currentValue >= (value as number);
      case 'lte':
        return currentValue <= (value as number);
      case 'between':
        const [min, max] = value as [number, number];
        return currentValue >= min && currentValue <= max;
      default:
        return false;
    }
  }

  /**
   * Evaluate multiple conditions with AND/OR logic
   */
  static evaluateAll(
    conditions: ThresholdCondition[],
    logic: 'AND' | 'OR',
    values: Record<AlertMetric, number>
  ): boolean {
    if (conditions.length === 0) return false;

    const results = conditions.map(condition => {
      const currentValue = values[condition.metric] ?? 0;
      return this.evaluate(condition, currentValue);
    });

    return logic === 'AND'
      ? results.every(r => r)
      : results.some(r => r);
  }
}

// ─── Alert Generator ──────────────────────────────────────────────────────

interface AlertGenerationContext {
  userId: string;
  transactions: TransactionType[];
  currentMetrics: Record<AlertMetric, number>;
  previousMetrics?: Record<AlertMetric, number>;
  budgetStatus?: {
    category: string;
    spent: number;
    budget: number;
  }[];
}

export class AlertGenerator {
  private calculator: MetricCalculator;

  constructor(
    private transactions: TransactionType[],
    days: number = 30,
    runtimeContext: AlertRuntimeContext = {}
  ) {
    this.calculator = new MetricCalculator(transactions, days, runtimeContext);
  }

  /**
   * Calculate all current metrics
   */
  calculateMetrics(): Record<AlertMetric, number> {
    return {
      spending_total: this.calculator.calculateSpendingTotal().value,
      spending_category: 0, // Calculated per category if needed
      late_night_count: this.calculator.calculateLateNightCount().value,
      transaction_count: this.calculator.calculateTransactionCount().value,
      savings_rate: 0, // Calculated separately
      streak_days: 0, // From tracking streaks
      goal_progress: 0, // From goals service
      budget_variance: this.calculator.calculateBudgetVariance().value,
      balance: this.calculator.calculateBalance().value,
      duplicate_count: this.calculator.calculateDuplicateCount().value,
      bills_due_7d: this.calculator.calculateBillsDue7d().value,
    };
  }

  /**
   * Evaluate a single rule and determine if it should trigger
   */
  evaluateRule(
    rule: AlertRule,
    context: AlertGenerationContext
  ): { triggered: boolean; severity: AlertSeverity; metricValues: Record<AlertMetric, number> } {
    // Check if rule is enabled
    if (!rule.enabled) {
      return { triggered: false, severity: 'info', metricValues: context.currentMetrics };
    }

    // Check cooldown (would need to check against recent alerts in real implementation)
    // For now, we'll trust the rule.cooldownMinutes to be respected by the caller

    // Evaluate conditions
    const metricValues = { ...context.currentMetrics };
    const conditionsMet = ConditionEvaluator.evaluateAll(
      rule.conditions,
      rule.conditionsLogic,
      metricValues
    );

    if (!conditionsMet) {
      return { triggered: false, severity: 'info', metricValues };
    }

    // Determine severity based on thresholds
    let severity = rule.severity;
    const primaryMetric = rule.conditions[0]?.metric;
    const currentValue = metricValues[primaryMetric] ?? 0;

    if (rule.thresholds.critical && currentValue >= rule.thresholds.critical) {
      severity = 'critical';
    } else if (rule.thresholds.alert && currentValue >= rule.thresholds.alert) {
      severity = 'alert';
    } else if (rule.thresholds.warning && currentValue >= rule.thresholds.warning) {
      severity = 'warning';
    }

    return { triggered: true, severity, metricValues };
  }

  /**
   * Generate alert content based on rule and context
   */
  generateAlertContent(
    rule: AlertRule,
    context: AlertGenerationContext,
    severity: AlertSeverity
  ): { title: string; message: string } {
    const metrics = context.currentMetrics;
    
    // Runtime-context alerts (balance / duplicates / bills) keyed by primary metric
    const primaryMetric = rule.conditions[0]?.metric;
    if (primaryMetric === 'balance') {
      return {
        title: 'ยอดเงินคงเหลือต่ำ',
        message: `ยอดเงินในบัญชีเหลือ ฿${Math.max(0, metrics.balance).toLocaleString()} ต่ำกว่าเกณฑ์ที่ตั้งไว้ ระวังการใช้จ่ายช่วงนี้เพื่อไม่ให้หมดก่อนถึงวันเงินเดือนออก`
      };
    }
    if (primaryMetric === 'duplicate_count') {
      return {
        title: 'พบรายการที่อาจถูกตั้งค่าซ้ำ',
        message: `ตรวจพบ ${metrics.duplicate_count} รายการที่มีร้านค้าและจำนวนเงินเดียวกันภายใน 48 ชั่วโมง อาจเป็นการถูกตั้งเงินซ้ำ เปิดหน้า Activity เพื่อตรวจสอบ`
      };
    }
    if (primaryMetric === 'bills_due_7d') {
      return {
        title: 'มีบิลที่จะมาถึง',
        message: `คุณมี ${metrics.bills_due_7d} รายการสมัคร/บิลที่จะถูกตัดภายใน 7 วันข้างหน้า ตรวจสอบหน้า Subscriptions เพื่อเตรียมแผนเงิน`
      };
    }
    
    // Generate dynamic content based on rule type
    switch (rule.category) {
      case 'budget':
        return this.generateBudgetAlert(rule, metrics);
      case 'savings':
        return this.generateSavingsAlert(rule, metrics);
      case 'pattern':
        return this.generatePatternAlert(rule, metrics);
      default:
        return {
          title: rule.name,
          message: rule.description
        };
    }
  }

  private generateBudgetAlert(
    rule: AlertRule,
    metrics: Record<AlertMetric, number>
  ): { title: string; message: string } {
    const spending = metrics.spending_total;
    const category = rule.conditions[0]?.metric === 'spending_category' 
      ? 'this category' 
      : 'your spending';

    return {
      title: 'Budget Threshold Approaching',
      message: `Your ${category} has reached ฿${spending.toLocaleString()}. You're approaching your set limit. Review your upcoming expenses to stay on track.`
    };
  }

  private generateSavingsAlert(
    rule: AlertRule,
    metrics: Record<AlertMetric, number>
  ): { title: string; message: string } {
    const savingsRate = metrics.savings_rate;

    return {
      title: 'Savings Rate Opportunity',
      message: `Your current savings rate is ${savingsRate}%. Financial experts recommend 20%+ savings. Even small increases today compound significantly over years.`
    };
  }

  private generatePatternAlert(
    rule: AlertRule,
    metrics: Record<AlertMetric, number>
  ): { title: string; message: string } {
    const lateNight = metrics.late_night_count;

    return {
      title: 'Time-Based Pattern Detected',
      message: `${lateNight} late-night transactions detected. Late-night spending often correlates with impulse decisions due to decision fatigue. Consider setting a "no spend" rule after 9pm.`
    };
  }
}

// ─── Pre-built Alert Rules ────────────────────────────────────────────────

export const DEFAULT_ALERT_RULES: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Late Night Spending Pattern',
    description: 'Identifies late-night spending which often indicates impulse',
    category: 'pattern',
    severity: 'warning',
    priority: 'medium',
    triggers: [{ type: 'time_trigger', time: '22:00', days: [0, 1, 2, 3, 4, 5, 6] }],
    conditions: [
      { metric: 'late_night_count', operator: 'gte', value: 2, window: 'weekly' }
    ],
    conditionsLogic: 'AND',
    channels: ['in_app'],
    timing: 'daily_digest',
    cooldownMinutes: 1440,
    maxPerDay: 1,
    enabled: true,
    autoResolve: true,
    showInFeed: true,
    thresholds: { warning: 2, alert: 4, critical: 6 }
  },
  {
    name: 'Savings Rate Alert',
    description: 'Notifies when savings rate falls below target',
    category: 'savings',
    severity: 'alert',
    priority: 'high',
    triggers: [{ type: 'weekly_summary' }],
    conditions: [
      { metric: 'savings_rate', operator: 'lt', value: 20 }
    ],
    conditionsLogic: 'AND',
    channels: ['in_app', 'email'],
    timing: 'daily_digest',
    cooldownMinutes: 1440,
    maxPerDay: 1,
    enabled: true,
    autoResolve: true,
    showInFeed: true,
    thresholds: { warning: 20, alert: 10, critical: 5 }
  },
  {
    name: 'Weekly Spending Summary',
    description: 'Daily summary of spending patterns and insights',
    category: 'pattern',
    severity: 'info',
    priority: 'low',
    triggers: [{ type: 'weekly_summary' }],
    conditions: [],
    conditionsLogic: 'AND',
    channels: ['in_app', 'email'],
    timing: 'daily_digest',
    cooldownMinutes: 1440,
    maxPerDay: 1,
    enabled: true,
    autoResolve: true,
    showInFeed: true,
    thresholds: {}
  },
  {
    name: 'Streak Milestone',
    description: 'Celebrates consistent tracking streaks',
    category: 'milestone',
    severity: 'info',
    priority: 'low',
    triggers: [{ type: 'streak_change', direction: 'increase' }],
    conditions: [
      { metric: 'streak_days', operator: 'gte', value: 7 }
    ],
    conditionsLogic: 'AND',
    channels: ['in_app', 'push'],
    timing: 'immediate',
    cooldownMinutes: 1440,
    maxPerDay: 1,
    enabled: true,
    autoResolve: true,
    showInFeed: true,
    thresholds: { warning: 7, alert: 14, critical: 30 }
  },
  {
    name: 'Budget Variance Alert',
    description: 'Warns when spending exceeds budget allocation',
    category: 'budget',
    severity: 'alert',
    priority: 'high',
    triggers: [{ type: 'budget_exceeded' }],
    conditions: [
      { metric: 'budget_variance', operator: 'gt', value: 0 }
    ],
    conditionsLogic: 'AND',
    channels: ['in_app', 'push', 'email'],
    timing: 'immediate',
    cooldownMinutes: 480,
    maxPerDay: 3,
    enabled: true,
    autoResolve: true,
    showInFeed: true,
    thresholds: { warning: 0, alert: 10, critical: 25 }
  },
  {
    name: 'Low Balance Warning',
    description: 'Warns when wallet balance falls below a safe threshold before payday',
    category: 'budget',
    severity: 'warning',
    priority: 'high',
    triggers: [{ type: 'time_trigger', time: '09:00', days: [0, 1, 2, 3, 4, 5, 6] }],
    conditions: [
      { metric: 'balance', operator: 'lt', value: 2000, window: 'daily' }
    ],
    conditionsLogic: 'AND',
    channels: ['in_app', 'push'],
    timing: 'immediate',
    cooldownMinutes: 720,
    maxPerDay: 1,
    enabled: true,
    autoResolve: true,
    showInFeed: true,
    thresholds: {}
  },
  {
    name: 'Duplicate Charge Detected',
    description: 'Flags suspected duplicate charges (same merchant + amount within 48h)',
    category: 'security',
    severity: 'alert',
    priority: 'high',
    triggers: [{ type: 'budget_exceeded' }],
    conditions: [
      { metric: 'duplicate_count', operator: 'gte', value: 1 }
    ],
    conditionsLogic: 'AND',
    channels: ['in_app'],
    timing: 'immediate',
    cooldownMinutes: 1440,
    maxPerDay: 2,
    enabled: true,
    autoResolve: false,
    showInFeed: true,
    thresholds: { warning: 1, alert: 2 }
  },
  {
    name: 'Upcoming Bills Reminder',
    description: 'Reminds when subscriptions or bills are due within the next 7 days',
    category: 'pattern',
    severity: 'info',
    priority: 'medium',
    triggers: [{ type: 'weekly_summary' }],
    conditions: [
      { metric: 'bills_due_7d', operator: 'gte', value: 1 }
    ],
    conditionsLogic: 'AND',
    channels: ['in_app', 'push'],
    timing: 'immediate',
    cooldownMinutes: 1440,
    maxPerDay: 1,
    enabled: true,
    autoResolve: true,
    showInFeed: true,
    thresholds: {}
  }
];

// ─── Utility Functions ────────────────────────────────────────────────────

/**
 * Generate unique alert ID
 */
export function generateAlertId(): string {
  return `alt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate severity score for sorting
 */
export function severityToScore(severity: AlertSeverity): number {
  const scores: Record<AlertSeverity, number> = {
    critical: 4,
    alert: 3,
    warning: 2,
    info: 1,
    success: 0
  };
  return scores[severity];
}

/**
 * Format alert message with transaction context
 */
export function formatAlertMessage(
  template: string,
  context: {
    amount?: number;
    category?: string;
    merchant?: string;
  }
): string {
  let message = template;
  
  if (context.amount !== undefined) {
    message = message.replace('{amount}', `฿${Math.abs(context.amount).toLocaleString()}`);
  }
  if (context.category) {
    message = message.replace('{category}', context.category);
  }
  if (context.merchant) {
    message = message.replace('{merchant}', context.merchant);
  }
  
  return message;
}

/**
 * Check if we're in quiet hours
 */
export function isQuietHours(quietHours: { start: string; end: string }): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  
  const [startHour, startMin] = quietHours.start.split(':').map(Number);
  const [endHour, endMin] = quietHours.end.split(':').map(Number);
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;
  
  if (startTime <= endTime) {
    // Same day range (e.g., 09:00 - 17:00)
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    // Overnight range (e.g., 22:00 - 08:00)
    return currentTime >= startTime || currentTime <= endTime;
  }
}
