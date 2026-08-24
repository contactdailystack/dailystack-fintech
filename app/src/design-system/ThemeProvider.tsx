/**
 * ============================================================
 * DailyStack Design System — ThemeProvider v2.0
 * ============================================================
 * Token Architecture v1.0:
 * - CSS Variables (tokens.css) are the runtime source of truth
 * - TypeScript exports provide type definitions for DX
 * - ThemeProvider manages [data-theme] attribute on <html>
 *
 * Usage:
 *   CSS:  background: var(--bg-page); color: var(--text-primary);
 *   JS:   const { typography } = useDesignTokens();
 */

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { typographyTokens, TypographyTokens } from './typography-tokens';
import { spacingTokens, SpacingTokens } from './spacing-tokens';
import { motionTokens, MotionTokens } from './motion-tokens';
import { hapticTokens, HapticTokens } from './haptic-tokens';

// ─── Theme Mode Types ──────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';

// ─── Design Tokens Context Value ───────────────────────────────────

export interface DesignTokens {
  typography: TypographyTokens;
  spacing: SpacingTokens;
  motion: MotionTokens;
  haptics: HapticTokens;
  mode: ThemeMode;
}

// ─── Default Theme (Light Mode Production Default) ─────────────────

const defaultTokens: DesignTokens = {
  typography: typographyTokens,
  spacing: spacingTokens,
  motion: motionTokens,
  haptics: hapticTokens,
  mode: 'light',
};

// ─── Context ───────────────────────────────────────────────────────

const DesignTokensContext = createContext<DesignTokens>(defaultTokens);

// ─── Provider Component ─────────────────────────────────────────────

export interface ThemeProviderProps {
  children: ReactNode;
  config?: { mode?: ThemeMode };
}

export function ThemeProvider({ children, config }: ThemeProviderProps) {
  const mode = config?.mode ?? 'light';

  // Apply theme attribute to <html> for CSS variable switching
  useMemo(() => {
    if (typeof document !== 'undefined') {
      const resolved = mode === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : mode;
      document.documentElement.setAttribute('data-theme', resolved);
    }
  }, [mode]);

  const tokens = useMemo<DesignTokens>(() => ({
    typography: typographyTokens,
    spacing: spacingTokens,
    motion: motionTokens,
    haptics: hapticTokens,
    mode,
  }), [mode]);

  return (
    <DesignTokensContext.Provider value={tokens}>
      {children}
    </DesignTokensContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────

/**
 * Access design tokens from the current theme context.
 * Note: For appearance colors, use CSS variables directly in your styles.
 * This hook provides non-CSS token layers (typography, spacing, motion).
 */
export function useDesignTokens(): DesignTokens {
  const context = useContext(DesignTokensContext);
  if (context === undefined) {
    console.warn('[DesignSystem] useDesignTokens() called outside ThemeProvider.');
    return defaultTokens;
  }
  return context;
}

// ─── Pre-configured Theme Exports ─────────────────────────────────

export const lightTheme: DesignTokens = { ...defaultTokens, mode: 'light' };
export const darkTheme: DesignTokens = { ...defaultTokens, mode: 'dark' };
