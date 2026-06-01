/**
 * Product Showcase - Medium Editorial Card Style
 * Clean article-style cards with subtle elevation and hover effects
 */
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { BRAND } from './constants';

// Icon Components - Thin stroke, no fill
const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);

const BrainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0 1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A2.5 2.5 0 0 0 12 19.5"/>
    <path d="M12 4.5a2.5 2.5 0 0 1 4.96-.46 2.5 2.5 0 0 1 1.98 3 2.5 2.5 0 0 1-1.32 4.24 3 3 0 0 1-.34 5.58 2.5 2.5 0 0 1-2.96 3.08A2.5 2.5 0 0 1 12 19.5"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V10M12 20V4M6 20v-6"/>
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const LayersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

// Article Card Component - Medium Style
interface ArticleCardProps {
  tag: string;
  title: string;
  description: string;
  author: string;
  date: string;
  readTime: string;
  icon: React.ReactNode;
  index: number;
}

function ArticleCard({ tag, title, description, author, date, readTime, icon, index }: ArticleCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.4, 0.25, 1] }}
      className="group bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-[#56be89]"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Text Content - Left Side */}
        <div className="flex-1 p-6 sm:p-8">
          {/* Tag */}
          <span className="inline-block text-xs font-medium tracking-wide uppercase mb-3 text-[#56be89]">
            {tag}
          </span>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#56be89] transition-colors leading-tight">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-500 text-sm leading-relaxed mb-5">
            {description}
          </p>

          {/* Author/Meta Row */}
          <div className="flex items-center gap-3">
            {/* Avatar Placeholder */}
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span className="text-sm text-gray-600">{author}</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-400">{date}</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-400">{readTime}</span>
          </div>
        </div>

        {/* Icon - Right Side */}
        <div className="sm:w-32 sm:flex-shrink-0 flex items-center justify-center p-6 sm:p-8 border-t sm:border-t-0 sm:border-l border-gray-100 bg-gray-50 sm:bg-transparent">
          <div className="text-gray-400 group-hover:text-[#56be89] transition-colors">
            {icon}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function ProductShowcase() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const features = [
    {
      tag: 'Performance',
      title: 'Lightning Fast',
      description: 'Optimized for speed with instant search and real-time updates across all your data. Experience the difference of a truly responsive system.',
      author: 'DailyStack Team',
      date: 'May 2026',
      readTime: '2 min read',
      icon: <ZapIcon />,
    },
    {
      tag: 'Intelligence',
      title: 'AI Assistant',
      description: 'Smart AI that learns your patterns and helps you make better decisions faster. Your personal productivity coach, available 24/7.',
      author: 'DailyStack Team',
      date: 'May 2026',
      readTime: '3 min read',
      icon: <BrainIcon />,
    },
    {
      tag: 'Scheduling',
      title: 'Smart Scheduling',
      description: 'AI-powered calendar that finds the perfect time for everything. Never double-book again with intelligent conflict resolution.',
      author: 'DailyStack Team',
      date: 'May 2026',
      readTime: '2 min read',
      icon: <CalendarIcon />,
    },
    {
      tag: 'Collaboration',
      title: 'Team Collaboration',
      description: 'Work together seamlessly with real-time sync and smart notifications. Share tasks, delegate responsibilities, and track progress as a team.',
      author: 'DailyStack Team',
      date: 'May 2026',
      readTime: '3 min read',
      icon: <UsersIcon />,
    },
    {
      tag: 'Security',
      title: 'Enterprise Security',
      description: 'Bank-grade encryption and privacy controls to keep your data safe. SOC 2 compliant with end-to-end encryption for all communications.',
      author: 'DailyStack Team',
      date: 'May 2026',
      readTime: '2 min read',
      icon: <ShieldIcon />,
    },
    {
      tag: 'Analytics',
      title: 'Analytics Dashboard',
      description: 'Beautiful insights and reports that help you understand your productivity. Track trends, identify bottlenecks, and optimize your workflow.',
      author: 'DailyStack Team',
      date: 'May 2026',
      readTime: '3 min read',
      icon: <ChartIcon />,
    },
  ];

  return (
    <section 
      ref={containerRef}
      className="py-16 md:py-24 px-6"
      style={{ background: BRAND.darkBase }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span 
            className="inline-block text-sm font-medium tracking-wide uppercase mb-3"
            style={{ color: BRAND.primary }}
          >
            Features
          </span>
          <h2 
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ lineHeight: '1.2' }}
          >
            Everything you need,
            <br />
            <span style={{ color: BRAND.primary }}>nothing you don't</span>
          </h2>
          <p className="text-white/40 text-base max-w-2xl">
            A carefully crafted set of tools designed to help you achieve more with less effort.
          </p>
        </motion.div>

        {/* Article Cards Stack */}
        <div className="space-y-4">
          {features.map((feature, index) => (
            <ArticleCard
              key={feature.title}
              tag={feature.tag}
              title={feature.title}
              description={feature.description}
              author={feature.author}
              date={feature.date}
              readTime={feature.readTime}
              icon={feature.icon}
              index={index}
            />
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <button className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:gap-3" style={{ color: BRAND.primary }}>
            View all features
            <ArrowRightIcon />
          </button>
        </motion.div>
      </div>
    </section>
  );
}