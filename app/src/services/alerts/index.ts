/**
 * alerts/index.ts — Behavioral Alerts Module Exports
 * DailyStack FinTech — Public API
 */

// Types
export * from './alertTypes';

// Core Engine
export { AlertGenerator, ConditionEvaluator, DEFAULT_ALERT_RULES, generateAlertId, severityToScore, formatAlertMessage, isQuietHours } from './alertEngine';

// Services
export * from './alertService';
export { alertNotificationService, notifyAlert, notifyDigest } from './alertNotifications';

// React Context
export { AlertsProvider, useAlerts, useActiveAlerts, useAlertsByCategory, useAlertsBySeverity } from './AlertsContext';

// Components
export { AlertComponents } from './AlertComponents';
