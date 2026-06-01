/**
 * DailyStack — Lenis Smooth Scroll Configuration (v2.0)
 * Phase 5: Lenis Smooth Scroll + Mobile Gesture System
 * 
 * Features:
 * - Cinematic scroll feel with tuned easing curves
 * - Improved momentum behavior
 * - Mobile smoothness optimizations
 * - Scroll-linked animation support
 * - Overscroll handling
 */

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface LenisConfig {
  duration?: number;
  easing?: (t: number) => number;
  orientation?: 'vertical' | 'horizontal';
  gestureOrientation?: 'vertical' | 'horizontal';
  smoothWheel?: boolean;
  touchMultiplier?: number;
  wheelEventsTarget?: Window | HTMLElement | null;
}

export interface ScrollState {
  scroll: number;
  limit: number;
  direction: 'up' | 'down' | null;
  velocity: number;
  isScrolling: boolean;
}

// =====================================================
// CUSTOM EASING FUNCTIONS
// =====================================================

export const EasingFunctions = {
  // Smooth ease-out (recommended for most use cases)
  smooth: (t: number) => Math.min(1 - Math.pow(1 - t, 3), t * 1.05),
  
  // Bouncy feel (for interactive elements)
  bouncy: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 
      ? 0 
      : t === 1 
        ? 1 
        : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  
  // Cinematic ease (slow start, fast end)
  cinematic: (t: number) => {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },
  
  // Quick snap (for snappy interactions)
  snap: (t: number) => {
    return t < 0.5 
      ? 8 * t * t * t * t 
      : 1 - Math.pow(-8 * t + 8, 4) / 2;
  },
  
  // Elastic (for playful elements)
  elastic: (t: number) => {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0
      ? 0
      : t === 1
        ? 1
        : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c5) + 1;
  },
  
  // Ease out expo (for smooth deceleration)
  expoOut: (t: number) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  },
  
  // Spring physics approximation
  spring: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 
      ? 0 
      : t === 1 
        ? 1 
        : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

// =====================================================
// LENIS WRAPPER (Without direct import)
// =====================================================

interface LenisInstance {
  scroll: number;
  limit: number;
  isScrolling: boolean;
  direction: 'up' | 'down' | null;
  velocity: number;
  raf: (time: number) => void;
  on: (event: string, callback: (e: any) => void) => void;
  off: (event: string, callback: (e: any) => void) => void;
  scrollTo: (target: string | number | HTMLElement, options?: any) => void;
  stop: () => void;
  start: () => void;
  destroy: () => void;
}

// Lenis instance storage
let lenisInstance: LenisInstance | null = null;
let isInitialized = false;

// =====================================================
// LENIS INITIALIZATION
// =====================================================

export async function initializeLenis(customConfig?: Partial<LenisConfig>): Promise<LenisInstance | null> {
  // Prevent double initialization
  if (isInitialized && lenisInstance) {
    return lenisInstance;
  }
  
  try {
    // Dynamic import to avoid build errors if not installed
    const Lenis = (await import('lenis')).default;
    const defaultConfig: LenisConfig = {
      duration: 1.2,
      easing: EasingFunctions.smooth,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    };
    
    const config = { ...defaultConfig, ...customConfig };
    
    lenisInstance = new Lenis({
      duration: config.duration,
      easing: config.easing,
      orientation: config.orientation,
      gestureOrientation: config.gestureOrientation,
      smoothWheel: config.smoothWheel,
      touchMultiplier: config.touchMultiplier,
    }) as unknown as LenisInstance;
    
    isInitialized = true;
    return lenisInstance;
  } catch (error) {
    console.warn('Lenis initialization failed, falling back to native scroll:', error);
    // Return a minimal stub that uses native scroll
    lenisInstance = createNativeScrollStub();
    isInitialized = true;
    return lenisInstance;
  }
}

function createNativeScrollStub(): LenisInstance {
  let scrollListener: ((state: ScrollState) => void) | null = null;
  
  return {
    scroll: 0,
    limit: 0,
    isScrolling: false,
    direction: null,
    velocity: 0,
    
    raf: (time: number) => {
      // Trigger scroll updates at 60fps
    },
    
    on: (event: string, callback: (e: any) => void) => {
      if (event === 'scroll' && typeof window !== 'undefined') {
        const handler = () => {
          const scrollY = window.scrollY;
          const limit = document.documentElement.scrollHeight - window.innerHeight;
          callback({
            scroll: scrollY,
            limit,
            direction: scrollY > (lenisInstance?.scroll || 0) ? 'down' : 'up',
            velocity: 0,
            isScrolling: true,
          });
        };
        window.addEventListener('scroll', handler, { passive: true });
      }
    },
    
    off: () => {},
    
    scrollTo: (target: string | number | HTMLElement) => {
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      } else if (typeof target === 'string') {
        const element = document.querySelector(target);
        element?.scrollIntoView({ behavior: 'smooth' });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    },
    
    stop: () => {},
    start: () => {},
    destroy: () => {
      isInitialized = false;
    },
  };
}

// =====================================================
// LENIS INSTANCE GETTER
// =====================================================

export function getLenisInstance(): LenisInstance | null {
  return lenisInstance;
}

export function destroyLenisInstance(): void {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
    isInitialized = false;
  }
}

// =====================================================
// SCROLL HELPERS
// =====================================================

export function scrollTo(
  target: string | number | HTMLElement,
  options?: {
    offset?: number;
    duration?: number;
    immediate?: boolean;
    easing?: (t: number) => number;
  }
): Promise<void> {
  return new Promise((resolve) => {
    if (!lenisInstance) {
      resolve();
      return;
    }
    
    lenisInstance.scrollTo(target, {
      offset: options?.offset ?? 0,
      duration: options?.duration ?? 1,
      immediate: options?.immediate ?? false,
      easing: options?.easing ?? EasingFunctions.smooth,
    });
    
    setTimeout(resolve, (options?.duration ?? 1) * 1000 + 100);
  });
}

export function scrollToTop(options?: { duration?: number; easing?: (t: number) => number }) {
  return scrollTo(0, options);
}

export function scrollToBottom(options?: { duration?: number; easing?: (t: number) => number }) {
  return scrollTo(document.body.scrollHeight, options);
}

// =====================================================
// SCROLL STATE UTILITIES
// =====================================================

export function getScrollPosition(): number {
  return lenisInstance?.scroll ?? (typeof window !== 'undefined' ? window.scrollY : 0);
}

export function getScrollProgress(): number {
  if (typeof window === 'undefined') return 0;
  
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollHeight <= 0) return 0;
  
  const scrollY = lenisInstance?.scroll ?? window.scrollY;
  return Math.min(Math.max(scrollY / scrollHeight, 0), 1);
}

export function isScrolling(): boolean {
  return lenisInstance?.isScrolling ?? false;
}

export function isAtTop(): boolean {
  return (lenisInstance?.scroll ?? 0) <= 0;
}

export function isAtBottom(): boolean {
  if (typeof window === 'undefined') return false;
  
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollY = lenisInstance?.scroll ?? window.scrollY;
  return scrollY >= scrollHeight - 1;
}

// =====================================================
// STOP/RESUME SCROLLING
// =====================================================

export function stopScrolling(): void {
  lenisInstance?.stop();
}

export function resumeScrolling(): void {
  lenisInstance?.start();
}

export function refreshScroller(): void {
  lenisInstance?.raf(performance.now());
}

// =====================================================
// MOBILE-SPECIFIC CONFIGURATIONS
// =====================================================

export const MobileConfig: LenisConfig = {
  duration: 0.8,
  easing: EasingFunctions.smooth,
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: false,
  touchMultiplier: 1.5,
};

export const DesktopConfig: LenisConfig = {
  duration: 1.4,
  easing: EasingFunctions.cinematic,
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  touchMultiplier: 2,
};

// =====================================================
// DETECT DEVICE TYPE
// =====================================================

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// =====================================================
// CREATE DEVICE-SPECIFIC INSTANCE
// =====================================================

export async function createOptimizedLenis(): Promise<LenisInstance | null> {
  const config = isMobileDevice() ? MobileConfig : DesktopConfig;
  return initializeLenis(config);
}

// =====================================================
// SCROLL DIRECTION DETECTION
// =====================================================

export type ScrollDirection = 'up' | 'down' | null;

export function getScrollDirection(): ScrollDirection {
  return lenisInstance?.direction ?? null;
}

// =====================================================
// OVERSCROLL HANDLING
// =====================================================

export function preventOverscroll(): void {
  if (typeof document !== 'undefined') {
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';
  }
}

export function allowOverscroll(): void {
  if (typeof document !== 'undefined') {
    document.body.style.overscrollBehavior = 'auto';
    document.documentElement.style.overscrollBehavior = 'auto';
  }
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  initializeLenis,
  createOptimizedLenis,
  getLenisInstance,
  destroyLenisInstance,
  scrollTo,
  scrollToTop,
  scrollToBottom,
  getScrollPosition,
  getScrollProgress,
  isScrolling,
  isAtTop,
  isAtBottom,
  stopScrolling,
  resumeScrolling,
  refreshScroller,
  getScrollDirection,
  preventOverscroll,
  allowOverscroll,
  isMobileDevice,
  isTouchDevice,
  EasingFunctions,
  MobileConfig,
  DesktopConfig,
};