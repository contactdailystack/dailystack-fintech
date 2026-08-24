/**
 * ============================================================
 * DailyStack Design System — ErrorState Component v1.0
 * ============================================================
 * Specialized error state component following Nielsen's Heuristic #9:
 * "Help users recognize, diagnose, and recover from errors"
 * 
 * Design Principles:
 * - Specific, actionable error messages
 * - Clear error categorization with error codes
 * - Recovery actions (retry, go back, contact support)
 * - Warning/alert color scheme for visual distinction
 */

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, ArrowLeft, Mail, Wifi, WifiOff } from 'lucide-react';
import { ActionButton } from './ActionButton';
import { motionTokens, toSeconds, easing } from '../motion-tokens';

// ─── Design Tokens ──────────────────────────────────────────────────
const ACCENT = '#0FB0CE';
const ERROR_RED = '#F87171';
const ERROR_AMBER = '#F59E0B';
const ERROR_ORANGE = '#F97316';
const MUTED = '#888888';
const BACKGROUND = '#1A1A1A';
const SURFACE = '#050D1F';

// ─── Error Type Categories ──────────────────────────────────────────
export type ErrorCategory = 
  | 'network'      // Connection issues
  | 'auth'         // Authentication/authorization
  | 'validation'   // Input validation errors
  | 'server'       // Server errors
  | 'notFound'     // Resource not found
  | 'permission'   // Access denied
  | 'timeout'      // Request timeout
  | 'unknown';     // Generic/unknown

// ─── Error Severity ─────────────────────────────────────────────────
export type ErrorSeverity = 'error' | 'warning' | 'info';

// ─── Component Props ───────────────────────────────────────────────
export interface ErrorStateProps {
  /** Error title (optional if category is provided) */
  title?: string;
  /** Detailed error description (optional if category is provided) */
  description?: string;
  /** Error category for icon/style selection */
  category?: ErrorCategory;
  /** Specific error code for debugging */
  errorCode?: string;
  /** Retry action callback */
  retryAction?: () => void;
  /** Go back action callback */
  onBack?: () => void;
  /** Custom action (contact support, etc.) */
  customAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
  };
  /** Error severity level */
  severity?: ErrorSeverity;
  /** Show error code badge */
  showErrorCode?: boolean;
  /** Custom className */
  className?: string;
}

// ─── Error Category Presets ─────────────────────────────────────────
const errorPresets: Record<ErrorCategory, {
  title: string;
  description: string;
  icon: React.FC<{ className?: string; color?: string }>;
  color: string;
  severity: ErrorSeverity;
}> = {
  'network': {
    title: 'Connection Failed',
    description: 'Please check your internet connection and try again',
    icon: WifiOff,
    color: ERROR_AMBER,
    severity: 'warning',
  },
  'auth': {
    title: 'Authentication Failed',
    description: 'Your session has expired. Please sign in again',
    icon: AlertCircle,
    color: ERROR_RED,
    severity: 'error',
  },
  'validation': {
    title: 'Invalid Input',
    description: 'Please check your input and try again',
    icon: AlertCircle,
    color: ERROR_ORANGE,
    severity: 'warning',
  },
  'server': {
    title: 'Server Error',
    description: 'Server is processing. Please wait a moment and try again',
    icon: AlertCircle,
    color: ERROR_RED,
    severity: 'error',
  },
  'notFound': {
    title: 'Not Found',
    description: 'The item you are looking for may have been deleted or moved',
    icon: AlertCircle,
    color: MUTED,
    severity: 'info',
  },
  'permission': {
    title: 'Access Denied',
    description: 'You do not have permission to access this resource',
    icon: AlertCircle,
    color: ERROR_RED,
    severity: 'error',
  },
  'timeout': {
    title: 'Request Timeout',
    description: 'Network is too slow. Please try again',
    icon: Wifi,
    color: ERROR_AMBER,
    severity: 'warning',
  },
  'unknown': {
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred. Please try again',
    icon: AlertCircle,
    color: ERROR_RED,
    severity: 'error',
  },
};

// ─── Error Illustration SVG ─────────────────────────────────────────
const ErrorIllustration: React.FC<{ color: string; className?: string }> = ({ color, className }) => (
  <motion.svg
    viewBox="0 0 120 120"
    className={className}
    initial="hidden"
    animate="visible"
  >
    {/* Background circle */}
    <motion.circle
      cx="60" cy="60" r="50"
      fill={BACKGROUND}
      stroke={color}
      strokeWidth="2"
      strokeOpacity="0.3"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    />
    {/* Warning triangle */}
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
    {/* Exclamation line */}
    <motion.line 
      x1="60" y1="45" x2="60" y2="70" 
      stroke={color} 
      strokeWidth="4" 
      strokeLinecap="round"
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      style={{ originY: 0 }}
    />
    {/* Exclamation dot */}
    <motion.circle 
      cx="60" cy="80" 
      r="4" 
      fill={color}
      initial={{ scale: 0 }} 
      animate={{ scale: 1 }} 
      transition={{ delay: 0.3, type: 'spring' }}
    />
    {/* Pulse ring */}
    <motion.circle
      cx="60" cy="60" r="50"
      fill="transparent"
      stroke={color}
      strokeWidth="1"
      strokeOpacity="0.5"
      initial={{ scale: 1, opacity: 0.5 }}
      animate={{ scale: 1.1, opacity: 0 }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity,
        ease: 'easeOut'
      }}
    />
  </motion.svg>
);

// ─── Error Code Badge ────────────────────────────────────────────────
const ErrorCodeBadge: React.FC<{ code: string; color: string }> = ({ code, color }) => (
  <motion.div
    initial={{ opacity: 0, y: -5 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full"
    style={{ 
      backgroundColor: `${color}15`,
      border: `1px solid ${color}30`
    }}
  >
    <span className="text-[10px] font-mono font-medium uppercase" style={{ color }}>
      Error
    </span>
    <span className="text-[10px] font-mono font-bold" style={{ color }}>
      {code}
    </span>
  </motion.div>
);

// ─── Component ─────────────────────────────────────────────────────
export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  category = 'unknown',
  errorCode,
  retryAction,
  onBack,
  customAction,
  severity = 'error',
  showErrorCode = true,
  className = '',
}) => {
  const preset = errorPresets[category];
  const resolvedTitle = title || preset.title;
  const resolvedDescription = description || preset.description;
  const IconComponent = preset.icon;
  const resolvedColor = severity === 'warning' ? ERROR_AMBER : severity === 'info' ? MUTED : preset.color;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: toSeconds(motionTokens.duration.normal), ease: easing.tight }}
      className={`
        flex flex-col items-center justify-center
        text-center
        px-6 py-8
        ${className}
      `}
    >
      {/* Error Illustration */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: toSeconds(motionTokens.duration.quick), 
          ease: easing.tight,
          delay: 0.1,
        }}
        className="w-[120px] h-[120px] mb-6"
      >
        <ErrorIllustration color={resolvedColor} className="w-full h-full" />
      </motion.div>

      {/* Error Code Badge */}
      {errorCode && showErrorCode && (
        <ErrorCodeBadge code={errorCode} color={resolvedColor} />
      )}

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: toSeconds(motionTokens.duration.quick), 
          ease: easing.tight,
          delay: 0.2,
        }}
        className="text-lg font-semibold text-white mb-2 mt-2"
      >
        {resolvedTitle}
      </motion.h3>

      {/* Description */}
      {resolvedDescription && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: toSeconds(motionTokens.duration.quick), 
            ease: easing.tight,
            delay: 0.25,
          }}
          className="text-sm text-[#888888] max-w-xs mb-6"
        >
          {resolvedDescription}
        </motion.p>
      )}

      {/* Action Buttons */}
      {(retryAction || onBack || customAction) && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: toSeconds(motionTokens.duration.quick), 
            ease: easing.tight,
            delay: 0.3,
          }}
          className="flex flex-col gap-2 w-full max-w-[240px]"
        >
          {retryAction && (
            <ActionButton
              variant="primary"
              onClick={retryAction}
              fullWidth
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              ลองอีกครั้ง
            </ActionButton>
          )}
          {onBack && (
            <ActionButton
              variant="ghost"
              onClick={onBack}
              fullWidth
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับ
            </ActionButton>
          )}
          {customAction && (
            <ActionButton
              variant={customAction.variant || 'secondary'}
              onClick={customAction.onClick}
              fullWidth
            >
              {customAction.label}
            </ActionButton>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

// ─── Preset Error States ───────────────────────────────────────────

// Network Error (No Internet)
export interface NetworkErrorProps {
  retryAction?: () => void;
  onBack?: () => void;
  errorCode?: string;
  className?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ 
  retryAction, 
  onBack, 
  errorCode,
  className = '' 
}) => (
  <ErrorState
    category="network"
    errorCode={errorCode}
    retryAction={retryAction}
    onBack={onBack}
    className={className}
  />
);

// Server Error (500)
export interface ServerErrorProps {
  retryAction?: () => void;
  onBack?: () => void;
  errorCode?: string;
  className?: string;
}

export const ServerError: React.FC<ServerErrorProps> = ({ 
  retryAction, 
  onBack, 
  errorCode,
  className = '' 
}) => (
  <ErrorState
    category="server"
    errorCode={errorCode}
    retryAction={retryAction}
    onBack={onBack}
    className={className}
  />
);

// Authentication Error
export interface AuthErrorProps {
  onBack?: () => void;
  onRetry?: () => void;
  errorCode?: string;
  className?: string;
}

export const AuthError: React.FC<AuthErrorProps> = ({ 
  onBack, 
  onRetry,
  errorCode,
  className = '' 
}) => (
  <ErrorState
    category="auth"
    errorCode={errorCode}
    retryAction={onRetry}
    onBack={onBack}
    className={className}
  />
);

// Not Found Error (404)
export interface NotFoundErrorProps {
  onBack?: () => void;
  errorCode?: string;
  className?: string;
}

export const NotFoundError: React.FC<NotFoundErrorProps> = ({ 
  onBack, 
  errorCode,
  className = '' 
}) => (
  <ErrorState
    category="notFound"
    errorCode={errorCode}
    onBack={onBack}
    className={className}
  />
);

// Validation Error
export interface ValidationErrorProps {
  message: string;
  onRetry?: () => void;
  errorCode?: string;
  className?: string;
}

export const ValidationError: React.FC<ValidationErrorProps> = ({ 
  message, 
  onRetry,
  errorCode,
  className = '' 
}) => (
  <ErrorState
    category="validation"
    description={message}
    errorCode={errorCode}
    retryAction={onRetry}
    className={className}
  />
);

// Timeout Error
export interface TimeoutErrorProps {
  retryAction?: () => void;
  onBack?: () => void;
  errorCode?: string;
  className?: string;
}

export const TimeoutError: React.FC<TimeoutErrorProps> = ({ 
  retryAction, 
  onBack, 
  errorCode,
  className = '' 
}) => (
  <ErrorState
    category="timeout"
    errorCode={errorCode}
    retryAction={retryAction}
    onBack={onBack}
    className={className}
  />
);

// ─── Exports ──────────────────────────────────────────────────────
export default ErrorState;
