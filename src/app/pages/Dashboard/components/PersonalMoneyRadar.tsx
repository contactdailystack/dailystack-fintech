import React, { useMemo } from 'react';
import {
  TrendingUp, Target, Sparkles,
  AlertTriangle, CheckCircle, Clock
} from 'lucide-react';
import { Transaction, Budget } from '../DashboardHome';

interface PersonalMoneyRadarProps {
  transactions: Transaction[];
  budgets?: Budget[];
  weeklySpend?: number;
}

interface QuickStat {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'same';
  trendValue?: string;
  icon: React.ElementType;
  color: string;
}

const PersonalMoneyRadar: React.FC<PersonalMoneyRadarProps> = ({
  transactions,
  budgets = [],
  weeklySpend: externalWeeklySpend,
}) => {
  const healthScore = useMemo(() => {
    let score = 70;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const weekTransactions = transactions.filter((t) => {
      const txDate = new Date(t.date);
      return txDate >= startOfWeek && txDate <= now;
    });

    const weeklySpend = weekTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    if (budgets.length > 0) {
      const overBudgetCount = budgets.filter((b) => b.spent > b.limit).length;
      const nearBudgetCount = budgets.filter((b) => b.spent > b.limit * 0.85 && b.spent <= b.limit).length;
      score -= overBudgetCount * 10;
      score -= nearBudgetCount * 3;
    }

    if (weeklySpend > 20000) score -= 10;
    else if (weeklySpend > 10000) score -= 5;

    const savingsTx = weekTransactions.filter((t) => t.amount > 0);
    if (savingsTx.length > 0) score += 5;

    return Math.max(0, Math.min(100, score));
  }, [transactions, budgets]);

  const scoreColor = useMemo(() => {
    if (healthScore >= 70) return { color: '#C7FF2E', label: 'Excellent', bg: 'bg-primary/20', textColor: 'text-primary' };
    if (healthScore >= 40) return { color: '#FBBF24', label: 'On Track', bg: 'bg-amber-500/20', textColor: 'text-amber-400' };
    return { color: '#F59E0B', label: 'Needs Attention', bg: 'bg-amber-500/20', textColor: 'text-amber-400' };
  }, [healthScore]);

  const weeklyData = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const weekTx = transactions.filter((t) => {
      const txDate = new Date(t.date);
      return txDate >= startOfWeek && txDate <= now;
    });

    const lastWeekTx = transactions.filter((t) => {
      const txDate = new Date(t.date);
      return txDate >= lastWeekStart && txDate < startOfWeek;
    });

    const thisWeekSpend = weekTx.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const lastWeekSpend = lastWeekTx.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const percentChange = lastWeekSpend > 0 ? ((thisWeekSpend - lastWeekSpend) / lastWeekSpend) * 100 : 0;

    return {
      totalSpend: thisWeekSpend,
      trend: percentChange > 5 ? 'up' : percentChange < -5 ? 'down' : 'same',
      percentChange: Math.abs(percentChange),
    };
  }, [transactions]);

  const budgetStatus = useMemo(() => {
    if (budgets.length === 0) return { status: 'unknown' as const, overCount: 0, totalCount: 0 };

    const overCount = budgets.filter((b) => b.spent > b.limit).length;
    const totalCount = budgets.length;

    return {
      status: overCount === 0 ? ('on-track' as const) : ('over' as const),
      overCount,
      totalCount,
    };
  }, [budgets]);

  const aiInsight = useMemo(() => {
    if (weeklyData.totalSpend === 0) {
      return 'ยังไม่มีการใช้จ่ายสัปดาห์นี้ — เริ่มต้นบันทึกการใช้จ่ายเพื่อติดตามสุขภาพการเงินของคุณ';
    }

    const categorySpending: Record<string, number> = {};
    weeklyData.totalSpend;
    transactions
      .filter((t) => t.amount < 0)
      .forEach((t) => {
        categorySpending[t.categoryName] = (categorySpending[t.categoryName] || 0) + Math.abs(t.amount);
      });

    const topCategory = Object.entries(categorySpending).sort(([, a], [, b]) => b - a)[0];

    if (topCategory && topCategory[1] > weeklyData.totalSpend * 0.5) {
      return `คุณใช้จ่ายเรื่อง ${topCategory[0]} มากถึง ${((topCategory[1] / weeklyData.totalSpend) * 100).toFixed(0)}% ของทั้งหมด — ลองปรับลดดูได้นะ`;
    }

    if (budgetStatus.status === 'over') {
      return `คุณกำลังใช้งบเกินใน ${budgetStatus.overCount} หมวดหมู่ — ลองรีวินการใช้จ่ายสัปดาห์นี้`;
    }

    if (weeklyData.trend === 'down') {
      return `ดีมาก! สัปดาห์นี้คุณใช้จ่ายน้อยลง ${weeklyData.percentChange.toFixed(0)}% — ทำแบบนี้ต่อไป!`;
    }

    if (weeklyData.trend === 'up' && weeklyData.percentChange > 20) {
      return `สัปดาห์นี้ใช้จ่ายเพิ่มขึ้น ${weeklyData.percentChange.toFixed(0)}% — ควรระวังการใช้จ่ายที่ไม่จำเป็นนะ`;
    }

    return 'การใช้จ่ายของคุณค่อนข้างสมดุล — ทำได้ดีมาก!';
  }, [weeklyData, transactions, budgetStatus]);

  const quickStats: QuickStat[] = [
    {
      label: 'This Week',
      value: weeklyData.totalSpend.toLocaleString(),
      subValue: 'THB',
      trend: weeklyData.trend,
      trendValue: `${weeklyData.percentChange.toFixed(0)}%`,
      icon: TrendingUp,
      color: weeklyData.trend === 'down' ? 'text-primary' : weeklyData.trend === 'up' ? 'text-amber-400' : 'text-white/60',
    },
    {
      label: 'Budget Status',
      value: budgetStatus.status === 'unknown' ? '-' : budgetStatus.status === 'on-track' ? 'On Track' : `${budgetStatus.overCount}/${budgetStatus.totalCount}`,
      subValue: budgetStatus.status === 'on-track' ? 'All categories' : 'Over budget',
      icon: Target,
      color: budgetStatus.status === 'on-track' ? 'text-primary' : 'text-amber-400',
    },
    {
      label: 'AI Insight',
      value: '1',
      subValue: 'Recommendation',
      icon: Sparkles,
      color: 'text-primary',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-[#171C15] rounded-3xl p-6 border border-white/10 flex flex-col items-center">
        <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6">Financial Health</h3>
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={scoreColor.color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(healthScore / 100) * 264} 264`}
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white">{healthScore}</span>
            <span className={`text-xs font-bold ${scoreColor.textColor}`}>{scoreColor.label}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {quickStats.map(({ label, value, subValue, trend, trendValue, icon: Icon, color }, index) => (
          <div key={index} className="bg-[#171C15] rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={color} />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{label}</span>
            </div>
            <p className={`text-lg font-black ${color}`}>{value}</p>
            <div className="flex items-center gap-1 mt-1">
              {subValue && <span className="text-[10px] text-white/40">{subValue}</span>}
              {trend && trendValue && (
                <span className={`text-[10px] font-bold ${trend === 'down' ? 'text-primary' : trend === 'up' ? 'text-amber-400' : 'text-white/40'}`}>
                  {trend === 'up' && <TrendingUp size={10} className="inline" />}
                  {trend === 'down' && <TrendingDown size={10} className="inline" />}
                  {trend === 'same' && <Clock size={10} className="inline" />}
                  {trendValue}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-5 border border-primary/30">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-primary" />
          <h3 className="text-sm font-black text-primary">AI Recommendation</h3>
        </div>
        <p className="text-sm text-white/80 leading-relaxed">{aiInsight}</p>
      </div>

      {budgetStatus.status === 'over' && (
        <div className="bg-amber-500/10 rounded-3xl p-4 border border-amber-500/30">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-400" />
            <span className="text-sm font-bold text-amber-400">Budget Alert</span>
          </div>
          <p className="text-sm text-white/70 mt-2">
            คุณกำลังใช้งบเกินใน {budgetStatus.overCount} หมวดหมู่ ลองปรับลดการใช้จ่ายในสัปดาห์นี้นะ
          </p>
        </div>
      )}

      {budgetStatus.status === 'on-track' && budgets.length > 0 && (
        <div className="bg-primary/10 rounded-3xl p-4 border border-primary/30">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-primary" />
            <span className="text-sm font-bold text-primary">On Track</span>
          </div>
          <p className="text-sm text-white/70 mt-2">
            งบประมาณทั้งหมดอยู่ในเกณฑ์ปกติ — ทำได้ดีมาก! รักษาจังหวะนี้ไว้นะ
          </p>
        </div>
      )}
    </div>
  );
};

const TrendingDown: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 7H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default PersonalMoneyRadar;