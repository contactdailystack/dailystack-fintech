/**
 * ============================================================
 * Pilo Pill Card Showcase
 * ============================================================
 * Examples of Pill Card patterns inspired by Pilo Autonomous Taxi App
 * Design: Light Gray Background + Black Text
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  Calendar,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Info,
  Plus,
  Minus,
} from 'lucide-react';

// ============================================================
// PILO-STYLE DESIGN TOKENS
// ============================================================
const PILO = {
  // Background Colors
  bgPage: '#FFFFFF',
  bgCard: '#F3F4F6',
  bgElevated: '#E5E7EB',
  bgMuted: '#F9FAFB',
  
  // Accent
  accent: '#FFDE00',
  accentDark: '#E6C900',
  
  // Text
  textPrimary: '#111827',
  textSecondary: '#374151',
  textTertiary: '#6B7280',
  
  // Semantic
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#2563EB',
  
  // Brand Colors
  checking: '#2563EB',
  savings: '#059669',
};

// ============================================================
// PILL CARD COMPONENTS
// ============================================================

/**
 * 1. Hero Pill Card
 * Large card with avatar and stats
 */
export const HeroPillCard: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-3xl p-6"
    style={{ backgroundColor: PILO.bgCard }}
  >
    {/* Header with Avatar */}
    <div className="flex items-center gap-4 mb-6">
      <div 
        className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
        style={{ backgroundColor: PILO.accent, color: PILO.textPrimary }}
      >
        P
      </div>
      <div>
        <h2 className="text-xl font-bold" style={{ color: PILO.textPrimary }}>
          Good afternoon, Pilo
        </h2>
        <p className="text-sm" style={{ color: PILO.textSecondary }}>
          Ready for your next ride?
        </p>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-3 gap-4">
      {[
        { label: 'Balance', value: '$1,234', icon: Wallet, color: PILO.checking },
        { label: 'Rides', value: '12', icon: MapPin, color: PILO.savings },
        { label: 'Rating', value: '4.9', icon: Star, color: PILO.warning },
      ].map((stat, i) => (
        <div 
          key={i}
          className="rounded-2xl p-4 text-center"
          style={{ backgroundColor: PILO.bgElevated }}
        >
          <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
          <p className="text-lg font-bold" style={{ color: PILO.textPrimary }}>{stat.value}</p>
          <p className="text-xs" style={{ color: PILO.textTertiary }}>{stat.label}</p>
        </div>
      ))}
    </div>
  </motion.div>
);

/**
 * 2. Ride Request Pill Card
 * Booking interface card
 */
export const RideRequestCard: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="rounded-3xl p-5"
    style={{ backgroundColor: PILO.bgCard }}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold" style={{ color: PILO.textPrimary }}>Request a ride</h3>
      <ChevronRight className="w-5 h-5" style={{ color: PILO.textTertiary }} />
    </div>

    {/* Pickup & Dropoff */}
    <div className="space-y-3 mb-4">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PILO.success }} />
        <span style={{ color: PILO.textSecondary }}>123 Main Street</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PILO.danger }} />
        <span style={{ color: PILO.textSecondary }}>456 Oak Avenue</span>
      </div>
    </div>

    {/* Price */}
    <div className="flex items-center justify-between p-4 rounded-2xl" style={{ backgroundColor: PILO.bgElevated }}>
      <div>
        <p className="text-sm" style={{ color: PILO.textTertiary }}>Estimated Price</p>
        <p className="text-2xl font-bold" style={{ color: PILO.textPrimary }}>$24.50</p>
      </div>
      <button
        className="px-6 py-3 rounded-2xl font-semibold"
        style={{ backgroundColor: PILO.accent, color: PILO.textPrimary }}
      >
        Book Now
      </button>
    </div>
  </motion.div>
);

/**
 * 3. Status Pill Card
 * Shows status with icon
 */
export const StatusPillCard: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="rounded-3xl p-5"
    style={{ backgroundColor: PILO.bgCard }}
  >
    <h3 className="font-semibold mb-4" style={{ color: PILO.textPrimary }}>Trip Status</h3>
    
    <div className="space-y-3">
      {/* Success Status */}
      <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ backgroundColor: `${PILO.success}15` }}>
        <Check className="w-5 h-5" style={{ color: PILO.success }} />
        <span style={{ color: PILO.textPrimary }}>Payment confirmed</span>
      </div>
      
      {/* Warning Status */}
      <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ backgroundColor: `${PILO.warning}15` }}>
        <AlertCircle className="w-5 h-5" style={{ color: PILO.warning }} />
        <span style={{ color: PILO.textPrimary }}>Surge pricing active</span>
      </div>
      
      {/* Info Status */}
      <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ backgroundColor: `${PILO.info}15` }}>
        <Info className="w-5 h-5" style={{ color: PILO.info }} />
        <span style={{ color: PILO.textPrimary }}>Driver arriving in 3 min</span>
      </div>
    </div>
  </motion.div>
);

/**
 * 4. Driver Card Pill
 * Driver info with rating
 */
export const DriverPillCard: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="rounded-3xl p-5"
    style={{ backgroundColor: PILO.bgCard }}
  >
    <div className="flex items-center gap-4">
      {/* Avatar */}
      <div 
        className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
        style={{ backgroundColor: PILO.bgElevated, color: PILO.textPrimary }}
      >
        JD
      </div>
      
      {/* Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold" style={{ color: PILO.textPrimary }}>John D.</h3>
          <span className="flex items-center gap-1 text-sm" style={{ color: PILO.warning }}>
            <Star className="w-4 h-4 fill-current" /> 4.9
          </span>
        </div>
        <p className="text-sm" style={{ color: PILO.textSecondary }}>Toyota Camry • ABC 1234</p>
      </div>
      
      {/* Actions */}
      <div className="flex gap-2">
        <button 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: PILO.bgElevated }}
        >
          <CreditCard className="w-5 h-5" style={{ color: PILO.textSecondary }} />
        </button>
        <button 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: PILO.bgElevated }}
        >
          <X className="w-5 h-5" style={{ color: PILO.danger }} />
        </button>
      </div>
    </div>
  </motion.div>
);

/**
 * 5. Price Breakdown Pill Card
 * Shows pricing details
 */
export const PriceBreakdownCard: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="rounded-3xl p-5"
    style={{ backgroundColor: PILO.bgCard }}
  >
    <h3 className="font-semibold mb-4" style={{ color: PILO.textPrimary }}>Price Details</h3>
    
    <div className="space-y-3 mb-4">
      {[
        { label: 'Base fare', value: '$8.00' },
        { label: 'Distance (3.2 mi)', value: '$12.80' },
        { label: 'Time (12 min)', value: '$3.60' },
        { label: 'Surge', value: '+$2.00' },
      ].map((item, i) => (
        <div key={i} className="flex justify-between">
          <span style={{ color: PILO.textSecondary }}>{item.label}</span>
          <span style={{ color: PILO.textPrimary }}>{item.value}</span>
        </div>
      ))}
    </div>
    
    {/* Divider */}
    <div className="border-t my-4" style={{ borderColor: PILO.bgElevated }} />
    
    {/* Total */}
    <div className="flex justify-between items-center">
      <span className="font-semibold" style={{ color: PILO.textPrimary }}>Total</span>
      <span className="text-2xl font-bold" style={{ color: PILO.textPrimary }}>$26.40</span>
    </div>
  </motion.div>
);

/**
 * 6. Action Button Pills
 * Primary and secondary buttons
 */
export const ActionButtonPills: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className="rounded-3xl p-5"
    style={{ backgroundColor: PILO.bgCard }}
  >
    <h3 className="font-semibold mb-4" style={{ color: PILO.textPrimary }}>Button Styles</h3>
    
    <div className="space-y-3">
      {/* Primary - Yellow */}
      <button
        className="w-full py-4 rounded-2xl font-semibold text-lg"
        style={{ backgroundColor: PILO.accent, color: PILO.textPrimary }}
      >
        Primary Button
      </button>
      
      {/* Secondary - Black */}
      <button
        className="w-full py-4 rounded-2xl font-semibold text-lg"
        style={{ backgroundColor: PILO.textPrimary, color: PILO.bgPage }}
      >
        Secondary Button
      </button>
      
      {/* Outline */}
      <button
        className="w-full py-4 rounded-2xl font-semibold text-lg border-2"
        style={{ borderColor: PILO.textPrimary, color: PILO.textPrimary }}
      >
        Outline Button
      </button>
      
      {/* Icon Buttons Row */}
      <div className="flex gap-3">
        <button
          className="flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
          style={{ backgroundColor: `${PILO.success}15`, color: PILO.success }}
        >
          <Plus className="w-5 h-5" /> Add
        </button>
        <button
          className="flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
          style={{ backgroundColor: `${PILO.danger}15`, color: PILO.danger }}
        >
          <Minus className="w-5 h-5" /> Remove
        </button>
      </div>
    </div>
  </motion.div>
);

/**
 * 7. Timeline Pill Card
 * Shows time-based events
 */
export const TimelinePillCard: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6 }}
    className="rounded-3xl p-5"
    style={{ backgroundColor: PILO.bgCard }}
  >
    <h3 className="font-semibold mb-4" style={{ color: PILO.textPrimary }}>Trip Timeline</h3>
    
    <div className="space-y-4">
      {[
        { time: '2:30 PM', event: 'Trip started', icon: MapPin, color: PILO.success },
        { time: '2:45 PM', event: 'Arrived at destination', icon: MapPin, color: PILO.info },
        { time: '2:47 PM', event: 'Trip completed', icon: Check, color: PILO.success },
      ].map((item, i) => (
        <div key={i} className="flex items-start gap-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${item.color}20` }}
          >
            <item.icon className="w-4 h-4" style={{ color: item.color }} />
          </div>
          <div className="flex-1">
            <p className="font-medium" style={{ color: PILO.textPrimary }}>{item.event}</p>
            <p className="text-sm" style={{ color: PILO.textTertiary }}>{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

/**
 * 8. Notification Pill Card
 * Alert-style cards
 */
export const NotificationPillCard: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.7 }}
    className="rounded-3xl p-5"
    style={{ backgroundColor: PILO.bgCard }}
  >
    <h3 className="font-semibold mb-4" style={{ color: PILO.textPrimary }}>Notifications</h3>
    
    <div className="space-y-3">
      {/* Unread */}
      <div 
        className="p-4 rounded-2xl"
        style={{ backgroundColor: PILO.bgElevated }}
      >
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: PILO.accent }} />
          <div>
            <p className="font-medium" style={{ color: PILO.textPrimary }}>New promotion!</p>
            <p className="text-sm" style={{ color: PILO.textSecondary }}>Get 20% off your next 3 rides</p>
          </div>
        </div>
      </div>
      
      {/* Read */}
      <div 
        className="p-4 rounded-2xl opacity-60"
        style={{ backgroundColor: PILO.bgMuted }}
      >
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 mt-0.5" style={{ color: PILO.textTertiary }} />
          <div>
            <p className="font-medium" style={{ color: PILO.textPrimary }}>Rate your driver</p>
            <p className="text-sm" style={{ color: PILO.textSecondary }}>How was your trip with John D.?</p>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// ============================================================
// SHOWCASE PAGE
// ============================================================
export const PiloPillCardShowcase: React.FC = () => {
  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: PILO.bgPage }}>
      <div className="max-w-md mx-auto px-5 space-y-4">
        <h1 className="text-2xl font-bold mb-6" style={{ color: PILO.textPrimary }}>
          Pilo Pill Card Examples
        </h1>
        
        <HeroPillCard />
        <RideRequestCard />
        <StatusPillCard />
        <DriverPillCard />
        <PriceBreakdownCard />
        <ActionButtonPills />
        <TimelinePillCard />
        <NotificationPillCard />
      </div>
    </div>
  );
};

export default PiloPillCardShowcase;
