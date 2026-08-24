import React from 'react';
import {
  Home,
  RefreshCw,
  Wallet,
  CreditCard,
  User,
} from 'lucide-react';
import { Language } from '../data/translations';
import { pageTokens } from '../design-system';

interface BottomNavBarProps {
  lang: Language;
  onNavigate: (tab: string) => void;
  onPress: () => void;
  activeTab?: string;
  /** Theme variant: 'light' (default) or 'dark' */
  variant?: 'light' | 'dark';
}

const tabs = [
  {
    id: 'dashboard',
    icon: Home,
    route: 'dashboard',
    labelTh: 'หน้าแรก',
    labelEn: 'Home',
  },
  {
    id: 'recurring',
    icon: RefreshCw,
    route: 'subscriptions',
    labelTh: 'รายเดือน',
    labelEn: 'Recurring',
  },
  {
    id: 'networth',
    icon: Wallet,
    route: 'networth',
    labelTh: 'มูลค่าสุทธิ',
    labelEn: 'Net Worth',
  },
  {
    id: 'transactions',
    icon: CreditCard,
    route: 'activity',
    labelTh: 'ธุรกรรม',
    labelEn: 'Trancesion',
  },
  {
    id: 'profile',
    icon: User,
    route: 'settings',
    labelTh: 'โปรไฟล์',
    labelEn: 'Profile',
  },
];

export default function BottomNavBar({
  lang,
  onNavigate,
  onPress,
  activeTab = 'dashboard',
  variant = 'light',
}: BottomNavBarProps) {
  // Theme-aware colors
  const colors = {
    light: {
      background: '#FFFFFF',
      border: '#F3F4F6',
      active: pageTokens.colors.accent,
      inactive: '#9CA3AF',
      text: '#111827',
    },
    dark: {
      background: pageTokens.colors.darkCard,
      border: 'rgba(255, 255, 255, 0.08)',
      active: pageTokens.colors.accent,
      inactive: '#6B7280',
      text: '#FFFFFF',
    },
  };

  const theme = colors[variant];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        backgroundColor: theme.background,
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        paddingTop: '8px',
        borderTop: `1px solid ${theme.border}`,
      }}
    >
      <div className="flex items-stretch justify-around px-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          const label = lang === 'th' ? tab.labelTh : tab.labelEn;

          return (
            <button
              key={tab.id}
              onClick={() => {
                onPress();
                onNavigate(tab.route);
              }}
              className="flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl cursor-pointer transition-all active:scale-95 relative"
              style={{ minWidth: '64px' }}
              aria-label={label}
            >
              {isActive && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ backgroundColor: theme.active }}
                />
              )}
              <Icon
                className="w-5 h-5 transition-colors"
                style={{
                  color: isActive ? theme.active : theme.inactive,
                  strokeWidth: isActive ? 2.5 : 2,
                }}
              />
              <span
                className="text-[10px] font-semibold leading-tight transition-colors"
                style={{
                  color: isActive ? theme.active : theme.inactive,
                  fontFamily:
                    lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif',
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
