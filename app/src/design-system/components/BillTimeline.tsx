/**
 * BillTimeline Component
 * Displays upcoming bills in a timeline format (Rocket Money style)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, Clock } from 'lucide-react';

export interface BillItem {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  icon?: string;
  color?: string;
  category?: string;
}

export interface BillTimelineProps {
  bills: BillItem[];
  onBillPress?: (id: string) => void;
  onSeeAllPress?: () => void;
  lang?: 'en' | 'th';
}

// Calculate days until due
const getDaysUntil = (dateStr: string): number => {
  const due = new Date(dateStr);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Get status color based on days until due
const getStatusColor = (daysUntil: number): { bg: string; text: string; dot: string } => {
  if (daysUntil < 0) {
    return { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' };
  }
  if (daysUntil <= 3) {
    return { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-500' };
  }
  if (daysUntil <= 7) {
    return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-500' };
  }
  return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' };
};

export const BillTimeline: React.FC<BillTimelineProps> = ({
  bills,
  onBillPress,
  onSeeAllPress,
  lang = 'en'
}) => {
  // Sort bills by due date
  const sortedBills = [...bills].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const translations = {
    en: {
      upcomingBills: 'Upcoming Bills',
      seeAll: 'See all',
      dueToday: 'Due today',
      dueTomorrow: 'Due tomorrow',
      daysLeft: 'days left',
      overdue: 'Overdue',
      noBills: 'No upcoming bills',
    },
    th: {
      upcomingBills: 'บิลที่จะถึง',
      seeAll: 'ดูทั้งหมด',
      dueToday: 'ถึงวันนี้',
      dueTomorrow: 'ถึงพรุ่งนี้',
      daysLeft: 'วัน',
      overdue: 'เกินกำหนด',
      noBills: 'ไม่มีบิลที่จะถึง',
    }
  };

  const t = translations[lang];

  // Empty state
  if (bills.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-display font-bold text-gray-900 text-sm mb-4">
          {t.upcomingBills}
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <Calendar className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm">{t.noBills}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-gray-900 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0FB0CE]" />
          {t.upcomingBills}
        </h3>
        {onSeeAllPress && (
          <button
            onClick={onSeeAllPress}
            className="text-xs text-gray-500 hover:text-[#0FB0CE] transition-colors flex items-center gap-1 cursor-pointer"
          >
            {t.seeAll}
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {sortedBills.map((bill, index) => {
          const daysUntil = getDaysUntil(bill.dueDate);
          const status = getStatusColor(daysUntil);
          const dueDate = new Date(bill.dueDate);
          const isToday = daysUntil === 0;
          const isTomorrow = daysUntil === 1;
          const isOverdue = daysUntil < 0;

          // Format due date display
          let dueDateDisplay: string;
          if (isToday) {
            dueDateDisplay = t.dueToday;
          } else if (isTomorrow) {
            dueDateDisplay = t.dueTomorrow;
          } else if (isOverdue) {
            dueDateDisplay = `${Math.abs(daysUntil)} ${t.daysLeft} ${t.overdue}`;
          } else {
            dueDateDisplay = `${daysUntil} ${t.daysLeft}`;
          }

          return (
            <motion.div
              key={bill.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                onClick={() => onBillPress?.(bill.id)}
                className="flex items-center gap-4 py-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-xl transition-colors"
              >
                {/* Timeline dot and line */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${status.dot} ring-4 ring-white shadow-sm`} />
                  {index < sortedBills.length - 1 && (
                    <div className="w-[1px] h-8 bg-gray-200 mt-1" />
                  )}
                </div>

                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: bill.color || '#6366F1' }}
                >
                  {bill.icon || bill.name.substring(0, 2).toUpperCase()}
                </div>

                {/* Bill info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {bill.name}
                  </p>
                  <p className={`text-xs ${status.text}`}>
                    {dueDateDisplay}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className="font-mono font-bold text-gray-900">
                    ${bill.amount.toFixed(2)}
                  </p>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{sortedBills.length} {lang === 'en' ? 'bills' : 'บิล'}</span>
          <span className="font-mono">
            ${sortedBills.reduce((sum, b) => sum + b.amount, 0).toFixed(2)} {lang === 'en' ? 'total' : 'รวม'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BillTimeline;
