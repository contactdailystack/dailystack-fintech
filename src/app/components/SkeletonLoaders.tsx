/**
 * DailyStack — Premium Shimmer Skeleton Loaders
 * Standardized pulsing skeletons for high-fidelity loading UX.
 * Aligns with calm modern contrast and data-theme.
 */

import React from 'react';

export const PulseCard: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => (
  <div 
    className={`animate-pulse bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-[20px] ${className}`}
    style={{
      opacity: 0.7,
      animationDuration: '1.8s',
      ...style
    }}
  />
);

export const DatingSkeleton: React.FC = () => {
  return (
    <div className="max-w-sm mx-auto space-y-6">
      {/* Curved Deck Card */}
      <div 
        className="w-full aspect-[3/4] rounded-[28px] bg-[var(--surface-card)] border border-[var(--border-subtle)] relative overflow-hidden flex flex-col justify-end p-6 animate-pulse"
        style={{ animationDuration: '1.8s' }}
      >
        {/* Simulating image gradient cover shimmer */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-void)]/90 via-[var(--surface-input)]/20 to-transparent" />
        
        {/* Shimmer items */}
        <div className="relative z-10 space-y-3">
          <div className="h-5 bg-[var(--surface-input)] rounded-full w-1/3" />
          <div className="h-8 bg-[var(--surface-input)] rounded-xl w-3/4" />
          <div className="h-4 bg-[var(--surface-input)] rounded-full w-5/6" />
          <div className="h-4 bg-[var(--surface-input)] rounded-full w-2/3" />
        </div>
      </div>

      {/* Button Tray Skeletons */}
      <div className="flex items-center justify-center gap-6 animate-pulse" style={{ animationDuration: '1.8s' }}>
        <div className="w-14 h-14 rounded-full bg-[var(--surface-card)] border border-[var(--border-subtle)]" />
        <div className="w-12 h-12 rounded-full bg-[var(--surface-card)] border border-[var(--border-subtle)]" />
        <div className="w-14 h-14 rounded-full bg-[var(--surface-card)] border border-[var(--border-subtle)]" />
      </div>
    </div>
  );
};

export const ValueSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" style={{ animationDuration: '1.8s' }}>
      {/* Wallet Card skeleton */}
      <div className="h-[220px] rounded-[32px] bg-[var(--surface-card)] border border-[var(--border-subtle)] p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-2 w-1/2">
            <div className="h-3 bg-[var(--surface-input)] rounded-full w-1/3" />
            <div className="h-5 bg-[var(--surface-input)] rounded-lg w-3/4" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-input)]" />
        </div>
        
        <div className="space-y-2">
          <div className="h-3 bg-[var(--surface-input)] rounded-full w-1/4" />
          <div className="h-6 bg-[var(--surface-input)] rounded-lg w-2/3" />
        </div>

        <div className="flex justify-between items-end border-t border-[var(--border-subtle)] pt-4">
          <div className="w-20 space-y-1">
            <div className="h-2 bg-[var(--surface-input)] rounded-full" />
            <div className="h-4 bg-[var(--surface-input)] rounded-lg" />
          </div>
          <div className="w-16 space-y-1">
            <div className="h-2 bg-[var(--surface-input)] rounded-full" />
            <div className="h-4 bg-[var(--surface-input)] rounded-lg" />
          </div>
        </div>
      </div>

      {/* Pro box skeleton */}
      <div className="h-[140px] rounded-[24px] bg-[var(--surface-card)] border border-[var(--border-subtle)] p-6 space-y-3">
        <div className="h-5 bg-[var(--surface-input)] rounded-lg w-1/3" />
        <div className="h-4 bg-[var(--surface-input)] rounded-full w-5/6" />
        <div className="h-4 bg-[var(--surface-input)] rounded-full w-2/3" />
      </div>

      {/* Ledger list skeletons */}
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center justify-between p-4 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[20px]">
            <div className="flex items-center gap-3 w-3/4">
              <div className="w-8 h-8 rounded-lg bg-[var(--surface-input)]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[var(--surface-input)] rounded-full w-2/3" />
                <div className="h-2 bg-[var(--surface-input)] rounded-full w-1/3" />
              </div>
            </div>
            <div className="w-12 h-4 bg-[var(--surface-input)] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};
