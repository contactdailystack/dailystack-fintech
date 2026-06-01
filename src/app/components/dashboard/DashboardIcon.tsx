import React from 'react';
import { 
  Briefcase, GraduationCap, Heart, Palette, Zap, 
  Plus, ChevronRight, Check, Settings, Flame, 
  Calendar, Target, Phone, Star, TrendingUp, 
  Users, Moon, Sun, Sparkles, PartyPopper, 
  Trophy, Medal, Folder, Lightbulb, 
  Award, ShieldCheck, Bell, Shield, Home, 
  CheckSquare, TrendingUp as TrendUp, CheckCircle, Clock
} from 'lucide-react';

export const Icon: React.FC<{
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ name, size = 24, className = '', style }) => {
  const icons: Record<string, React.ReactElement> = {
    work: <Briefcase size={size} />,
    school: <GraduationCap size={size} />,
    favorite: <Heart size={size} />,
    palette: <Palette size={size} />,
    bolt: <Zap size={size} />,
    plus: <Plus size={size} />,
    chevronRight: <ChevronRight size={size} />,
    check: <Check size={size} />,
    settings: <Settings size={size} />,
    flame: <Flame size={size} />,
    calendar: <Calendar size={size} />,
    target: <Target size={size} />,
    phone: <Phone size={size} />,
    star: <Star size={size} />,
    trending: <TrendingUp size={size} />,
    trending_up: <TrendUp size={size} />,
    users: <Users size={size} />,
    moon: <Moon size={size} />,
    light: <Sun size={size} />,
    heart: <Heart size={size} />,
    zap: <Zap size={size} />,
    sparkle: <Sparkles size={size} />,
    confetti: <PartyPopper size={size} />,
    trophy: <Trophy size={size} />,
    medal: <Medal size={size} />,
    fire: <Flame size={size} />,
    folder: <Folder size={size} />,
    lightbulb: <Lightbulb size={size} />,
    local_fire_department: <Flame size={size} />, // fallback
    bedtime: <Moon size={size} />, // fallback
    emoji_events: <Award size={size} />, // fallback
    verified: <ShieldCheck size={size} />, // fallback
    notifications_active: <Bell size={size} />, // fallback
    check_circle: <CheckCircle size={size} />,
    clock: <Clock size={size} />,
    shield: <Shield size={size} />,
    home: <Home size={size} />,
    checklist: <CheckSquare size={size} />,
  };

  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      {icons[name] || <Star size={size} />}
    </span>
  );
};

export const ProgressRing: React.FC<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  accent?: string;
  label?: string;
  animate?: boolean;
}> = ({ progress, size = 120, strokeWidth = 8, accent = 'var(--pilo)', label, animate = true }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  // Create a safe filter ID by stripping non-alphanumeric characters (like # or var(--))
  const safeId = accent.replace(/[^a-zA-Z0-9-]/g, '');
  // Pilo: Subtle glow effect for progress
  const glowColor = `rgba(209, 255, 59, 0.25)`;

  return (
    <div className="ds-progress-ring" style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} className="progress-ring-svg">
        <defs>
          <filter id={`glow-${safeId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle
          className="ds-progress-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          opacity="0.15"
        />
        <circle
          className={`ds-progress-ring-fill ${animate ? 'animate-progress' : ''}`}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={accent}
          strokeLinecap="round"
          filter={`url(#glow-${safeId})`}
          style={{
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
        />
      </svg>
      <div className="text-center" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <span className="ds-progress-ring-text" style={{ position: 'static', color: 'var(--text-primary)', fontSize: '24px', fontWeight: 800 }}>
          {progress}%
        </span>
        {label && (
          <span className="ds-progress-ring-label block mt-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        )}
      </div>
    </div>
  );
};
