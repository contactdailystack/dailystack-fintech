/**
 * alertService.ts — Behavioral Alerts Supabase Integration
 * DailyStack FinTech — Database Operations
 */

import { supabase } from '../../supabaseClient';
import {
  AlertRule,
  AlertRuleRow,
  BehavioralAlert,
  BehavioralAlertRow,
  AlertPreferences,
  AlertPreferencesRow,
  AlertFeedQuery,
  AlertStats,
  AlertCategory,
  AlertSeverity,
  AlertStatus,
  NotificationChannel,
} from './alertTypes';
import { DEFAULT_ALERT_RULES } from './alertEngine';
import { generateAlertId, severityToScore } from './alertEngine';

// ─── Alert Rules Operations ───────────────────────────────────────────────

/**
 * Fetch all alert rules for a user
 */
export async function getAlertRules(userId: string): Promise<AlertRule[]> {
  try {
    const { data, error } = await supabase
      .from('alert_rules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    return (data || []).map(rowToAlertRule);
  } catch {
    return [];
  }
}

/**
 * Get a single alert rule by ID
 */
export async function getAlertRule(ruleId: string): Promise<AlertRule | null> {
  try {
    const { data, error } = await supabase
      .from('alert_rules')
      .select('*')
      .eq('id', ruleId)
      .maybeSingle();

    if (error) throw error;
    
    return data ? rowToAlertRule(data) : null;
  } catch {
    return null;
  }
}

/**
 * Initialize default alert rules for a new user
 */
export async function initializeDefaultRules(userId: string): Promise<void> {
  try {
    const rulesToInsert = DEFAULT_ALERT_RULES.map((rule, index) => ({
      user_id: userId,
      name: rule.name,
      description: rule.description,
      category: rule.category,
      severity: rule.severity,
      priority: rule.priority,
      triggers: rule.triggers,
      conditions: rule.conditions,
      conditions_logic: rule.conditionsLogic,
      channels: rule.channels,
      timing: rule.timing,
      quiet_hours: rule.quietHours || null,
      cooldown_minutes: rule.cooldownMinutes,
      max_per_day: rule.maxPerDay,
      snooze_until: null,
      enabled: rule.enabled,
      auto_resolve: rule.autoResolve,
      show_in_feed: rule.showInFeed,
      thresholds: rule.thresholds,
    }));

    const { error } = await supabase
      .from('alert_rules')
      .insert(rulesToInsert);

    if (error) throw error;
  } catch (err) {
    console.error('Failed to initialize default alert rules:', err);
  }
}

/**
 * Create or update an alert rule
 */
export async function saveAlertRule(rule: Partial<AlertRule> & { id?: string }): Promise<AlertRule | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const row: Partial<AlertRuleRow> = {
      user_id: user.id,
      name: rule.name,
      description: rule.description,
      category: rule.category,
      severity: rule.severity,
      priority: rule.priority,
      triggers: rule.triggers,
      conditions: rule.conditions,
      conditions_logic: rule.conditionsLogic,
      channels: rule.channels,
      timing: rule.timing,
      quiet_hours: rule.quietHours || null,
      cooldown_minutes: rule.cooldownMinutes,
      max_per_day: rule.maxPerDay,
      snooze_until: rule.snoozeUntil || null,
      enabled: rule.enabled,
      auto_resolve: rule.autoResolve,
      show_in_feed: rule.showInFeed,
      thresholds: rule.thresholds,
    };

    if (rule.id) {
      // Update existing
      const { data, error } = await supabase
        .from('alert_rules')
        .update({ ...row, updated_at: new Date().toISOString() })
        .eq('id', rule.id)
        .select()
        .single();

      if (error) throw error;
      return data ? rowToAlertRule(data) : null;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('alert_rules')
        .insert(row)
        .select()
        .single();

      if (error) throw error;
      return data ? rowToAlertRule(data) : null;
    }
  } catch {
    return null;
  }
}

/**
 * Toggle alert rule enabled/disabled
 */
export async function toggleAlertRule(ruleId: string, enabled: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('alert_rules')
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq('id', ruleId);

    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete an alert rule
 */
export async function deleteAlertRule(ruleId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('alert_rules')
      .delete()
      .eq('id', ruleId);

    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

// ─── Behavioral Alerts Operations ────────────────────────────────────────

/**
 * Create a new behavioral alert
 */
export async function createAlert(
  alertData: Omit<BehavioralAlert, 'id' | 'createdAt' | 'viewed' | 'viewCount'>
): Promise<BehavioralAlert | null> {
  try {
    const row: Partial<BehavioralAlertRow> = {
      rule_id: alertData.ruleId,
      user_id: alertData.userId,
      title: alertData.title,
      message: alertData.message,
      category: alertData.category,
      severity: alertData.severity,
      priority: alertData.priority,
      trigger_data: alertData.triggerData,
      transactions: alertData.transactions || null,
      metric_values: alertData.metricValues || null,
      status: alertData.status,
      acknowledged_at: alertData.acknowledgedAt || null,
      resolved_at: alertData.resolvedAt || null,
      dismissed_at: alertData.dismissedAt || null,
      delivered_to: alertData.deliveredTo,
      delivery_status: alertData.deliveryStatus,
      viewed: false,
      view_count: 0,
      action_taken: alertData.actionTaken || null,
    };

    const { data, error } = await supabase
      .from('behavioral_alerts')
      .insert(row)
      .select()
      .single();

    if (error) throw error;
    return data ? rowToBehavioralAlert(data) : null;
  } catch {
    return null;
  }
}

/**
 * Fetch alerts with query options
 */
export async function getAlerts(
  userId: string,
  query: AlertFeedQuery = {}
): Promise<BehavioralAlert[]> {
  try {
    let dbQuery = supabase
      .from('behavioral_alerts')
      .select('*')
      .eq('user_id', userId);

    // Apply filters
    if (query.status) {
      const statuses = Array.isArray(query.status) ? query.status : [query.status];
      dbQuery = dbQuery.in('status', statuses);
    }
    if (query.category) {
      const categories = Array.isArray(query.category) ? query.category : [query.category];
      dbQuery = dbQuery.in('category', categories);
    }
    if (query.severity) {
      const severities = Array.isArray(query.severity) ? query.severity : [query.severity];
      dbQuery = dbQuery.in('severity', severities);
    }
    if (query.dateRange) {
      dbQuery = dbQuery
        .gte('created_at', query.dateRange.start)
        .lte('created_at', query.dateRange.end);
    }

    // Apply sorting
    const sortBy = query.sortBy || 'created_at';
    const sortOrder = query.sortOrder || 'desc';
    dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    if (query.limit) {
      dbQuery = dbQuery.limit(query.limit);
    }
    if (query.offset) {
      dbQuery = dbQuery.range(query.offset, query.offset + (query.limit || 20) - 1);
    }

    const { data, error } = await dbQuery;

    if (error) throw error;
    return (data || []).map(rowToBehavioralAlert);
  } catch {
    return [];
  }
}

/**
 * Get unread alert count
 */
export async function getUnreadAlertCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('behavioral_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active')
      .eq('viewed', false);

    if (error) throw error;
    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Mark alert as viewed
 */
export async function markAlertViewed(alertId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('increment_alert_view_count', { alert_id: alertId });
    if (error) throw error;
    return true;
  } catch {
    // Fallback: simple update
    try {
      const { error } = await supabase
        .from('behavioral_alerts')
        .update({ 
          viewed: true,
          view_count: supabase.rpc('increment', { x: 1 })
        })
        .eq('id', alertId);
      if (error) throw error;
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(alertId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('behavioral_alerts')
      .update({
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve an alert
 */
export async function resolveAlert(alertId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('behavioral_alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

/**
 * Dismiss an alert
 */
export async function dismissAlert(alertId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('behavioral_alerts')
      .update({
        status: 'dismissed',
        dismissed_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

/**
 * Snooze an alert
 */
export async function snoozeAlert(alertId: string, durationMinutes: number): Promise<boolean> {
  try {
    const snoozeUntil = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
    const { error } = await supabase
      .from('behavioral_alerts')
      .update({
        status: 'dismissed',
        dismissed_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (error) throw error;

    // Also update the rule's snooze until
    const alert = await getAlert(alertId);
    if (alert) {
      await supabase
        .from('alert_rules')
        .update({ snooze_until: snoozeUntil })
        .eq('id', alert.ruleId);
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Get a single alert
 */
export async function getAlert(alertId: string): Promise<BehavioralAlert | null> {
  try {
    const { data, error } = await supabase
      .from('behavioral_alerts')
      .select('*')
      .eq('id', alertId)
      .maybeSingle();

    if (error) throw error;
    return data ? rowToBehavioralAlert(data) : null;
  } catch {
    return null;
  }
}

// ─── Alert Preferences Operations ────────────────────────────────────────

/**
 * Get user alert preferences
 */
export async function getAlertPreferences(userId: string): Promise<AlertPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('alert_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data ? rowToAlertPreferences(data) : null;
  } catch {
    return null;
  }
}

/**
 * Initialize default alert preferences
 */
export async function initializeAlertPreferences(userId: string): Promise<AlertPreferences> {
  const defaults: AlertPreferences = {
    userId,
    alertsEnabled: true,
    quietMode: false,
    quietHours: { start: '22:00', end: '08:00' },
    channels: {
      in_app: { enabled: true, frequency: 'immediate' },
      push: { enabled: true, frequency: 'immediate' },
      email: { enabled: true, frequency: 'daily_digest' },
      sms: { enabled: false, frequency: 'immediate' },
    },
    categories: {
      impulse: { enabled: true, minSeverity: 'warning', channels: ['in_app', 'push'] },
      budget: { enabled: true, minSeverity: 'alert', channels: ['in_app', 'push', 'email'] },
      habit: { enabled: true, minSeverity: 'warning', channels: ['in_app'] },
      savings: { enabled: true, minSeverity: 'alert', channels: ['in_app', 'email'] },
      emotional: { enabled: true, minSeverity: 'alert', channels: ['in_app', 'push'] },
      pattern: { enabled: true, minSeverity: 'warning', channels: ['in_app'] },
      milestone: { enabled: true, minSeverity: 'info', channels: ['in_app', 'push'] },
      security: { enabled: true, minSeverity: 'critical', channels: ['in_app', 'push', 'email', 'sms'] },
    },
    adaptiveThresholds: true,
    smartTiming: true,
    updatedAt: new Date().toISOString(),
  };

  try {
    await supabase.from('alert_preferences').upsert({
      user_id: defaults.userId,
      alerts_enabled: defaults.alertsEnabled,
      quiet_mode: defaults.quietMode,
      quiet_hours: defaults.quietHours,
      channels: defaults.channels,
      categories: defaults.categories,
      adaptive_thresholds: defaults.adaptiveThresholds,
      smart_timing: defaults.smartTiming,
    }, { onConflict: 'user_id' });
  } catch {
    // Ignore errors during initialization
  }

  return defaults;
}

/**
 * Update alert preferences
 */
export async function updateAlertPreferences(
  preferences: Partial<AlertPreferences>
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const updateData: Partial<AlertPreferencesRow> = {};
    
    if (preferences.alertsEnabled !== undefined) {
      updateData.alerts_enabled = preferences.alertsEnabled;
    }
    if (preferences.quietMode !== undefined) {
      updateData.quiet_mode = preferences.quietMode;
    }
    if (preferences.quietHours !== undefined) {
      updateData.quiet_hours = preferences.quietHours;
    }
    if (preferences.channels !== undefined) {
      updateData.channels = preferences.channels;
    }
    if (preferences.categories !== undefined) {
      // Transform camelCase to snake_case for Supabase
      const transformed: Record<string, { enabled: boolean; min_severity: AlertSeverity; channels: NotificationChannel[] }> = {};
      for (const [key, value] of Object.entries(preferences.categories)) {
        transformed[key] = {
          enabled: value.enabled,
          min_severity: value.minSeverity,
          channels: value.channels,
        };
      }
      updateData.categories = transformed as unknown as AlertPreferencesRow['categories'];
    }
    if (preferences.adaptiveThresholds !== undefined) {
      updateData.adaptive_thresholds = preferences.adaptiveThresholds;
    }
    if (preferences.smartTiming !== undefined) {
      updateData.smart_timing = preferences.smartTiming;
    }

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('alert_preferences')
      .update(updateData)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

// ─── Alert Statistics ─────────────────────────────────────────────────────

/**
 * Get alert statistics for a user
 */
export async function getAlertStats(userId: string, days: number = 30): Promise<AlertStats> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const alerts = await getAlerts(userId, {
      dateRange: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
      },
      limit: 1000,
    });

    const stats: AlertStats = {
      totalAlerts: alerts.length,
      alertsByCategory: {
        impulse: 0,
        budget: 0,
        habit: 0,
        savings: 0,
        emotional: 0,
        pattern: 0,
        milestone: 0,
        security: 0,
      },
      alertsBySeverity: {
        info: 0,
        warning: 0,
        alert: 0,
        critical: 0,
      },
      averageResponseTime: 0,
      resolutionRate: 0,
      topTriggers: [],
    };

    // Count by category
    alerts.forEach(alert => {
      stats.alertsByCategory[alert.category]++;
      stats.alertsBySeverity[alert.severity]++;
    });

    // Calculate response time
    const acknowledgedAlerts = alerts.filter(a => a.acknowledgedAt);
    if (acknowledgedAlerts.length > 0) {
      const totalResponseTime = acknowledgedAlerts.reduce((sum, alert) => {
        const created = new Date(alert.createdAt).getTime();
        const acknowledged = new Date(alert.acknowledgedAt!).getTime();
        return sum + (acknowledged - created) / (1000 * 60); // Minutes
      }, 0);
      stats.averageResponseTime = Math.round(totalResponseTime / acknowledgedAlerts.length);
    }

    // Calculate resolution rate
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved');
    const dismissedAlerts = alerts.filter(a => a.status === 'dismissed');
    if (alerts.length > 0) {
      stats.resolutionRate = Math.round((resolvedAlerts.length / alerts.length) * 100);
    }

    // Top triggers
    const triggerCounts: Record<string, number> = {};
    alerts.forEach(alert => {
      triggerCounts[alert.ruleId] = (triggerCounts[alert.ruleId] || 0) + 1;
    });
    stats.topTriggers = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ruleId, count]) => ({ ruleId, count }));

    return stats;
  } catch {
    return {
      totalAlerts: 0,
      alertsByCategory: {
        impulse: 0, budget: 0, habit: 0, savings: 0,
        emotional: 0, pattern: 0, milestone: 0, security: 0,
      },
      alertsBySeverity: {
        info: 0, warning: 0, alert: 0, critical: 0,
      },
      averageResponseTime: 0,
      resolutionRate: 0,
      topTriggers: [],
    };
  }
}

// ─── Type Converters ───────────────────────────────────────────────────────

function rowToAlertRule(row: AlertRuleRow): AlertRule {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    severity: row.severity,
    priority: row.priority,
    triggers: row.triggers,
    conditions: row.conditions,
    conditionsLogic: row.conditions_logic,
    channels: row.channels,
    timing: row.timing,
    quietHours: row.quiet_hours || undefined,
    cooldownMinutes: row.cooldown_minutes,
    maxPerDay: row.max_per_day,
    snoozeUntil: row.snooze_until || undefined,
    enabled: row.enabled,
    autoResolve: row.auto_resolve,
    showInFeed: row.show_in_feed,
    thresholds: row.thresholds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToBehavioralAlert(row: BehavioralAlertRow): BehavioralAlert {
  return {
    id: row.id,
    ruleId: row.rule_id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    category: row.category,
    severity: row.severity,
    priority: row.priority,
    triggerData: row.trigger_data,
    transactions: row.transactions || undefined,
    metricValues: row.metric_values || undefined,
    status: row.status,
    createdAt: row.created_at,
    acknowledgedAt: row.acknowledged_at || undefined,
    resolvedAt: row.resolved_at || undefined,
    dismissedAt: row.dismissed_at || undefined,
    deliveredTo: row.delivered_to,
    deliveryStatus: row.delivery_status,
    viewed: row.viewed,
    viewCount: row.view_count,
    actionTaken: row.action_taken || undefined,
  };
}

function rowToAlertPreferences(row: AlertPreferencesRow): AlertPreferences {
  // Transform snake_case from Supabase to camelCase
  const categories: Record<string, { enabled: boolean; minSeverity: AlertSeverity; channels: NotificationChannel[] }> = {};
  for (const [key, value] of Object.entries(row.categories)) {
    categories[key] = {
      enabled: value.enabled,
      minSeverity: value.min_severity,
      channels: value.channels,
    };
  }

  return {
    userId: row.user_id,
    alertsEnabled: row.alerts_enabled,
    quietMode: row.quiet_mode,
    quietHours: row.quiet_hours,
    channels: row.channels,
    categories: categories as AlertPreferences['categories'],
    adaptiveThresholds: row.adaptive_thresholds,
    smartTiming: row.smart_timing,
    updatedAt: row.updated_at,
  };
}

// ─── Supabase RPC Functions ───────────────────────────────────────────────

/**
 * Check if alert should be rate-limited (for a rule on a given day)
 */
export async function checkAlertRateLimit(ruleId: string): Promise<{ allowed: boolean; count: number }> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { count, error } = await supabase
      .from('behavioral_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('rule_id', ruleId)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString());

    if (error) throw error;

    return { allowed: true, count: count || 0 };
  } catch {
    return { allowed: true, count: 0 };
  }
}

/**
 * Clean up old resolved/dismissed alerts (retention policy)
 */
export async function cleanupOldAlerts(userId: string, retentionDays: number = 90): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  try {
    await supabase
      .from('behavioral_alerts')
      .delete()
      .eq('user_id', userId)
      .eq('status', 'resolved')
      .lt('created_at', cutoffDate.toISOString());
  } catch {
    // Ignore cleanup errors
  }
}
