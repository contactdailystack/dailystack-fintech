/**
 * alertEngine.ts — Behavioral Alert Evaluation Engine
 * DailyStack FinTech — Core Alert Logic
 */

import { 
  AlertRule, 
  BehavioralAlert, 
  ThresholdCondition, 
  AlertMetric,
  AlertCategory,
  AlertSeverity,
  AlertTrigger,
  Transaction
} from './alertTypes';
import { Transaction as TransactionType, Emotion } from '../../types';

// ─── Metric Calculator ───────────────────────────────────────────────────

interface MetricResult {
  value: number;
  breakdown?: Record<string, number>;
}

class MetricCalculator {
  private transactions: TransactionType[];
  private dateRange: { start: Date; end: Date };

  constructor(transactions: TransactionType[], days: number = 30) {
    this.transactions = transactions;
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
   * Count transactions by emotion type
   */
  calculateEmotionCount(emotion: Emotion): MetricResult {
    const filtered = this.getFilteredTransactions();
    const count = filtered.filter(tx => tx.emotion === emotion).length;
    return { value: count };
  }

  /**
   * Count stress-related transactions
   */
  calculateStressCount(): MetricResult {
    const stressEmotions: Emotion[] = ['Stress', 'Anxious', 'Stressed'];
    return this.calculateEmotionCountMultiple(stressEmotions);
  }

  /**
   * Count impulse-related transactions
   */
  calculateImpulseCount(): MetricResult {
    const impulseEmotions: Emotion[] = ['Impulse'];
    return this.calculateEmotionCountMultiple(impulseEmotions);
  }

  private calculateEmotionCountMultiple(emotions: Emotion[]): MetricResult {
    const filtered = this.getFilteredTransactions();
    const count = filtered.filter(tx => emotions.includes(tx.emotion as Emotion)).length;
    return { value: count };
  }

  /**
   * Calculate average risk score
   */
  calculateAverageRiskScore(): MetricResult {
    const filtered = this.getFilteredTransactions();
    const withRisk = filtered.filter(tx => tx.riskScore !== undefined);
    if (withRisk.length === 0) return { value: 0 };
    
    const avg = withRisk.reduce((sum, tx) => sum + (tx.riskScore || 0), 0) / withRisk.length;
    return { value: Math.round(avg) };
  }

  /**
   * Calculate max risk score
   */
  calculateMaxRiskScore(): MetricResult {
    const filtered = this.getFilteredTransactions();
    const withRisk = filtered.filter(tx => tx.riskScore !== undefined);
    if (withRisk.length === 0) return { value: 0 };
    
    const max = Math.max(...withRisk.map(tx => tx.riskScore || 0));
    return { value: max };
  }

  /**
   * Calculate average habit score
   */
  calculateAverageHabitScore(): MetricResult {
    const filtered = this.getFilteredTransactions();
    const withHabit = filtered.filter(tx => tx.habitScore !== undefined);
    if (withHabit.length === 0) return { value: 100 };
    
    const avg = withHabit.reduce((sum, tx) => sum + (tx.habitScore || 0), 0) / withHabit.length;
    return { value: Math.round(avg) };
  }

  /**
   * Calculate min habit score
   */
  calculateMinHabitScore(): MetricResult {
    const filtered = this.getFilteredTransactions();
    const withHabit = filtered.filter(tx => tx.habitScore !== undefined);
    if (withHabit.length === 0) return { value: 100 };
    
    const min = Math.min(...withHabit.map(tx => tx.habitScore || 0));
    return { value: min };
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
   * Calculate social spending
   */
  calculateSocialSpending(): MetricResult {
    const filtered = this.getFilteredTransactions();
    const socialTxs = filtered.filter(tx => 
      tx.behavioralCategory === 'Social' || 
      tx.intent === 'Relationship'
    );
    const total = Math.abs(
      socialTxs.reduce((sum, tx) => sum + tx.amount, 0)
    );
    return { value: total };
  }

  /**
   * Count "dopamine hits" - impulsive purchases that provide immediate satisfaction
   */
  calculateDopamineHits(): MetricResult {
    const filtered = this.getFilteredTransactions();
    const hits = filtered.filter(tx => 
      (tx.behavioralCategory === 'Impulse' || tx.behavioralCategory === 'Emotional') &&
      tx.emotion === 'Impulse'
    ).length;
    return { value: hits };
  }

  /**
   * Count transactions
   */
  calculateTransactionCount(): MetricResult {
    return { value: this.getFilteredTransactions().length };
  }

  /**
   * Calculate metric by name
   */
  calculate(metric: AlertMetric): MetricResult {
    switch (metric) {
      case 'spending_total':
        return this.calculateSpendingTotal();
      case 'emotion_stress_count':
        return this.calculateStressCount();
      case 'emotion_impulse_count':
        return this.calculateImpulseCount();
      case 'risk_score_avg':
        return this.calculateAverageRiskScore();
      case 'risk_score_max':
        return this.calculateMaxRiskScore();
      case 'habit_score_avg':
        return this.calculateAverageHabitScore();
      case 'habit_score_min':
        return this.calculateMinHabitScore();
      case 'late_night_count':
        return this.calculateLateNightCount();
      case 'social_spending':
        return this.calculateSocialSpending();
      case 'dopamine_hits':
        return this.calculateDopamineHits();
      case 'transaction_count':
        return this.calculateTransactionCount();
      case 'spending_category':
        return this.calculateSpendingTotal(); // Will be overridden per-category
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
  fbisMeta?: {
    streakDays: number;
    currentScore: number;
  };
  budgetStatus?: {
    category: string;
    spent: number;
    budget: number;
  }[];
}

export class AlertGenerator {
  private calculator: MetricCalculator;

  constructor(private transactions: TransactionType[], days: number = 30) {
    this.calculator = new MetricCalculator(transactions, days);
  }

  /**
   * Calculate all current metrics
   */
  calculateMetrics(): Record<AlertMetric, number> {
    return {
      spending_total: this.calculator.calculateSpendingTotal().value,
      spending_category: 0, // Calculated per category if needed
      emotion_stress_count: this.calculator.calculateStressCount().value,
      emotion_impulse_count: this.calculator.calculateImpulseCount().value,
      risk_score_avg: this.calculator.calculateAverageRiskScore().value,
      risk_score_max: this.calculator.calculateMaxRiskScore().value,
      habit_score_avg: this.calculator.calculateAverageHabitScore().value,
      habit_score_min: this.calculator.calculateMinHabitScore().value,
      late_night_count: this.calculator.calculateLateNightCount().value,
      social_spending: this.calculator.calculateSocialSpending().value,
      dopamine_hits: this.calculator.calculateDopamineHits().value,
      transaction_count: this.calculator.calculateTransactionCount().value,
      savings_rate: 0, // Calculated separately
      streak_days: 0, // From FBIS
      goal_progress: 0, // From goals service
      budget_variance: 0, // Calculated from budgets
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
    
    // Generate dynamic content based on rule type
    switch (rule.category) {
      case 'impulse':
        return this.generateImpulseAlert(rule, metrics);
      case 'budget':
        return this.generateBudgetAlert(rule, metrics);
      case 'emotional':
        return this.generateEmotionalAlert(rule, metrics);
      case 'habit':
        return this.generateHabitAlert(rule, metrics);
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

  private generateImpulseAlert(
    rule: AlertRule,
    metrics: Record<AlertMetric, number>
  ): { title: string; message: string } {
    const impulseCount = metrics.emotion_impulse_count;
    const dopamineHits = metrics.dopamine_hits;
    const spending = metrics.spending_total;

    return {
      title: 'Impulse Spending Detected',
      message: `You've made ${impulseCount} impulse-driven transactions this period with ${dopamineHits} dopamine hits totaling ฿${spending.toLocaleString()}. Consider pausing before your next purchase to evaluate if it aligns with your goals.`
    };
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

  private generateEmotionalAlert(
    rule: AlertRule,
    metrics: Record<AlertMetric, number>
  ): { title: string; message: string } {
    const stressCount = metrics.emotion_stress_count;
    const habitScore = metrics.habit_score_avg;

    return {
      title: 'Emotional Spending Pattern',
      message: `${stressCount} stress-related transactions detected this period. Your average habit score is ${habitScore}/100. Stress-triggered spending often leads to buyer's remorse. Try a 10-minute pause or alternative stress relief.`
    };
  }

  private generateHabitAlert(
    rule: AlertRule,
    metrics: Record<AlertMetric, number>
  ): { title: string; message: string } {
    const habitScore = metrics.habit_score_min;
    const avgScore = metrics.habit_score_avg;

    return {
      title: 'Habit Consistency Alert',
      message: `Your lowest habit score this period is ${habitScore}/100 (avg: ${avgScore}/100). Some transactions deviated from your typical healthy patterns. Small improvements compound over time.`
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
    name: 'Impulse Spending Spike',
    description: 'Triggers when multiple impulse-driven transactions are detected',
    category: 'impulse',
    severity: 'warning',
    priority: 'high',
    triggers: [{ type: 'transaction', filter: { emotion: 'Impulse' } }],
    conditions: [
      { metric: 'emotion_impulse_count', operator: 'gte', value: 3, window: 'weekly' }
    ],
    conditionsLogic: 'AND',
    channels: ['in_app', 'push'],
    timing: 'immediate',
    cooldownMinutes: 1440, // Once per day
    maxPerDay: 2,
    enabled: true,
    autoResolve: true,
    showInFeed: true,
    thresholds: { warning: 3, alert: 5, critical: 7 }
  },
  {
    name: 'Dopamine Hit Accumulation',
    description: 'Warns when multiple quick-satisfaction purchases stack up',
    category: 'impulse',
    severity: 'info',
    priority: 'medium',
    triggers: [{ type: 'transaction' }],
    conditions: [
      { metric: 'dopamine_hits', operator: 'gte', value: 4, window: 'weekly' }
    ],
    conditionsLogic: 'AND',
    channels: ['in_app'],
    timing: 'daily_digest',
    cooldownMinutes: 1440,
    maxPerDay: 1,
    enabled: true,
    autoResolve: true,
    showInFeed: true,
    thresholds: { warning: 4, alert: 6, critical: 8 }
  },
  {
    name: 'Stress Spending Warning',
    description: 'Detects emotional spending triggered by stress',
    category: 'emotional',
    severity: 'alert',
    priority: 'high',
    triggers: [{ type: 'emotion_spike', emotion: 'Stress', threshold: 2 }],
    conditions: [
      { metric: 'emotion_stress_count', operator: 'gte', value: 2, window: 'weekly' }
    ],
    conditionsLogic: 'AND',
    channels: ['in_app', 'push'],
    timing: 'immediate',
    cooldownMinutes: 720,
    maxPerDay: 2,
    enabled: true,
    autoResolve: true,
    showInFeed: true,
    thresholds: { warning: 2, alert: 4, critical: 6 }
  },
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
    name: 'High Risk Transaction',
    description: 'Alerts when a transaction has unusually high risk score',
    category: 'pattern',
    severity: 'alert',
    priority: 'high',
    triggers: [{ type: 'transaction' }],
    conditions: [
      { metric: 'risk_score_max', operator: 'gte', value: 80 }
    ],
    conditionsLogic: 'AND',
    channels: ['in_app', 'push'],
    timing: 'immediate',
    cooldownMinutes: 60,
    maxPerDay: 5,
    enabled: true,
    autoResolve: true,
    showInFeed: true,
    thresholds: { warning: 70, alert: 80, critical: 90 }
  },
  {
    name: 'Habit Score Decline',
    description: 'Detects when average habit score drops significantly',
    category: 'habit',
    severity: 'warning',
    priority: 'medium',
    triggers: [{ type: 'transaction' }],
    conditions: [
      { metric: 'habit_score_avg', operator: 'lt', value: 70 }
    ],
    conditionsLogic: 'AND',
    channels: ['in_app'],
    timing: 'daily_digest',
    cooldownMinutes: 1440,
    maxPerDay: 1,
    enabled: true,
    autoResolve: true,
    showInFeed: true,
    thresholds: { warning: 70, alert: 50, critical: 30 }
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
    info: 1
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
    emotion?: string;
    riskScore?: number;
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
  if (context.emotion) {
    message = message.replace('{emotion}', context.emotion);
  }
  if (context.riskScore !== undefined) {
    message = message.replace('{riskScore}', context.riskScore.toString());
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
