/**
 * DailyStack — Swipe Gesture Component
 * Tinder-style drag-to-swipe with spring physics
 * 
 * Features:
 * - Drag in any direction
 * - Velocity-based throw
 * - Visual feedback (Like/Pass/Super labels)
 * - Spring physics animation
 * - Rotation while dragging
 */

import React, { useState, useRef, useCallback } from 'react';
import { Heart, X, Star } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type SwipeDirection = 'left' | 'right' | 'super' | null;

interface SwipeGestureProps {
  children: React.ReactNode;
  onSwipe: (direction: SwipeDirection) => void;
  threshold?: number; // Distance to trigger swipe (default: 100)
  superThreshold?: number; // Distance for super like (default: -80, up)
  rotationFactor?: number; // Degrees per pixel (default: 0.1)
  maxRotation?: number; // Max rotation degrees (default: 15)
  enabled?: boolean;
}

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

// ─── Swipe Label Overlay ────────────────────────────────────────────────────────
interface SwipeLabelProps {
  type: 'like' | 'pass' | 'super';
  opacity: number;
  rotation: number;
}
const SwipeLabel: React.FC<SwipeLabelProps> = ({ type, opacity, rotation }) => {
  if (opacity < 0.1) return null;
  
  const configs = {
    like: {
      icon: Heart,
      label: 'LIKE',
      bg: 'bg-[#22C55E]',
      border: 'border-[#22C55E]',
      text: 'text-white',
      rotation: -20,
    },
    pass: {
      icon: X,
      label: 'NOPE',
      bg: 'bg-[#EF4444]',
      border: 'border-[#EF4444]',
      text: 'text-white',
      rotation: 20,
    },
    super: {
      icon: Star,
      label: 'SUPER',
      bg: 'bg-[#FFD700]',
      border: 'border-[#FFD700]',
      text: 'text-[#0D1117]',
      rotation: 0,
    },
  };
  
  const config = configs[type];
  const Icon = config.icon;
  
  return (
    <div
      className={`absolute top-8 ${type === 'like' ? 'left-6' : type === 'pass' ? 'right-6' : 'top-2'} 
        ${config.bg} ${config.text} px-4 py-2 rounded-xl border-4 ${config.border}
        flex items-center gap-2 font-black text-sm tracking-wider shadow-lg`}
      style={{
        opacity,
        transform: `translateX(${type === 'like' ? '-50%' : type === 'pass' ? '50%' : '0'}%) rotate(${config.rotation}deg)`,
        pointerEvents: 'none',
      }}
    >
      <Icon size={16} fill="currentColor" />
      {config.label}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const SwipeGesture: React.FC<SwipeGestureProps> = ({
  children,
  onSwipe,
  threshold = 100,
  superThreshold = -80,
  rotationFactor = 0.1,
  maxRotation = 15,
  enabled = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState<Position>({ x: 0, y: 0 });
  const [startTime, setStartTime] = useState(0);
  
  // Track velocity
  const lastPosRef = useRef<Position>({ x: 0, y: 0 });
  const lastTimeRef = useRef(0);
  const velocityRef = useRef<Velocity>({ x: 0, y: 0 });

  // ─── Calculate swipe direction from position ──────────────────────────────
  const getSwipeDirection = useCallback((): SwipeDirection => {
    const { x, y } = position;
    
    // Super like: swipe up enough
    if (y < superThreshold) return 'super';
    
    // Like: swipe right enough
    if (x > threshold) return 'right';
    
    // Pass: swipe left enough
    if (x < -threshold) return 'left';
    
    return null;
  }, [position, threshold, superThreshold]);

  // ─── Calculate label opacities ────────────────────────────────────────────
  const getLabelOpacity = useCallback((type: 'like' | 'pass' | 'super'): number => {
    const { x, y } = position;
    
    switch (type) {
      case 'like':
        return Math.min(1, Math.max(0, x / threshold));
      case 'pass':
        return Math.min(1, Math.max(0, -x / threshold));
      case 'super':
        return Math.min(1, Math.max(0, -y / Math.abs(superThreshold)));
      default:
        return 0;
    }
  }, [position, threshold, superThreshold]);

  // ─── Calculate rotation ───────────────────────────────────────────────────
  const getRotation = useCallback((): number => {
    const rotation = position.x * rotationFactor;
    return Math.max(-maxRotation, Math.min(maxRotation, rotation));
  }, [position, rotationFactor, maxRotation]);

  // ─── Handle drag start ────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!enabled) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    setStartPos({ x: clientX, y: clientY });
    setStartTime(Date.now());
    lastPosRef.current = { x: clientX, y: clientY };
    lastTimeRef.current = Date.now();
    
    // Capture pointer for smooth tracking
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [enabled]);

  // ─── Handle drag move ────────────────────────────────────────────────────
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    // Calculate delta from start
    const deltaX = clientX - startPos.x;
    const deltaY = clientY - startPos.y;
    
    // Update position
    setPosition({ x: deltaX, y: deltaY });
    
    // Calculate velocity
    const now = Date.now();
    const dt = now - lastTimeRef.current;
    if (dt > 0) {
      velocityRef.current = {
        x: (clientX - lastPosRef.current.x) / dt * 1000,
        y: (clientY - lastPosRef.current.y) / dt * 1000,
      };
    }
    lastPosRef.current = { x: clientX, y: clientY };
    lastTimeRef.current = now;
  }, [isDragging, startPos]);

  // ─── Handle drag end ─────────────────────────────────────────────────────
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const direction = getSwipeDirection();
    const velocity = velocityRef.current;
    
    // Check for velocity-based swipe (throw)
    const velocityThreshold = 500;
    const isThrown =
      (direction === 'right' && velocity.x > velocityThreshold) ||
      (direction === 'left' && velocity.x < -velocityThreshold) ||
      (direction === 'super' && velocity.y < -velocityThreshold);
    
    if (direction && isThrown) {
      // Execute swipe with animation
      executeSwipe(direction);
    } else if (direction) {
      // Slow drag - check if past threshold
      const { x, y } = position;
      if (direction === 'right' && x > threshold) {
        executeSwipe('right');
      } else if (direction === 'left' && x < -threshold) {
        executeSwipe('left');
      } else if (direction === 'super' && y < superThreshold) {
        executeSwipe('super');
      } else {
        // Snap back
        resetPosition();
      }
    } else {
      // Snap back
      resetPosition();
    }
  }, [isDragging, getSwipeDirection, position, threshold, superThreshold]);

  // ─── Execute swipe animation ───────────────────────────────────────────────
  const executeSwipe = (direction: SwipeDirection) => {
    if (!direction) return;
    
    // Animate out
    const { x, y } = position;
    let targetX = x;
    let targetY = y;
    
    if (direction === 'right') targetX = 500;
    if (direction === 'left') targetX = -500;
    if (direction === 'super') targetY = -500;
    
    // Quick animation out
    setPosition({ x: targetX, y: targetY });
    
    // Trigger callback after animation
    setTimeout(() => {
      onSwipe(direction);
      resetPosition();
    }, 200);
  };

  // ─── Reset position ───────────────────────────────────────────────────────
  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
  };

  // ─── Spring back animation ───────────────────────────────────────────────
  const springBack = useCallback(() => {
    if (Math.abs(position.x) > 1 || Math.abs(position.y) > 1) {
      setPosition(prev => ({
        x: prev.x * 0.85,
        y: prev.y * 0.85,
      }));
      requestAnimationFrame(springBack);
    } else {
      setPosition({ x: 0, y: 0 });
    }
  }, [position]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Card with transforms */}
      <div
        className={`w-full h-full transition-transform ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) rotate(${getRotation()}deg)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {children}
      </div>

      {/* Like overlay */}
      <SwipeLabel
        type="like"
        opacity={getLabelOpacity('like')}
        rotation={getRotation()}
      />

      {/* Pass overlay */}
      <SwipeLabel
        type="pass"
        opacity={getLabelOpacity('pass')}
        rotation={getRotation()}
      />

      {/* Super overlay */}
      <SwipeLabel
        type="super"
        opacity={getLabelOpacity('super')}
        rotation={0}
      />
    </div>
  );
};

export default SwipeGesture;

// ─── Swipe Action Indicator (for action buttons) ──────────────────────────────
interface SwipeActionIndicatorProps {
  direction: 'like' | 'pass' | 'super';
  active: boolean;
}
export const SwipeActionIndicator: React.FC<SwipeActionIndicatorProps> = ({ direction, active }) => {
  const configs = {
    like: { icon: Heart, color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/20' },
    pass: { icon: X, color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/20' },
    super: { icon: Star, color: 'text-[#FFD700]', bg: 'bg-[#FFD700]/20' },
  };
  
  const config = configs[direction];
  const Icon = config.icon;
  
  return (
    <div className={`w-14 h-14 rounded-full ${config.bg} flex items-center justify-center transition-all
      ${active ? 'scale-125' : 'scale-100'}`}>
      <Icon size={24} className={config.color} fill={direction === 'super' ? 'currentColor' : 'none'} />
    </div>
  );
};