/**
 * AlertsContext.tsx — React Context for Behavioral Alerts
 * DailyStack FinTech — State Management
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Transaction } from '../../types';
import {
  AlertRule,
  BehavioralAlert,
  AlertPreferences,
  AlertFeedQuery,
  AlertStats,
} from './alertTypes';
import {
  getAlertRules,
  getAlerts,
  getUnreadAlertCount,
  getAlertPreferences,
  acknowledgeAlert,
  resolveAlert,
  dismissAlert,
  toggleAlertRule,
  initializeDefaultRules,
  initializeAlertPreferences,
  getAlertStats,
} from './alertService';
import { AlertGenerator } from './alertEngine';
import { notifyAlert } from './alertNotifications';

// ─── Context Types ────────────────────────────────────────────────────────

interface AlertsContextValue {
  // State
  alerts: BehavioralAlert[];
  rules: AlertRule[];
  preferences: AlertPreferences | null;
  stats: AlertStats | null;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Alert Actions
  acknowledge: (alertId: string) => Promise<void>;
  resolve: (alertId: string) => Promise<void>;
  dismiss: (alertId: string) => Promise<void>;
  refreshAlerts: () => Promise<void>;
  
  // Rule Actions
  toggleRule: (ruleId: string, enabled: boolean) => Promise<void>;
  
  // Evaluation
  evaluateAlerts: (transactions: Transaction[]) => Promise<void>;
  
  // Preferences
  updatePreferences: (prefs: Partial<AlertPreferences>) => Promise<void>;
  
  // Query
  queryAlerts: (query: AlertFeedQuery) => Promise<void>;
}

const AlertsContext = createContext<AlertsContextValue | null>(null);

// ─── Provider Component ────────────────────────────────────────────────────

interface AlertsProviderProps {
  children: React.ReactNode;
}

export function AlertsProvider({ children }: AlertsProviderProps) {
  const [alerts, setAlerts] = useState<BehavioralAlert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [preferences, setPreferences] = useState<AlertPreferences | null>(null);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await import('../../supabaseClient').then(m => m.supabase.auth.getUser());
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Initialize default rules and preferences if needed
      await Promise.all([
        initializeDefaultRules(user.id),
        initializeAlertPreferences(user.id),
      ]);

      // Load data in parallel
      const [loadedRules, loadedPreferences, loadedUnreadCount] = await Promise.all([
        getAlertRules(user.id),
        getAlertPreferences(user.id),
        getUnreadAlertCount(user.id),
      ]);

      setRules(loadedRules);
      setPreferences(loadedPreferences);
      setUnreadCount(loadedUnreadCount);

      // Load recent alerts
      const loadedAlerts = await getAlerts(user.id, { limit: 50 });
      setAlerts(loadedAlerts);

      // Load stats
      const loadedStats = await getAlertStats(user.id);
      setStats(loadedStats);

    } catch (err) {
      console.error('Failed to initialize alerts:', err);
      setError('Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  };

  // Alert Actions
  const acknowledge = useCallback(async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      setAlerts(prev => 
        prev.map(a => 
          a.id === alertId 
            ? { ...a, status: 'acknowledged', acknowledgedAt: new Date().toISOString() }
            : a
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  }, []);

  const resolve = useCallback(async (alertId: string) => {
    try {
      await resolveAlert(alertId);
      setAlerts(prev => 
        prev.map(a => 
          a.id === alertId 
            ? { ...a, status: 'resolved', resolvedAt: new Date().toISOString() }
            : a
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  }, []);

  const dismiss = useCallback(async (alertId: string) => {
    try {
      await dismissAlert(alertId);
      setAlerts(prev => 
        prev.map(a => 
          a.id === alertId 
            ? { ...a, status: 'dismissed', dismissedAt: new Date().toISOString() }
            : a
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  }, []);

  const refreshAlerts = useCallback(async () => {
    try {
      const { data: { user } } = await import('../../supabaseClient').then(m => m.supabase.auth.getUser());
      if (!user) return;

      const [loadedAlerts, loadedUnreadCount] = await Promise.all([
        getAlerts(user.id, { limit: 50 }),
        getUnreadAlertCount(user.id),
      ]);

      setAlerts(loadedAlerts);
      setUnreadCount(loadedUnreadCount);
    } catch (err) {
      console.error('Failed to refresh alerts:', err);
    }
  }, []);

  // Rule Actions
  const toggleRule = useCallback(async (ruleId: string, enabled: boolean) => {
    try {
      await toggleAlertRule(ruleId, enabled);
      setRules(prev => 
        prev.map(r => 
          r.id === ruleId ? { ...r, enabled } : r
        )
      );
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  }, []);

  // Evaluate transactions and create alerts
  const evaluateAlerts = useCallback(async (transactions: Transaction[]) => {
    if (!preferences || !transactions.length) return;

    const { data: { user } } = await import('../../supabaseClient').then(m => m.supabase.auth.getUser());
    if (!user) return;

    // Use alert generator to evaluate rules
    const generator = new AlertGenerator(transactions);
    const currentMetrics = generator.calculateMetrics();

    // Evaluate each enabled rule
    for (const rule of rules) {
      if (!rule.enabled) continue;

      const result = generator.evaluateRule(rule, {
        userId: user.id,
        transactions,
        currentMetrics,
      });

      if (result.triggered) {
        const { title, message } = generator.generateAlertContent(
          rule,
          { userId: user.id, transactions, currentMetrics },
          result.severity
        );

        // Create alert
        const { createAlert } = await import('./alertService');
        const newAlert = await createAlert({
          ruleId: rule.id,
          userId: user.id,
          title,
          message,
          category: rule.category,
          severity: result.severity,
          priority: rule.priority,
          triggerData: { ruleName: rule.name },
          transactions: transactions.slice(0, 5), // Include related transactions
          metricValues: result.metricValues,
          status: 'active',
          deliveredTo: rule.channels,
          deliveryStatus: {
            email: 'pending',
            push: 'pending',
            in_app: 'pending',
            sms: 'pending',
          },
        });

        if (newAlert) {
          setAlerts(prev => [newAlert, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Send notifications
          notifyAlert(newAlert, preferences);
        }
      }
    }
  }, [preferences, rules]);

  // Query alerts
  const queryAlerts = useCallback(async (query: AlertFeedQuery) => {
    try {
      const { data: { user } } = await import('../../supabaseClient').then(m => m.supabase.auth.getUser());
      if (!user) return;

      const results = await getAlerts(user.id, query);
      setAlerts(results);
    } catch (err) {
      console.error('Failed to query alerts:', err);
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback(async (prefs: Partial<AlertPreferences>) => {
    const { updateAlertPreferences } = await import('./alertService');
    const success = await updateAlertPreferences(prefs);
    
    if (success && preferences) {
      setPreferences({ ...preferences, ...prefs });
    }
  }, [preferences]);

  const value = useMemo(() => ({
    alerts,
    rules,
    preferences,
    stats,
    unreadCount,
    isLoading,
    error,
    acknowledge,
    resolve,
    dismiss,
    refreshAlerts,
    toggleRule,
    evaluateAlerts,
    updatePreferences,
    queryAlerts,
  }), [
    alerts, rules, preferences, stats, unreadCount, isLoading, error,
    acknowledge, resolve, dismiss, refreshAlerts, toggleRule, 
    evaluateAlerts, updatePreferences, queryAlerts,
  ]);

  return (
    <AlertsContext.Provider value={value}>
      {children}
    </AlertsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useAlerts() {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
}

// ─── Filtered Alerts Hooks ────────────────────────────────────────────────

export function useActiveAlerts() {
  const { alerts } = useAlerts();
  return useMemo(() => 
    alerts.filter(a => a.status === 'active' || a.status === 'acknowledged'),
    [alerts]
  );
}

export function useAlertsByCategory(category: string) {
  const { alerts } = useAlerts();
  return useMemo(() => 
    alerts.filter(a => a.category === category),
    [alerts, category]
  );
}

export function useAlertsBySeverity(severity: string) {
  const { alerts } = useAlerts();
  return useMemo(() => 
    alerts.filter(a => a.severity === severity),
    [alerts, severity]
  );
}
