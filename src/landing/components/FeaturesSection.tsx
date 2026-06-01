/**
 * Features Section - Clean List Style
 * Minimal flat design with thin-stroke icons and section headers
 */
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { BRAND } from './constants';

// Icon Components - Thin stroke, no backgrounds
const CommandIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
  </svg>
);

const WorkflowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

// Feature Item Component - Clean list style
interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

function FeatureItem({ icon, title, description, delay = 0 }: FeatureItemProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className="flex items-start gap-5 py-5 border-b border-white/5"
    >
      {/* Icon - Thin stroke, muted color */}
      <div className="flex-shrink-0 text-white/30 mt-0.5">
        {icon}
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <h4 className="text-white font-medium mb-1">
          {title}
        </h4>
        <p className="text-white/40 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// Stat Card Component - Minimal style
interface StatCardProps {
  label: string;
  value: string;
  change: string;
  delay?: number;
}

function StatCard({ label, value, change, delay = 0 }: StatCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className="px-5 py-4 border border-white/10 rounded-lg"
    >
      <div className="text-white/40 text-xs mb-1">{label}</div>
      <div className="text-2xl font-semibold text-white mb-1">{value}</div>
      <div className="text-xs font-medium" style={{ color: BRAND.primary }}>
        {change}
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const features = [
    {
      icon: <CommandIcon />,
      title: 'Command Everything',
      description: 'Powerful shortcuts and commands to navigate without leaving your keyboard.',
    },
    {
      icon: <WorkflowIcon />,
      title: 'Automated Workflows',
      description: 'Create intelligent automations that save hours of manual work.',
    },
    {
      icon: <TargetIcon />,
      title: 'Smart Prioritization',
      description: 'AI-powered task scoring that helps you focus on what matters.',
    },
    {
      icon: <TrendingUpIcon />,
      title: 'Progress Tracking',
      description: 'Beautiful visualizations that keep you motivated and on track.',
    },
  ];

  const stats = [
    { label: 'Tasks Done', value: '142', change: '+12%' },
    { label: 'Hours Saved', value: '28h', change: '+18%' },
    { label: 'Focus Score', value: '94', change: '+5%' },
  ];

  return (
    <section 
      ref={containerRef}
      className="py-16 md:py-24 px-6"
      style={{ background: '#1C232A' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Feature List */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span 
              className="inline-block text-sm font-medium tracking-wide uppercase mb-4"
              style={{ color: BRAND.primary }}
            >
              Why DailyStack
            </span>
            <h2 
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ lineHeight: '1.2' }}
            >
              Built for those who
              <br />
              <span style={{ color: BRAND.primary }}>mean business</span>
            </h2>
            <p className="text-white/40 text-base mb-8 leading-relaxed">
              Every feature is designed with one goal in mind: helping you accomplish more 
              with less friction and more flow.
            </p>

            {/* Feature List */}
            <div className="divide-y divide-white/5">
              {features.map((feature, index) => (
                <FeatureItem
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={0.1 * index}
                />
              ))}
            </div>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium transition-all hover:gap-3"
              style={{ color: BRAND.primary }}
            >
              Explore all features
              <ArrowRightIcon />
            </motion.button>
          </motion.div>

          {/* Right Column - Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="border border-white/10 rounded-lg p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div>
                  <div className="text-white font-medium">Productivity Overview</div>
                  <div className="text-white/40 text-sm">Last 30 days</div>
                </div>
                <span 
                  className="text-xs font-medium px-2 py-1 rounded border"
                  style={{ 
                    color: BRAND.primary,
                    borderColor: `${BRAND.primary}40`,
                  }}
                >
                  Live
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {stats.map((stat, index) => (
                  <StatCard
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    change={stat.change}
                    delay={0.3 + index * 0.1}
                  />
                ))}
              </div>

              {/* Progress Bars */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                {[
                  { label: 'Weekly Goals', progress: 78 },
                  { label: 'Team Tasks', progress: 92 },
                  { label: 'Personal Tasks', progress: 65 },
                ].map((item, index) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-white/60">{item.label}</span>
                      <span className="text-sm text-white/80 font-medium">{item.progress}%</span>
                    </div>
                    <div 
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${item.progress}%` } : {}}
                        transition={{ duration: 0.8, delay: 0.4 + index * 0.1, ease: [0.25, 0.4, 0.25, 1] }}
                        className="h-full rounded-full"
                        style={{ background: index === 0 ? BRAND.primary : index === 1 ? '#8A4CFF' : '#FFD24D' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}