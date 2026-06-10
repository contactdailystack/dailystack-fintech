/**
 * AlertsPage.tsx — Behavioral Alerts Full Page View
 * DailyStack FinTech — Pilo/Emerald Mint Theme
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Settings, 
  Filter, 
  Search, 
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  LayoutGrid,
  List
} from 'lucide-react';
import { 
  useAlerts, 
  useActiveAlerts 
} from '../services/alerts/AlertsContext';
import { 
  AlertFeed, 
  AlertSummary,
  AlertSettingsPanel,
  AlertBadge 
} from '../services/alerts/AlertComponents';
import { AlertCategory, AlertSeverity, AlertStatus } from '../services/alerts/alertTypes';

// ─── Filter Options ───────────────────────────────────────────────────────

const CATEGORY_OPTIONS: { value: AlertCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'impulse', label: 'Impulse', icon: <Zap className="w-4 h-4" /> },
  { value: 'budget', label: 'Budget', icon: <TrendingDown className="w-4 h-4" /> },
  { value: 'habit', label: 'Habit', icon: <Clock className="w-4 h-4" /> },
  { value: 'savings', label: 'Savings', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'emotional', label: 'Emotional', icon: <Zap className="w-4 h-4" /> },
  { value: 'pattern', label: 'Pattern', icon: <Filter className="w-4 h-4" /> },
  { value: 'milestone', label: 'Milestone', icon: <CheckCircle className="w-4 h-4" /> },
  { value: 'security', label: 'Security', icon: <AlertTriangle className="w-4 h-4" /> },
];

const SEVERITY_OPTIONS: { value: AlertSeverity; label: string; color: string }[] = [
  { value: 'critical', label: 'Critical', color: 'calm-warning-critical' },
  { value: 'alert', label: 'Alert', color: 'bg-orange-500' },
  { value: 'warning', label: 'Warning', color: 'calm-warning' },
  { value: 'info', label: 'Info', color: 'bg-emerald-500' },
];

const STATUS_OPTIONS: { value: AlertStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
];

// ─── Main Component ───────────────────────────────────────────────────────

export default function AlertsPage() {
  const { unreadCount, alerts, isLoading } = useAlerts();
  const activeAlerts = useActiveAlerts();
  
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filters, setFilters] = useState<{
    categories: AlertCategory[];
    severities: AlertSeverity[];
    statuses: AlertStatus[];
  }>({
    categories: [],
    severities: [],
    statuses: ['active', 'acknowledged'],
  });
  const [showFilters, setShowFilters] = useState(false);

  // Apply filters to alerts
  const filteredAlerts = alerts.filter(alert => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!alert.title.toLowerCase().includes(query) && 
          !alert.message.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(alert.category)) {
      return false;
    }
    
    // Severity filter
    if (filters.severities.length > 0 && !filters.severities.includes(alert.severity)) {
      return false;
    }
    
    // Status filter
    if (filters.statuses.length > 0 && !filters.statuses.includes(alert.status)) {
      return false;
    }
    
    return true;
  });

  const toggleFilter = (
    filterType: 'categories' | 'severities' | 'statuses',
    value: AlertCategory | AlertSeverity | AlertStatus
  ) => {
    setFilters(prev => {
      const current = prev[filterType] as (string | AlertCategory | AlertSeverity | AlertStatus)[];
      if (current.includes(value)) {
        return {
          ...prev,
          [filterType]: current.filter(v => v !== value),
        };
      } else {
        return {
          ...prev,
          [filterType]: [...current, value],
        };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      severities: [],
      statuses: ['active', 'acknowledged'],
    });
    setSearchQuery('');
  };

  const hasActiveFilters = 
    filters.categories.length > 0 || 
    filters.severities.length > 0 ||
    filters.statuses.length !== 1 ||
    searchQuery.length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#CCFF00]/10">
                <Bell className="w-6 h-6 text-[#CCFF00]" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Behavioral Alerts</h1>
                <p className="text-sm text-gray-400">
                  {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-[#CCFF00]/20 text-[#CCFF00]' : 'text-gray-400'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-[#CCFF00]/20 text-[#CCFF00]' : 'text-gray-400'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 
                         focus:border-[#CCFF00]/50 focus:ring-1 focus:ring-[#CCFF00]/20
                         placeholder-gray-500 transition-colors"
            />
          </div>

          {/* Filter Bar */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors flex-shrink-0 ${
                showFilters ? 'bg-[#CCFF00]/20 text-[#CCFF00]' : 'bg-white/5 text-gray-400'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#CCFF00]" />
              )}
            </button>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {filters.statuses.length === 1 && filters.statuses[0] === 'active' && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, statuses: ['active', 'acknowledged'] }))}
                  className="px-3 py-1.5 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] text-sm flex-shrink-0"
                >
                  Show All
                </button>
              )}
            </div>

            {/* Active Filter Pills */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-400 hover:text-white flex-shrink-0 ml-auto"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-4">
                  {/* Categories */}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
                      Categories
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => toggleFilter('categories', opt.value)}
                          className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors
                            ${filters.categories.includes(opt.value)
                              ? 'bg-[#CCFF00]/20 text-[#CCFF00]'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }
                          `}
                        >
                          {opt.icon}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Severities */}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
                      Severity
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SEVERITY_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => toggleFilter('severities', opt.value)}
                          className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors
                            ${filters.severities.includes(opt.value)
                              ? 'bg-[#CCFF00]/20 text-[#CCFF00]'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }
                          `}
                        >
                          <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
                      Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => toggleFilter('statuses', opt.value)}
                          className={`
                            px-3 py-1.5 rounded-lg text-sm transition-colors
                            ${filters.statuses.includes(opt.value)
                              ? 'bg-[#CCFF00]/20 text-[#CCFF00]'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }
                          `}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Summary Cards */}
        <AlertSummary />

        {/* Alerts List */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              {hasActiveFilters ? 'No matching alerts' : 'All caught up!'}
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              {hasActiveFilters 
                ? 'Try adjusting your filters to see more alerts.'
                : 'No behavioral alerts right now. We\'ll notify you when we detect patterns worth highlighting.'
              }
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 rounded-lg bg-[#CCFF00]/10 text-[#CCFF00] hover:bg-[#CCFF00]/20 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-3'}>
            {filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AlertCard
                  alert={alert}
                  onAcknowledge={() => useAlerts().acknowledge(alert.id)}
                  onResolve={() => useAlerts().resolve(alert.id)}
                  onDismiss={() => useAlerts().dismiss(alert.id)}
                  compact={viewMode === 'grid'}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <AlertSettingsPanel onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Re-export AlertCard for internal use
import { AlertCard } from '../services/alerts/AlertComponents';
