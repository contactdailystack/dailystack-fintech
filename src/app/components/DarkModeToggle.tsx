/**
 * DarkModeToggle.tsx
 * Phase 3 – UX Polish: Animated dark/light mode toggle button
 */
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface DarkModeToggleProps {
  className?: string;
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ className = '' }) => {
  const { isDark, toggle } = useTheme();

  return (
    <button
      id="dark-mode-toggle"
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all
        ${isDark
          ? 'bg-white/10 text-white hover:bg-white/20'
          : 'bg-black/5 text-gray-600 hover:bg-black/10'
        } ${className}`}
      style={{ transition: 'background 200ms, transform 200ms' }}
    >
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          opacity: isDark ? 0 : 1,
          transform: isDark ? 'rotate(90deg) scale(0.5)' : 'rotate(0deg) scale(1)',
        }}
      >
        <Sun size={16} strokeWidth={2} />
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          opacity: isDark ? 1 : 0,
          transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)',
        }}
      >
        <Moon size={16} strokeWidth={2} />
      </span>
    </button>
  );
};
