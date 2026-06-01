/**
 * ================================================================
 * DailyStack — PartNavigation v8.0 (Pilo-Inspired Redesign)
 * ================================================================
 * 
 * Pilo Design Principles Applied:
 * 
 * 1. NAVIGATION = SECONDARY LAYER
 *    - Does NOT compete with content
 *    - User sees content first, navigation second
 *    - Minimal visual weight
 * 
 * 2. ACTIVE STATE = ACCENT BACKGROUND
 *    - Active tab uses Pilo accent (#D1FF3B) background
 *    - Text is black for contrast (not white on accent)
 *    - Clear indication of current location
 * 
 * 3. INACTIVE STATE = MUTED SECONDARY
 *    - Icons and text use muted/secondary color
 *    - No accent colors on inactive items
 *    - Subtle, not competing
 * 
 * 4. LESS VISUAL NOISE
 *    - Removed container styling (no bg, no border)
 *    - Removed decorative elements
 *    - Clean horizontal scroll
 * 
 * ================================================================ */

import React from 'react';
import { motion } from 'framer-motion';
import { PARTS } from './DashboardTypes';
import type { PartId } from './DashboardTypes';
import { Icon } from './DashboardIcon';

export interface PartNavigationProps {
  active: PartId;
  onChange: (id: PartId) => void;
  lang: 'en' | 'th';
}

export const PartNavigation: React.FC<PartNavigationProps> = ({ active, onChange, lang }) => {
  const isThai = lang === 'th';

  return (
    <div className="mb-6 animate-fade-up" style={{ animationDelay: '80ms' }}>
      {/* ═══════════════════════════════════════════════════════════
          NAVIGATION BAR — Clean, Minimal, Secondary
          
          BEFORE: Had container with bg-surface-2 and border
          AFTER: No container, items float freely
          
          Pilo Principle: Navigation is secondary layer
      ═══════════════════════════════════════════════════════════ */}
      <div 
        className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {PARTS.map((part) => {
          const isActive = active === part.id;
          
          return (
            <motion.button
              key={part.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => onChange(part.id)}
              className="flex-shrink-0"
              style={{
                scrollSnapAlign: 'start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 16px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                // Pilo: Active uses accent background, inactive uses transparent
                background: isActive ? 'var(--pilo)' : 'transparent',
                color: isActive ? '#111111' : 'var(--text-secondary)',
                border: 'none',
              }}
            >
              {/* Pilo: Icon inherits text color - no accent on inactive */}
              <Icon name={part.icon} size={14} />
              <span>{isThai ? part.labelShort.th : part.labelShort.en}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
