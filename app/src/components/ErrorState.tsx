/**
 * ============================================================
 * DailyStack — ErrorState Component (App-level, i18n)
 * ============================================================
 * Clear error states with recovery actions.
 * Shows specific error message (NOT generic "Something went wrong").
 * Provides actionable next steps (retry button, contact support).
 * Uses #FF3B30 sparingly — only for critical errors.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowLeft, Mail, Wifi, WifiOff, AlertCircle } from 'lucide-react';

// ─── Design Tokens ───────────────────────────────────────────────
const LIME = '#0FB0CE';
const ERROR_RED = '#FF3B30';
const ERROR_AMBER = '#FF9F0A';
const MUTED = '#888888';
const BG = '#1A1A1A';

// ─── Error Category ──────────────────────────────────────────────
export type ErrorCategory =
  | 'network' | 'auth' | 'validation' | 'server'
  | 'notFound' | 'permission' | 'timeout' | 'unknown';

export type ErrorSeverity = 'error' | 'warning' | 'info';

// ─── Props ───────────────────────────────────────────────────────
export interface ErrorStateProps {
  /** Error title */
  title?: string;
  /** Detailed error description */
  description?: string;
  /** Error category for icon/style selection */
  category?: ErrorCategory;
  /** Specific error code */
  errorCode?: string;
  /** Retry action */
  onRetry?: () => void;
  /** Go back action */
  onBack?: () => void;
  /** Custom action (contact support, etc.) */
  customAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
  };
  /** Severity level */
  severity?: ErrorSeverity;
  /** Show error code badge */
  showErrorCode?: boolean;
  /** i18n labels */
  labels?: {
    retry?: string;
    goBack?: string;
  };
  className?: string;
}

// ─── Category Presets ────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const categoryPresets: Record<ErrorCategory, {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  color: string;
  severity: ErrorSeverity;
}> = {
  network: {
    title: 'Connection Failed',
    description: 'Please check your internet connection and try again.',
    icon: WifiOff,
    color: ERROR_AMBER,
    severity: 'warning',
  },
  auth: {
    title: 'Authentication Failed',
    description: 'Your session has expired. Please sign in again.',
    icon: AlertCircle,
    color: ERROR_RED,
    severity: 'error',
  },
  validation: {
    title: 'Invalid Input',
    description: 'Please check your input and try again.',
    icon: AlertCircle,
    color: ERROR_AMBER,
    severity: 'warning',
  },
  server: {
    title: 'Server Error',
    description: 'Something went wrong on our end. Please try again in a moment.',
    icon: AlertCircle,
    color: ERROR_RED,
    severity: 'error',
  },
  notFound: {
    title: 'Not Found',
    description: 'The item you are looking for may have been deleted or moved.',
    icon: AlertCircle,
    color: MUTED,
    severity: 'info',
  },
  permission: {
    title: 'Access Denied',
    description: 'You do not have permission to access this resource.',
    icon: AlertCircle,
    color: ERROR_RED,
    severity: 'error',
  },
  timeout: {
    title: 'Request Timeout',
    description: 'Network is too slow. Please try again.',
    icon: Wifi,
    color: ERROR_AMBER,
    severity: 'warning',
  },
  unknown: {
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred. Please try again.',
    icon: AlertCircle,
    color: ERROR_RED,
    severity: 'error',
  },
};

// ─── Error Illustration ─────────────────────────────────────────
const ErrorIllustration: React.FC<{ color: string }> = ({ color }) => (
  <motion.svg viewBox="0 0 120 120" className="w-full h-full">
    <motion.circle
      cx="60" cy="60" r="50"
      fill={BG}
      stroke={color}
      strokeWidth="2"
      strokeOpacity="0.3"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    />
    <motion.path
      d="M60 25 L95 90 L25 90 Z"
      fill="transparent"
      stroke={color}
      strokeWidth="3"
      strokeLinejoin="round"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 15 }}
    />
    <motion.line
      x1="60" y1="45" x2="60" y2="70"
      stroke={color} strokeWidth="4" strokeLinecap="round"
      initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      style={{ originY: 0 }}
    />
    <motion.circle
      cx="60" cy="80" r="4" fill={color}
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ delay: 0.3, type: 'spring' }}
    />
    <motion.circle
      cx="60" cy="60" r="50"
      fill="transparent"
      stroke={color}
      strokeWidth="1"
      strokeOpacity="0.5"
      initial={{ scale: 1, opacity: 0.5 }}
      animate={{ scale: 1.15, opacity: 0 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
    />
  </motion.svg>
);

// ─── Component ───────────────────────────────────────────────────
export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  category = 'unknown',
  errorCode,
  onRetry,
  onBack,
  customAction,
  severity,
  showErrorCode = true,
  labels = {},
  className = '',
}) => {
  const preset = categoryPresets[category];
  const resolvedTitle = title || preset.title;
  const resolvedDescription = description || preset.description;
  const IconComponent = preset.icon;
  const resolvedSeverity = severity ?? preset.severity;
  const resolvedColor =
    resolvedSeverity === 'warning' ? ERROR_AMBER :
    resolvedSeverity === 'info' ? MUTED :
    preset.color;

  const retryLabel = labels.retry ?? 'Try Again';
  const goBackLabel = labels.goBack ?? 'Go Back';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex flex-col items-center justify-center text-center px-6 py-8 ${className}`}
    >
      {/* Illustration */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="w-[120px] h-[120px] mb-6"
      >
        <ErrorIllustration color={resolvedColor} />
      </motion.div>

      {/* Error code badge */}
      {errorCode && showErrorCode && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full mb-2"
          style={{ backgroundColor: `${resolvedColor}15`, border: `1px solid ${resolvedColor}30` }}
        >
          <span className="text-[10px] font-mono font-medium uppercase" style={{ color: resolvedColor }}>
            Error
          </span>
          <span className="text-[10px] font-mono font-bold" style={{ color: resolvedColor }}>
            {errorCode}
          </span>
        </motion.div>
      )}

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-white mb-2 mt-2"
      >
        {resolvedTitle}
      </motion.h3>

      {/* Description */}
      {resolvedDescription && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-sm text-[#888888] max-w-xs mb-6"
        >
          {resolvedDescription}
        </motion.p>
      )}

      {/* Actions */}
      {(onRetry || onBack || customAction) && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-2 w-full max-w-[240px]"
        >
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-[#101010] bg-[#0FB0CE] hover:bg-[#3FC4DB] active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              <RefreshCw size={16} />
              {retryLabel}
            </button>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-transparent hover:bg-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              <ArrowLeft size={16} />
              {goBackLabel}
            </button>
          )}
          {customAction && (
            <button
              onClick={customAction.onClick}
              className={`
                w-full py-3.5 rounded-xl font-semibold text-sm min-h-[44px] transition-all flex items-center justify-center gap-2
                ${customAction.variant === 'secondary'
                  ? 'text-white bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#2A2A2A] active:scale-[0.98]'
                  : 'text-[#0FB0CE] hover:underline'}
              `}
            >
              {customAction.label}
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

// ─── Preset Error States ─────────────────────────────────────────
interface PresetErrorProps {
  onRetry?: () => void;
  onBack?: () => void;
  errorCode?: string;
  labels?: ErrorStateProps['labels'];
  className?: string;
}

export const NetworkError: React.FC<PresetErrorProps> = (props) => (
  <ErrorState category="network" {...props} />
);

export const ServerError: React.FC<PresetErrorProps> = (props) => (
  <ErrorState category="server" {...props} />
);

export const AuthError: React.FC<PresetErrorProps> = (props) => (
  <ErrorState category="auth" {...props} />
);

export const NotFoundError: React.FC<PresetErrorProps> = (props) => (
  <ErrorState category="notFound" {...props} />
);

export const ValidationError: React.FC<PresetErrorProps & { description?: string }> = (props) => (
  <ErrorState category="validation" description={props.description} onRetry={props.onRetry} />
);

export const TimeoutError: React.FC<PresetErrorProps> = (props) => (
  <ErrorState category="timeout" {...props} />
);

export default ErrorState;
