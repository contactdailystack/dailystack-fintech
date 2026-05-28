/**
 * DailyStack — Shared UI Components (v3)
 * Design System based on GiGi Energy Reference
 * 
 * Features:
 * - 3D Cards with soft shadows
 * - Lime Green (#AAFF12) accent
 * - Light background (#F5F5F5)
 * - Animated effects
 */

import React, { useState } from 'react';

// =====================================================
// SHARED STYLES
// =====================================================
export const colors = {
  lime: '#AAFF12',
  limeDark: '#8FCC00',
  background: '#F5F5F5',
  darkSurface: '#121212',
  cardDark: '#1a1a1a',
  textDark: '#121212',
  textMuted: '#8B949E',
  textSecondary: '#57606A',
  white: '#FFFFFF',
  whiteAlpha: 'rgba(255,255,255,0.1)',
};

// =====================================================
// CARD 3D - 3D Effect Card
// =====================================================
interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  onClick?: () => void;
}

export const Card3D: React.FC<Card3DProps> = ({ 
  children, className = '', dark = false, onClick 
}) => (
  <div 
    onClick={onClick}
    className={`
      relative rounded-3xl overflow-hidden
      ${dark 
        ? 'bg-[#1a1a1a] border border-white/10' 
        : 'bg-white shadow-[0_8px_32px_rgba(13,17,23,0.08),0_2px_8px_rgba(13,17,23,0.04)]'
      }
      ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);

// =====================================================
// CARD FEATURE - Bento Grid Card
// =====================================================
interface CardFeatureProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description?: string;
  accent?: string;
  className?: string;
}

export const CardFeature: React.FC<CardFeatureProps> = ({
  icon: Icon,
  title,
  subtitle,
  description,
  accent = colors.lime,
  className = ''
}) => (
  <div 
    className={`
      relative bg-[#1a1a1a] rounded-2xl p-5 border border-white/10 
      overflow-hidden cursor-pointer
      hover:border-white/20 transition-all duration-300
      group ${className}
    `}
  >
    {/* Glow effect on hover */}
    <div 
      className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: `linear-gradient(135deg, ${accent}40, transparent, ${accent}40)`,
        filter: 'blur(8px)',
      }}
    />
    
    {/* Shine effect on hover */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.03) 25%, transparent 30%)',
          animation: 'shine 1.5s linear infinite',
        }}
      />
    </div>
    
    {/* Content */}
    <div className="relative z-10 flex flex-col min-h-[140px]">
      {/* Icon */}
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 relative"
        style={{ backgroundColor: `${accent}20` }}
      >
        {/* Pulse ring */}
        <div 
          className="absolute inset-0 rounded-xl"
          style={{ backgroundColor: accent }}
        />
        <Icon className="w-5 h-5 relative z-10" style={{ color: accent }} />
      </div>
      
      {/* Text */}
      <div className="flex-1">
        <div className="text-3xl font-black tracking-tight text-white">
          <span style={{ color: accent }}>{title}</span>
        </div>
        <h3 className="text-sm font-semibold text-white mt-1">{subtitle}</h3>
        {description && (
          <p className="text-xs text-white/50 mt-1 font-mono">{description}</p>
        )}
      </div>
      
      {/* Bottom accent line */}
      <div 
        className="h-[2px] rounded-full mt-4"
        style={{ backgroundColor: accent }}
      />
    </div>
  </div>
);

// =====================================================
// BUTTON PRIMARY - Gradient Lime Button
// =====================================================
interface ButtonPrimaryProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({ 
  children, loading, size = 'md', className = '', ...props 
}) => {
  const sizeClasses = {
    sm: 'px-5 py-2.5 text-sm min-h-[44px]',
    md: 'px-6 py-3.5 text-base min-h-[52px]',
    lg: 'px-8 py-4 text-lg min-h-[60px]',
  };
  
  return (
    <button
      {...props}
      className={`
        relative w-full rounded-full font-bold tracking-wide
        bg-gradient-to-b from-[#AAFF12] to-[#8FCC00]
        text-[#121212] shadow-[0_4px_16px_rgba(170,255,18,0.35)]
        hover:shadow-[0_6px_24px_rgba(170,255,18,0.45)]
        hover:-translate-y-[2px] active:translate-y-0
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        transition-all duration-200
        ${sizeClasses[size]} ${className}
      `}
    >
      {/* Shine effect */}
      <div 
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
          transform: 'skewX(-20deg)',
        }}
      />
      <span className="relative z-10">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-[#121212]/30 border-t-[#121212] rounded-full animate-spin" />
            Loading…
          </span>
        ) : children}
      </span>
    </button>
  );
};

// =====================================================
// BUTTON SECONDARY - Dark Outlined Button
// =====================================================
interface ButtonSecondaryProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const ButtonSecondary: React.FC<ButtonSecondaryProps> = ({ 
  children, className = '', ...props 
}) => (
  <button
    {...props}
    className={`
      relative w-full rounded-full font-bold tracking-wide
      bg-transparent border-2 border-[#121212] text-[#121212]
      hover:bg-[#121212] hover:text-white
      active:scale-[0.98]
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-200
      px-6 py-3.5 text-base min-h-[52px]
      ${className}
    `}
  >
    {children}
  </button>
);

// =====================================================
// NAVIGATION - Sticky Navigation Bar
// =====================================================
interface NavigationProps {
  children: React.ReactNode;
  scrolled?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  children, 
  scrolled = false 
}) => (
  <nav 
    className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-500
      ${scrolled 
        ? 'bg-[#121212]/95 backdrop-blur-md border-b border-white/10' 
        : 'bg-transparent'
      }
    `}
  >
    {children}
  </nav>
);

// =====================================================
// NAV LINK - Navigation Link with Hover Effect
// =====================================================
interface NavLinkProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  scrolled?: boolean;
}

export const NavLink: React.FC<NavLinkProps> = ({ 
  label, 
  active = false, 
  onClick,
  scrolled = false 
}) => (
  <button
    onClick={onClick}
    className={`
      text-sm font-medium tracking-wide transition-colors relative
      ${scrolled 
        ? active ? 'text-[#AAFF00]' : 'text-white/80 hover:text-[#AAFF00]' 
        : active ? 'text-[#121212]' : 'text-[#121212]/80 hover:text-[#121212]'
      }
    `}
  >
    {label}
    {active && (
      <span 
        className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#AAFF00] origin-left"
      />
    )}
  </button>
);

// =====================================================
// INPUT FIELD - Modern Input
// =====================================================
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => (
  <div className="space-y-2">
    {label && (
      <label className="text-xs font-semibold text-[#57606A] block pl-1 tracking-wide">
        {label}
      </label>
    )}
    <input
      {...props}
      className={`
        w-full px-5 py-4 min-h-[56px] rounded-[20px] 
        bg-[#F5F5F5] border-2 transition-all duration-200
        ${error ? 'border-red-500' : 'border-transparent focus:border-[#AAFF12]'}
        text-[#0D1117] placeholder:text-[#8B949E] 
        focus:bg-white focus:shadow-[0_0_0_4px_rgba(170,255,18,0.15)]
        focus:outline-none
        ${className}
      `}
    />
    {error && (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50">
        <span className="text-xs text-red-500 font-medium">{error}</span>
      </div>
    )}
  </div>
);

// =====================================================
// BADGE - Status Badge
// =====================================================
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'lime' | 'default' | 'success' | 'warning';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  pulse = false 
}) => {
  const variants = {
    lime: 'bg-[#AAFF12]/10 text-[#AAFF12] border-[#AAFF12]/20',
    default: 'bg-[#F5F5F5] text-[#57606A] border-[#E5E7EB]',
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };
  
  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border
        ${variants[variant]}
      `}
    >
      {pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {children}
    </span>
  );
};

// =====================================================
// SECTION HEADER - Section Title with Accent
// =====================================================
interface SectionHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  label,
  title,
  subtitle 
}) => (
  <div className="mb-6">
    <span className="inline-block font-mono text-[#AAFF12] text-[10px] tracking-[0.3em] uppercase">
      {label}
    </span>
    <h2 className="text-2xl md:text-3xl font-black text-[#121212] tracking-tight mt-1">
      {title}
    </h2>
    <div className="h-[2px] w-12 bg-[#AAFF12] rounded-full mt-2" />
    {subtitle && (
      <p className="text-sm text-[#57606A] mt-3">{subtitle}</p>
    )}
  </div>
);

// =====================================================
// STAT CARD - Dashboard Statistics Card
// =====================================================
interface StatCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  accent?: boolean;
  dark?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  suffix,
  accent = false,
  dark = false 
}) => (
  <div 
    className={`
      rounded-2xl p-4 md:p-5 
      ${dark 
        ? 'bg-[#1a1a1a] border border-white/10' 
        : 'bg-white shadow-[0_4px_16px_rgba(13,17,23,0.06)]'
      }
    `}
  >
    <p className="text-[10px] font-semibold text-[#8B949E] uppercase tracking-widest mb-2 whitespace-nowrap">
      {label}
    </p>
    <p className={`text-3xl font-bold leading-none ${accent ? 'text-[#AAFF12]' : 'text-[#121212]'}`}>
      {value}
      {suffix && (
        <span className="text-xs font-normal text-[#8B949E] ml-1.5">{suffix}</span>
      )}
    </p>
  </div>
);

// =====================================================
// BOTTOM TAB - Bottom Navigation Tab
// =====================================================
interface BottomTabProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const BottomTab: React.FC<BottomTabProps> = ({
  icon: Icon,
  label,
  active = false,
  onClick
}) => (
  <button
    onClick={onClick}
    className={`
      flex-1 flex flex-col items-center justify-center gap-1 py-3
      transition-colors relative
      ${active ? 'text-[#AAFF12]' : 'text-[#8B949E]'}
    `}
  >
    {active && (
      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[#AAFF12]" />
    )}
    <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
    <span className="text-[10px] font-semibold tracking-wide">{label}</span>
  </button>
);

// =====================================================
// DIVIDER - Decorative Divider
// =====================================================
interface DividerProps {
  text?: string;
}

export const Divider: React.FC<DividerProps> = ({ text }) => (
  <div className="relative flex items-center py-4">
    <div className="flex-1 border-t border-[#E5E7EB]" />
    {text && (
      <span className="absolute left-1/2 -translate-x-1/2 px-4 bg-[#F5F5F5] text-xs text-[#8B949E] font-medium">
        {text}
      </span>
    )}
    <div className="flex-1 border-t border-[#E5E7EB]" />
  </div>
);

// =====================================================
// SCROLL INDICATOR - Bouncing Scroll Down Indicator
// =====================================================
export const ScrollIndicator: React.FC = () => (
  <div className="flex flex-col items-center gap-2">
    <div className="w-5 h-8 border-2 border-[#121212]/30 rounded-full flex justify-center pt-1.5">
      <div 
        className="w-1 h-2 bg-[#121212]/30 rounded-full"
        style={{
          animation: 'bounce 2s infinite',
        }}
      />
    </div>
    <span className="text-[10px] text-[#121212]/40 font-mono uppercase tracking-wider">Scroll</span>
  </div>
);

// =====================================================
// GRADIENT CIRCLE - Decorative Background Element
// =====================================================
interface GradientCircleProps {
  size?: number;
  color?: string;
  blur?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const GradientCircle: React.FC<GradientCircleProps> = ({
  size = 300,
  color = '#AAFF12',
  blur = 80,
  position = 'top-right'
}) => {
  const positions = {
    'top-left': { top: '-100px', left: '-100px' },
    'top-right': { top: '-100px', right: '-100px' },
    'bottom-left': { bottom: '-100px', left: '-100px' },
    'bottom-right': { bottom: '-100px', right: '-100px' },
  };
  
  return (
    <div 
      className="absolute pointer-events-none rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle, ${color}20, transparent 70%)`,
        filter: `blur(${blur}px)`,
        ...positions[position],
      }}
    />
  );
};

// =====================================================
// DOT PATTERN - Decorative Background Pattern
// =====================================================
interface DotPatternProps {
  color?: string;
  size?: number;
  opacity?: number;
}

export const DotPattern: React.FC<DotPatternProps> = ({
  color = '#AAFF12',
  size = 24,
  opacity = 0.3
}) => (
  <div 
    className="absolute pointer-events-none"
    style={{
      backgroundImage: `radial-gradient(circle, ${color} 1.5px, transparent 1.5px)`,
      backgroundSize: `${size}px ${size}px`,
      opacity,
    }}
  />
);