/**
 * GlobalAlertBanners.tsx — RM-style in-app alert banners
 * Shows active behavioral alerts as a dismissible stack fixed below the
 * safe-area top inset, visible on every authenticated screen.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Bell, ShieldAlert, TrendingDown, X } from 'lucide-react';
import { useAlerts } from './AlertsContext';
import type { BehavioralAlert } from './alertTypes';
import { Language } from '../../data/translations';

const SEVERITY_STYLE: Record<string, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  critical: {
    bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C',
    icon: <ShieldAlert className="w-4 h-4 flex-shrink-0" />,
  },
  alert: {
    bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C',
    icon: <AlertTriangle className="w-4 h-4 flex-shrink-0" />,
  },
  warning: {
    bg: '#FFFBEB', border: '#FDE68A', text: '#A16207',
    icon: <AlertTriangle className="w-4 h-4 flex-shrink-0" />,
  },
  info: {
    bg: '#E0F2FC', border: '#BAE1F5', text: '#075985',
    icon: <Bell className="w-4 h-4 flex-shrink-0" />,
  },
};

interface GlobalAlertBannersProps {
  lang: Language;
}

export function GlobalAlertBanners({ lang }: GlobalAlertBannersProps) {
  const navigate = useNavigate();
  // Only status==='active' alerts surface as banners (acknowledged ones stay in the feed)
  const { alerts, acknowledge, isLoading } = useAlerts();
  const [locallyClosed, setLocallyClosed] = useState<Set<string>>(new Set());

  // Newest first, cap at 2 so the stack never takes over the screen
  const banners = useMemo(
    () => alerts
      .filter(a => a.status === 'active' && !locallyClosed.has(a.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2),
    [alerts, locallyClosed]
  );

  // Reset local closes when the underlying alerts change (e.g. new session)
  useEffect(() => {
    setLocallyClosed(prev => {
      const liveIds = new Set(alerts.map(a => a.id));
      const next = new Set([...prev].filter(id => liveIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [alerts]);

  if (isLoading || banners.length === 0) return null;

  const close = (alert: BehavioralAlert) => {
    setLocallyClosed(prev => new Set(prev).add(alert.id));
    // Dismissed banners are marked acknowledged (not dismissed) so they can
    // resurface later per rule cooldown instead of vanishing forever.
    void acknowledge(alert.id);
  };

  const openFeed = (alert: BehavioralAlert) => {
    void acknowledge(alert.id);
    navigate('/alerts');
  };

  const seeAllLabel = lang === 'th' ? 'ดูทั้งหมด' : 'See all';

  return (
    <div
      className="fixed left-0 right-0 z-[60] px-4 pointer-events-none"
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}
      role="region"
      aria-live="polite"
      aria-label={lang === 'th' ? 'การแจ้งเตือน' : 'Alerts'}
    >
      <AnimatePresence initial={false}>
        {banners.map((alert) => {
          const style = SEVERITY_STYLE[alert.severity] || SEVERITY_STYLE.info;
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.15 } }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto mx-auto max-w-md mb-2 rounded-xl border shadow-sm overflow-hidden"
              style={{ backgroundColor: style.bg, borderColor: style.border }}
            >
              <div className="flex items-start gap-3 p-3">
                <span style={{ color: style.text }} aria-hidden="true">{style.icon}</span>
                <button
                  type="button"
                  onClick={() => openFeed(alert)}
                  className="flex-1 min-w-0 text-left cursor-pointer"
                >
                  <p className="text-xs font-semibold truncate" style={{ color: style.text }}>
                    {alert.title}
                  </p>
                  <p className="text-[11px] leading-snug mt-0.5 line-clamp-2" style={{ color: '#374151' }}>
                    {alert.message}
                  </p>
                  <p className="text-[10px] font-mono mt-1 underline underline-offset-2" style={{ color: style.text }}>
                    {seeAllLabel}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => close(alert)}
                  aria-label={lang === 'th' ? 'ปิดการแจ้งเตือน' : 'Dismiss alert'}
                  className="p-1 rounded-lg hover:bg-black/5 transition-colors flex-shrink-0"
                  style={{ color: style.text }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
