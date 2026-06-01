/**
 * DailyStack — Mobile Gesture System (v1.0)
 * Phase 5: Lenis Smooth Scroll + Mobile Gesture System
 * 
 * Features:
 * - Swipe gestures with momentum
 * - Pull-to-refresh
 * - Drag interactions
 * - Touch feedback system
 * - Physics-based animations
 * - Premium tactile feel
 */

import { useCallback, useRef, useState } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export type GestureDirection = 'left' | 'right' | 'up' | 'down' | null;

export interface SwipeGestureConfig {
  threshold?: number;
  velocityThreshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: (direction: GestureDirection) => void;
}

export interface DragGestureConfig {
  springConfig?: { stiffness: number; damping: number; mass?: number };
  bounds?: { left: number; right: number; top: number; bottom: number };
  onDragStart?: () => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
}

export interface PullGestureConfig {
  threshold?: number;
  onPullStart?: () => void;
  onPullEnd?: (distance: number) => void;
  enabled?: boolean;
}

// =====================================================
// SPRING CONFIGS
// =====================================================

export const SpringConfigs = {
  snappy: { stiffness: 400, damping: 30, mass: 0.8 },
  smooth: { stiffness: 200, damping: 25, mass: 1 },
  bouncy: { stiffness: 300, damping: 20, mass: 0.9 },
  heavy: { stiffness: 150, damping: 35, mass: 1.5 },
  stiff: { stiffness: 500, damping: 40, mass: 0.6 },
};

// =====================================================
// SWIPE GESTURE HOOK
// =====================================================

export function useSwipeGesture(config: SwipeGestureConfig) {
  const {
    threshold = 100,
    velocityThreshold = 500,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipeStart,
    onSwipeEnd,
  } = config;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const [isDragging, setIsDragging] = useState(false);

  const springX = useSpring(x, SpringConfigs.smooth);
  const springY = useSpring(y, SpringConfigs.smooth);

  // Helper function to get rotation from x position
  const getRotation = (xVal: number) => Math.max(-15, Math.min(15, xVal / 13.33));
  
  // Helper function to get opacity based on distance
  const getOpacity = (xVal: number) => Math.max(0.5, Math.min(1, 1 - Math.abs(xVal) / 400));

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    onSwipeStart?.();
  }, [onSwipeStart]);

  const handleDragEnd = useCallback((_: any, info: any) => {
    setIsDragging(false);
    
    const offsetX = info.offset.x;
    const offsetY = info.offset.y;
    const velocityX = info.velocity.x;
    const velocityY = info.velocity.y;
    
    let direction: GestureDirection = null;
    
    if (Math.abs(offsetX) > threshold || Math.abs(velocityX) > velocityThreshold) {
      if (offsetX > 0 || velocityX > velocityThreshold) {
        direction = 'right';
        onSwipeRight?.();
      } else {
        direction = 'left';
        onSwipeLeft?.();
      }
    } else if (Math.abs(offsetY) > threshold || Math.abs(velocityY) > velocityThreshold) {
      if (offsetY > 0 || velocityY > velocityThreshold) {
        direction = 'down';
        onSwipeDown?.();
      } else {
        direction = 'up';
        onSwipeUp?.();
      }
    }
    
    onSwipeEnd?.(direction);
  }, [threshold, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipeEnd]);

  return {
    x,
    y,
    springX,
    springY,
    getRotation,
    getOpacity,
    isDragging,
    handlers: {
      drag: true,
      dragElastic: 0.7,
      dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
    },
  };
}

// =====================================================
// DRAG GESTURE HOOK
// =====================================================

export function useDragGesture(config: DragGestureConfig) {
  const {
    springConfig = SpringConfigs.smooth,
    bounds,
    onDragStart,
    onDragEnd,
  } = config;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleDragStart = useCallback(() => {
    onDragStart?.();
  }, [onDragStart]);

  const handleDragEnd = useCallback((_: any, info: any) => {
    onDragEnd?.({ x: info.point.x, y: info.point.y });
  }, [onDragEnd]);

  return {
    x,
    y,
    springX,
    springY,
    handlers: {
      drag: true,
      dragConstraints: bounds || undefined,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
    },
  };
}

// =====================================================
// PULL-TO-REFRESH HOOK
// =====================================================

export function usePullToRefresh(config: PullGestureConfig) {
  const {
    threshold = 80,
    onPullStart,
    onPullEnd,
    enabled = true,
  } = config;

  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Calculate progress as a derived value
  const getPullProgress = () => Math.max(0, Math.min(1, pullDistance / threshold));

  const handlePullStart = useCallback(() => {
    if (!enabled || isRefreshing) return;
    setIsPulling(true);
    onPullStart?.();
  }, [enabled, isRefreshing, onPullStart]);

  const handlePullMove = useCallback((dy: number) => {
    if (!isPulling || dy < 0) return;
    setPullDistance(Math.min(dy, threshold * 1.5));
  }, [isPulling, threshold]);

  const handlePullEnd = useCallback(() => {
    if (!isPulling) return;
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      onPullEnd?.(pullDistance);
      
      setTimeout(() => {
        setPullDistance(0);
        setIsRefreshing(false);
      }, 1000);
    } else {
      setPullDistance(0);
    }
    
    setIsPulling(false);
  }, [isPulling, pullDistance, threshold, onPullEnd]);

  return {
    pullDistance,
    getPullProgress,
    isPulling,
    isRefreshing,
    handlers: {
      onTouchStart: handlePullStart,
      onTouchMove: (e: React.TouchEvent) => handlePullMove(e.touches[0].clientY),
      onTouchEnd: handlePullEnd,
    },
  };
}

// =====================================================
// TOUCH FEEDBACK HOOK
// =====================================================

export function useTouchFeedback() {
  const [isPressed, setIsPressed] = useState(false);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const tapStartTimeRef = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent | TouchEvent) => {
    const touch = e.touches[0];
    tapStartTimeRef.current = Date.now();
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
    setIsPressed(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent | TouchEvent) => {
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

  const isTap = useCallback(() => {
    const duration = Date.now() - tapStartTimeRef.current;
    return duration < 300;
  }, []);

  return {
    isPressed,
    touchPosition,
    isTap,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

// =====================================================
// HAPTIC FEEDBACK UTILITY
// =====================================================

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const patterns: Record<string, number[]> = {
      light: [10],
      medium: [20],
      heavy: [30, 10, 30],
    };
    navigator.vibrate(patterns[type] || [10]);
  }
}

// =====================================================
// LONG PRESS GESTURE HOOK
// =====================================================

export function useLongPress(
  callback: () => void,
  duration: number = 500
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    timeoutRef.current = setTimeout(() => {
      callback();
      triggerHaptic('medium');
    }, duration);
  }, [callback, duration]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchCancel: cancel,
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
  };
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  useSwipeGesture,
  useDragGesture,
  usePullToRefresh,
  useTouchFeedback,
  useLongPress,
  triggerHaptic,
  SpringConfigs,
};