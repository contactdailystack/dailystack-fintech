/**
 * ============================================================
 * DailyStack Design System — Main Export v1.0
 * ============================================================
 * The Tesla of Personal Finance — Design Token System
 * 
 * Import from this file for all design system exports:
 * import { colorTokens, typographyTokens, TeslaButton } from './design-system';
 */

// ─── Token Exports ─────────────────────────────────────────────────

// Color System
export {
  colorTokens,
  mint,
  cyan,
  background,
  border,
  text,
  semantic,
  warning,
  error,
  components,
  cssVariables as colorCssVariables,
} from './color-tokens';

export type { ColorTokens } from './color-tokens';

// Typography System
export {
  typographyTokens,
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  textTransform,
  typography,
  typographyClasses,
} from './typography-tokens';

export type { TypographyTokens } from './typography-tokens';

// Spacing System
export {
  spacingTokens,
  spacing,
  semanticSpacing,
  componentSpacing,
  borderRadius,
  zIndex,
  layout,
  cssVariables as spacingCssVariables,
} from './spacing-tokens';

export type { SpacingTokens } from './spacing-tokens';

// Motion System
export {
  motionTokens,
  spring,
  duration,
  bpm60,
  keyframes,
  motionPresets,
  tailwindAnimations,
} from './motion-tokens';

export type { MotionTokens } from './motion-tokens';

// Haptic System
export {
  hapticTokens,
  hapticPresets,
  hapticUsageMap,
  hapticTriggers,
  hapticCSSVariables,
} from './haptic-tokens';

export type { HapticTokens, HapticPresetKey, HapticUsageKey } from './haptic-tokens';

// ─── Component Exports ───────────────────────────────────────────────

// TeslaCard
export {
  TeslaCard,
  TeslaCardHeader,
  TeslaCardContent,
  TeslaCardFooter,
} from './components/TeslaCard';

export type { TeslaCardProps, TeslaCardHeaderProps, TeslaCardContentProps, TeslaCardFooterProps } from './components/TeslaCard';

// TeslaPill
export {
  TeslaPill,
  TeslaStatusDot,
} from './components/TeslaPill';

export type { TeslaPillProps, TeslaStatusDotProps } from './components/TeslaPill';

// TeslaButton
export {
  TeslaButton,
  TeslaIconButton,
} from './components/TeslaButton';

export type { TeslaButtonProps, TeslaIconButtonProps } from './components/TeslaButton';

// TeslaInput
export {
  TeslaInput,
  TeslaMoneyInput,
} from './components/TeslaInput';

export type { TeslaInputProps, TeslaMoneyInputProps } from './components/TeslaInput';

// TeslaDivider
export {
  TeslaDivider,
  TeslaSectionLabel,
} from './components/TeslaDivider';

export type { TeslaDividerProps, TeslaSectionLabelProps } from './components/TeslaDivider';

// TeslaIcon
export {
  TeslaIcon,
  Icons,
  iconSizes,
  // Preset icons
  HomeIcon,
  WalletIcon,
  CreditCardIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  SettingsIcon,
  CheckIcon,
  AlertIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  PlusIcon,
  SearchIcon,
  BellIcon,
  LoaderIcon,
} from './components/TeslaIcon';

export type { TeslaIconProps } from './components/TeslaIcon';

// GlassSurface
export {
  GlassSurface,
  GlassCard,
  GlassModal,
} from './components/GlassSurface';

export type { GlassSurfaceProps, GlassCardProps, GlassModalProps } from './components/GlassSurface';

// E-Pay Components
export {
  GridMenu,
  GridMenuSection,
} from './components/GridMenu';

export type { GridMenuProps, GridMenuItem, GridMenuSectionProps } from './components/GridMenu';

export { default as BottomNav, CompactBottomNav } from './components/BottomNav';
export type { BottomNavProps, NavItem, CompactBottomNavProps } from './components/BottomNav';

export { default as StatCard, StatCardGrid, MiniStat } from './components/StatCard';
export type { StatCardProps, StatCardGridProps, MiniStatProps } from './components/StatCard';

export { default as TransactionItem, TransactionList, CompactTransactionItem } from './components/TransactionItem';
export type { TransactionItemProps, TransactionListProps, CompactTransactionItemProps, TransactionDisplayItem } from './components/TransactionItem';

export { default as SuccessGraphic, SuccessCard, SuccessIndicator } from './components/SuccessGraphic';
export type { SuccessGraphicProps, SuccessCardProps, SuccessIndicatorProps } from './components/SuccessGraphic';

// ─── AnimatedBalance ───────────────────────────────────────────────────────

export { default as AnimatedBalance, TrendBadge, BalanceChange } from './components/AnimatedBalance';
export type { AnimatedBalanceProps, TrendBadgeProps, BalanceChangeProps } from './components/AnimatedBalance';

// ─── New Phase 2 Components ───────────────────────────────────────────────

// TransactionCard
export { default as TransactionCard, TransactionCardGrid } from './components/TransactionCard';
export type { TransactionCardProps, TransactionCardGridProps, Transaction, EmotionType } from './components/TransactionCard';

// QuickEntryModal
export { default as QuickEntryModal } from './components/QuickEntryModal';
export type { QuickEntryModalProps, QuickEntryData, Category } from './components/QuickEntryModal';

// MetricDisplay
export { default as MetricDisplay, MetricCard, MetricGrid } from './components/MetricDisplay';
export type { MetricDisplayProps, MetricCardProps, MetricGridProps, Trend, SparklinePoint } from './components/MetricDisplay';

// ActionButton
export { default as ActionButton, IconButton, ButtonGroup, ActionPresets } from './components/ActionButton';
export type { ActionButtonProps, IconButtonProps, ButtonGroupProps } from './components/ActionButton';

// StatusBadge
export { 
  default as StatusBadge, 
  CompletedBadge, 
  PendingBadge, 
  FailedBadge, 
  NewBadge, 
  ActiveBadge, 
  InactiveBadge, 
  BadgeGroup 
} from './components/StatusBadge';
export type { StatusBadgeProps, PresetBadgeProps, BadgeGroupProps } from './components/StatusBadge';

// LoadingSkeleton
export { 
  default as LoadingSkeleton, 
  TextSkeleton, 
  CardSkeleton, 
  TransactionSkeleton, 
  AvatarSkeleton, 
  MetricSkeleton, 
  ListSkeleton, 
  GridSkeleton, 
  PageSkeleton,
  StaggerSkeleton,
  DashboardSkeleton,
  ActivitySkeleton,
  InsightsSkeleton,
} from './components/LoadingSkeleton';
export type { LoadingSkeletonProps, TextSkeletonProps, CardSkeletonProps, TransactionSkeletonProps, AvatarSkeletonProps, MetricSkeletonProps, ListSkeletonProps, GridSkeletonProps, PageSkeletonProps, StaggerSkeletonProps } from './components/LoadingSkeleton';

// EmptyState
export { 
  default as EmptyState, 
  NoTransactionsEmpty, 
  NoSubscriptionsEmpty, 
  NoGoalsEmpty, 
  NoResultsEmpty, 
  ErrorEmpty, 
  EmptyWallet, 
  EmptyDocuments,
  NoCardsEmpty,
  NoInsightsEmpty,
} from './components/EmptyState';
export type { EmptyStateProps, PresetEmptyStateProps, ErrorEmptyProps } from './components/EmptyState';

// ErrorBoundary
export { 
  default as ErrorBoundary, 
  TeslaErrorCard, 
  InlineError 
} from './components/ErrorBoundary';
export type { ErrorBoundaryProps, ErrorFallbackProps, ErrorInfoProps, TeslaErrorCardProps, InlineErrorProps } from './components/ErrorBoundary';

// PageTransition
export { 
  default as PageTransition, 
  StaggerContainer, 
  StaggerItem, 
  ListAnimation, 
  AnimatedNumber,
  pageTransition,
  slideTransition,
  scaleTransition,
} from './components/PageTransition';
export type { PageTransitionProps, StaggerContainerProps, StaggerItemProps, ListAnimationProps, AnimatedNumberProps } from './components/PageTransition';

// Accessibility
export {
  getLuminance,
  getContrastRatio,
  meetsContrastStandard,
  useFocusTrap,
  useAriaAnnounce,
  useArrowNavigation,
  SkipLink,
  VisuallyHidden,
} from './accessibility';

// ─── Page Tokens (Source of Truth for App Pages) ────────────────────
export {
  pageTokens,
  pageColors,
  pageTypography,
  pageLayout,
  componentTokens,
} from './page-tokens';

export type { PageTokens, PageColors, PageTypography, PageLayout, ComponentTokens } from './page-tokens';

// ─── ThemeProvider Export ────────────────────────────────────────────
export {
  ThemeProvider,
  useDesignTokens,
  darkTheme,
  lightTheme,
  type ThemeMode,
  type DesignTokens,
} from './ThemeProvider';

// ─── Design Principles Export ──────────────────────────────────────
export { DESIGN_PRINCIPLES } from './principles';

// ─── Full System Export ─────────────────────────────────────────────
import { colorTokens } from './color-tokens';
import { typographyTokens } from './typography-tokens';
import { spacingTokens } from './spacing-tokens';
import { motionTokens } from './motion-tokens';
import { hapticTokens } from './haptic-tokens';

/**
 * Complete design system for convenient import:
 * 
 * import { ds } from './design-system';
 * 
 * ds.colors.mint.DEFAULT  // #56be89
 * ds.typography.netWorth  // Net Worth style
 * ds.motion.spring.TIGHT  // cubic-bezier(0.16, 1, 0.3, 1)
 */
export const ds = {
  colors: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  motion: motionTokens,
  haptics: hapticTokens,
} as const;

export type DailyStackDesignSystem = typeof ds;
