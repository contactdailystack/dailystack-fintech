import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useHaptics } from '../services/hapticService';
import { motionTokens } from '../design-system/motion-tokens';
import { translations, Language } from '../data/translations';

interface SlideToUpgradeProps {
  onSlideComplete: () => void;
  lang?: Language;
  tierColor: string; // e.g. '#56be89' or '#FFD700'
  isLoading?: boolean;
  disabled?: boolean;
}

export default function SlideToUpgrade(props: SlideToUpgradeProps) {
  const { onSlideComplete, lang = 'en', tierColor, isLoading = false, disabled = false } = props;
  const t = translations[lang];
  const reduceMotion = useReducedMotion() ?? false;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLDivElement | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [pos, setPos] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [completed, setCompleted] = useState(false);
  const startX = useRef(0);
  const isDisabled = isLoading || disabled || completed;

  useEffect(() => {
    const resize = () => {
      if (!trackRef.current) return;
      const w = trackRef.current.offsetWidth - 56; // thumb width approx
      setTrackWidth(w > 0 ? w : 0);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const clamp = (v: number) => Math.max(0, Math.min(v, trackWidth));
  const { fire } = useHaptics();

  const handleStart = (clientX: number) => {
    if (isDisabled) return;
    setDragging(true);
    startX.current = clientX - pos;
    try { fire('SELECT'); } catch {};
  };

  const handleMove = (clientX: number) => {
    if (!dragging || isDisabled) return;
    const dx = clientX - startX.current;
    const v = clamp(dx);
    setPos(v);
    if (v >= trackWidth - 8) {
      // complete
      setCompleted(true);
      setPos(trackWidth);
      setDragging(false);
      onSlideComplete();
      try { fire('DEEP_RESONANCE'); } catch {}
    }
  };

  const handleEnd = () => {
    if (isDisabled) return;
    setDragging(false);
    if (!completed) setPos(0);
  };

  useEffect(() => {
    const mm = (e: MouseEvent) => handleMove(e.clientX);
    const mu = () => handleEnd();
    const tm = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const tu = () => handleEnd();
    if (dragging) {
      window.addEventListener('mousemove', mm);
      window.addEventListener('mouseup', mu);
      window.addEventListener('touchmove', tm, { passive: false } as any);
      window.addEventListener('touchend', tu);
    }
    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
      window.removeEventListener('touchmove', tm as any);
      window.removeEventListener('touchend', tu);
    };
  }, [dragging, trackWidth, completed]);

  const progress = trackWidth > 0 ? (pos / trackWidth) * 100 : 0;

  return (
    <div className="w-full">
      <p className="text-center text-[10px] text-white/40 font-mono mb-3 uppercase tracking-widest">
        {completed ? 'Access Granted' : reduceMotion ? t.slideConfirm : t.slideUpgrade}
      </p>

      {/* Reduced motion: tap-to-confirm button instead of slide gesture */}
      {reduceMotion ? (
        <button
          type="button"
          onClick={() => {
            if (isDisabled || completed) return;
            setCompleted(true);
            onSlideComplete();
          }}
          disabled={isDisabled || completed}
          aria-label={t.slideConfirm}
          className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-mono text-sm uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56be89] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
            completed ? 'text-white/40' : 'text-white/30'
          } ${isDisabled || completed ? 'cursor-not-allowed opacity-50' : ''}`}
          style={{
            background: completed
              ? `linear-gradient(90deg, ${tierColor}22 0%, ${tierColor}33 100%)`
              : '#1A1B1E',
            border: completed ? `1px solid ${tierColor}44` : '1px solid #2B2D31',
          }}
        >
          <Sparkles className="w-4 h-4" style={{ color: completed ? tierColor : '#555' }} />
          <span style={{ color: completed ? tierColor : undefined }}>
            {completed
              ? (lang === 'en' ? 'Access Granted' : '?????????????')
              : t.slideConfirm}
          </span>
        </button>
      ) : (
        /* Normal: slide gesture */
        <div
          ref={trackRef}
          className={`relative h-14 rounded-2xl overflow-hidden select-none ${completed ? 'bg-[#56be89]/20 border border-[#56be89]/40' : 'bg-[#1A1B1E] border border-[#2B2D31]'}`}
          tabIndex={0}
          role="group"
          aria-label={t.slideConfirm}
          aria-disabled={isDisabled ? 'true' : 'false'}
          onKeyDown={(e) => {
            if (isDisabled) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!completed && pos === 0) {
                setPos(trackWidth);
                setCompleted(true);
                onSlideComplete();
              }
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              if (!completed) setPos(0);
            }
          }}
          onClick={() => {
            if (!completed && !isDisabled && pos === 0) {
              setPos(trackWidth);
              setCompleted(true);
              onSlideComplete();
            }
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              width: `${Math.max(progress, completed ? 100 : 0)}%`,
              transitionProperty: 'width',
              transitionDuration: motionTokens.duration.fast,
              background: completed ? `linear-gradient(90deg, ${tierColor}22 0%, ${tierColor}33 100%)` : `linear-gradient(90deg, ${tierColor}15 0%, ${tierColor}22 100%)`,
              borderRadius: 'inherit',
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: completed ? 0 : 1 - progress / 100, transitionDuration: motionTokens.duration.fast }}>
            <span className="text-xs font-mono text-white/30 uppercase tracking-widest">? {t.slideUpgrade}</span>
          </div>

          {completed && (
            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={reduceMotion ? { duration: 0 } : undefined}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="flex items-center gap-2 rounded-2xl px-6 py-3">
                <Sparkles className={`w-4 h-4 ${reduceMotion ? '' : 'animate-pulse'}`} style={{ color: tierColor }} />
                <span className="font-display font-extrabold text-sm uppercase tracking-wider" style={{ color: tierColor }}>{lang === 'en' ? 'Access Granted' : '?????????????'}</span>
              </div>
            </motion.div>
          )}

          {/* Thumb */}
          <div
            ref={thumbRef}
            role="button"
            tabIndex={0}
            aria-label={t.slideConfirm}
            aria-disabled={isDisabled ? 'true' : 'false'}
            className={`absolute top-1 left-1 w-12 h-12 rounded-xl flex items-center justify-center ${dragging ? 'cursor-grabbing' : 'cursor-pointer'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56be89] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent`}
            style={{
              transform: `translateX(${pos}px)`,
              transitionProperty: 'transform',
              transitionDuration: motionTokens.duration.fast,
              background: dragging ? tierColor : '#1E1F22',
              boxShadow: dragging ? `0 0 20px ${tierColor}66, 0 4px 12px rgba(0,0,0,0.4)` : '0 2px 8px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.04)'
            }}
            onKeyDown={(e) => {
              if (isDisabled) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!completed && pos === 0) {
                  setPos(trackWidth);
                  setCompleted(true);
                  onSlideComplete();
                }
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                if (!completed) setPos(0);
              }
            }}
            onMouseDown={(e) => handleStart(e.clientX)}
            onTouchStart={(e) => handleStart(e.touches[0].clientX)}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: `${tierColor}44`, borderTopColor: tierColor }} />
            ) : (
              <ArrowRight className="w-4 h-4" style={{ color: dragging ? '#0B0F0A' : '#888' }} />
            )}
          </div>
        </div>
      )}

      <p className="text-center text-[10px] text-white/25 font-mono mt-2">
        {reduceMotion ? '' : t.swipeConfirm}
      </p>
    </div>
  );
}