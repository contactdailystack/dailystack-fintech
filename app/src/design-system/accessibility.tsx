/**
 * ============================================================
 * DailyStack Design System — Accessibility Utilities v1.0
 * ============================================================
 * WCAG 2.1 AA Compliance helpers
 * 
 * Design Philosophy:
 * - Screen reader support
 * - Keyboard navigation
 * - Focus management
 * - Color contrast verification
 */

import React, { useCallback } from 'react';

// ─── Color Contrast Checker ──────────────────────────────────────────
/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 formula
 */
export const getLuminance = (color: string): number => {
  const hex = color.replace('#', '');
  const rgb = [
    parseInt(hex.substring(0, 2), 16) / 255,
    parseInt(hex.substring(2, 4), 16) / 255,
    parseInt(hex.substring(4, 6), 16) / 255,
  ];

  const [r, g, b] = rgb.map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Calculate contrast ratio between two colors
 * Returns value between 1 and 21
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if contrast ratio meets WCAG AA standard
 * For normal text: 4.5:1
 * For large text (18pt+): 3:1
 * For UI components: 3:1
 */
export const meetsContrastStandard = (
  foreground: string,
  background: string,
  textSize?: 'normal' | 'large' | 'ui'
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  const threshold = textSize === 'large' ? 3 : textSize === 'ui' ? 3 : 4.5;
  return ratio >= threshold;
};

// ─── Focus Management ────────────────────────────────────────────────
/**
 * Focus trap utility for modals and dialogs
 * Keeps focus within a specific element
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element when trap becomes active
    firstElement?.focus();

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
};

// ─── Announce for Screen Readers ──────────────────────────────────────
/**
 * Announce message to screen readers
 * Uses ARIA live regions
 */
export const useAriaAnnounce = () => {
  const [announcement, setAnnouncement] = React.useState('');
  const [politeness, setPoliteness] = React.useState<'polite' | 'assertive'>('polite');

  const announce = useCallback((message: string, level: 'polite' | 'assertive' = 'polite') => {
    setPoliteness(level);
    setAnnouncement('');
    // Small delay to ensure the change is detected
    setTimeout(() => setAnnouncement(message), 50);
  }, []);

  const AriaLiveRegion: React.FC = () => (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );

  return { announce, AriaLiveRegion };
};

// ─── Keyboard Navigation Helpers ──────────────────────────────────────
/**
 * Handle arrow key navigation for lists/grids
 */
export const useArrowNavigation = (
  items: HTMLElement[],
  options?: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
    onSelect?: (index: number) => void;
  }
) => {
  const { orientation = 'vertical', loop = true, onSelect } = options || {};
  const [focusedIndex, setFocusedIndex] = React.useState(-1);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (items.length === 0) return;

    const isVertical = orientation === 'vertical' || orientation === 'both';
    const isHorizontal = orientation === 'horizontal' || orientation === 'both';

    let nextIndex = focusedIndex;
    let handled = false;

    if ((e.key === 'ArrowDown' && isVertical) || (e.key === 'ArrowRight' && isHorizontal)) {
      nextIndex = focusedIndex + 1;
      if (nextIndex >= items.length) {
        nextIndex = loop ? 0 : items.length - 1;
      }
      handled = true;
    }

    if ((e.key === 'ArrowUp' && isVertical) || (e.key === 'ArrowLeft' && isHorizontal)) {
      nextIndex = focusedIndex - 1;
      if (nextIndex < 0) {
        nextIndex = loop ? items.length - 1 : 0;
      }
      handled = true;
    }

    if (e.key === 'Home') {
      nextIndex = 0;
      handled = true;
    }

    if (e.key === 'End') {
      nextIndex = items.length - 1;
      handled = true;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      if (focusedIndex >= 0 && onSelect) {
        onSelect(focusedIndex);
        handled = true;
      }
    }

    if (handled) {
      e.preventDefault();
      setFocusedIndex(nextIndex);
      items[nextIndex]?.focus();
    }
  }, [focusedIndex, items, loop, onSelect, orientation]);

  return { focusedIndex, setFocusedIndex, handleKeyDown };
};

// ─── Skip Link Component ─────────────────────────────────────────────
export interface SkipLinkProps {
  targetId: string;
  children?: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId,
  children = 'Skip to main content',
}) => (
  <a
    href={`#${targetId}`}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#56be89] focus:text-black focus:rounded-lg focus:font-medium"
  >
    {children}
  </a>
);

// ─── Screen Reader Only ──────────────────────────────────────────────
/**
 * Visually hidden but accessible to screen readers
 */
export const VisuallyHidden: React.FC<React.HTMLAttributes<HTMLElement>> = ({
  children,
  ...props
}) => (
  <span
    {...props}
    style={{
      position: 'absolute',
      width: 1,
      height: 1,
      padding: 0,
      margin: -1,
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: 0,
    }}
  >
    {children}
  </span>
);

// ─── Expand/Collapse Description ─────────────────────────────────────
/**
 * Generate accessible description IDs for expand/collapse patterns
 */
export const useExpandCollapseDescription = (buttonId: string, contentId: string) => {
  const descriptionId = `${buttonId}-description`;

  const buttonProps = {
    'aria-describedby': descriptionId,
    'aria-expanded': false,
    'aria-controls': contentId,
  };

  const contentProps = {
    id: contentId,
    role: 'region',
    'aria-labelledby': buttonId,
  };

  const descriptionProps = {
    id: descriptionId,
    className: 'sr-only',
  };

  return { buttonProps, contentProps, descriptionProps };
};

// ─── Exports ──────────────────────────────────────────────────────
export default {
  getLuminance,
  getContrastRatio,
  meetsContrastStandard,
  useFocusTrap,
  useAriaAnnounce,
  useArrowNavigation,
  SkipLink,
  VisuallyHidden,
  useExpandCollapseDescription,
};
