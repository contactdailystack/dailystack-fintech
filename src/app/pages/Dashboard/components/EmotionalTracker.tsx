import React, { useMemo } from 'react';
import {
  Smile, Frown, Zap, Meh, Flame, Heart,
  Coffee, Train, Gift, Home, AlertTriangle,
  TrendingUp, TrendingDown, Clock
} from 'lucide-react';
import { Transaction } from '../DashboardHome';

interface EmotionalTrackerProps {
  transactions: Transaction[];
  emotionalData?: Array<{
    id: string;
    mood: string;
    trigger: string;
    amount: number;
    date: string;
  }>;
}

type MoodKey = 'happy' | 'sad' | 'stressed' | 'neutral' | 'impulse' | 'reward';
type TriggerKey = 'food' | 'travel' | 'urgent' | 'gift' | 'home';

const MOOD_CONFIG: Record<MoodKey, { icon: React.ElementType; color: string; label: string }> = {
  happy: { icon: Smile, color: 'bg-green-500', label: 'ดีใจ' },
  sad: { icon: Frown, color: 'bg-blue-500', label: 'เศร้า' },
  stressed: { icon: Zap, color: 'bg-amber-500', label: 'เครียด' },
  neutral: { icon: Meh, color: 'bg-gray-500', label: 'ธรรมดา' },
  impulse: { icon: Flame, color: 'bg-amber-500', label: 'Impulse' },
  reward: { icon: Heart, color: 'bg-pink-500', label: 'ตั้งใจ/รางวัลตัวเอง' },
};

const TRIGGER_CONFIG: Record<TriggerKey, { icon: React.ElementType; color: string; label: string }> = {
  food: { icon: Coffee, color: 'bg-amber-500', label: 'กินข้าว' },
  travel: { icon: Train, color: 'bg-blue-500', label: 'เดินทาง' },
  urgent: { icon: Zap, color: 'bg-amber-500', label: 'ด่วน/ฉุกเฉิน' },
  gift: { icon: Gift, color: 'bg-purple-500', label: 'ให้ของขวัญ' },
  home: { icon: Home, color: 'bg-emerald-500', label: 'บ้าน/ครอบครัว' },
};

const EmotionalTracker: React.FC<EmotionalTrackerProps> = ({ transactions, emotionalData = [] }) => {
  const weeklyData = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return transactions.filter((t) => {
      const txDate = new Date(t.date);
      return txDate >= startOfWeek && txDate <= now;
    });
  }, [transactions]);

  const lastWeekData = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(startOfWeek);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

    return transactions.filter((t) => {
      const txDate = new Date(t.date);
      return txDate >= lastWeekStart && txDate <= lastWeekEnd;
    });
  }, [transactions]);

  const moodDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    const moodOrder: MoodKey[] = ['happy', 'neutral', 'sad', 'stressed', 'impulse', 'reward'];

    if (emotionalData.length > 0) {
      emotionalData.forEach((d) => {
        dist[d.mood] = (dist[d.mood] || 0) + d.amount;
      });
    } else {
      dist.happy = weeklyData.length * 0.3 * 500;
      dist.neutral = weeklyData.length * 0.25 * 500;
      dist.impulse = weeklyData.length * 0.2 * 1000;
      dist.stressed = weeklyData.length * 0.15 * 800;
      dist.sad = weeklyData.length * 0.07 * 600;
      dist.reward = weeklyData.length * 0.03 * 1500;
    }

    const total = Object.values(dist).reduce((sum, v) => sum + v, 0);

    return moodOrder.map((mood) => ({
      mood,
      amount: dist[mood] || 0,
      percent: total > 0 ? ((dist[mood] || 0) / total) * 100 : 0,
      ...MOOD_CONFIG[mood],
    }));
  }, [weeklyData, emotionalData]);

  const triggerAnalysis = useMemo(() => {
    const triggers: Record<string, number> = {};

    if (emotionalData.length > 0) {
      emotionalData.forEach((d) => {
        triggers[d.trigger] = (triggers[d.trigger] || 0) + 1;
      });
    } else {
      triggers.food = weeklyData.length * 0.4;
      triggers.travel = weeklyData.length * 0.25;
      triggers.urgent = weeklyData.length * 0.2;
      triggers.gift = weeklyData.length * 0.1;
      triggers.home = weeklyData.length * 0.05;
    }

    return Object.entries(triggers)
      .sort(([, a], [, b]) => b - a)
      .map(([trigger, count]) => ({
        trigger: trigger as TriggerKey,
        count,
        ...TRIGGER_CONFIG[trigger as TriggerKey],
      }));
  }, [weeklyData, emotionalData]);

  const dominantMood = useMemo(() => {
    const sorted = [...moodDistribution].sort((a, b) => b.amount - a.amount);
    return sorted[0];
  }, [moodDistribution]);

  const weekOverWeekChange = useMemo(() => {
    const thisWeekTotal = weeklyData.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const lastWeekTotal = lastWeekData.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    if (lastWeekTotal === 0) return { type: 'same' as const, percent: 0 };
    const change = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
    return {
      type: change > 5 ? ('up' as const) : change < -5 ? ('down' as const) : ('same' as const),
      percent: Math.abs(change),
    };
  }, [weeklyData, lastWeekData]);

  const impulseAlert = useMemo(() => {
    const impulseData = moodDistribution.find((m) => m.mood === 'impulse');
    if (impulseData && impulseData.percent > 25) {
      return `ดูเหมือนคุณใช้จ่ายแบบ Impulse บ่อยขึ้น — ลองหาวิธีผ่อนคลายอื่นแทนการใช้จ่ายนะ`;
    }
    return null;
  }, [moodDistribution]);

  const stressedAlert = useMemo(() => {
    const stressedData = moodDistribution.find((m) => m.mood === 'stressed');
    if (stressedData && stressedData.percent > 20) {
      return `คุณดูเครียดและใช้จ่ายตามอารมณ์บ่อย — ลองหากิจกรรมผ่อนคลายอื่นแทนเงินนะ`;
    }
    return null;
  }, [moodDistribution]);

  return (
    <div className="space-y-4">
      <div className="bg-[#171C15] rounded-3xl p-5 border border-white/10">
        <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Mood Distribution</h3>
        <div className="space-y-3">
          {moodDistribution.map(({ mood, percent, amount, icon: Icon, color, label }) => (
            <div key={mood} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
                <Icon size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-white">{label}</span>
                  <span className="text-xs text-white/40">{amount.toLocaleString()} THB</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#171C15] rounded-3xl p-5 border border-white/10">
        <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Trigger Analysis</h3>
        <div className="space-y-3">
          {triggerAnalysis.map(({ trigger, count, icon: Icon, color, label }) => (
            <div key={trigger} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
                <Icon size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">{label}</span>
                  <span className="text-xs text-white/40">{count} ครั้ง</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#171C15] rounded-3xl p-5 border border-white/10">
        <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Weekly Emotional Summary</h3>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${dominantMood?.color} flex items-center justify-center`}>
            {React.createElement(dominantMood?.icon || Meh, { size: 28, className: 'text-white' })}
          </div>
          <div className="flex-1">
            <p className="text-lg font-black text-white">
              สัปดาห์นี้: <span className="text-primary">{dominantMood?.label}</span>
            </p>
            <div className="flex items-center gap-2 mt-1">
              {weekOverWeekChange.type === 'up' && (
                <>
                  <TrendingUp size={14} className="text-amber-400" />
                  <span className="text-xs text-amber-400">เพิ่มขึ้น {weekOverWeekChange.percent.toFixed(0)}%</span>
                </>
              )}
              {weekOverWeekChange.type === 'down' && (
                <>
                  <TrendingDown size={14} className="text-primary" />
                  <span className="text-xs text-primary">ลดลง {weekOverWeekChange.percent.toFixed(0)}%</span>
                </>
              )}
              {weekOverWeekChange.type === 'same' && (
                <>
                  <Clock size={14} className="text-white/40" />
                  <span className="text-xs text-white/40">ใกล้เคียงสัปดาห์ที่แล้ว</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {(impulseAlert || stressedAlert) && (
        <div className="bg-amber-500/10 rounded-3xl p-4 border border-amber-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-400 mt-0.5" />
            <p className="text-sm text-white/80 leading-relaxed">
              {impulseAlert || stressedAlert}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionalTracker;