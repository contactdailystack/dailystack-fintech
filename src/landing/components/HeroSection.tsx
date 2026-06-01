/**
 * Hero Section - Editorial Design
 * Clean, typography-first with Medium-inspired aesthetics
 */
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { BRAND, MOTION, animationVariants } from './constants';

// Icons
const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const SparklesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.5 2L11.5 9.5L19 11.5L11.5 13.5L9.5 21L7.5 13.5L0 11.5L7.5 9.5L9.5 2Z"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: '#1C232A' }}
    >
      {/* Subtle Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Main Content */}
      <motion.div 
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
        style={{ y, opacity }}
      >
        {/* Badge */}
        <motion.div
          variants={animationVariants.fadeIn}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 mb-12"
        >
          <span className="text-[#56be89]">
            <SparklesIcon />
          </span>
          <span className="text-sm text-white/70 font-medium tracking-wide">
            AI-Powered Productivity Platform
          </span>
        </motion.div>

        {/* Main Headline - Bold Editorial Typography */}
        <motion.h1
          variants={animationVariants.fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1, duration: MOTION.duration.slower }}
          className="mb-8"
          style={{
            fontSize: 'clamp(3rem, 8vw, 5rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          <span className="text-white">Your Life.</span>
          <br />
          <span className="text-white">
            <span style={{ color: '#56be89' }}>Organized.</span>
          </span>
        </motion.h1>

        {/* Subheadline - Generous Line-height, Muted */}
        <motion.p
          variants={animationVariants.fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2, duration: MOTION.duration.slower }}
          className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto mb-14 leading-[1.7]"
          style={{
            fontWeight: 400,
          }}
        >
          DailyStack brings together AI assistance, smart workflows, and seamless 
          collaboration into one beautifully designed workspace.
        </motion.p>

        {/* CTA Buttons - Clean Editorial Style */}
        <motion.div
          variants={animationVariants.staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Primary Button - Solid Mint */}
          <motion.button
            variants={animationVariants.fadeIn}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg transition-colors duration-300"
            style={{ 
              background: '#56be89',
              color: '#1C232A',
            }}
          >
            Get Started Free
            <ArrowRightIcon />
          </motion.button>

          {/* Secondary Button - Ghost Outlined */}
          <motion.button
            variants={animationVariants.fadeIn}
            whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.06)' }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg border border-white/15 transition-colors duration-300 text-white"
            style={{ background: 'transparent' }}
          >
            <span 
              className="flex items-center justify-center w-7 h-7 rounded-full"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <PlayIcon />
            </span>
            Watch Demo
          </motion.button>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={animationVariants.staggerContainer}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="mt-20 flex flex-wrap items-center justify-center gap-12 md:gap-20"
        >
          {[
            { value: '50K+', label: 'Active Users' },
            { value: '4.9', label: 'App Rating' },
            { value: '99.9%', label: 'Uptime' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={animationVariants.fadeIn}
              className="text-center"
            >
              <div 
                className="text-4xl md:text-5xl font-bold mb-2"
                style={{ color: '#56be89' }}
              >
                {stat.value}
              </div>
              <div className="text-sm text-white/35 font-medium tracking-wide uppercase">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator - Subtle Animation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs text-white/25 font-medium tracking-[0.2em] uppercase">
            Scroll
          </span>
          <div className="w-5 h-8 rounded-full border border-white/15 flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-0.5 h-2 rounded-full bg-white/30"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}