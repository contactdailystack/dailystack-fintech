/**
 * alertTypes.ts — Behavioral Alerts System Type Definitions
 * DailyStack FinTech — Behavioral Intelligence Module
 */

import { Transaction, Emotion } from '../../types';

// ─── Alert Severity & Priority ─────────────────────────────────────────────

export type AlertSeverity = 'info' | 'warning' | 'alert' | 'critical';
export type AlertPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed';
export type AlertCategory = 
  | 'impulse' 
  | 'budget' 
  | 'habit' 
  | 'savings' 
  | 'emotional' 
  | 'pattern' 
  | 'milestone' 
  | 'security';

// ─── Notification Channels ─────────────────────────────────────────────────

export type NotificationChannel = 'in_app' | 'push' | 'email' | 'sms';
export type NotificationTiming = 'immediate' | 'hourly_digest' | 'daily_digest';

// ─── Trigger Conditions ────────────────────────────────────────────────────

export interface ThresholdCondition {
  metric: AlertMetric;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
  value: number | [number, number];
  window?: 'daily' | 'weekly' | 'monthly';
}

export type AlertMetric = 
  | 'spending_total'
  | 'spending_category'
  | 'emotion_stress_count'
  | 'emotion_impulse_count'
  | 'risk_score_avg'
  | 'risk_score_max'
  | 'habit_score_avg'
  | 'habit_score_min'
  | 'streak_days'
  | 'savings_rate'
  | 'transaction_count'
  | 'late_night_count'
  | 'social_spending'
  | 'dopamine_hits'
  | 'goal_progress'
  | 'budget_variance';

// ─── Alert Configuration ───────────────────────────────────────────────────

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  category: AlertCategory;
  severity: AlertSeverity;
  priority: AlertPriority;
  
  // Trigger Configuration
  triggers: AlertTrigger[];
  conditions: ThresholdCondition[];
  conditionsLogic: 'AND' | 'OR'; // How conditions are combined
  
  // Notification Settings
  channels: NotificationChannel[];
  timing: NotificationTiming;
  quietHours?: { start: string; end: string }; // e.g., "22:00" - "08:00"
  
  // Cooldown & Limits
  cooldownMinutes: number; // Min time between repeat alerts
  maxPerDay: number; // Max alerts from this rule per day
  snoozeUntil?: string; // ISO date when snooze ends
  
  // Behavior
  enabled: boolean;
  autoResolve: boolean; // Auto-resolve when conditions no longer met
  showInFeed: boolean; // Show in activity feed
  
  // Thresholds
  thresholds: {
    warning?: number;
    alert?: number;
    critical?: number;
  };
  
  createdAt: string;
  updatedAt: string;
}

// ─── Alert Trigger Types ───────────────────────────────────────────────────

export type AlertTrigger = 
  | { type: 'transaction'; filter?: Partial<Transaction> }
  | { type: 'daily_summary' }
  | { type: 'weekly_summary' }
  | { type: 'streak_change'; direction: 'increase' | 'decrease' }
  | { type: 'budget_exceeded'; category?: string }
  | { type: 'emotion_spike'; emotion: Emotion; threshold: number }
  | { type: 'pattern_detected'; patternType: string }
  | { type: 'milestone_reached'; milestoneType: string }
  | { type: 'time_trigger'; time: string; days?: number[] }; // e.g., every Monday at 9am

// ─── Alert Instance ───────────────────────────────────────────────────────

export interface BehavioralAlert {
  id: string;
  ruleId: string;
  userId: string;
  
  // Alert Content
  title: string;
  message: string;
  category: AlertCategory;
  severity: AlertSeverity;
  priority: AlertPriority;
  
  // Context
  triggerData: Record<string, unknown>; // The data that triggered this alert
  transactions?: Transaction[]; // Related transactions
  metricValues?: Record<AlertMetric, number>; // Current metric values
  
  // State
  status: AlertStatus;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  dismissedAt?: string;
  
  // Delivery
  deliveredTo: NotificationChannel[];
  deliveryStatus: Record<NotificationChannel, 'pending' | 'sent' | 'failed'>;
  
  // Analytics
  viewed: boolean;
  viewCount: number;
  actionTaken?: string; // What action user took
}

// ─── User Alert Preferences ───────────────────────────────────────────────

export interface AlertPreferences {
  userId: string;
  
  // Global Settings
  alertsEnabled: boolean;
  quietMode: boolean;
  quietHours: { start: string; end: string };
  
  // Channel Preferences
  channels: Record<NotificationChannel, {
    enabled: boolean;
    frequency?: NotificationTiming;
  }>;
  
  // Category Preferences
  categories: Record<AlertCategory, {
    enabled: boolean;
    minSeverity: AlertSeverity;
    channels: NotificationChannel[];
  }>;
  
  // Smart Settings
  adaptiveThresholds: boolean; // Adjust based on user behavior patterns
  smartTiming: boolean; // Learn when user is most responsive
  
  updatedAt: string;
}

// ─── Alert Templates ──────────────────────────────────────────────────────

export interface AlertTemplate {
  id: string;
  name: string;
  category: AlertCategory;
  severity: AlertSeverity;
  titleTemplate: string;
  messageTemplate: string;
  suggestedThresholds: ThresholdCondition[];
}

// ─── Alert Statistics ─────────────────────────────────────────────────────

export interface AlertStats {
  totalAlerts: number;
  alertsByCategory: Record<AlertCategory, number>;
  alertsBySeverity: Record<AlertSeverity, number>;
  averageResponseTime: number; // Minutes to acknowledge
  resolutionRate: number; // % resolved vs dismissed
  topTriggers: { ruleId: string; count: number }[];
}

// ─── Supabase Row Types ───────────────────────────────────────────────────

export interface AlertRuleRow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  category: AlertCategory;
  severity: AlertSeverity;
  priority: AlertPriority;
  triggers: AlertTrigger[];
  conditions: ThresholdCondition[];
  conditions_logic: 'AND' | 'OR';
  channels: NotificationChannel[];
  timing: NotificationTiming;
  quiet_hours: { start: string; end: string } | null;
  cooldown_minutes: number;
  max_per_day: number;
  snooze_until: string | null;
  enabled: boolean;
  auto_resolve: boolean;
  show_in_feed: boolean;
  thresholds: { warning?: number; alert?: number; critical?: number };
  created_at: string;
  updated_at: string;
}

export interface BehavioralAlertRow {
  id: string;
  rule_id: string;
  user_id: string;
  title: string;
  message: string;
  category: AlertCategory;
  severity: AlertSeverity;
  priority: AlertPriority;
  trigger_data: Record<string, unknown>;
  transactions: Transaction[] | null;
  metric_values: Record<AlertMetric, number> | null;
  status: AlertStatus;
  created_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  dismissed_at: string | null;
  delivered_to: NotificationChannel[];
  delivery_status: Record<NotificationChannel, 'pending' | 'sent' | 'failed'>;
  viewed: boolean;
  view_count: number;
  action_taken: string | null;
}

export interface AlertPreferencesRow {
  user_id: string;
  alerts_enabled: boolean;
  quiet_mode: boolean;
  quiet_hours: { start: string; end: string };
  channels: Record<NotificationChannel, { enabled: boolean; frequency?: NotificationTiming }>;
  categories: Record<AlertCategory, { enabled: boolean; min_severity: AlertSeverity; channels: NotificationChannel[] }>;
  adaptive_thresholds: boolean;
  smart_timing: boolean;
  updated_at: string;
}

// ─── Alert Context for Components ────────────────────────────────────────

export interface AlertContext {
  alert: BehavioralAlert;
  rule: AlertRule;
  onAcknowledge: () => void;
  onResolve: () => void;
  onDismiss: () => void;
  onSnooze: (duration: number) => void; // Duration in minutes
}

// ─── Alert Feed Query Options ─────────────────────────────────────────────

export interface AlertFeedQuery {
  status?: AlertStatus | AlertStatus[];
  category?: AlertCategory | AlertCategory[];
  severity?: AlertSeverity | AlertSeverity[];
  dateRange?: { start: string; end: string };
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'severity' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

// ─── Export all types for convenience ───────────────────────────────────

export type {
  Transaction,
  Emotion
};
