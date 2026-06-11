import React from 'react';
import { Sparkles } from 'lucide-react';

interface StatusRingProps {
  health: number;
  savingsRate: number;
  warningLevel: 'none' | 'low' | 'medium' | 'high';
  totalBalance: number;
}

export const StatusRing: React.FC<StatusRingProps> = ({
  health,
  savingsRate,
  warningLevel,
  totalBalance,
}) => {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const fill = (health / 100) * circumference;
  const amberSegment = warningLevel !== 'none' ? circumference * 0.15 : 0;

  const warningColor =
    warningLevel === 'high' ? '#F59E0B' :
    warningLevel === 'medium' ? '#FBBF24' :
    warningLevel === 'low' ? '#FCD34D' : undefined;

  return (
    <div className="relative w-56 h-56 mx-auto">
      <svg
        className="w-full h-full -rotate-90"
        viewBox="0 0 200 200"
        aria-label={`Financial Health: ${health}%`}
      >
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgba(199,255,46,0.08)"
          strokeWidth="8"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#C7FF2E"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - fill}
          className="transition-all duration-700 animate-breathe-ring"
        />
        {warningLevel !== 'none' && warningColor && (
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={warningColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${amberSegment} ${circumference}`}
            className="animate-amber-pulse"
          />
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-primary font-mono">
          ฿{totalBalance.toLocaleString()}
        </span>
        <span className="text-xs text-white/40 mt-1 font-kanit">ยอดรวม</span>
        <div className="flex items-center gap-1 mt-2">
          <Sparkles size={10} className="text-primary/60" />
          <span className="text-[10px] text-white/35 font-kanit">
            {health >= 70 ? 'สุขภาพดี' : health >= 40 ? 'ปานกลาง' : 'ต้องระวัง'}
          </span>
        </div>
      </div>
    </div>
  );
};
