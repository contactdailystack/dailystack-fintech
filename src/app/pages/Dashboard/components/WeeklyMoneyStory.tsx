import React, { useMemo } from 'react';
import { User, TrendingUp, TrendingDown, Minus, Target, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import { Transaction } from './DashboardHome';

interface WeeklyMoneyStoryProps {
  transactions: Transaction[];
  budgets?: Array<{ categoryName: string; limit: number; spent: number }>;
}

interface WeeklyStats {
  totalSpend: number;
  totalIncome: number;
  transactionCount: number;
  topCategory: string;
  topCategoryAmount: number;
  mood: string | null;
  emotionPattern: string;
  comparisonText: string;
  comparisonType: 'up' | 'down' | 'same';
  percentChange: number;
}

const WeeklyMoneyStory: React.FC<WeeklyMoneyStoryProps> = ({ transactions, budgets = [] }) => {
  const stats = useMemo((): WeeklyStats => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weekTransactions = transactions.filter((t) => {
      const txDate = new Date(t.date);
      return txDate >= startOfWeek && txDate <= now;
    });

    const totalSpend = weekTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalIncome = weekTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const categorySpending: Record<string, number> = {};
    weekTransactions
      .filter((t) => t.amount < 0)
      .forEach((t) => {
        categorySpending[t.categoryName] = (categorySpending[t.categoryName] || 0) + Math.abs(t.amount);
      });

    const topCategory = Object.entries(categorySpending).sort(([, a], [, b]) => b - a)[0]?.[0] || 'ไม่มีข้อมูล';
    const topCategoryAmount = Object.entries(categorySpending).sort(([, a], [, b]) => b - a)[0]?.[1] || 0;

    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(startOfWeek);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

    const lastWeekTransactions = transactions.filter((t) => {
      const txDate = new Date(t.date);
      return txDate >= lastWeekStart && txDate <= lastWeekEnd;
    });

    const lastWeekSpend = lastWeekTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const percentChange = lastWeekSpend > 0 ? ((totalSpend - lastWeekSpend) / lastWeekSpend) * 100 : 0;
    const comparisonType = percentChange > 5 ? 'up' : percentChange < -5 ? 'down' : 'same';
    const comparisonText =
      comparisonType === 'up'
        ? `ใช้จ่ายมากขึ้น ${Math.abs(percentChange).toFixed(0)}% จากสัปดาห์ที่แล้ว`
        : comparisonType === 'down'
        ? `ใช้จ่ายน้อยลง ${Math.abs(percentChange).toFixed(0)}% จากสัปดาห์ที่แล้ว`
        : 'ใช้จ่ายใกล้เคียงสัปดาห์ที่แล้ว';

    const emotionPattern = '';
    const mood = null;

    return {
      totalSpend,
      totalIncome,
      transactionCount: weekTransactions.length,
      topCategory,
      topCategoryAmount,
      mood,
      emotionPattern,
      comparisonText,
      comparisonType,
      percentChange,
    };
  }, [transactions]);

  const dateRange = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const formatDate = (d: Date) => d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    return `${formatDate(startOfWeek)} - ${formatDate(now)}`;
  }, []);

  const overBudgetCount = budgets.filter((b) => b.spent > b.limit).length;
  const nearBudgetCount = budgets.filter((b) => b.spent > b.limit * 0.85 && b.spent <= b.limit).length;

  const getNarrative = () => {
    const mood = stats.percentChange < -10 ? 'ดีใจ' : stats.percentChange > 20 ? 'เศร้า' : 'ธรรมดา';
    return mood;
  };

  const getActionItems = (): string[] => {
    const actions: string[] = [];
    if (overBudgetCount > 0) {
      actions.push(`รีวินงบประมาณที่เกินใน ${overBudgetCount} หมวดหมู่`);
    }
    if (stats.comparisonType === 'up' && stats.percentChange > 15) {
      actions.push('ลองตั้งเป้าหมายการใช้จ่ายสัปดาห์นี้');
    }
    if (stats.topCategoryAmount > stats.totalSpend * 0.4) {
      actions.push(`ระวังการใช้จ่ายเรื่อง ${stats.topCategory} ด้วยนะ`);
    }
    if (actions.length === 0) {
      actions.push('ทำได้ดีมาก! รักษาจังหวะนี้ไว้');
      actions.push('ลองออมเงินเพิ่มอีก 10% จากรายได้สัปดาห์นี้');
    }
    return actions;
  };

  return (
    <div className="min-h-screen bg-[#0B0F0A] text-white pb-20">
      <header className="px-5 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-1">Weekly Story</p>
            <h1 className="text-3xl font-black font-kanit">สัปดาห์นี้</h1>
            <p className="text-white/40 text-sm mt-1">{dateRange}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <User size={24} className="text-primary" />
          </div>
        </div>

        <div className="bg-[#171C15] rounded-3xl p-6 border border-white/10">
          <p className="text-lg font-kanit leading-relaxed">
            สัปดาห์นี้คุณรู้สึก{' '}
            <span className="text-primary font-black">{getNarrative()}</span> เรื่องเงินของคุณ
            <br />
            คุณใช้จ่าย{' '}
            <span className="text-primary font-black">{stats.totalSpend.toLocaleString()}</span> บาท ใน{' '}
            <span className="text-primary font-black">{stats.transactionCount}</span> ครั้ง
          </p>
          <div className="mt-4 flex items-center gap-2">
            {stats.comparisonType === 'up' && (
              <>
                <TrendingUp size={16} className="text-amber-400" />
                <span className="text-amber-400 text-sm font-bold">{stats.comparisonText}</span>
              </>
            )}
            {stats.comparisonType === 'down' && (
              <>
                <TrendingDown size={16} className="text-primary" />
                <span className="text-primary text-sm font-bold">{stats.comparisonText}</span>
              </>
            )}
            {stats.comparisonType === 'same' && (
              <>
                <Minus size={16} className="text-white/40" />
                <span className="text-white/60 text-sm font-bold">{stats.comparisonText}</span>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="px-5 space-y-4">
        <div className="bg-[#171C15] rounded-3xl p-5 border border-white/10">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Top Spending</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-primary">{stats.topCategoryAmount.toLocaleString()}</p>
              <p className="text-white/60 text-sm">{stats.topCategory}</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-primary/30 flex items-center justify-center">
              <Target size={28} className="text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-[#171C15] rounded-3xl p-5 border border-white/10">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">สิ่งที่ควรทำต่อไป</h3>
          <ul className="space-y-3">
            {getActionItems().map((action, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                  action.includes('ดี') || action.includes('รักษา') ? 'bg-primary/20' : 'bg-white/10'
                }`}>
                  {action.includes('ดี') || action.includes('รักษา') ? (
                    <CheckCircle size={14} className="text-primary" />
                  ) : (
                    <Sparkles size={14} className="text-white/60" />
                  )}
                </div>
                <span className="text-sm text-white/80 font-medium leading-relaxed">{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {overBudgetCount > 0 && (
          <div className="bg-amber-500/10 rounded-3xl p-5 border border-amber-500/30">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle size={20} className="text-amber-400" />
              <h3 className="text-sm font-black text-amber-400">งบประมาณที่เกิน</h3>
            </div>
            <p className="text-sm text-white/70">
              คุณกำลังใช้งบเกินใน {overBudgetCount} หมวดหมู่ ลองรีวินและปรับลดการใช้จ่ายนะ
            </p>
          </div>
        )}

        {nearBudgetCount > 0 && (
          <div className="bg-amber-500/10 rounded-3xl p-5 border border-amber-500/30">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle size={20} className="text-amber-400" />
              <h3 className="text-sm font-black text-amber-400">งบประมาณใกล้เต็ม</h3>
            </div>
            <p className="text-sm text-white/70">
              งบประมาณใกล้เต็มใน {nearBudgetCount} หมวดหมู่ ควรระวังการใช้จ่ายเพิ่มเติม
            </p>
          </div>
        )}

        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-5 border border-primary/30">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-primary" />
            <h3 className="text-sm font-black text-primary">AI Insight</h3>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            {stats.topCategoryAmount > stats.totalSpend * 0.4
              ? `คุณใช้จ่ายเรื่อง ${stats.topCategory} มากถึง ${((stats.topCategoryAmount / stats.totalSpend) * 100).toFixed(0)}% ของทั้งหมด — ลองรีวินดูว่าจำเป็นจริงๆ หรือเปล่า?`
              : stats.comparisonType === 'down'
              ? `ดีมาก! สัปดาห์นี้คุณใช้จ่ายน้อยลง ${Math.abs(stats.percentChange).toFixed(0)}% — ทำแบบนี้ต่อไปนะ!`
              : stats.comparisonType === 'up'
              ? `สัปดาห์นี้ใช้จ่ายเพิ่มขึ้น ${stats.percentChange.toFixed(0)}% — ลองควบคุมการใช้จ่ายในหมวด ${stats.topCategory} ดูนะ`
              : `การใช้จ่ายของคุณค่อนข้างสม่ำเสมอ — ทำได้ดีมาก!`}
          </p>
        </div>
      </section>
    </div>
  );
};

export default WeeklyMoneyStory;