/**
 * ============================================================
 * DailyStack — SecurityBadge Component (App-level, i18n)
 * ============================================================
 * Reusable security indicator badge for trust & safety UI.
 * Wraps the design-system SecurityBadge but accepts i18n labels
 * from translations.ts.
 *
 * Variants: 'encrypted' | 'verified' | 'secure'
 * Appears in Settings/Profile, Auth screens, Dashboard header.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, ShieldCheck } from 'lucide-react';

export interface SecurityBadgeProps {
  /** Badge variant determines icon + default label */
  variant?: 'encrypted' | 'verified' | 'secure';
  /** Override label text (i18n key lookup done by parent) */
  label?: string;
  /** Show the badge */
  show?: boolean;
  className?: string;
}

// ─── Design Tokens ────────────────────────────────────────────────
const APPLE_GREEN = '#34C759';

const variantConfig = {
  encrypted: {
    icon: Lock,
    defaultLabel: '256-bit Encrypted',
    bg: 'rgba(52, 199, 89, 0.12)',
    border: 'rgba(52, 199, 89, 0.25)',
    color: APPLE_GREEN,
  },
  verified: {
    icon: ShieldCheck,
    defaultLabel: 'Verified Account',
    bg: 'rgba(52, 199, 89, 0.12)',
    border: 'rgba(52, 199, 89, 0.25)',
    color: APPLE_GREEN,
  },
  secure: {
    icon: Shield,
    defaultLabel: 'Secure Connection',
    bg: 'rgba(52, 199, 89, 0.12)',
    border: 'rgba(52, 199, 89, 0.25)',
    color: APPLE_GREEN,
  },
};

export const SecurityBadge: React.FC<SecurityBadgeProps> = ({
  variant = 'encrypted',
  label,
  show = true,
  className = '',
}) => {
  if (!show) return null;

  const config = variantConfig[variant];
  const Icon = config.icon;
  const displayLabel = label ?? config.defaultLabel;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium text-[0.625rem] tracking-wide uppercase ${className}`}
      style={{
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
      }}
      role="status"
      aria-label={`Security: ${displayLabel}`}
    >
      <Icon size={12} strokeWidth={2.5} />
      <span>{displayLabel}</span>
    </motion.span>
  );
};

// ─── Preset Badges ────────────────────────────────────────────────
interface PresetBadgeProps {
  show?: boolean;
  className?: string;
}

export const EncryptedBadge: React.FC<PresetBadgeProps> = ({ show = true, className }) => (
  <SecurityBadge variant="encrypted" show={show} className={className} />
);

export const VerifiedBadge: React.FC<PresetBadgeProps> = ({ show = true, className }) => (
  <SecurityBadge variant="verified" show={show} className={className} />
);

export const SecureConnectionBadge: React.FC<PresetBadgeProps> = ({ show = true, className }) => (
  <SecurityBadge variant="secure" show={show} className={className} />
);

export default SecurityBadge;
