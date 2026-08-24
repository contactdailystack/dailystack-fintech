/**
 * ============================================================
 * DailyStack Design System — GridMenu Component v1.0 (E-Pay Style)
 * ============================================================
 * Quick Actions grid for E-Pay mobile interface
 * 
 * Design Philosophy:
 * - 4-column grid for quick action buttons
 * - Rounded icons with E-Pay lime accent
 * - Dark card backgrounds
 * - Touch-friendly 44x44pt minimum targets
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface GridMenuItem {
  id: string;
  icon: React.ElementType;
  label: string;
  badge?: string | number;
  color?: string;
  onClick?: () => void;
}

export interface GridMenuProps {
  items: GridMenuItem[];
  columns?: 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  onItemClick?: (item: GridMenuItem) => void;
  className?: string;
}

const gapStyles = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
};

const columnStyles = {
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

export const GridMenu: React.FC<GridMenuProps> = ({
  items,
  columns = 4,
  gap = 'md',
  onItemClick,
  className = '',
}) => {
  const handleClick = (item: GridMenuItem) => {
    item.onClick?.();
    onItemClick?.(item);
  };

  return (
    <div
      className={`
        grid ${columnStyles[columns]} ${gapStyles[gap]}
        ${className}
      `}
    >
      {items.map((item, index) => (
        <motion.button
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleClick(item)}
          className="
            flex flex-col items-center justify-center
            p-3 rounded-2xl
            bg-[#1A1A1A] border border-[#2A2A2A]
            transition-all duration-200
            hover:bg-[#202020] hover:border-[rgba(205,255,36,0.2)]
            active:bg-[rgba(205,255,36,0.1)]
            min-h-[80px]
          "
        >
          {/* Icon Container */}
          <div
            className="
              relative w-12 h-12 rounded-xl
              flex items-center justify-center
              bg-[rgba(205,255,36,0.1)]
              mb-2
            "
          >
            <item.icon
              className="w-6 h-6"
              style={{ color: item.color || '#56be89' }}
            />
            
            {/* Badge */}
            {item.badge !== undefined && (
              <span
                className="
                  absolute -top-1 -right-1
                  min-w-[18px] h-[18px] px-1
                  flex items-center justify-center
                  text-[10px] font-bold
                  bg-[#FF5733] text-white
                  rounded-full
                "
              >
                {typeof item.badge === 'number' && item.badge > 99
                  ? '99+'
                  : item.badge}
              </span>
            )}
          </div>
          
          {/* Label */}
          <span className="text-xs text-[#888888] text-center leading-tight">
            {item.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

// ─── Grid Menu Section with Title ───────────────────────────────────
export interface GridMenuSectionProps {
  title?: string;
  items: GridMenuItem[];
  columns?: 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  onItemClick?: (item: GridMenuItem) => void;
  className?: string;
}

export const GridMenuSection: React.FC<GridMenuSectionProps> = ({
  title,
  items,
  columns = 4,
  gap = 'md',
  onItemClick,
  className = '',
}) => (
  <div className={className}>
    {title && (
      <h3 className="text-sm font-semibold text-[#888888] mb-3 px-1">
        {title}
      </h3>
    )}
    <GridMenu
      items={items}
      columns={columns}
      gap={gap}
      onItemClick={onItemClick}
    />
  </div>
);

export default GridMenu;
