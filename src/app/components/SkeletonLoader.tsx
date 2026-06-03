/**
 * SkeletonLoader.tsx
 * Phase 3 – UX Polish: Reusable skeleton loading components
 */
import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`skeleton rounded-xl ${className}`} aria-hidden="true" />
);

export const SubscriptionCardSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm animate-fade-in" aria-busy="true">
    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
    <Skeleton className="h-5 w-16 flex-shrink-0" />
  </div>
);

export const StatCardSkeleton: React.FC = () => (
  <div className="rounded-2xl bg-white p-5 shadow-sm animate-fade-in" aria-busy="true">
    <Skeleton className="h-3 w-1/3 mb-3" />
    <Skeleton className="h-7 w-2/3 mb-2" />
    <Skeleton className="h-3 w-1/2" />
  </div>
);

export const DashboardSkeletons: React.FC = () => (
  <div className="space-y-4 animate-fade-up">
    {/* Stats Row */}
    <div className="grid grid-cols-3 gap-3">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
    {/* Subscription List */}
    <div className="space-y-2">
      {[1, 2, 3].map(i => (
        <SubscriptionCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
