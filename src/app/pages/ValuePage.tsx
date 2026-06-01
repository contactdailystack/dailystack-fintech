/**
 * DailyStack — Value Page v7.0
 * Premium Fintech Paywall & Rewards Dashboard
 * 
 * Features:
 * - Platinum Virtual Card (Cyberpunk style)
 * - Energy Points Ledger
 * - Pro Subscription Paywall
 * - Premium checkout experience
 * - Success confetti animation
 * 
 * Design: Design Concept v6.5 + Customer Journey Step 6
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Shell, FadeUp, ScaleIn, Badge } from '../components/DesignSystem';
import { ValueSkeleton } from '../components/SkeletonLoaders';
import { WalletSandboxPlayground } from '../wallet-sandbox/WalletSandboxPlayground';

/* ── Material Symbols helper ──────────────────────────────────── */
const Icon: React.FC<{ name: string; size?: number; className?: string; style?: React.CSSProperties }> = ({
  name, size = 20, className = '', style
}) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, ...style }}>{name}</span>
);

/* ── Confetti Particle Component ───────────────────────────────── */
const ConfettiParticle: React.FC<{ delay: number; x: number; color: string }> = ({ delay, x, color }) => (
  <div
    style={{
      position: 'absolute',
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: color,
      left: `${x}%`,
      top: '50%',
      animation: `confettiFall 1.5s ease-out ${delay}ms forwards`,
      opacity: 0,
    }}
  />
);

const ConfettiEffect: React.FC = () => {
  const colors = ['#C0F500', '#56BE89', '#FF6B9D', '#9B5DE5', '#FFB800', '#DFFF4A'];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: 30 }).map((_, i) => (
        <ConfettiParticle
          key={i}
          delay={i * 30}
          x={Math.random() * 100}
          color={colors[i % colors.length]}
        />
      ))}
    </div>
  );
};

/* ── Progress Ring Component ─────────────────────────────────── */
const ProgressRing: React.FC<{ 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  accent?: string;
  label?: string;
}> = ({ progress, size = 120, strokeWidth = 8, accent = '#C0F500', label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-4)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 8px ${accent}50)`,
            transition: 'stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ 
          fontFamily: 'var(--font-mono)', 
          fontSize: size * 0.22, 
          fontWeight: 800,
          color: accent 
        }}>
          {progress}%
        </span>
        {label && (
          <span style={{ 
            fontSize: 10, 
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginTop: 4,
          }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

/* ── Premium Button Component ────────────────────────────────── */
const PremiumButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
}> = ({ children, onClick, disabled = false, loading = false, variant = 'primary', className = '' }) => {
  const baseStyles = {
    primary: {
      background: 'var(--neon)',
      color: 'var(--text-inverse)',
      boxShadow: 'var(--shadow-neon-sm)',
    },
    secondary: {
      background: 'var(--surface-3)',
      color: 'var(--text-primary)',
      boxShadow: 'none',
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`premium-btn ${className}`}
      style={{
        ...baseStyles[variant],
        padding: '14px 28px',
        borderRadius: '9999px',
        fontFamily: 'var(--font)',
        fontWeight: 700,
        fontSize: 14,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        justifyContent: 'center',
      }}
    >
      {loading ? (
        <Icon name="progress_activity" size={18} className="animate-spin" />
      ) : children}
    </button>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 font-mono text-xs space-y-3 my-4">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-red-500 text-sm">
            <span className="material-symbols-outlined">warning</span>
            <span>Fintech Sandbox Crash Boundary</span>
          </div>
          <p className="font-semibold text-white">{this.state.error?.message || 'Unknown runtime error'}</p>
          {this.state.error?.stack && (
            <pre className="p-3 bg-black/60 rounded-lg overflow-x-auto text-[9px] leading-relaxed max-h-40 scrollbar-thin text-gray-400">
              {this.state.error.stack}
            </pre>
          )}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="w-full py-2 bg-red-500 text-white font-bold rounded-lg text-[10px] uppercase transition-all active:scale-95"
          >
            Reset App Cache & Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ValuePage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const { isDark } = useTheme();
  const isThai = lang === 'th';

  const [loading, setLoading] = useState(true);
  const [energyPoints, setEnergyPoints] = useState(847); // Simulated premium balance
  const [proActive, setProActive] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);

  useEffect(() => {
    // Read energy points and pro status from localStorage
    const savedPoints = localStorage.getItem('dailystack-energy-points');
    if (savedPoints) {
      setEnergyPoints(parseInt(savedPoints, 10));
    }

    const savedPro = localStorage.getItem('dailystack-pro-active');
    if (savedPro === 'true') {
      setProActive(true);
    }

    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleTogglePro = () => {
    if (proActive) {
      setProActive(false);
      localStorage.setItem('dailystack-pro-active', 'false');
    } else {
      setCheckoutLoading(true);
      setTimeout(() => {
        setProActive(true);
        setCheckoutLoading(false);
        setShowCheckoutSuccess(true);
        localStorage.setItem('dailystack-pro-active', 'true');
        localStorage.setItem('dailystack-dating-subscribed', 'true');
        setTimeout(() => setShowCheckoutSuccess(false), 4000);
      }, 1500);
    }
  };

  const transactions = [
    { id: 1, title: isThai ? 'Daily Stack Completed' : 'Daily Stack Completed', date: isThai ? 'วันนี้' : 'Today', points: '+25', type: 'earn' },
    { id: 2, title: isThai ? 'Weekly Perfect Stack Bonus' : 'Weekly Perfect Stack', date: isThai ? 'เมื่อวาน' : 'Yesterday', points: '+50', type: 'earn' },
    { id: 3, title: isThai ? 'Learning Streak Bonus' : 'Learning Streak', date: isThai ? '2 วันก่อน' : '2 days ago', points: '+15', type: 'earn' },
    { id: 4, title: isThai ? 'Relationship Care' : 'Relationship Care', date: isThai ? '3 วันก่อน' : '3 days ago', points: '+10', type: 'earn' },
    { id: 5, title: isThai ? 'Profile Quality Boost' : 'Profile Quality', date: isThai ? '4 วันก่อน' : '4 days ago', points: '+20', type: 'earn' },
  ];

  return (
    <Shell
      lang={lang}
      onLangChange={setLang}
      showNav
      showLangToggle
      showOrbs
      showBack
      onBack={() => navigate('/dashboard')}
      title={proActive ? 'Smart Wallet' : 'Value & Rewards'}
    >
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(-200px) rotate(720deg) scale(0); opacity: 0; }
        }
        @keyframes scaleUp {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .premium-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-neon);
        }
        .premium-btn:active:not(:disabled) {
          transform: scale(0.98);
        }
        .card-shine {
          position: relative;
          overflow: hidden;
        }
        .card-shine::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 40%,
            rgba(255,255,255,0.1) 50%,
            transparent 60%
          );
          animation: shine 3s ease-in-out infinite;
        }
        @keyframes shine {
          0%, 100% { transform: translateX(-100%) rotate(45deg); }
          50% { transform: translateX(100%) rotate(45deg); }
        }
      `}</style>

      <div className="px-5 pt-[calc(var(--safe-top)+80px)] pb-32">
        {loading ? (
          <ValueSkeleton />
        ) : proActive ? (
          <FadeUp delay={0}>
            <ErrorBoundary>
              <WalletSandboxPlayground onLockPro={() => {
                setProActive(false);
                localStorage.setItem('dailystack-pro-active', 'false');
              }} />
            </ErrorBoundary>
          </FadeUp>
        ) : (
          <>
            {/* ── Hero Section ────────────────────────────────────────── */}
            <FadeUp delay={0}>
              <div className="text-center mb-8">
                <Badge variant="lime" pulse className="mb-4">
                  {isThai ? 'Energy Reward System' : 'ENERGY REWARD SYSTEM'}
                </Badge>
                <h1 className="text-5xl font-black tracking-tight mb-2 font-space" style={{ 
                  letterSpacing: '-0.03em',
                  background: isDark ? 'linear-gradient(135deg, #FFF 60%, var(--neon) 100%)' : 'linear-gradient(135deg, var(--text-primary) 60%, var(--neon) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {energyPoints.toLocaleString()}
                  <span style={{ 
                    fontFamily: 'var(--font-mono)', 
                    color: 'var(--neon)',
                    fontWeight: 800,
                    marginLeft: 10,
                    fontSize: 18, 
                    letterSpacing: '0.05em'
                  }}>PTS</span>
                </h1>
                <p className="text-xs text-[var(--text-secondary)] font-medium">
                  {isThai 
                    ? 'คะแนนพลังงานสะสมจากการมีวินัยทำ Stacks สำเร็จ' 
                    : 'Points earned through disciplined Stack completions'}
                </p>
              </div>
            </FadeUp>

            <div className="space-y-6">
            
            {/* ── Premium Platinum Card ──────────────────────────────── */}
            <FadeUp delay={100}>
              <div 
                className="card-shine rounded-[28px] p-6 relative overflow-hidden ds-glass-card ds-card-glow-neon"
                style={{
                  background: 'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(192, 245, 0, 0.04) 100%)',
                  minHeight: 200,
                }}
              >
                {/* Padlock visual overlay representing premium lock */}
                {!proActive && (
                  <div 
                    onClick={handleTogglePro}
                    className="absolute inset-0 bg-black/75 backdrop-blur-[4px] z-20 flex flex-col items-center justify-center gap-3 select-none cursor-pointer transition-all duration-300 group"
                    title="แตะเพื่อทดลองปลดล็อกระบบบัญชีรายรับรายจ่ายพรีเมียม! (Tap to simulate Checkout & Unlock)"
                  >
                    <div className="w-16 h-16 rounded-full bg-[var(--neon-surface)] flex items-center justify-center border border-[var(--neon)] shadow-[0_0_20px_var(--neon-glow)] transition-all group-hover:scale-110 active:scale-95">
                      {checkoutLoading ? (
                        <Icon name="progress_activity" size={26} className="animate-spin text-[var(--neon)]" />
                      ) : (
                        <Icon name="lock" size={26} style={{ color: 'var(--neon)' }} />
                      )}
                    </div>
                    <div className="text-center space-y-1.5 px-6">
                      <span className="text-[10px] font-mono font-black text-[var(--neon)] tracking-[0.25em] block uppercase">
                        PREMIUM LOCKED
                      </span>
                      <span className="text-[9px] text-gray-300 font-sans font-semibold tracking-wide block animate-pulse">
                        💡 แตะการ์ดตรงนี้เพื่อซื้ออัปเกรด Pro และเปิดระบบ Smart Wallet จำลองทันที!
                      </span>
                    </div>
                  </div>
                )}
                {/* Glow accent */}
                <div style={{
                  position: 'absolute',
                  right: '-20%',
                  top: '-20%',
                  width: 250,
                  height: 250,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(192, 245, 0, 0.15) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                  pointerEvents: 'none',
                }} />

                {/* Card header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span style={{ 
                      fontSize: 9, 
                      fontFamily: 'var(--font-mono)', 
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.2em',
                      fontWeight: 700
                    }}>
                      DailyStack
                    </span>
                    <h3 className="text-base font-black mt-1 font-space tracking-tight text-white">
                      {proActive ? 'PRO MEMBER' : 'STANDARD TIER'}
                    </h3>
                  </div>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    background: 'rgba(192, 245, 0, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(192, 245, 0, 0.15)',
                  }}>
                    <Icon name="token" size={20} style={{ color: 'var(--neon)' }} />
                  </div>
                </div>

                {/* Virtual card number */}
                <div className="mb-6">
                  <p style={{ 
                    fontSize: 9, 
                    fontFamily: 'var(--font-mono)', 
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    fontWeight: 700,
                    marginBottom: 6,
                  }}>
                    {isThai ? 'รหัสกระเป๋าเสมือน' : 'Virtual Wallet'}
                  </p>
                  <p style={{ 
                    fontSize: 16, 
                    fontFamily: 'var(--font-mono)', 
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    color: 'var(--text-primary)'
                  }}>
                    •••• •••• •••• 8829
                  </p>
                </div>

                {/* Card footer */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-end',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: 16,
                }}>
                  <div>
                    <span style={{ 
                      fontSize: 9, 
                      fontFamily: 'var(--font-mono)', 
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      fontWeight: 700
                    }}>
                      {isThai ? 'แต้มสะสม' : 'Energy'}
                    </span>
                    <p style={{ 
                      fontSize: 13, 
                      fontFamily: 'var(--font-mono)', 
                      fontWeight: 800, 
                      color: 'var(--neon)',
                      marginTop: 2
                    }}>
                      {energyPoints.toLocaleString()} PTS
                    </p>
                  </div>
                  <div>
                    <span style={{ 
                      fontSize: 9, 
                      fontFamily: 'var(--font-mono)', 
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      fontWeight: 700
                    }}>
                      {isThai ? 'สถานะ' : 'Status'}
                    </span>
                    <p style={{ 
                      fontSize: 11, 
                      fontFamily: 'var(--font-mono)', 
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginTop: 2
                    }}>
                      {proActive ? 'ACTIVE' : 'INACTIVE'}
                    </p>
                  </div>
                </div>
              </div>
            </FadeUp>

            {/* ── Pro Subscription Card ──────────────────────────────── */}
            <FadeUp delay={200}>
              <div 
                className="ds-glass-card ds-card-glow-neon p-6 relative overflow-hidden"
                style={{
                  borderRadius: '28px',
                  background: 'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(192, 245, 0, 0.02) 100%)',
                }}
              >
                {/* Background glow for Pro */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 160,
                  height: 160,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(192, 245, 0, 0.08) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                  pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Badge variant={proActive ? 'success' : 'lime'} pulse={!proActive}>
                      {proActive ? (isThai ? 'เปิดใช้งานแล้ว' : 'ACTIVE') : (isThai ? 'แนะนำพรีเมียม' : 'RECOMMENDED')}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-black mb-2 text-[var(--text-primary)] font-space tracking-tight">
                    DailyStack Pro
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mb-5 leading-relaxed font-medium">
                    {isThai
                      ? 'ปลดล็อกระบบบริหารทรัพย์สินสุทธิ + สมุดบันทึกรายรับรายจ่าย + แป้นเครื่องคิดเลขจำลอง + ติดตามค่าบริการรายเดือน'
                      : 'Unlock Net Worth tracking + Built-in calculator ledger + Recurring subscriptions manager'}
                  </p>

                  {/* Features list */}
                  <div className="space-y-3.5 mb-6">
                    {[
                      { icon: 'calculate', text: isThai ? 'แป้นพิมพ์เครื่องคิดเลขในตัวอัจฉริยะ' : 'Built-in smart calculator keyboard' },
                      { icon: 'pie_chart', text: isThai ? 'แผนภูมิวิเคราะห์รายรับรายจ่ายสถิติ' : 'Visual category spending pie charts' },
                      { icon: 'calendar_month', text: isThai ? 'สมุดบัญชีรายวันและระบบปฏิทิน' : 'Daily ledger calendar tracking' },
                      { icon: 'sync', text: isThai ? 'ซิงค์ข้อมูล Supabase Cloud ข้ามอุปกรณ์' : 'Supabase Cloud multi-device sync' },
                    ].map((feature, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: 9,
                          background: 'rgba(192, 245, 0, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Icon name={feature.icon} size={14} style={{ color: 'var(--lime)' }} />
                        </div>
                        <span className="text-xs font-semibold text-[var(--text-secondary)]">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price and CTA */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    paddingTop: 18,
                    borderTop: '1px solid var(--border-subtle)',
                  }}>
                    <div>
                      <p className="text-[10px] text-[var(--text-muted)] font-mono font-bold uppercase tracking-wider">
                        {isThai ? 'ราคาเพียง' : 'Starting at'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 2 }}>
                        <span className="text-2xl font-black font-space text-[var(--text-primary)]">
                          $4.99
                        </span>
                        <span className="text-xs text-[var(--text-muted)] font-mono">/mo</span>
                      </div>
                    </div>

                    <PremiumButton
                      onClick={handleTogglePro}
                      loading={checkoutLoading}
                      variant={proActive ? 'secondary' : 'primary'}
                      className="cursor-pointer"
                    >
                      {proActive ? (
                        <>
                          <Icon name="cancel" size={16} />
                          {isThai ? 'ยกเลิก' : 'Cancel'}
                        </>
                      ) : (
                        <>
                          <Icon name="workspace_premium" size={16} />
                          {isThai ? 'อัปเกรด Pro' : 'Upgrade to Pro'}
                        </>
                      )}
                    </PremiumButton>
                  </div>
                </div>
              </div>
            </FadeUp>

            {/* ── Transaction Ledger ────────────────────────────────── */}
            <FadeUp delay={300}>
              <div>
                <h3 style={{ 
                  fontSize: 11, 
                  fontFamily: 'var(--font-mono)', 
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  marginBottom: 16,
                  paddingLeft: 8,
                }}>
                  {isThai ? 'ประวัติรายการพลัง' : 'ENERGY TRANSACTION LEDGER'}
                </h3>
                
                <div className="space-y-3">
                  {transactions.map(tx => (
                    <div 
                      key={tx.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        background: 'var(--surface-3)',
                        borderRadius: 20,
                        border: '1px solid var(--border-subtle)',
                        transition: 'all 0.2s',
                      }}
                      className="transaction-item hover:bg-[var(--surface-4)]"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: tx.type === 'earn' ? 'rgba(86, 190, 137, 0.1)' : 'rgba(192, 245, 0, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Icon 
                            name={tx.type === 'earn' ? 'trending_up' : 'info'} 
                            size={16} 
                            style={{ 
                              color: tx.type === 'earn' ? '#56BE89' : 'var(--neon)' 
                            }} 
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--text-primary)]">{tx.title}</p>
                          <p className="text-[9px] text-[var(--text-muted)] font-mono font-bold uppercase tracking-wider mt-1">{tx.date}</p>
                        </div>
                      </div>
                      <span style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontWeight: 800,
                        fontSize: 13,
                        color: tx.type === 'earn' ? '#56BE89' : 'var(--neon)',
                      }}>
                        {tx.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* ── Rewards Preview ───────────────────────────────────── */}
            <FadeUp delay={400}>
              <div style={{
                padding: 24,
                borderRadius: 28,
                background: 'linear-gradient(135deg, rgba(192, 245, 0, 0.08) 0%, rgba(86, 190, 137, 0.04) 100%)',
                border: '1px solid rgba(192, 245, 0, 0.15)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <ProgressRing progress={75} size={100} accent="var(--neon)" label="Weekly Goal" />
                <p className="text-xs font-semibold mt-4 text-[var(--text-primary)]">
                  {isThai 
                    ? 'คุณทำได้ 75% ของเป้าหมายรายสัปดาห์ — ใกล้ถึงรางวัลแล้ว!' 
                    : 'You\'re 75% to your weekly goal — rewards await!'}
                </p>
                <button 
                  className="cursor-pointer transition-all hover:bg-[var(--surface-4)] active:scale-95"
                  style={{
                    marginTop: 16,
                    padding: '10px 22px',
                    borderRadius: 9999,
                    background: 'var(--surface-3)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text-primary)'
                  }}
                >
                  {isThai ? 'ดูรางวัลทั้งหมด' : 'View All Rewards'}
                </button>
              </div>
            </FadeUp>
          </div>
        </>
      )}

        {/* ── Checkout Success Modal ──────────────────────────────── */}
        {showCheckoutSuccess && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}>
            <div style={{
              background: 'var(--surface-2)',
              border: '1px solid rgba(192, 245, 0, 0.3)',
              borderRadius: 32,
              padding: 32,
              maxWidth: 360,
              width: '100%',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              animation: 'scaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            }}>
              {/* Top accent bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: 'linear-gradient(90deg, var(--lime), #56BE89)',
              }} />
              
              <ConfettiEffect />
              
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(192, 245, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                border: '2px solid var(--lime)',
              }}>
                <Icon name="verified" size={36} style={{ color: 'var(--lime)' }} />
              </div>
              
              <h3 className="text-xl font-black mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                {isThai ? 'สมัครสมาชิกเสร็จสมบูรณ์!' : 'Welcome to Pro!'}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                {isThai
                  ? 'AI Match Radar และฟีเจอร์พรีเมียมถูกปลดล็อกแล้ว'
                  : 'AI Match Radar and premium features unlocked'}
              </p>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: 8, 
                marginBottom: 24 
              }}>
                {[
                  { label: 'AI Radar', icon: 'radar' },
                  { label: 'Reports', icon: 'analytics' },
                  { label: 'Unlimited', icon: 'swipe' },
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: 12,
                    background: 'var(--surface-3)',
                    borderRadius: 12,
                    textAlign: 'center',
                  }}>
                    <Icon name={item.icon} size={20} style={{ color: 'var(--lime)', marginBottom: 4 }} />
                    <p className="text-xs font-medium">{item.label}</p>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => setShowCheckoutSuccess(false)}
                style={{
                  width: '100%',
                  padding: 14,
                  borderRadius: 9999,
                  background: 'var(--lime)',
                  color: 'var(--text-inverse)',
                  fontWeight: 700,
                  fontSize: 14,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {isThai ? 'เริ่มสำรวจตอนนี้' : 'Start Exploring Now'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
};

export default ValuePage;
