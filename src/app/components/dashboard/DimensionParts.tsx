/**
 * ================================================================
 * DailyStack — DimensionParts v8.0 (Pilo-Inspired Redesign)
 * ================================================================
 * 
 * Pilo Design Principles Applied:
 * 
 * 1. CARD HIERARCHY
 *    - Primary Card: Main focus (progress, streak, energy)
 *    - Secondary Cards: Supporting info (stats, list items)
 *    - No equal emphasis on all cards
 * 
 * 2. ACCENT USAGE RULES (STRICT)
 *    - ✅ Allowed: CTA buttons, active states, progress bars
 *    - ❌ NOT allowed: Icons on white, labels, small numbers
 * 
 * 3. LESS BUT BETTER
 *    - Reduced cards per section
 *    - Removed decorative badges
 *    - Removed glow effects
 *    - Removed gradient overlays
 * 
 * 4. SPACING & WHITESPACE
 *    - Increased margins between sections
 *    - More breathing room
 *    - Premium feel
 * 
 * 5. TYPOGRAPHY HIERARCHY
 *    - Black/primary for headings and important numbers
 *    - Secondary/muted for labels
 *    - Clear scale
 * 
 * ================================================================ */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PARTS } from './DashboardTypes';
import type { PartId } from './DashboardTypes';
import { Icon, ProgressRing } from './DashboardIcon';

/* ═════════════════════════════════════════════════════════════════
   SHARED COMPONENTS — Clean, Minimal, Pilo-Inspired
══════════════════════════════════════════════════════════════════ */

/**
 * StatCard — Minimal stat display
 * 
 * BEFORE: Had accent icon background, glow, decorative elements
 * AFTER: Clean surface, black number, muted label
 */
export interface StatCardProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ value, label, icon, onClick }) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    className={`ds-card text-center ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    {/* Icon - Using secondary color, NOT accent */}
    <div className="flex justify-center mb-2">
      {icon}
    </div>
    
    {/* Value - Primary black */}
    <p className="text-xl font-bold text-[var(--text-primary)]">{value}</p>
    
    {/* Label - Muted secondary */}
    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 uppercase tracking-wide">
      {label}
    </p>
  </motion.div>
);

/**
 * GoalCard — Minimal goal display
 * 
 * BEFORE: Accent color on check icon, glowing progress bar
 * AFTER: Clean, simple, muted states
 */
export interface GoalCardProps {
  title: string;
  progress: number;
  onComplete?: () => void;
  index?: number;
}

export const GoalCard: React.FC<GoalCardProps> = ({ title, progress, onComplete, index = 0 }) => {
  const isComplete = progress === 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="ds-card"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Goal Info */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium text-[var(--text-primary)] leading-snug ${isComplete ? 'line-through opacity-60' : ''}`}>
            {title}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1">
            {progress}% {isComplete ? '✓' : ''}
          </p>
        </div>

        {/* Complete Button - Accent CTA */}
        {!isComplete && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            className="ds-btn ds-btn-primary"
            onClick={onComplete}
            style={{ minHeight: 36, padding: '8px 16px', fontSize: 12 }}
          >
            Done
          </motion.button>
        )}
      </div>

      {/* Progress Bar - Simple, no glow */}
      <div className="mt-3">
        <div className="h-1.5 bg-[var(--surface-3)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: isComplete ? 'var(--pilo)' : 'var(--text-secondary)' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

/**
 * QuickAddFAB — Floating Action Button
 */
export interface QuickAddFABProps {
  onClick: () => void;
}

export const QuickAddFAB: React.FC<QuickAddFABProps> = ({ onClick }) => (
  <motion.button
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.92 }}
    className="ds-fab"
    onClick={onClick}
    aria-label="Add new item"
  >
    <Icon name="plus" size={22} />
  </motion.button>
);

/* ═════════════════════════════════════════════════════════════════
   WORK PART — Primary: Progress Focus
══════════════════════════════════════════════════════════════════ */

export interface PartProps {
  lang: 'en' | 'th';
}

export interface WorkPartProps extends PartProps {
  onAddGoal?: () => void;
  activeTasksCount?: number;
  onTasksClick?: () => void;
}

export const WorkPart: React.FC<WorkPartProps> = ({ lang, onAddGoal, activeTasksCount = 0, onTasksClick }) => {
  const isThai = lang === 'th';
  const accent = PARTS[0].accent;

  const goals = [
    { title: isThai ? 'สร้าง Mobile App Beta' : 'Build Mobile App Beta', progress: 65 },
    { title: isThai ? 'ออกแบบ Premium Dashboard' : 'Design Premium Dashboard', progress: 90 },
    { title: isThai ? 'เปิดตัว TestFlight' : 'Launch TestFlight', progress: 30 },
  ];

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════
          SECTION HEADER — Clean, Minimal
          
          BEFORE: Had accent icon with background
          AFTER: Text only, secondary color icon
      ═══════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-3">
        {/* Icon - Secondary color, NOT accent */}
        <Icon name={PARTS[0].icon} size={18} className="text-[var(--text-secondary)]" />
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            {PARTS[0].label[isThai ? 'th' : 'en']}
          </h2>
          <p className="text-[11px] text-[var(--text-secondary)]">
            {isThai ? 'มิติของการสร้างคุณค่า' : 'Build value and drive impact'}
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          PRIMARY CARD — 12-Week Progress
          
          This is the HERO card for this section
          Pilo Principle: Progress is the focus
      ═══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="ds-card"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">
            {isThai ? 'เป้าหมาย 12 สัปดาห์' : '12-Week Goals'}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {isThai ? 'สัปดาห์ที่ 8' : 'Week 8'}
          </p>
        </div>

        {/* Progress Ring - Primary Focus */}
        <div className="flex items-center gap-6">
          <ProgressRing
            progress={65}
            size={100}
            strokeWidth={8}
            accent="var(--pilo)"
            label={isThai ? 'ความคืบหน้า' : 'Progress'}
          />
          <div className="flex-1">
            <p className="text-2xl font-bold text-[var(--text-primary)]">65%</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {isThai ? 'เสร็จแล้ว 7.8 สัปดาห์' : '7.8 weeks completed'}
            </p>
          </div>
        </div>

        {/* Progress Bar - Simple */}
        <div className="mt-5">
          <div className="h-2 bg-[var(--surface-3)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: '65%', background: 'var(--pilo)' }}
            />
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          SECONDARY SECTION — Stats + Goals
      ═══════════════════════════════════════════════════════ */}
      
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          value="12"
          label={isThai ? 'เป้าหมาย' : 'Goals'}
          icon={<Icon name="target" size={16} className="text-[var(--text-secondary)]" />}
        />
        <StatCard
          value={activeTasksCount}
          label={isThai ? 'งานรอ' : 'Tasks'}
          icon={<Icon name="check" size={16} className="text-[var(--text-secondary)]" />}
          onClick={onTasksClick}
        />
        <StatCard
          value="3"
          label={isThai ? 'สัปดาห์' : 'Weeks'}
          icon={<Icon name="calendar" size={16} className="text-[var(--text-secondary)]" />}
        />
      </div>

      {/* Goals List */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-3">
          {isThai ? 'เป้าหมายที่กำลังดำเนินอยู่' : 'Active Goals'}
        </p>
        <div className="space-y-2">
          {goals.map((goal, i) => (
            <GoalCard
              key={i}
              title={goal.title}
              progress={goal.progress}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Add Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onAddGoal}
        className="w-full py-4 rounded-2xl border border-dashed border-[var(--border-mid)] text-sm text-[var(--text-secondary)] font-medium flex items-center justify-center gap-2 hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] transition-colors"
      >
        <Icon name="plus" size={16} />
        {isThai ? 'เพิ่มเป้าหมายใหม่' : 'Add New Goal'}
      </motion.button>
    </div>
  );
};

/* ═════════════════════════════════════════════════════════════════
   LEARNING PART — Primary: Streak Focus
══════════════════════════════════════════════════════════════════ */

export const LearningPart: React.FC<PartProps> = ({ lang }) => {
  const isThai = lang === 'th';
  const streakDays = 47;

  const weeklyData = [
    { day: 'M', value: 5 },
    { day: 'T', value: 4 },
    { day: 'W', value: 5 },
    { day: 'T', value: 3 },
    { day: 'F', value: 5 },
    { day: 'S', value: 2 },
    { day: 'S', value: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Icon name={PARTS[1].icon} size={18} className="text-[var(--text-secondary)]" />
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            {PARTS[1].label[isThai ? 'th' : 'en']}
          </h2>
          <p className="text-[11px] text-[var(--text-secondary)]">
            {isThai ? 'เติมความรู้และทักษะใหม่' : 'Upskill daily with AI'}
          </p>
        </div>
      </div>

      {/* PRIMARY CARD — Streak */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="ds-card"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-4">
          {isThai ? 'วันติดต่อ' : 'Day Streak'}
        </p>

        <div className="text-center mb-5">
          <p className="text-4xl font-bold text-[var(--text-primary)]">{streakDays}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {isThai ? 'วันติดต่อกัน' : 'days in a row'}
          </p>
        </div>

        {/* Weekly Progress */}
        <div className="flex justify-center gap-2">
          {weeklyData.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium"
                style={{
                  background: d.value > 0 ? 'var(--pilo)' : 'var(--surface-3)',
                  color: d.value > 0 ? '#111111' : 'var(--text-secondary)',
                }}
              >
                {d.value > 0 ? '✓' : ''}
              </div>
              <span className="text-[9px] text-[var(--text-secondary)]">{d.day}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          value="21h"
          label={isThai ? 'ชม. เรียนรู้' : 'Hours'}
          icon={<Icon name="school" size={16} className="text-[var(--text-secondary)]" />}
        />
        <StatCard
          value="5"
          label={isThai ? 'คอร์ส' : 'Courses'}
          icon={<Icon name="star" size={16} className="text-[var(--text-secondary)]" />}
        />
        <StatCard
          value="3"
          label={isThai ? 'ใบรับรอง' : 'Certs'}
          icon={<Icon name="verified" size={16} className="text-[var(--text-secondary)]" />}
        />
      </div>

      {/* AI Study Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        className="ds-btn ds-btn-primary w-full"
      >
        {isThai ? 'เริ่มเรียนทันที' : 'Start Learning'}
      </motion.button>
    </div>
  );
};

/* ═════════════════════════════════════════════════════════════════
   RELATIONSHIPS PART — Primary: Attention Alert
══════════════════════════════════════════════════════════════════ */

export const RelationshipsPart: React.FC<PartProps> = ({ lang }) => {
  const isThai = lang === 'th';

  const relationships = [
    { name: 'คุณแม่', type: 'Family', lastContact: '2 วัน', color: '#6B7280' },
    { name: 'Mika', type: 'Friend', lastContact: '1 สัปดาห์', color: '#6B7280' },
    { name: 'Tanaka', type: 'Colleague', lastContact: '3 วัน', color: '#6B7280' },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Icon name={PARTS[2].icon} size={18} className="text-[var(--text-secondary)]" />
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            {PARTS[2].label[isThai ? 'th' : 'en']}
          </h2>
          <p className="text-[11px] text-[var(--text-secondary)]">
            {isThai ? 'ดูแลความสัมพันธ์ที่สำคัญ' : 'Nurture meaningful bonds'}
          </p>
        </div>
      </div>

      {/* PRIMARY CARD — Attention Alert */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="ds-card"
        style={{ borderLeft: '3px solid var(--pilo)' }}
      >
        <div className="flex items-start gap-3">
          <Icon name="notifications_active" size={18} className="text-[var(--text-secondary)] mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {isThai ? 'ต้องดูแลเป็นพิเศษ' : 'Needs attention'}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {isThai
                ? 'คุณไม่ได้คุยกับคุณแม่มา 2 สัปดาห์แล้ว'
                : '1 person hasn\'t been contacted in 2 weeks'}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            className="ds-btn ds-btn-primary"
            style={{ minHeight: 36, padding: '8px 16px', fontSize: 12 }}
          >
            {isThai ? 'โทร' : 'Call'}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          value="17"
          label={isThai ? 'คนสำคัญ' : 'Connections'}
          icon={<Icon name="users" size={16} className="text-[var(--text-secondary)]" />}
        />
        <StatCard
          value="3"
          label={isThai ? 'ต้องดูแล' : 'Needs Care'}
          icon={<Icon name="heart" size={16} className="text-[var(--text-secondary)]" />}
        />
        <StatCard
          value="5"
          label={isThai ? 'แมตช์' : 'Matches'}
          icon={<Icon name="star" size={16} className="text-[var(--text-secondary)]" />}
        />
      </div>

      {/* Relationships List */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-3">
          {isThai ? 'รายชื่อ' : 'Contacts'}
        </p>
        <div className="ds-card p-0 overflow-hidden">
          {relationships.map((rel, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              {/* Avatar - Simple circle */}
              <div className="w-10 h-10 rounded-full bg-[var(--surface-3)] flex items-center justify-center text-sm font-medium text-[var(--text-secondary)]">
                {rel.name[0]}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">{rel.name}</p>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {rel.lastContact}
                </p>
              </div>

              {/* Action */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                className="ds-btn ds-btn-secondary"
                style={{ minHeight: 32, padding: '6px 12px', fontSize: 11 }}
              >
                {isThai ? 'ติดต่อ' : 'Contact'}
              </motion.button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═════════════════════════════════════════════════════════════════
   PASSIONS PART — Primary: Projects Focus
══════════════════════════════════════════════════════════════════ */

export const PassionsPart: React.FC<PartProps> = ({ lang }) => {
  const isThai = lang === 'th';

  const projects = [
    { title: isThai ? 'แบรนด์ Pet Accessories' : 'Pet Accessory Brand', desc: isThai ? 'งานออกแบบคอลลาร์สัตว์เลี้ยง' : 'Minimal luxury pet collars', progress: 45 },
    { title: isThai ? 'Portfolio Site' : 'Minimal Portfolio Site', desc: isThai ? 'เว็บโชว์ผลงานสร้างสรรค์' : 'Personal design showcase', progress: 70 },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Icon name={PARTS[3].icon} size={18} className="text-[var(--text-secondary)]" />
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            {PARTS[3].label[isThai ? 'th' : 'en']}
          </h2>
          <p className="text-[11px] text-[var(--text-secondary)]">
            {isThai ? 'สร้างสรรค์งานที่สะท้อนตัวตน' : 'Build your creative signature'}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          value="2"
          label={isThai ? 'โปรเจกต์' : 'Projects'}
          icon={<Icon name="folder" size={16} className="text-[var(--text-secondary)]" />}
        />
        <StatCard
          value="7"
          label={isThai ? 'ไอเดีย' : 'Ideas'}
          icon={<Icon name="lightbulb" size={16} className="text-[var(--text-secondary)]" />}
        />
        <StatCard
          value="45%"
          label={isThai ? 'คืบหน้า' : 'Progress'}
          icon={<Icon name="trending_up" size={16} className="text-[var(--text-secondary)]" />}
        />
      </div>

      {/* Projects */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-3">
          {isThai ? 'โปรเจกต์' : 'Projects'}
        </p>
        <div className="space-y-3">
          {projects.map((proj, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="ds-card"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{proj.title}</p>
                <p className="text-xs text-[var(--text-secondary)]">{proj.progress}%</p>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mb-3">{proj.desc}</p>
              
              {/* Progress Bar - Simple */}
              <div className="h-1.5 bg-[var(--surface-3)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${proj.progress}%`, background: 'var(--text-secondary)' }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 rounded-2xl border border-dashed border-[var(--border-mid)] text-sm text-[var(--text-secondary)] font-medium flex items-center justify-center gap-2 hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] transition-colors"
      >
        <Icon name="plus" size={16} />
        {isThai ? 'เพิ่มโปรเจกต์ใหม่' : 'Add New Project'}
      </motion.button>
    </div>
  );
};

/* ═════════════════════════════════════════════════════════════════
   WELLBEING PART — Primary: Energy Focus
══════════════════════════════════════════════════════════════════ */

export const WellbeingPart: React.FC<PartProps> = ({ lang }) => {
  const isThai = lang === 'th';
  const [energyLevel] = useState(72);

  const getEnergyMessage = () => {
    if (energyLevel >= 70) return isThai ? 'วันพลังสูง' : 'High energy';
    if (energyLevel >= 40) return isThai ? 'พลังปานกลาง' : 'Moderate';
    return isThai ? 'พักผ่อนเยอะ ๆ' : 'Time to recharge';
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Icon name={PARTS[4].icon} size={18} className="text-[var(--text-secondary)]" />
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            {PARTS[4].label[isThai ? 'th' : 'en']}
          </h2>
          <p className="text-[11px] text-[var(--text-secondary)]">
            {isThai ? 'ดูแลสุขภาพและชาร์จพลังงาน' : 'Recharge your energy daily'}
          </p>
        </div>
      </div>

      {/* PRIMARY CARD — Energy */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="ds-card"
      >
        <div className="flex items-center gap-6">
          {/* Progress Ring */}
          <ProgressRing
            progress={energyLevel}
            size={100}
            strokeWidth={8}
            accent="var(--pilo)"
            label={isThai ? 'พลังงาน' : 'Energy'}
          />

          {/* Energy Info */}
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">
              {isThai ? 'วันนี้' : 'Today'}
            </p>
            <p className="text-xl font-bold text-[var(--text-primary)]">
              {energyLevel}%
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {getEnergyMessage()}
            </p>
          </div>
        </div>

        {/* Simple Progress Bar */}
        <div className="mt-5">
          <div className="h-1.5 bg-[var(--surface-3)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${energyLevel}%`, background: 'var(--pilo)' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          value="14"
          label={isThai ? 'วันติด' : 'Streak'}
          icon={<Icon name="local_fire_department" size={16} className="text-[var(--text-secondary)]" />}
        />
        <StatCard
          value="7.3h"
          label={isThai ? 'นอนเฉลี่ย' : 'Sleep Avg'}
          icon={<Icon name="bedtime" size={16} className="text-[var(--text-secondary)]" />}
        />
        <StatCard
          value="5"
          label={isThai ? 'รางวัล' : 'Rewards'}
          icon={<Icon name="emoji_events" size={16} className="text-[var(--text-secondary)]" />}
        />
      </div>

      {/* View Rewards Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        className="ds-btn ds-btn-secondary w-full"
      >
        {isThai ? 'ดูรางวัลสะสมทั้งหมด' : 'View All Rewards'}
      </motion.button>
    </div>
  );
};
