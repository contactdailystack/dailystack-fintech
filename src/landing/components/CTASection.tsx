/**
 * CTA Section - Editorial Restraint Design
 * High contrast, minimal decoration, whitespace as design
 */
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { BRAND } from './constants';

// Icon Components
const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// Motion constants - editorial restraint
const MOTION_SMOOTH = [0.25, 0.4, 0.25, 1] as const;
const MOTION_DURATION = 0.5;
const MOTION_STAGGER = 0.08;

interface CTASectionProps {
  onGetStarted?: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const benefits = [
    '14-day free trial',
    'No credit card required',
    'Cancel anytime',
    '24/7 support',
  ];

  return (
    <section 
      ref={containerRef}
      className="relative py-24 md:py-32 px-6"
      style={{ 
        background: BRAND.darkBase,
      }}
    >
      {/* Subtle radial gradient - mint at 5% opacity max */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 800px 600px at 50% 50%, rgba(86, 190, 137, 0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Main CTA Content */}
        <div className="text-center">
          {/* Headline - Large, bold, editorial */}
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: MOTION_DURATION, ease: MOTION_SMOOTH }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8"
            style={{ lineHeight: '1.05', letterSpacing: '-0.02em' }}
          >
            Ready to transform
            <br />
            <span style={{ color: BRAND.primary }}>your productivity?</span>
          </motion.h2>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ 
              duration: MOTION_DURATION, 
              delay: 0.15,
              ease: MOTION_SMOOTH 
            }}
            className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-12"
          >
            Join over 50,000 professionals who have already made the switch.
            No commitment required.
          </motion.p>

          {/* CTA Button - Solid mint, clean white text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ 
              duration: MOTION_DURATION, 
              delay: 0.3,
              ease: MOTION_SMOOTH 
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              onClick={onGetStarted}
              className="flex items-center gap-3 px-12 py-5 rounded-full font-semibold text-lg text-[#0D1117] transition-all duration-300"
              style={{ 
                background: BRAND.primary,
              }}
            >
              Start Free Trial
              <ArrowRightIcon />
            </motion.button>

            <p className="text-white/40 text-sm">
              or <span className="text-white/60 cursor-pointer hover:text-white hover:opacity-80 transition-opacity duration-200">schedule a demo</span>
            </p>
          </motion.div>

          {/* Benefits - Subtle stagger */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ 
              duration: MOTION_DURATION, 
              delay: 0.45,
              ease: MOTION_SMOOTH 
            }}
            className="flex flex-wrap items-center justify-center gap-8 mt-12"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ 
                  duration: MOTION_DURATION, 
                  delay: 0.6 + index * MOTION_STAGGER,
                  ease: MOTION_SMOOTH 
                }}
                className="flex items-center gap-2 text-sm text-white/50"
              >
                <span style={{ color: BRAND.primary }}>
                  <CheckIcon />
                </span>
                {benefit}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}