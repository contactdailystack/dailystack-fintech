/**
 * ============================================================
 * DailyStack — App Components Index
 * ============================================================
 * Central export for all app-level components.
 * These components wrap design-system components with i18n support
 * and app-specific styling tokens.
 */

// Trust & Security Components
export {
  default as SecurityBadge,
  EncryptedBadge,
  VerifiedBadge,
  SecureConnectionBadge,
} from './SecurityBadge';
export type { SecurityBadgeProps } from './SecurityBadge';

// Authentication Components
export { default as BiometricButton } from './BiometricButton';
export type { BiometricButtonProps } from './BiometricButton';

// Confirmation Components
export { default as ConfirmationModal } from './ConfirmationModal';
export type { ConfirmationModalProps } from './ConfirmationModal';

// Error State Components
export {
  default as ErrorState,
  NetworkError,
  ServerError,
  AuthError,
  NotFoundError,
  ValidationError,
  TimeoutError,
} from './ErrorState';
export type { ErrorStateProps, ErrorCategory, ErrorSeverity } from './ErrorState';

// Empty State Components
export {
  default as EmptyState,
  NoTransactionsEmpty,
  NoSubscriptionsEmpty,
  NoGoalsEmpty,
  NoResultsEmpty,
  ErrorEmpty,
  EmptyWallet,
  NoCardsEmpty,
  NoInsightsEmpty,
} from './EmptyState';
export type { EmptyStateProps, EmptyStateVariant } from './EmptyState';
