import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from '../data/translations';

interface SlideToUpgradeProps {
  onSlideComplete: () => void;
  lang: Language;
  tierColor: string; // e.g. '#C7FF2E' or '#FFD700'
  isLoading?: boolean;
  disabled?: boolean;
}

export default function SlideToUpgrade(props: SlideToUpgradeProps) {
  const {
    onSlideComplete,
    lang,
    tierColor,
    isLoading = false,
    disabled = false,
  } = props;
  const t = translations[lang];
  const trackRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const startXRef = useRef(0);
  const isDisabled = isLoading || disabled;

  useEffect(() => {
    if (trackRef.current) {
      setTrackWidth(trackRef.current.offsetWidth - 56); // 56 = thumb width
    }
  }, []);

  const handleMove = (clientX: number) => {
    if (isComplete || isDisabled) return;
    const dx = clientX - startXRef.current;
    const clamped = Math.max(0, Math.min(dx, trackWidth));
    setSliderPos(clamped);
    if (clamped >= trackWidth - 8) {
      setIsComplete(true);
      onSlideComplete();
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isComplete || isDisabled) return;
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX - sliderPos;
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isComplete || isDisabled) return;
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX - sliderPos;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const handleEnd = () => {
      setIsDragging(false);
      // Snap back if not completed
      if (!isComplete) {
        setSliderPos(0);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, isComplete, isDisabled]);

  const progress = trackWidth > 0 ? (sliderPos / trackWidth) * 100 : 0;

  return (
    <div className="w-full">
      {/* Hint text */}
      <p className="text-center text-[10px] text-white/40 font-mono mb-3 uppercase tracking-widest">
        {isComplete
          ? lang === 'en'
            ? 'Access Granted'
            : 'เข้าถึงแล้ว'
          : lang === 'en'
          ? 'Slide to Transform'
          : 'เลื่อนเพื่อเปลี่ยนผ่าน'}
      </p>

      {/* Track */}
      <div
        ref={trackRef}
        className={`
          relative h-14 rounded-2xl overflow-hidden cursor-pointer select-none
          transition-all duration-300
          ${isComplete
            ? 'bg-[#C7FF2E]/20 border border-[#C7FF2E]/40'
            : 'bg-[#1A1B1E] border border-[#2B2D31]'}
        `}
        onClick={() => {
          if (!isComplete && !isDisabled && sliderPos === 0) {
            setSliderPos(trackWidth * 0.9);
            setIsComplete(true);
            onSlideComplete();
          }
        }}
      >
        {/* Progress fill */}
        <div
          className="absolute inset-0 transition-all duration-75"
          style={{
            width: `${Math.max(progress, isComplete ? 100 : 0)}%`,
            background: isComplete
              ? `linear-gradient(90deg, ${tierColor}22 0%, ${tierColor}33 100%)`
              : `linear-gradient(90deg, ${tierColor}15 0%, ${tierColor}22 100%)`,
            borderRadius: 'inherit',
          }}
        />

        {/* Text hint (slides away) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200"
          style={{ opacity: isComplete ? 0 : 1 - progress / 100 }}
        >
          <span className="text-xs font-mono text-white/30 uppercase tracking-widest">
            {lang === 'en' ? '→ Slide to Upgrade' : '→ เลื่อนเพื่ออัพเกรด'}
          </span>
        </div>

        {/* Success state */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="flex items-center gap-2 animate-slide-success rounded-2xl px-6 py-3">
                <Sparkles
                  className="w-4 h-4 animate-pulse"
                  style={{ color: tierColor }}
                />
                <span
                  className="font-display font-extrabold text-sm uppercase tracking-wider"
                  style={{ color: tierColor }}
                >
                  {lang === 'en' ? 'Access Granted' : 'เข้าถึงแล้ว'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thumb */}
        {!isComplete && (
          <div
            className={`
              absolute top-1 left-1 w-12 h-12 rounded-xl flex items-center justify-center
              transition-shadow duration-200 cursor-grab active:cursor-grabbing
              ${isDisabled
                ? 'bg-[#2B2D31] cursor-not-allowed'
                : isDragging
                ? 'bg-[#C7FF2E] shadow-[0_0_20px_rgba(199,255,46,0.4)] cursor-grabbing'
                : 'bg-[#1E1F22] border border-[#3A3C40] hover:border-[#C7FF2E]/50'}
            `}
            style={{
              transform: `translateX(${sliderPos}px)`,
              boxShadow: isDragging
                ? `0 0 20px ${tierColor}66, 0 4px 12px rgba(0,0,0,0.4)`
                : '0 2px 8px rgba(0,0,0,0.3)',
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {isLoading ? (
              <div
                className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: `${tierColor}44`, borderTopColor: tierColor }}
              />
            ) : (
              <ArrowRight
                className="w-4 h-4"
                style={{ color: isDragging ? '#0C0D0E' : '#888' }}
              />
            )}
          </div>
        )}
      </div>

      {/* Sub-hint */}
      <p className="text-center text-[9px] text-white/25 font-mono mt-2">
        {lang === 'en' ? 'Swipe or tap to confirm' : 'เลื่อนหรือกดเพื่อยืนยัน'}
      </p>
    </div>
  );
}