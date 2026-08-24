/**
 * ============================================================
 * DailyStack — Ripple Projection (Butterfly Effect) v1.0
 * ============================================================
 * Sprint 5: Interactive Premium - What-if Simulator
 * 
 * When user long-presses on a transaction, shows ripple effect
 * projecting how this expense impacts future goals.
 * 
 * Design Specs:
 * - Ripple waves emanate from touch point
 * - Shows projected impact on savings/goals
 * - ELITE tier feature indicator
 * - Calming animation, not alarming
 */

import { useState, useRef, useCallback, memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { motionTokens, toSeconds, easing } from '../motion-tokens';
import { TrendingDown, Target, Calendar, Sparkles } from 'lucide-react';
import { Language } from '../../data/translations';
import { haptics } from '../../services/hapticService';

interface RippleProjectionProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    merchant: string;
    amount: number;
    category: string;
    date: string;
  } | null;
  lang: Language;
  userGoals?: Array<{
    name: string;
    target: number;
    current: number;
    deadline: string;
  }>;
  monthlyBudget?: number;
}

export const RippleProjection = memo(function RippleProjection({
  isOpen,
  onClose,
  transaction,
  lang,
  userGoals = [
    { name: 'Emergency Fund', target: 50000, current: 32500, deadline: '2026-09' },
    { name: 'Vacation Fund', target: 25000, current: 12500, deadline: '2026-12' },
  ],
  monthlyBudget = 5000,
}: RippleProjectionProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout>();

  // Calculate impact projections
  const calculateImpact = useCallback(() => {
    if (!transaction) return null;

    const amount = Math.abs(transaction.amount);
    
    // How many days this affects savings goal
    const dailySavings = monthlyBudget / 30;
    const daysDelayed = Math.floor(amount / dailySavings);
    
    // Impact on each goal
    const goalImpacts = userGoals.map(goal => {
      const dailyContribution = (goal.target - goal.current) / 
        (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      const daysToGoal = (goal.target - goal.current) / dailyContribution;
      
      return {
        name: goal.name,
        current: goal.current,
        target: goal.target,
        daysDelayed: Math.floor(daysDelayed),
        newDeadline: new Date(Date.now() + (daysToGoal + daysDelayed) * 24 * 60 * 60 * 1000),
        percentageDelayed: Math.round((daysDelayed / daysToGoal) * 100),
      };
    });

    return {
      amount,
      daysDelayed,
      goalImpacts,
      monthlyBudget,
    };
  }, [transaction, userGoals, monthlyBudget]);

  const impact = calculateImpact();

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    haptics.fire('SELECT');

    // Start ripple animation
    longPressTimerRef.current = setTimeout(() => {
      // Trigger long press action
      haptics.fire('THUD');
      setRipples([
        { id: Date.now(), x: touch.clientX, y: touch.clientY },
      ]);
    }, 500); // 500ms long press threshold
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    // Close projection if no ripple was shown
    if (ripples.length === 0 && !isOpen) {
      onClose();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStart({ x: e.clientX, y: e.clientY });
    haptics.fire('SELECT');

    longPressTimerRef.current = setTimeout(() => {
      haptics.fire('THUD');
      setRipples([{ id: Date.now(), x: e.clientX, y: e.clientY }]);
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    if (ripples.length === 0 && !isOpen) {
      onClose();
    }
  };

  // Add more ripples over time
  const addRipple = () => {
    if (touchStart && ripples.length < 5) {
      setRipples(prev => [...prev, { id: Date.now(), x: touchStart.x, y: touchStart.y }]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && transaction && impact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[150] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(11, 15, 10, 0.9)', backdropFilter: 'blur(20px)' }}
          onClick={onClose}
        >
          {/* Ripple Effects */}
          {ripples.map((ripple, index) => (
            <motion.div
              key={ripple.id}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: toSeconds(motionTokens.duration.slower), delay: index * 0.2 }}
              className="absolute w-32 h-32 rounded-full pointer-events-none"
              style={{
                left: ripple.x,
                top: ripple.y,
                transform: 'translate(-50%, -50%)',
                border: '2px solid var(--color-lime)',
                boxShadow: '0 0 30px rgba(86, 190, 137, 0.3)',
              }}
              onAnimationComplete={addRipple}
            />
          ))}

          {/* Projection Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ delay: toSeconds(motionTokens.duration.fast), type: 'spring', stiffness: 300 }}
            className="relative max-w-sm w-full mx-4 p-6 rounded-3xl"
            style={{
              backgroundColor: '#1A1A1A',
              border: '1px solid rgba(86, 190, 137, 0.2)',
              boxShadow: '0 0 60px rgba(86, 190, 137, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ELITE Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
              style={{
                background: 'linear-gradient(90deg, var(--color-elite), #FFA500)',
                color: '#0B0F0A',
              }}
            >
              <Sparkles className="w-3 h-3" />
              ELITE Feature
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(86, 190, 137, 0.1)',
                  border: '1px solid rgba(86, 190, 137, 0.3)',
                }}
              >
                <TrendingDown className="w-8 h-8" style={{ color: '#56be89' }} />
              </motion.div>
              
              <h2 className="text-xl font-bold text-white mb-1">
                {lang === 'th' ? 'ผลกระทบในอนาคต' : 'Future Impact'}
              </h2>
              <p className="text-sm text-white/60">
                {lang === 'th' 
                  ? `${transaction.merchant} ฿${impact.amount.toLocaleString()}`
                  : `${transaction.merchant} ฿${impact.amount.toLocaleString()}`}
              </p>
            </div>

            {/* Impact Summary */}
            <div className="bg-white/5 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/80">
                  {lang === 'th' 
                    ? `เลื่อนเป้าหมายออกไป ${impact.daysDelayed} วัน`
                    : `Pushes goals back ${impact.daysDelayed} days`}
                </span>
              </div>
              
              <div className="text-xs text-white/40">
                {lang === 'th'
                  ? 'การใช้จ่ายนี้ส่งผลต่อแผนการออมของคุณ'
                  : 'This expense affects your savings plan'}
              </div>
            </div>

            {/* Goal Impacts */}
            <div className="space-y-3 mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
                {lang === 'th' ? 'ผลกระทบต่อเป้าหมาย' : 'Goal Impacts'}
              </h3>
              
              {impact.goalImpacts.map((goal, index) => (
                <motion.div
                  key={goal.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5">
                    <Target className="w-4 h-4" style={{ color: 'var(--color-lime)' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-white font-medium">{goal.name}</span>
                      <span className="text-xs text-amber-400">
                        +{goal.percentageDelayed}%
                      </span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                        transition={{ delay: toSeconds(motionTokens.duration.fast) + index * 0.1, duration: toSeconds(motionTokens.duration.normal) }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: 'var(--color-lime)' }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-sm font-medium"
              style={{
                backgroundColor: 'rgba(86, 190, 137, 0.1)',
                color: '#56be89',
                border: '1px solid rgba(86, 190, 137, 0.2)',
              }}
            >
              {lang === 'th' ? 'เข้าใจแล้ว' : 'Got it'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// Long press hook for triggering ripple projection
export function useLongPress(callback: () => void, delay: number = 500) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const targetRef = useRef<EventTarget>();

  const start = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.persist();
    targetRef.current = e.target;
    
    timeoutRef.current = setTimeout(() => {
      callback();
    }, delay);
  }, [callback, delay]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
  };
}
