/**
 * ============================================================
 * DailyStack Design System — ErrorBoundary Component v1.0
 * ============================================================
 * React ErrorBoundary for catching component errors
 * 
 * Design Philosophy:
 * - Tesla-style error display with recovery
 * - Graceful degradation
 * - Optional error reporting
 * - Recovery actions
 */

import React, { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { semantic, text, border } from '../color-tokens';
import { motionTokens, toSeconds, easing } from '../motion-tokens';

// ─── Error Info Props ──────────────────────────────────────────────
export interface ErrorInfoProps {
  componentStack?: string | null;
}

// ─── Error Fallback Props ──────────────────────────────────────────
export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  errorInfo?: ErrorInfoProps;
}

// ─── Component Props ───────────────────────────────────────────────
export interface ErrorBoundaryProps {
  /** Fallback component to render on error */
  fallback?: React.ComponentType<ErrorFallbackProps>;
  /** Custom error message */
  errorMessage?: string;
  /** Enable error reporting */
  onError?: (error: Error, errorInfo: ErrorInfoProps) => void;
  /** Show error details (dev mode) */
  showDetails?: boolean;
  /** Recovery action label */
  recoveryLabel?: string;
  /** Children */
  children: ReactNode;
  /** Custom className */
  className?: string;
}

// React.ErrorInfo type alias for use in componentDidCatch
type ReactErrorInfo = {
  componentStack?: string | null;
  digest?: string;
};

// ─── Default Error Fallback ─────────────────────────────────────────
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
}) => {
  // Check if we're in development mode
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: toSeconds(motionTokens.duration.quick), ease: easing.tight }}
      className="flex flex-col items-center justify-center p-6 text-center"
    >
      {/* Error Icon */}
      <div className="w-16 h-16 mb-4 rounded-full bg-[rgba(255,92,115,0.15)] flex items-center justify-center">
        <svg
          className="w-8 h-8 text-[#FF5C73]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-2">
        Something went wrong
      </h3>

      {/* Description */}
      <p className="text-sm text-[#888888] max-w-sm mb-6">
        We encountered an unexpected error. Please try again or contact support if the problem persists.
      </p>

      {/* Error Message (dev only) */}
      {isDev && error?.message && (
        <div className="w-full max-w-md mb-4 p-3 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] text-left">
          <p className="text-xs text-[#FF5C73] font-mono break-all">
            {error.message}
          </p>
        </div>
      )}

      {/* Recovery Actions */}
      <div className="flex gap-3">
        <button
          onClick={resetError}
          className="px-4 py-2 bg-[#56be89] text-[#0B0F0A] font-semibold rounded-xl hover:bg-[#6fcca3] active:scale-[0.98] transition-all"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[rgba(255,255,255,0.05)] text-white font-medium rounded-xl hover:bg-[rgba(255,255,255,0.1)] active:scale-[0.98] transition-all"
        >
          Reload Page
        </button>
      </div>

      {/* Support Link */}
      <p className="text-xs text-[#666666] mt-6">
        If this keeps happening,{' '}
        <a 
          href="mailto:support@dailystack.app" 
          className="text-[#56be89] hover:underline"
        >
          contact support
        </a>
      </p>
    </motion.div>
  );
};

// ─── Tesla-Style Error Card ─────────────────────────────────────────
export interface TeslaErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const TeslaErrorCard: React.FC<TeslaErrorCardProps> = ({
  title = 'Error',
  message = 'An unexpected error occurred',
  onRetry,
  onDismiss,
  className = '',
}) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className={`
      bg-[rgba(255,92,115,0.1)]
      border border-[rgba(255,92,115,0.3)]
      rounded-2xl p-4
      ${className}
    `}
  >
    <div className="flex items-start gap-3">
      {/* Icon */}
      <div className="w-8 h-8 rounded-full bg-[rgba(255,92,115,0.2)] flex items-center justify-center flex-shrink-0">
        <svg
          className="w-4 h-4 text-[#FF5C73]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white">{title}</h4>
        <p className="text-xs text-[#888888] mt-1">{message}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1.5 text-xs font-medium text-[#56be89] hover:bg-[rgba(199,255,46,0.1)] rounded-lg transition-colors"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-2 py-1.5 text-xs text-[#666666] hover:bg-white/5 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

// ─── Inline Error Message ──────────────────────────────────────────
export interface InlineErrorProps {
  message: string;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({ message, className = '' }) => (
  <motion.p
    initial={{ opacity: 0, y: -4 }}
    animate={{ opacity: 1, y: 0 }}
    className={`
      text-xs text-[#FF5C73] flex items-center gap-1.5
      ${className}
    `}
  >
    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    {message}
  </motion.p>
);

// ─── Error Boundary Class Component ─────────────────────────────────
export class ErrorBoundary extends Component<ErrorBoundaryProps, { hasError: boolean; error: Error | null }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ReactErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, { componentStack: errorInfo.componentStack || null });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { 
      fallback: Fallback, 
      children, 
      errorMessage,
      recoveryLabel,
      className,
    } = this.props;

    if (hasError && error) {
      if (Fallback) {
        return (
          <Fallback
            error={error}
            resetError={this.resetError}
            errorInfo={{ componentStack: '' }}
          />
        );
      }

      return (
        <div className={className}>
          <DefaultErrorFallback
            error={error}
            resetError={this.resetError}
          />
        </div>
      );
    }

    return children;
  }
}

// ─── Hook-based Error Boundary ─────────────────────────────────────
export interface UseErrorBoundaryOptions {
  onError?: (error: Error) => void;
}

export function useErrorBoundary(options?: UseErrorBoundaryOptions) {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const throwError = React.useCallback((err: Error) => {
    setError(err);
    options?.onError?.(err);
  }, [options]);

  if (error) {
    throw error;
  }

  return { resetError, throwError };
}

// ─── Async Error Wrapper ───────────────────────────────────────────
export interface AsyncErrorBoundaryProps {
  children: (props: { error: Error | null; reset: () => void }) => ReactNode;
}

export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({ children }) => {
  const [error, setError] = React.useState<Error | null>(null);

  const reset = React.useCallback(() => {
    setError(null);
  }, []);

  // Wrap children in error handling
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return <>{children({ error, reset })}</>;
};

// ─── Exports ──────────────────────────────────────────────────────
export default ErrorBoundary;
