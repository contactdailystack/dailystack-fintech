/**
 * DailyStack — Dating Components Index
 * Phase 3: Scalable Architecture
 * 
 * Barrel export for all dating components
 * Usage: import { SwipeCard, MatchCelebration } from '@/components/dating';
 */

export { default as SwipeCard } from './SwipeCard';
export type { SwipeCardProps } from './SwipeCard';

export { default as SwipeActionButtons, SwipeActionButtonsLarge } from './SwipeActionButtons';
export type { SwipeActionButtonsProps } from './SwipeActionButtons';

export { default as MatchCelebration } from './MatchCelebration';
export type { MatchCelebrationProps } from './MatchCelebration';

export { default as StatsCard, StatsCardWithChart } from './StatsCard';
export type { StatsCardProps, StatsCardWithChartProps } from './StatsCard';

export { default as EmptyState, EmptyStateLoading, EmptyStateError } from './EmptyState';
export type { EmptyStateProps, EmptyStateType } from './EmptyState';