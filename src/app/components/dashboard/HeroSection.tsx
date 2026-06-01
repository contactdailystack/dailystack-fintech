/**
 * ================================================================
 * DailyStack — HeroSection v9.0 (AutoPass-Inspired Redesign)
 * ================================================================
 * 
 * AutoPass Design Elements Applied:
 * 
 * 1. WHITE = Background/Space
 *    - Page background is clean white
 *    - Cards use solid black for contrast
 * 
 * 2. BLACK = Information Layer
 *    - Hero card uses solid black background
 *    - White text for maximum contrast
 * 
 * 3. ACCENT (#D1FF3B) = Attention Control
 *    - Avatar border
 *    - Progress bar
 *    - Active member badge
 *    - Never used for icons/labels on dark
 * 
 * 4. VISUAL ELEMENTS
 *    - Circular avatar with lime border
 *    - Stats in 3 columns
 *    - Pill-shaped buttons
 *    - Settings list with chevrons
 * 
 * ================================================================ */

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from './DashboardIcon';

export interface HeroSectionProps {
  lang: 'en' | 'th';
  onThemeToggle: () => void;
  isDark: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  lang,
  onThemeToggle,
  isDark,
}) => {
  const isThai = lang === 'th';
  
  // Mock user data (should come from auth context in real app)
  const userName = isThai ? 'สมชาย ใจดี' : 'Alex Kovalenko';
  const userPhone = '+1 (555) 332-2233';
  
  // Mock stats
  const stats = {
    goals: 12,
    growth: '+15%',
    streak: 8,
  };
  
  const overallProgress = 72;
  const weekLabel = isThai ? 'สัปดาห์' : 'Week';

  return (
    <div className="mb-6">
      {/* ═══════════════════════════════════════════════════════════
          USER PROFILE ROW — Clean, Minimal
          AutoPass: Avatar + Name + Pill Button
      ═══════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {/* Avatar with Lime Border */}
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ 
              background: 'var(--pilo)',
              padding: '3px',
            }}
          >
            <div className="w-full h-full rounded-full bg-[var(--bg-base)] flex items-center justify-center overflow-hidden">
              <span className="text-lg font-bold text-[var(--text-primary)]">
                {userName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </div>
          
          {/* User Info */}
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)] leading-tight">
              {userName}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] font-normal">
              {userPhone}
            </p>
          </div>
        </div>

        {/* Pill Buttons */}
        <div className="flex items-center gap-2">
          {/* Member Badge - Lime */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-full text-xs font-semibold"
            style={{ 
              background: 'var(--pilo)',
              color: '#111111',
            }}
          >
            {isThai ? 'สมาชิก' : 'Member'}
          </motion.button>

          {/* Upgrade - Black */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-[var(--text-primary)] text-white"
          >
            {isThai ? 'อัพเกรด' : 'Upgrade'}
          </motion.button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          STATS CARD — Black Background
          AutoPass: 3 columns with progress bar
      ═══════════════════════════════════════════════════════════ */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 180 }}
        className="rounded-2xl p-5 mb-5"
        style={{ background: 'var(--pilo-black)' }}
      >
        {/* Stats Grid - 3 Columns */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Goals */}
          <div className="text-center">
            <p className="text-2xl font-bold text-white mb-1">
              {stats.goals}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wider"
               style={{ color: 'rgba(255,255,255,0.5)' }}>
              {isThai ? 'เป้าหมาย' : 'Goals'}
            </p>
          </div>
          
          {/* Growth */}
          <div className="text-center border-x border-y border-y-transparent"
               style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <p className="text-2xl font-bold" style={{ color: 'var(--pilo)' }}>
              {stats.growth}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wider"
               style={{ color: 'rgba(255,255,255,0.5)' }}>
              {isThai ? 'เติบโต' : 'Growth'}
            </p>
          </div>
          
          {/* Streak */}
          <div className="text-center">
            <p className="text-2xl font-bold text-white mb-1">
              {stats.streak}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wider"
               style={{ color: 'rgba(255,255,255,0.5)' }}>
              {isThai ? 'วัน' : 'Days'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {isThai ? 'ความคืบหน้ารายเดือน' : 'Monthly limit'}
            </p>
            <p className="text-[10px] font-semibold" style={{ color: 'var(--pilo)' }}>
              {overallProgress}%
            </p>
          </div>
          <div 
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'var(--pilo-charcoal)' }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'var(--pilo)' }}
            />
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          SETTINGS LIST — AutoPass Style
          Gray background items with chevron (#F5F5F5)
      ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-2">
        {/* Settings Header */}
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3 px-1">
          {isThai ? 'การตั้งค่า' : 'Settings'}
        </p>

        {/* Settings Items */}
        {[
          { 
            icon: 'settings',
            label: isThai ? 'การตั้งค่าทั่วไป' : 'General Settings',
            value: '',
          },
          { 
            icon: 'folder', 
            label: isThai ? 'วิธีการชำระเงิน' : 'Payment Methods',
            value: 'Visa **** 4211',
          },
          { 
            icon: 'shield', 
            label: isThai ? 'การตั้งค่าความปลอดภัย' : 'Safety Settings',
            value: isThai ? 'ตั้งค่าแล้ว' : 'Configured',
          },
        ].map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-between p-4 rounded-xl transition-colors"
            style={{ background: '#F5F5F5' }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.08)' }}
              >
                <Icon name={item.icon} size={18} className="text-[var(--text-secondary)]" />
              </div>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {item.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {item.value && (
                <span className="text-xs text-[var(--text-secondary)]">
                  {item.value}
                </span>
              )}
              <Icon name="chevronRight" size={16} className="text-[var(--text-muted)]" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
