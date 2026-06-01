/**
 * Social Proof - Testimonials & Trust System
 * Premium testimonial cards with modern design
 */
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { BRAND, MOTION, animationVariants } from './constants';

// Star Rating Component
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i < rating ? BRAND.primary : 'none'}
          stroke={BRAND.primary}
          strokeWidth="2"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

// Avatar Component
function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
  };

  // Generate initials from name
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate a consistent color based on name
  const colors = [
    { bg: '#56be8930', text: '#56be89' },
    { bg: '#8A4CFF30', text: '#8A4CFF' },
    { bg: '#FFD24D30', text: '#FFD24D' },
    { bg: '#5CC3FF30', text: '#5CC3FF' },
    { bg: '#FF6B8130', text: '#FF6B81' },
  ];
  const colorIndex = name.length % colors.length;
  const color = colors[colorIndex];

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold`}
      style={{ background: color.bg, color: color.text }}
    >
      {initials}
    </div>
  );
}

// Testimonial Card Component
interface TestimonialCardProps {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  delay?: number;
  featured?: boolean;
}

function TestimonialCard({ name, role, company, content, rating, delay = 0, featured = false }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
      className={`
        glass-panel p-6 md:p-8
        ${featured ? 'relative' : ''}
      `}
      style={{
        background: featured ? '#232D38' : '#1E2830',
      }}
    >
      {featured && (
        <div 
          className="absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ 
            background: BRAND.primary,
            color: BRAND.ink,
          }}
        >
          Featured
        </div>
      )}

      <StarRating rating={rating} />

      <p className="text-white/80 text-base leading-relaxed mt-4 mb-6">
        "{content}"
      </p>

      <div className="flex items-center gap-4">
        <Avatar name={name} size="md" />
        <div>
          <div className="text-white font-semibold">{name}</div>
          <div className="text-white/50 text-sm">
            {role} · {company}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Stats Banner Component
function StatsBanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    { value: '50K+', label: 'Active Users' },
    { value: '4.9/5', label: 'Average Rating' },
    { value: '10M+', label: 'Tasks Completed' },
    { value: '99.9%', label: 'Uptime SLA' },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-2xl"
      style={{ background: '#232D38' }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
          className="text-center"
        >
          <div 
            className="text-3xl md:text-4xl font-bold mb-1"
            style={{ color: BRAND.primary }}
          >
            {stat.value}
          </div>
          <div className="text-white/50 text-sm">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function SocialProof() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Manager',
      company: 'TechCorp',
      content: 'DailyStack has completely transformed how our team manages projects. The AI suggestions are incredibly accurate and have saved us countless hours.',
      rating: 5,
      featured: true,
    },
    {
      name: 'Marcus Johnson',
      role: 'Founder',
      company: 'StartupX',
      content: 'Finally, a productivity tool that actually understands what I need. The workflow automation is a game changer for our small team.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Design Lead',
      company: 'Creative Studio',
      content: 'The interface is gorgeous and the motion design makes every interaction feel premium. Worth every penny.',
      rating: 5,
    },
    {
      name: 'David Kim',
      role: 'Engineering Manager',
      company: 'DataFlow',
      content: 'We replaced three different tools with DailyStack. The integration between tasks, calendar, and AI is seamless.',
      rating: 5,
    },
  ];

  return (
    <section 
      ref={containerRef}
      className="relative py-24 md:py-32 px-6"
      style={{ background: '#1C232A' }}
    >
      {/* Background Gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(86, 190, 137, 0.05) 0%, transparent 50%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span 
            className="inline-block text-sm font-semibold tracking-wider uppercase mb-4"
            style={{ color: BRAND.primary }}
          >
            Testimonials
          </span>
          <h2 
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            style={{ lineHeight: '1.1' }}
          >
            Loved by thousands
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Join the community of productive people who have transformed their workflow with DailyStack.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.name}
              name={testimonial.name}
              role={testimonial.role}
              company={testimonial.company}
              content={testimonial.content}
              rating={testimonial.rating}
              featured={testimonial.featured}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Stats Banner */}
        <StatsBanner />

        {/* Trust Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-white/30 text-sm font-medium uppercase tracking-wider mb-6">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-40">
            {['TechCorp', 'StartupX', 'DataFlow', 'CreativeStudio', 'Innovate'].map((company) => (
              <div
                key={company}
                className="text-white text-lg font-semibold tracking-tight"
              >
                {company}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}