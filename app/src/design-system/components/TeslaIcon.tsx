/**
 * ============================================================
 * DailyStack Design System — TeslaIcon Component v1.0
 * ============================================================
 * Lucide-react wrapper with consistent sizing
 * 
 * Design Philosophy:
 * - Standardized icon sizes
 * - Consistent stroke width
 * - Color inherits from parent (currentColor)
 * - All icons use Lucide React library
 */

import React from 'react';

// ─── Icon Sizes ─────────────────────────────────────────────────────
export const iconSizes = {
  xs: '0.75rem',   // 12px
  sm: '0.875rem',  // 14px
  md: '1rem',      // 16px
  lg: '1.25rem',   // 20px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
} as const;

// ─── Component Props ───────────────────────────────────────────────
export interface TeslaIconProps extends React.SVGProps<SVGSVGElement> {
  /** Icon component from lucide-react */
  icon: React.ElementType;
  /** Icon size */
  size?: keyof typeof iconSizes | string;
  /** Stroke width (default: 1.5 for regular, 2 for bold) */
  strokeWidth?: number;
  /** Additional classes */
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────────
export const TeslaIcon: React.FC<TeslaIconProps> = ({
  icon: Icon,
  size = 'md',
  strokeWidth = 1.5,
  className = '',
  ...props
}) => {
  // Resolve size value
  const sizeValue = iconSizes[size as keyof typeof iconSizes] || size;

  return (
    <Icon
      width={sizeValue}
      height={sizeValue}
      strokeWidth={strokeWidth}
      className={`inline-flex shrink-0 ${className}`}
      {...props}
    />
  );
};

// ─── Preset Icon Wrappers (for zero-config usage) ──────────────────
// These wrap commonly used icons with consistent defaults

import {
  // Navigation
  Home,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Plus,
  Minus,
  Check,
  
  // Actions
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Share,
  ExternalLink,
  
  // Finance
  Wallet,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Receipt,
  
  // Status
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Loader,
  
  // Misc
  Search,
  Bell,
  Calendar,
  Clock,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Filter,
  MoreVertical,
  MoreHorizontal,
} from 'lucide-react';

// ─── Navigation Icons ───────────────────────────────────────────────
export const Icons = {
  // Navigation
  Home,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Plus,
  Minus,
  Check,
  
  // Actions
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Share,
  ExternalLink,
  
  // Finance
  Wallet,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Receipt,
  
  // Status
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Loader,
  
  // Misc
  Search,
  Bell,
  Calendar,
  Clock,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Filter,
  MoreVertical,
  MoreHorizontal,
} as const;

// ─── Preset Icon Components ────────────────────────────────────────
// For common use cases with pre-configured props

interface PresetIconProps {
  className?: string;
  size?: keyof typeof iconSizes | string;
}

export const HomeIcon: React.FC<PresetIconProps> = (props) => (
  <TeslaIcon icon={Home} {...props} />
);

export const WalletIcon: React.FC<PresetIconProps> = (props) => (
  <TeslaIcon icon={Wallet} {...props} />
);

export const CreditCardIcon: React.FC<PresetIconProps> = (props) => (
  <TeslaIcon icon={CreditCard} {...props} />
);

export const TrendingUpIcon: React.FC<PresetIconProps> = (props) => (
  <TeslaIcon icon={TrendingUp} {...props} />
);

export const TrendingDownIcon: React.FC<PresetIconProps> = (props) => (
  <TeslaIcon icon={TrendingDown} {...props} />
);

export const SettingsIcon: React.FC<PresetIconProps> = (props) => (
  <TeslaIcon icon={Settings} {...props} />
);

export const CheckIcon: React.FC<PresetIconProps> = (props) => (
  <TeslaIcon icon={Check} {...props} />
);

export const AlertIcon: React.FC<PresetIconProps> = (props) => (
  <TeslaIcon icon={AlertCircle} {...props} />
);

export const LockIcon: React.FC<PresetIconProps> = (props) => (
  <TeslaIcon icon={Lock} {...props} />
);

export const EyeIcon: React.FC<PresetIconProps> = (props) => (
  <TeslaIcon icon={Eye} {...props} />
);

export const EyeOffIcon: React.FC<PresetIconProps> = (props) => (
  <TeslaIcon icon={EyeOff} {...props} />
);

export const PlusIcon: React.FC<PresetIconProps> = (props) => (
  <TeslaIcon icon={Plus} {...props} />
);

export const SearchIcon: React.FC<PresetIconProps> = (props) => (
  <TeslaIcon icon={Search} {...props} />
);

export const BellIcon: React.FC<PresetIconProps> = (props) => (
  <TeslaIcon icon={Bell} {...props} />
);

export const LoaderIcon: React.FC<PresetIconProps> = (props) => (
  <TeslaIcon icon={Loader} {...props} />
);

// ─── Exports are handled via inline export declarations above ---
