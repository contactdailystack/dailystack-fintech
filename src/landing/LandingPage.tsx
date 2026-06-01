/**
 * LandingPage - Main Landing Page Component
 * Cinematic, motion-rich design with glassmorphism aesthetics
 */
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LenisWrapper } from './components/LenisWrapper';
import { HeroSection } from './components/HeroSection';
import { ProductShowcase } from './components/ProductShowcase';
import { FeaturesSection } from './components/FeaturesSection';
import { MotionShowcase } from './components/MotionShowcase';
import { SocialProof } from './components/SocialProof';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';

// Navigation Component
function Navigation() {
  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #56be89 0%, #3D9E6E 100%)',
              }}
            >
              <span className="text-xl font-bold" style={{ color: '#0D1117' }}>D</span>
            </div>
            <span className="text-xl font-bold text-white">DailyStack</span>
          </div>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-white/60 text-sm font-medium hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
              style={{ 
                background: '#56be89',
                color: '#0D1117',
              }}
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

interface LandingPageProps {
  onGetStarted?: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <LenisWrapper>
      <div className="min-h-screen" style={{ background: '#1c232a' }}>
        {/* Navigation */}
        <Navigation />

        {/* Hero Section */}
        <HeroSection />

        {/* Product Showcase */}
        <ProductShowcase />

        {/* Features Section */}
        <FeaturesSection />

        {/* Motion Showcase */}
        <MotionShowcase />

        {/* Social Proof */}
        <SocialProof />

        {/* CTA Section */}
        <CTASection onGetStarted={onGetStarted} />

        {/* Footer */}
        <Footer />
      </div>
    </LenisWrapper>
  );
}