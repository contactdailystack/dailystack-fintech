/**
 * ChartTabs.tsx — E-Pay Analytics Tab Navigation
 * Segmented control for Analytics / Credit Score / MyPay tabs
 */

import { memo } from 'react';
import { motion } from 'motion/react';

type TabId = 'analytics' | 'credit-score' | 'mypay';

interface Tab {
  id: TabId;
  label: string;
  labelTh?: string;
}

interface ChartTabsProps {
  tabs: Tab[];
  activeTab: TabId;
  onChange: (tab: TabId) => void;
  lang?: 'en' | 'th';
}

export const ChartTabs = memo(function ChartTabs({
  tabs,
  activeTab,
  onChange,
  lang = 'en',
}: ChartTabsProps) {
  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  return (
    <div
      className="relative flex items-center p-1 rounded-full"
      style={{
        backgroundColor: '#1A1A1A',
        border: '1px solid #2A2A2A',
      }}
    >
      {/* Sliding indicator */}
      <motion.div
        className="absolute h-[calc(100%-8px)] rounded-full"
        style={{
          backgroundColor: '#0FB0CE',
          width: `${100 / tabs.length}%`,
          left: 4,
        }}
        animate={{ x: `${activeIndex * 100}%` }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      />

      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const label = lang === 'th' && tab.labelTh ? tab.labelTh : tab.label;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="relative z-10 flex-1 px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors rounded-full"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: isActive ? '#101010' : '#888888',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
});
