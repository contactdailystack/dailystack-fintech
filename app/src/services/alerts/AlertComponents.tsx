/**
 * AlertComponents.tsx — Behavioral Alerts UI Components
 * DailyStack FinTech — Pilo/Emerald Mint Theme
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  X, 
  Clock,
  ChevronRight,
  Filter,
  Settings,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap
} from 'lucide-react';
import { 
  BehavioralAlert, 
  AlertSeverity, 
  AlertCategory,
  AlertStatus 
} from './alertTypes';
import { useAlerts } from './AlertsContext';

// ─── Severity Styles ──────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<AlertSeverity, {
  icon: React.ReactNode;
  bg: string;
  border: string;
  text: string;
  label: string;
}> = {
  critical: {
    icon: <AlertCircle className="w-5 h-5" />,
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    label: 'Critical',
  },
  alert: {
    icon: <AlertTriangle className="w-5 h-5" />,
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    label: 'Alert',
  },
  warning: {
    icon: <Zap className="w-5 h-5" />,
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    label: 'Warning',
  },
  info: {
    icon: <Info className="w-5 h-5" />,
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    label: 'Info',
  },
};

// ─── Category Icons ────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<AlertCategory, React.ReactNode> = {
  impulse: <Zap className="w-4 h-4" />,
  budget: <TrendingDown className="w-4 h-4" />,
  habit: <Clock className="w-4 h-4" />,
  savings: <TrendingUp className="w-4 h-4" />,
  emotional: <Sparkles className="w-4 h-4" />,
  pattern: <Filter className="w-4 h-4" />,
  milestone: <CheckCircle className="w-4 h-4" />,
  security: <AlertCircle className="w-4 h-4" />,
};

// ─── Alert Card Component ─────────────────────────────────────────────────

interface AlertCardProps {
  alert: BehavioralAlert;
  onAcknowledge?: () => void;
  onResolve?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

export function AlertCard({ 
  alert, 
  onAcknowledge, 
  onResolve, 
  onDismiss,
  compact = false 
}: AlertCardProps) {
  const config = SEVERITY_CONFIG[alert.severity];
  const categoryIcon = CATEGORY_ICONS[alert.category];

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        relative rounded-xl border ${config.border} ${config.bg}
        backdrop-blur-sm overflow-hidden
        ${!alert.viewed ? 'ring-1 ring-[#CCFF00]/20' : ''}
        ${compact ? 'p-3' : 'p-4'}
      `}
    >
      {/* Severity Indicator */}
      <div className={`absolute top-0 left-0 w-1 h-full ${config.bg}`} />
      
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`${config.bg} ${config.text} p-2 rounded-lg flex-shrink-0`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className={`font-semibold text-sm ${config.text} flex items-center gap-2`}>
                {alert.title}
                {!alert.viewed && (
                  <span className="w-2 h-2 rounded-full bg-[#CCFF00]" />
                )}
              </h3>
              {!compact && (
                <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                  {alert.message}
                </p>
              )}
            </div>

            {/* Category Badge */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 text-xs text-gray-400 flex-shrink-0">
              {categoryIcon}
              <span className="capitalize">{alert.category}</span>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span>{formatTime(alert.createdAt)}</span>
            {alert.metricValues && Object.keys(alert.metricValues).length > 0 && (
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3" />
                {Object.keys(alert.metricValues).length} metrics
              </span>
            )}
          </div>

          {/* Actions */}
          {!compact && alert.status === 'active' && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
              {onAcknowledge && (
                <button
                  onClick={onAcknowledge}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Acknowledge
                </button>
              )}
              {onResolve && (
                <button
                  onClick={onResolve}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#CCFF00]/10 hover:bg-[#CCFF00]/20 text-sm text-[#CCFF00] transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Resolve
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-400 transition-colors ml-auto"
                >
                  <X className="w-4 h-4" />
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>

        {/* Chevron */}
        {!compact && alert.status === 'active' && (
          <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
        )}
      </div>
    </motion.div>
  );
}

// ─── Alert Feed Component ─────────────────────────────────────────────────

interface AlertFeedProps {
  filter?: {
    status?: AlertStatus | AlertStatus[];
    category?: AlertCategory | AlertCategory[];
    severity?: AlertSeverity | AlertSeverity[];
  };
  limit?: number;
  showActions?: boolean;
}

export function AlertFeed({ filter, limit, showActions = true }: AlertFeedProps) {
  const { alerts, acknowledge, resolve, dismiss, isLoading } = useAlerts();
  
  const filteredAlerts = alerts
    .filter(alert => {
      if (filter?.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        if (!statuses.includes(alert.status)) return false;
      }
      if (filter?.category) {
        const categories = Array.isArray(filter.category) ? filter.category : [filter.category];
        if (!categories.includes(alert.category)) return false;
      }
      if (filter?.severity) {
        const severities = Array.isArray(filter.severity) ? filter.severity : [filter.severity];
        if (!severities.includes(alert.severity)) return false;
      }
      return true;
    })
    .slice(0, limit);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (filteredAlerts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[#CCFF00]/10 flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-[#CCFF00]/50" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">No alerts</h3>
        <p className="text-gray-500 text-sm">
          You're all caught up! New alerts will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {filteredAlerts.map(alert => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onAcknowledge={showActions ? () => acknowledge(alert.id) : undefined}
            onResolve={showActions ? () => resolve(alert.id) : undefined}
            onDismiss={showActions ? () => dismiss(alert.id) : undefined}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Alert Badge Component ────────────────────────────────────────────────

interface AlertBadgeProps {
  count: number;
  max?: number;
}

export function AlertBadge({ count, max = 99 }: AlertBadgeProps) {
  if (count === 0) return null;

  return (
    <motion.span
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      className="
        inline-flex items-center justify-center
        min-w-[20px] h-5 px-1.5 rounded-full
        bg-[#CCFF00] text-black text-xs font-bold
      "
    >
      {count > max ? `${max}+` : count}
    </motion.span>
  );
}

// ─── Alert Stats Card Component ─────────────────────────────────────────

interface AlertStatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

export function AlertStatsCard({ title, value, change, icon, color }: AlertStatsCardProps) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
    </div>
  );
}

// ─── Alert Summary Component ──────────────────────────────────────────────

export function AlertSummary() {
  const { stats, unreadCount } = useAlerts();

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <AlertStatsCard
        title="Active Alerts"
        value={unreadCount}
        icon={<Bell className="w-5 h-5 text-[#CCFF00]" />}
        color="bg-[#CCFF00]/10"
      />
      <AlertStatsCard
        title="This Month"
        value={stats.totalAlerts}
        icon={<AlertCircle className="w-5 h-5 text-orange-400" />}
        color="bg-orange-500/10"
      />
      <AlertStatsCard
        title="Resolved"
        value={`${stats.resolutionRate}%`}
        icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
        color="bg-emerald-500/10"
      />
      <AlertStatsCard
        title="Avg Response"
        value={`${stats.averageResponseTime}m`}
        icon={<Clock className="w-5 h-5 text-blue-400" />}
        color="bg-blue-500/10"
      />
    </div>
  );
}

// ─── Alert Settings Panel Component ─────────────────────────────────────

interface AlertSettingsPanelProps {
  onClose: () => void;
}

export function AlertSettingsPanel({ onClose }: AlertSettingsPanelProps) {
  const { rules, preferences, toggleRule } = useAlerts();
  const { updatePreferences } = useAlerts();

  const categories = ['impulse', 'budget', 'habit', 'savings', 'emotional', 'pattern', 'milestone', 'security'] as AlertCategory[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg max-h-[80vh] overflow-auto rounded-2xl bg-[#1a1a1a] border border-white/10"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/5 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-[#CCFF00]" />
            <h2 className="text-lg font-semibold text-white">Alert Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Global Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <h3 className="font-medium text-white">Enable Alerts</h3>
              <p className="text-sm text-gray-400">Receive behavioral notifications</p>
            </div>
            <button
              onClick={() => updatePreferences({ alertsEnabled: !preferences?.alertsEnabled })}
              className={`
                relative w-12 h-6 rounded-full transition-colors
                ${preferences?.alertsEnabled ? 'bg-[#CCFF00]' : 'bg-white/20'}
              `}
            >
              <span 
                className={`
                  absolute top-1 w-4 h-4 rounded-full bg-black transition-transform
                  ${preferences?.alertsEnabled ? 'left-7' : 'left-1'}
                `}
              />
            </button>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-3">
            <h3 className="font-medium text-white">Quiet Hours</h3>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div>
                <p className="text-sm text-gray-300">DND Mode</p>
                <p className="text-xs text-gray-500">
                  {preferences?.quietHours.start} - {preferences?.quietHours.end}
                </p>
              </div>
              <button
                onClick={() => updatePreferences({ quietMode: !preferences?.quietMode })}
                className={`
                  relative w-10 h-5 rounded-full transition-colors
                  ${preferences?.quietMode ? 'bg-[#CCFF00]' : 'bg-white/20'}
                `}
              >
                <span 
                  className={`
                    absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform
                    ${preferences?.quietMode ? 'left-5' : 'left-0.5'}
                  `}
                />
              </button>
            </div>
          </div>

          {/* Category Toggles */}
          <div className="space-y-3">
            <h3 className="font-medium text-white">Categories</h3>
            <div className="space-y-2">
              {categories.map(category => {
                const catPrefs = preferences?.categories[category];
                const enabled = catPrefs?.enabled ?? true;

                return (
                  <div
                    key={category}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400">
                        {CATEGORY_ICONS[category]}
                      </div>
                      <span className="text-sm text-gray-300 capitalize">{category}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (catPrefs) {
                          updatePreferences({
                            categories: {
                              ...preferences?.categories,
                              [category]: { ...catPrefs, enabled: !enabled }
                            }
                          });
                        }
                      }}
                      className={`
                        relative w-10 h-5 rounded-full transition-colors
                        ${enabled ? 'bg-[#CCFF00]' : 'bg-white/20'}
                      `}
                    >
                      <span 
                        className={`
                          absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform
                          ${enabled ? 'left-5' : 'left-0.5'}
                        `}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Toast Notification Component ─────────────────────────────────────────

interface ToastNotificationProps {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  onClose: () => void;
}

export function ToastNotification({ 
  id, 
  title, 
  message, 
  severity, 
  onClose 
}: ToastNotificationProps) {
  const config = SEVERITY_CONFIG[severity];

  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`
        fixed bottom-4 right-4 z-50 w-80 rounded-xl border ${config.border} ${config.bg}
        backdrop-blur-md shadow-2xl overflow-hidden
      `}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`${config.bg} ${config.text} p-2 rounded-lg flex-shrink-0`}>
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-sm ${config.text}`}>{title}</h4>
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1 bg-white/10">
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 5, ease: 'linear' }}
          className={`h-full ${config.bg.replace('/10', '')}`}
        />
      </div>
    </motion.div>
  );
}

// ─── Export All Components ────────────────────────────────────────────────

export const AlertComponents = {
  AlertCard,
  AlertFeed,
  AlertBadge,
  AlertStatsCard,
  AlertSummary,
  AlertSettingsPanel,
  ToastNotification,
};
