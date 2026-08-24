/**
 * ============================================================
 * DailyStack Design System — LoadingSkeleton Component v2.0
 * ============================================================
 * Shimmer animation skeleton for loading states
 * 
 * Design Philosophy:
 * - Shimmer animation with prefers-reduced-motion support
 * - Multiple variants: text, circle, card, transaction
 * - Stagger animation for list items
 * - Full-page skeletons for route-level loading
 */

import React from 'react';
import { motion } from 'framer-motion';
import { components } from '../color-tokens';
import { borderRadius } from '../spacing-tokens';

// ─── Animation Constants ────────────────────────────────────────────
const SHIMMER_DURATION = 1.5;
const STAGGER_DELAY = 0.05;

// ─── Skeleton Variants ─────────────────────────────────────────────
export type SkeletonVariant = 'text' | 'circle' | 'card' | 'transaction' | 'rectangle' | 'avatar';

// ─── Component Props ───────────────────────────────────────────────
export interface LoadingSkeletonProps {
  /** Skeleton variant */
  variant?: SkeletonVariant;
  /** Width */
  width?: string | number;
  /** Height */
  height?: string | number;
  /** Border radius override */
  radius?: string;
  /** Custom className */
  className?: string;
  /** Shimmer animation disabled */
  noShimmer?: boolean;
}

// ─── Default Colors ───────────────────────────────────────────────
const skeletonBase = components.skeleton.base;
const skeletonShimmer = components.skeleton.shimmer;

// ─── Shimmer Animation (Enhanced v2) ────────────────────────────────
const ShimmerOverlay: React.FC<{ isReducedMotion: boolean }> = ({ isReducedMotion }) => {
  if (isReducedMotion) return null;

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      animate={{
        x: ['-100%', '200%'],
      }}
      transition={{
        duration: SHIMMER_DURATION,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        background: `linear-gradient(
          90deg,
          transparent 0%,
          rgba(86, 190, 137, 0.06) 20%,
          rgba(86, 190, 137, 0.12) 50%,
          rgba(86, 190, 137, 0.06) 80%,
          transparent 100%
        )`,
        width: '60%',
      }}
    />
  );
};

// ─── Skeleton Wrapper ───────────────────────────────────────────────
interface SkeletonWrapperProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  radius?: string;
  className?: string;
  noShimmer?: boolean;
  children?: React.ReactNode;
}

const SkeletonWrapper: React.FC<SkeletonWrapperProps> = ({
  variant = 'rectangle',
  width,
  height,
  radius,
  className = '',
  noShimmer = false,
  children,
}) => {
  // Check for reduced motion preference
  const [isReducedMotion, setIsReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Variant-specific dimensions
  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return { width: width || '100%', height: height || '14px', borderRadius: borderRadius.sm };
      case 'circle':
        return { width: width || '48px', height: height || '48px', borderRadius: '50%' };
      case 'card':
        return { width: width || '100%', height: height || '120px', borderRadius: borderRadius.xl };
      case 'transaction':
        return { width: width || '100%', height: height || '72px', borderRadius: borderRadius.lg };
      case 'avatar':
        return { width: width || '40px', height: height || '40px', borderRadius: '50%' };
      case 'rectangle':
      default:
        return {
          width: width || '100%',
          height: height || '20px',
          borderRadius: radius || borderRadius.md,
        };
    }
  };

  const variantStyle = getVariantStyles();

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: variantStyle.width,
        height: variantStyle.height,
        borderRadius: variantStyle.borderRadius,
        backgroundColor: skeletonBase,
      }}
    >
      {!noShimmer && <ShimmerOverlay isReducedMotion={isReducedMotion} />}
      {children}
    </div>
  );
};

// ─── Component ─────────────────────────────────────────────────────
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'rectangle',
  width,
  height,
  radius,
  className = '',
  noShimmer = false,
}) => (
  <SkeletonWrapper
    variant={variant}
    width={width}
    height={height}
    radius={radius}
    className={className}
    noShimmer={noShimmer}
  />
);

// ─── Text Skeleton ─────────────────────────────────────────────────
export interface TextSkeletonProps {
  lines?: number;
  width?: string | number;
  lastLineWidth?: string | number;
  className?: string;
}

export const TextSkeleton: React.FC<TextSkeletonProps> = ({
  lines = 3,
  width = '100%',
  lastLineWidth = '60%',
  className = '',
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <LoadingSkeleton
        key={index}
        variant="text"
        width={index === lines - 1 ? lastLineWidth : width}
        height={14}
      />
    ))}
  </div>
);

// ─── Card Skeleton ─────────────────────────────────────────────────
export interface CardSkeletonProps {
  lines?: number;
  showImage?: boolean;
  className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  lines = 2,
  showImage = false,
  className = '',
}) => (
  <div
    className={`
      bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A]
      p-4 space-y-3
      ${className}
    `}
  >
    {showImage && (
      <LoadingSkeleton variant="rectangle" height={100} radius={borderRadius.lg} />
    )}
    <LoadingSkeleton variant="text" width="70%" height={16} />
    <LoadingSkeleton variant="text" width="100%" height={12} />
    {lines > 2 && <LoadingSkeleton variant="text" width="85%" height={12} />}
  </div>
);

// ─── Transaction Skeleton ──────────────────────────────────────────
export interface TransactionSkeletonProps {
  count?: number;
  className?: string;
}

export const TransactionSkeleton: React.FC<TransactionSkeletonProps> = ({
  count = 5,
  className = '',
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="flex items-center gap-3 p-3 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]"
      >
        {/* Icon */}
        <LoadingSkeleton variant="circle" width={48} height={48} />

        {/* Content */}
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" width="50%" height={14} />
          <LoadingSkeleton variant="text" width="30%" height={10} />
        </div>

        {/* Amount */}
        <LoadingSkeleton variant="text" width={80} height={16} />
      </div>
    ))}
  </div>
);

// ─── Avatar Skeleton ───────────────────────────────────────────────
export interface AvatarSkeletonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const avatarSizes = {
  sm: 32,
  md: 40,
  lg: 56,
};

export const AvatarSkeleton: React.FC<AvatarSkeletonProps> = ({
  size = 'md',
  className = '',
}) => (
  <LoadingSkeleton
    variant="circle"
    width={avatarSizes[size]}
    height={avatarSizes[size]}
    className={className}
  />
);

// ─── Metric Skeleton ───────────────────────────────────────────────
export interface MetricSkeletonProps {
  className?: string;
}

export const MetricSkeleton: React.FC<MetricSkeletonProps> = ({ className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    <LoadingSkeleton variant="text" width={80} height={12} />
    <LoadingSkeleton variant="text" width={120} height={24} />
    <LoadingSkeleton variant="text" width={60} height={10} />
  </div>
);

// ─── List Skeleton ─────────────────────────────────────────────────
export interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  items = 5,
  showAvatar = false,
  className = '',
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center gap-3">
        {showAvatar && <AvatarSkeleton size="sm" />}
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" width="60%" height={14} />
          <LoadingSkeleton variant="text" width="40%" height={10} />
        </div>
      </div>
    ))}
  </div>
);

// ─── Grid Skeleton ─────────────────────────────────────────────────
export interface GridSkeletonProps {
  columns?: number;
  rows?: number;
  cardHeight?: number;
  className?: string;
}

export const GridSkeleton: React.FC<GridSkeletonProps> = ({
  columns = 2,
  rows = 3,
  cardHeight = 120,
  className = '',
}) => (
  <div
    className={`grid gap-3 ${columns === 2 ? 'grid-cols-2' : columns === 3 ? 'grid-cols-3' : 'grid-cols-4'} ${className}`}
  >
    {Array.from({ length: columns * rows }).map((_, index) => (
      <LoadingSkeleton
        key={index}
        variant="card"
        height={cardHeight}
      />
    ))}
  </div>
);

// ─── Full Page Skeleton ─────────────────────────────────────────────
export interface PageSkeletonProps {
  className?: string;
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ className = '' }) => (
  <div className={`space-y-6 p-4 ${className}`}>
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <LoadingSkeleton variant="text" width={160} height={24} />
        <LoadingSkeleton variant="text" width={100} height={12} />
      </div>
      <AvatarSkeleton size="lg" />
    </div>

    {/* Metric Cards */}
    <div className="grid grid-cols-2 gap-3">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>

    {/* Transaction List */}
    <div className="space-y-2">
      <LoadingSkeleton variant="text" width={120} height={16} />
      <TransactionSkeleton count={3} />
    </div>
  </div>
);

// ─── Stagger Skeleton (Animated List) ────────────────────────────────
export interface StaggerSkeletonProps {
  count?: number;
  variant?: 'transaction' | 'card' | 'list';
  className?: string;
}

export const StaggerSkeleton: React.FC<StaggerSkeletonProps> = ({
  count = 5,
  variant = 'transaction',
  className = '',
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: count }).map((_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay: index * STAGGER_DELAY,
          ease: 'easeOut',
        }}
      >
        {variant === 'transaction' && (
          <div className="flex items-center gap-3 p-3 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
            <LoadingSkeleton variant="circle" width={48} height={48} />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton variant="text" width="50%" height={14} />
              <LoadingSkeleton variant="text" width="30%" height={10} />
            </div>
            <LoadingSkeleton variant="text" width={80} height={16} />
          </div>
        )}
        {variant === 'card' && (
          <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
            <LoadingSkeleton variant="text" width="70%" height={16} />
            <LoadingSkeleton variant="text" width="100%" height={12} className="mt-2" />
            <LoadingSkeleton variant="text" width="85%" height={12} className="mt-1" />
          </div>
        )}
        {variant === 'list' && (
          <div className="flex items-center gap-3 p-2">
            <LoadingSkeleton variant="circle" width={32} height={32} />
            <div className="flex-1">
              <LoadingSkeleton variant="text" width="60%" height={12} />
              <LoadingSkeleton variant="text" width="40%" height={10} className="mt-1" />
            </div>
          </div>
        )}
      </motion.div>
    ))}
  </div>
);

// ─── Dashboard Skeleton (Full Page) ─────────────────────────────────
export const DashboardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`min-h-screen p-4 space-y-6 ${className}`}>
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <LoadingSkeleton variant="text" width={140} height={28} />
        <LoadingSkeleton variant="text" width={80} height={12} />
      </div>
      <AvatarSkeleton size="lg" />
    </div>

    {/* Balance Card */}
    <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] p-6">
      <LoadingSkeleton variant="text" width={100} height={12} />
      <LoadingSkeleton variant="text" width={180} height={40} className="mt-2" />
      <div className="flex gap-4 mt-4">
        <LoadingSkeleton variant="rectangle" width={60} height={24} radius="12px" />
        <LoadingSkeleton variant="rectangle" width={60} height={24} radius="12px" />
      </div>
    </div>

    {/* Quick Actions */}
    <div className="grid grid-cols-4 gap-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex flex-col items-center gap-2">
          <LoadingSkeleton variant="circle" width={48} height={48} />
          <LoadingSkeleton variant="text" width={50} height={10} />
        </div>
      ))}
    </div>

    {/* Recent Transactions */}
    <StaggerSkeleton count={4} variant="transaction" />
  </div>
);

// ─── Activity Skeleton (Full Page) ─────────────────────────────────
export const ActivitySkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`min-h-screen p-4 space-y-4 ${className}`}>
    {/* Header */}
    <LoadingSkeleton variant="text" width={120} height={24} />

    {/* Search Bar */}
    <LoadingSkeleton variant="rectangle" height={48} radius="16px" />

    {/* Filter Pills */}
    <div className="flex gap-2 overflow-hidden">
      {[80, 60, 70, 50, 65].map((w, i) => (
        <LoadingSkeleton key={i} variant="rectangle" width={w} height={32} radius="16px" />
      ))}
    </div>

    {/* Transaction List */}
    <StaggerSkeleton count={6} variant="transaction" />
  </div>
);

// ─── Insights Skeleton (Full Page) ─────────────────────────────────
export const InsightsSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`min-h-screen p-4 space-y-6 ${className}`}>
    {/* Header */}
    <div className="flex items-center gap-3">
      <LoadingSkeleton variant="circle" width={40} height={40} />
      <div className="space-y-2">
        <LoadingSkeleton variant="text" width={100} height={20} />
        <LoadingSkeleton variant="text" width={60} height={12} />
      </div>
    </div>

    {/* Tab Pills */}
    <div className="flex gap-2">
      {[60, 80, 50].map((w, i) => (
        <LoadingSkeleton key={i} variant="rectangle" width={w} height={36} radius="18px" />
      ))}
    </div>

    {/* Chart Area */}
    <LoadingSkeleton variant="rectangle" height={200} radius="16px" />

    {/* Stats Grid */}
    <div className="grid grid-cols-2 gap-3">
      <CardSkeleton />
      <CardSkeleton />
    </div>

    {/* Donut Chart */}
    <LoadingSkeleton variant="circle" width={150} height={150} />
  </div>
);

// ─── Exports ──────────────────────────────────────────────────────
export default LoadingSkeleton;
