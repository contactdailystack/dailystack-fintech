/**
 * Motion Showcase - Cinematic Transitions & Interactive Previews
 * Demonstrates the premium motion and interaction design
 */
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { BRAND, MOTION, animationVariants } from './constants';

// Icon Components
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const LightningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.5 2L11.5 9.5L19 11.5L11.5 13.5L9.5 21L7.5 13.5L0 11.5L7.5 9.5L9.5 2Z"/>
  </svg>
);

const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

// Animated UI Card Component
interface MotionCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  delay?: number;
  accentColor?: string;
}

function MotionCard({ title, subtitle, icon, delay = 0, accentColor = BRAND.primary }: MotionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.4, 0.25, 1] }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 40px ${accentColor}30`,
      }}
      className="glass-panel p-6 cursor-pointer"
      style={{
        background: '#232D38',
      }}
    >
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${accentColor}20`, color: accentColor }}
      >
        {icon}
      </div>
      <h4 className="text-lg font-semibold text-white mb-1">{title}</h4>
      <p className="text-white/50 text-sm">{subtitle}</p>
    </motion.div>
  );
}

// Notification Animation Component
function NotificationDemo() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      ref={ref}
      className="glass-panel p-4 flex items-center gap-4"
      style={{
        y,
        opacity,
        background: '#232D38',
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: BRAND.primary }}
      >
        <CheckIcon />
      </motion.div>
      <div>
        <div className="text-white font-medium text-sm">Task Completed!</div>
        <div className="text-white/50 text-xs">Weekly review finished</div>
      </div>
    </motion.div>
  );
}

// Floating Layers Demo
function FloatingLayers() {
  const layers = [
    { delay: 0, y: 0, scale: 1, opacity: 1 },
    { delay: 0.1, y: -15, scale: 0.95, opacity: 0.8 },
    { delay: 0.2, y: -30, scale: 0.9, opacity: 0.6 },
  ];

  return (
    <div className="relative h-48">
      {layers.map((layer, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: layer.opacity, y: layer.y, scale: layer.scale }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: layer.delay }}
          className="absolute inset-0 glass-panel flex items-center justify-center"
          style={{
            background: index === 0 
              ? '#232D38' 
              : `rgba(35, 45, 56, ${0.9 - index * 0.1})`,
            borderColor: `rgba(255, 255, 255, ${0.1 - index * 0.03})`,
          }}
        >
          <span className="text-white/40 text-sm font-medium">
            Layer {index + 1}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export function MotionShowcase() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const motionFeatures = [
    {
      title: 'Smooth Scrolling',
      subtitle: 'Butter-smooth navigation with Lenis',
      icon: <SparklesIcon />,
      accentColor: BRAND.primary,
    },
    {
      title: 'Instant Feedback',
      subtitle: 'Sub-100ms response to every action',
      icon: <LightningIcon />,
      accentColor: '#FFD24D',
    },
    {
      title: 'Smart Notifications',
      subtitle: 'Context-aware, non-intrusive alerts',
      icon: <BellIcon />,
      accentColor: '#5CC3FF',
    },
    {
      title: 'Fluid Transitions',
      subtitle: 'Cinematic page transitions',
      icon: <MessageIcon />,
      accentColor: '#8A4CFF',
    },
  ];

  return (
    <section 
      ref={containerRef}
      className="relative py-24 md:py-32 overflow-hidden"
      style={{ background: BRAND.darkBase }}
    >
      {/* Animated Background */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0"
      >
        <div 
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: BRAND.primary }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ background: '#8A4CFF' }}
        />
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span 
            className="inline-block text-sm font-semibold tracking-wider uppercase mb-4"
            style={{ color: BRAND.primary }}
          >
            Motion Design
          </span>
          <h2 
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            style={{ lineHeight: '1.1' }}
          >
            Feel the difference
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Every interaction is crafted to feel natural, responsive, and delightful.
          </p>
        </motion.div>

        {/* Motion Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {motionFeatures.map((feature, index) => (
            <MotionCard
              key={feature.title}
              title={feature.title}
              subtitle={feature.subtitle}
              icon={feature.icon}
              accentColor={feature.accentColor}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Interactive Demos Row */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Floating Layers */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-panel p-8"
            style={{ background: 'rgba(31, 38, 46, 0.8)' }}
          >
            <h3 className="text-lg font-semibold text-white mb-6">Floating Depth</h3>
            <FloatingLayers />
            <p className="text-white/40 text-sm mt-4">
              Subtle parallax creates a sense of depth and hierarchy.
            </p>
          </motion.div>

          {/* Notification Demo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-panel p-8"
            style={{ background: 'rgba(31, 38, 46, 0.8)' }}
          >
            <h3 className="text-lg font-semibold text-white mb-6">Scroll Animations</h3>
            <div className="space-y-4">
              <NotificationDemo />
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="glass-panel p-4"
                style={{ background: 'rgba(50, 59, 72, 0.9)' }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: `${BRAND.primary}20` }}
                  >
                    <SparklesIcon />
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">New Insight</div>
                    <div className="text-white/50 text-xs">2 tasks optimized</div>
                  </div>
                </div>
              </motion.div>
            </div>
            <p className="text-white/40 text-sm mt-4">
              Content reveals on scroll with spring physics.
            </p>
          </motion.div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4">
            <span className="text-white/30 text-sm font-medium">Scroll to explore</span>
            <div className="w-32 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ 
                  background: BRAND.primary,
                  scaleX: smoothProgress,
                  transformOrigin: 'left',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}