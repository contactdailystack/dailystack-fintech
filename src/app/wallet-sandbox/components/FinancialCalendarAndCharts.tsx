import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, PieChart as PieIcon, TrendingUp, Info, 
  ChevronLeft, ChevronRight, ListCollapse, BookOpen, AlertCircle
} from 'lucide-react';
import type { Transaction, Account } from '../types';

interface FinancialCalendarAndChartsProps {
  transactions: Transaction[];
  maskingMode: boolean;
  accounts?: Account[];
}

export const FinancialCalendarAndCharts: React.FC<FinancialCalendarAndChartsProps> = ({
  transactions,
  maskingMode,
  accounts = []
}) => {
  const getTxDateStr = (tx: Transaction) => {
    if (!tx.transactionDate) return '';
    return tx.transactionDate.split('T')[0] || '';
  };

  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'charts' | 'ledger'>('calendar');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'donut' | 'line'>('donut');
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  // Month & Year state (initialized to current time, but fully navigation-enabled!)
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  const THAI_MONTHS = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  const THAI_WEEKDAYS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

  // Convert Gregorian year to Buddhist Era (BE)
  const getBEYear = (gregorianYear: number) => gregorianYear + 543;

  // Handle Month Navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDate(null);
  };

  // Get total days in month
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  // Get first day index
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // Helper to check if a transaction falls in the selected month & year
  const isTxInCurrentMonth = (tx: Transaction) => {
    if (!tx.transactionDate) return false;
    const txDate = new Date(tx.transactionDate);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  };

  // Filtered transactions for the current month
  const monthlyTxs = transactions.filter(isTxInCurrentMonth);

  // Calculate monthly summary
  const getMonthlySummary = () => {
    let income = 0;
    let expense = 0;
    
    monthlyTxs.forEach(tx => {
      if (tx.type === 'income') income += tx.amount;
      if (tx.type === 'expense') expense += tx.amount;
    });

    return {
      income,
      expense,
      total: income - expense
    };
  };

  const summary = getMonthlySummary();

  // Get daily totals for grid cells
  const getDailyTotals = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTxs = monthlyTxs.filter(tx => getTxDateStr(tx) === dateStr);
    
    let income = 0;
    let expense = 0;
    
    dayTxs.forEach(tx => {
      if (tx.type === 'income') income += tx.amount;
      if (tx.type === 'expense') expense += tx.amount;
    });

    return {
      income,
      expense,
      net: income - expense,
      txCount: dayTxs.length,
      dateStr
    };
  };

  // Group expenses by category for Donut Chart
  const getExpensesByCategory = () => {
    const expenseTxs = monthlyTxs.filter(tx => tx.type === 'expense');
    const categories: Record<string, number> = {};
    let total = 0;

    expenseTxs.forEach(tx => {
      categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
      total += tx.amount;
    });

    return {
      total,
      data: Object.entries(categories).map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0
      })).sort((a, b) => b.value - a.value)
    };
  };

  const { total: totalExpenses, data: categoryData } = getExpensesByCategory();

  // 7 Days Spending Trend for Line Chart (from the past 7 days up to today)
  const get7DaysTrend = () => {
    const trend = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
      
      const dayTxs = transactions.filter(tx => getTxDateStr(tx) === dateStr && tx.type === 'expense');
      const totalExpense = dayTxs.reduce((sum, tx) => sum + tx.amount, 0);

      trend.push({
        dateStr,
        label,
        value: totalExpense
      });
    }
    return trend;
  };

  const trendData = get7DaysTrend();

  const CHART_COLORS = [
    '#ff5a52', // Warm Coral Red
    '#C0F500', // Electric Lime
    '#56BE89', // Mint Green
    '#a855f7', // Purple
    '#f59e0b', // Amber
    '#3b82f6', // Blue
    '#ec4899'  // Pink
  ];

  const formatCurrency = (val: number) => {
    if (maskingMode) return '••••';
    const formatted = new Intl.NumberFormat('th-TH', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(val));
    return `${val < 0 ? '-' : ''}฿${formatted}`;
  };

  // Group transactions by date for the History Ledger tab
  const getGroupedTransactions = () => {
    const grouped: Record<string, { dateStr: string; dayNum: number; beDateStr: string; weekdayThai: string; txs: Transaction[]; dailyIncome: number; dailyExpense: number }> = {};
    
    monthlyTxs.forEach(tx => {
      const dateStr = getTxDateStr(tx);
      if (!grouped[dateStr]) {
        const d = new Date(tx.transactionDate);
        const dayNum = d.getDate();
        const weekdayThai = THAI_WEEKDAYS[d.getDay()];
        const beDateStr = `${String(d.getMonth() + 1).padStart(2, '0')}/${getBEYear(d.getFullYear())}`;
        
        grouped[dateStr] = {
          dateStr,
          dayNum,
          beDateStr,
          weekdayThai,
          txs: [],
          dailyIncome: 0,
          dailyExpense: 0
        };
      }
      
      grouped[dateStr].txs.push(tx);
      if (tx.type === 'income') grouped[dateStr].dailyIncome += tx.amount;
      if (tx.type === 'expense') grouped[dateStr].dailyExpense += tx.amount;
    });

    // Sort grouped dates in descending order
    return Object.values(grouped).sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  };

  const groupedTimeline = getGroupedTransactions();

  const getAccountName = (accId?: string) => {
    if (!accId) return '';
    const acc = accounts.find(a => a.id === accId);
    return acc ? acc.name : '';
  };

  return (
    <div className="space-y-5 select-none">
      
      {/* 1. Sub-Tabs Bar (Notion Glassmorphism inspired capsule segment buttons) */}
      <div className="flex bg-[#14171E]/80 border border-gray-850 p-1 rounded-2xl max-w-max mx-auto shadow-md">
        {[
          { id: 'calendar', label: 'ปฏิทิน', icon: <CalendarIcon className="w-3.5 h-3.5" /> },
          { id: 'charts', label: 'สถิติ', icon: <PieIcon className="w-3.5 h-3.5" /> },
          { id: 'ledger', label: 'จดบันทึก', icon: <BookOpen className="w-3.5 h-3.5" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold font-sans tracking-wide transition-all ${
              activeSubTab === tab.id 
                ? 'bg-[#C0F500] text-black shadow-[0_0_10px_rgba(192,245,0,0.2)]' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 2. Month Selector Navigation Header (< พ.ค. 2569 > BE style) */}
      <div className="flex items-center justify-between bg-[#161920] border border-gray-800 rounded-2xl p-4 shadow-lg">
        <button 
          onClick={handlePrevMonth}
          className="p-2 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl text-gray-300 hover:text-white transition-all active:scale-90"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C0F500] font-bold">ledger period</span>
          <span className="text-base font-bold font-sans text-white mt-0.5">
            {THAI_MONTHS[currentMonth]} {getBEYear(currentYear)}
          </span>
        </div>

        <button 
          onClick={handleNextMonth}
          className="p-2 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl text-gray-300 hover:text-white transition-all active:scale-90"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Budget Summary Header Bar (Replicating Screenshot 4) */}
      <div className="grid grid-cols-3 gap-2 bg-[#161920] border border-gray-800/80 rounded-2xl p-4 text-center shadow-lg">
        <div>
          <span className="text-[10px] text-gray-500 font-sans block mb-1">รายรับ (Income)</span>
          <span className="text-xs font-mono font-bold text-[#56BE89]">
            {formatCurrency(summary.income)}
          </span>
        </div>
        <div className="border-x border-gray-800/60">
          <span className="text-[10px] text-gray-500 font-sans block mb-1">รายจ่าย (Expense)</span>
          <span className="text-xs font-mono font-bold text-[#ff5a52]">
            {formatCurrency(-summary.expense)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 font-sans block mb-1">รวม (Total)</span>
          <span className={`text-xs font-mono font-black ${summary.total >= 0 ? 'text-white' : 'text-[#ff5a52]'}`}>
            {formatCurrency(summary.total)}
          </span>
        </div>
      </div>

      {/* 4. Tab Content Area */}
      <div className="relative min-h-[300px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: CALENDAR VIEW */}
          {activeSubTab === 'calendar' && (
            <motion.div
              key="calendar-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-4"
            >
              <div className="bg-[#14171E] border border-gray-850 rounded-2xl p-4 shadow-xl space-y-4">
                
                {/* Weekday Titles */}
                <div className="grid grid-cols-7 gap-1 text-center font-sans text-[10px] text-gray-500 font-semibold tracking-wider pb-2 border-b border-gray-800/30">
                  {THAI_WEEKDAYS.map(w => (
                    <span key={w} className={w === 'อา.' ? 'text-[#ff5a52]' : w === 'ส.' ? 'text-[#56BE89]' : ''}>{w}</span>
                  ))}
                </div>

                {/* Grid Cells */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Offsets before 1st of month */}
                  {Array.from({ length: firstDayIndex }).map((_, idx) => (
                    <div key={`offset-${idx}`} className="h-16 bg-transparent" />
                  ))}

                  {/* Days of Month */}
                  {Array.from({ length: totalDays }).map((_, idx) => {
                    const day = idx + 1;
                    const { income, expense, net, dateStr } = getDailyTotals(day);
                    const isSelected = selectedDate === dateStr;
                    const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;

                    return (
                      <button
                        key={`day-${day}`}
                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                        className={`h-16 bg-[#161a22]/40 border rounded-xl p-1 flex flex-col justify-between items-start transition-all hover:border-gray-600 active:scale-95 ${
                          isSelected 
                            ? 'border-[#C0F500] bg-[#C0F500]/5 shadow-[inset_0_0_8px_rgba(192,245,0,0.1)]' 
                            : isToday 
                            ? 'border-gray-600 bg-gray-800/30' 
                            : 'border-gray-850'
                        }`}
                      >
                        {/* Day Number and indicator dot */}
                        <div className="flex justify-between items-center w-full">
                          <span className={`text-[10px] font-mono font-bold ${
                            isToday ? 'text-[#C0F500]' : 'text-gray-400'
                          }`}>
                            {day}
                          </span>
                          {(income > 0 || expense > 0) && (
                            <span className={`w-1 h-1 rounded-full ${net >= 0 ? 'bg-[#56BE89]' : 'bg-[#ff5a52]'}`} />
                          )}
                        </div>

                        {/* Daily flow numeric summary */}
                        <div className="w-full flex flex-col items-stretch text-left leading-none font-mono">
                          {income > 0 && (
                            <span className="text-[7px] text-[#56BE89] font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                              +{formatCurrency(income).replace('฿', '')}
                            </span>
                          )}
                          {expense > 0 && (
                            <span className="text-[7px] text-[#ff5a52] font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                              -{formatCurrency(expense).replace('฿', '')}
                            </span>
                          )}
                          {!income && !expense && (
                            <span className="text-[7px] text-gray-800">-</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* Toggled day details ledger popup */}
              <AnimatePresence>
                {selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-[#14171E] border border-gray-850 rounded-2xl p-4 shadow-xl space-y-3"
                  >
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#C0F500] border-b border-gray-800/50 pb-2 flex items-center justify-between">
                      <span>📂 daily ledger details</span>
                      <span className="text-white">
                        {new Date(selectedDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} {getBEYear(new Date(selectedDate).getFullYear())}
                      </span>
                    </h4>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {monthlyTxs.filter(tx => getTxDateStr(tx) === selectedDate).length === 0 ? (
                        <p className="text-center py-6 text-xs text-gray-500 font-sans">ไม่มีรายการบัญชีในวันนี้</p>
                      ) : (
                        monthlyTxs
                          .filter(tx => getTxDateStr(tx) === selectedDate)
                          .map(tx => (
                            <div key={tx.id} className="bg-gray-950/60 p-3 border border-gray-850 rounded-xl flex justify-between items-center text-xs">
                              <div>
                                <div className="font-semibold text-white tracking-wide">{tx.category}</div>
                                {tx.note && <div className="text-[10px] text-gray-500 mt-0.5">{tx.note}</div>}
                                {(tx.fromAccountId || tx.toAccountId) && (
                                  <div className="text-[8px] text-[#C0F500] font-mono mt-1">
                                    {tx.type === 'transfer' 
                                      ? `${getAccountName(tx.fromAccountId)} ➔ ${getAccountName(tx.toAccountId)}`
                                      : getAccountName(tx.fromAccountId || tx.toAccountId)
                                    }
                                  </div>
                                )}
                              </div>
                              <span className={`font-mono font-bold text-sm shrink-0 ${
                                tx.type === 'expense' ? 'text-[#ff5a52]' : tx.type === 'income' ? 'text-[#56BE89]' : 'text-blue-400'
                              }`}>
                                {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                                {formatCurrency(tx.amount)}
                              </span>
                            </div>
                          ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* TAB 2: CHARTS ANALYTICS */}
          {activeSubTab === 'charts' && (
            <motion.div
              key="charts-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="bg-[#14171E] border border-gray-850 rounded-2xl p-4 shadow-xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-gray-800/50 pb-3">
                <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-[#C0F500] flex items-center gap-2">
                  <PieIcon className="w-4 h-4" /> AI สถิติวิเคราะห์รายจ่าย
                </h3>

                {/* Sub Chart Selector Toggle */}
                <div className="flex bg-gray-950 p-0.5 border border-gray-850 rounded-xl">
                  <button
                    onClick={() => setActiveChartTab('donut')}
                    className={`px-3 py-1.5 text-[9px] font-mono font-bold rounded-lg uppercase transition-all ${
                      activeChartTab === 'donut' ? 'bg-[#C0F500] text-black shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Category
                  </button>
                  <button
                    onClick={() => setActiveChartTab('line')}
                    className={`px-3 py-1.5 text-[9px] font-mono font-bold rounded-lg uppercase transition-all ${
                      activeChartTab === 'line' ? 'bg-[#C0F500] text-black shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Trend
                  </button>
                </div>
              </div>

              {activeChartTab === 'donut' ? (
                // SVG Pie/Donut Chart breakdown
                <div className="space-y-6">
                  {categoryData.length === 0 ? (
                    <div className="text-center py-20 text-xs font-mono text-gray-500">
                      กรุณาเพิ่มรายการใช้จ่ายก่อนหน้า เพื่อแสดงแผนภูมิวิเคราะห์
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-6 md:flex-row md:justify-around">
                      
                      {/* Responsive custom SVG Donut */}
                      <div className="relative w-36 h-36">
                        <svg width="100%" height="100%" viewBox="0 0 120 120" className="transform -rotate-90">
                          {/* Inner clean ring backplate */}
                          <circle cx="60" cy="60" r="50" fill="transparent" stroke="#0b0e14" strokeWidth="14" />
                          
                          {/* Slices arc calculation */}
                          {(() => {
                            let accumulatedPercent = 0;
                            return categoryData.map((slice, idx) => {
                              const circumference = 2 * Math.PI * 50; // 314.16
                              const dashArray = `${(slice.percentage / 100) * circumference} ${circumference}`;
                              const dashOffset = -((accumulatedPercent / 100) * circumference);
                              accumulatedPercent += slice.percentage;

                              const isHovered = hoveredSlice === idx;

                              return (
                                <circle
                                  key={idx}
                                  cx="60"
                                  cy="60"
                                  r="50"
                                  fill="transparent"
                                  stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                                  strokeWidth={isHovered ? '17' : '13'}
                                  strokeDasharray={dashArray}
                                  strokeDashoffset={dashOffset}
                                  strokeLinecap="round"
                                  className="cursor-pointer transition-all duration-300 hover:stroke-[17px]"
                                  onMouseEnter={() => setHoveredSlice(idx)}
                                  onMouseLeave={() => setHoveredSlice(null)}
                                />
                              );
                            });
                          })()}
                        </svg>
                        
                        {/* Centered balance text */}
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-center font-mono">
                          <span className="text-[8px] text-gray-500 uppercase tracking-widest">รายจ่ายรวม</span>
                          <span className="text-xs font-bold text-white tracking-tight">
                            {formatCurrency(totalExpenses)}
                          </span>
                        </div>
                      </div>

                      {/* Donut Legend lists with color pills */}
                      <div className="space-y-1.5 w-full flex-1 max-w-[240px]">
                        {categoryData.map((slice, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between text-[11px] font-mono p-2 rounded-xl border transition-all ${
                              hoveredSlice === idx 
                                ? 'bg-gray-800/40 border-gray-700 shadow-md' 
                                : 'border-transparent hover:bg-gray-950/20'
                            }`}
                            onMouseEnter={() => setHoveredSlice(idx)}
                            onMouseLeave={() => setHoveredSlice(null)}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                              <span className="text-gray-300 truncate font-sans font-medium">{slice.name}</span>
                            </div>
                            <div className="text-right shrink-0 flex items-center gap-2">
                              <span className="text-white font-bold">{formatCurrency(slice.value)}</span>
                              <span className="text-gray-500 font-semibold">{slice.percentage.toFixed(0)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}
                </div>
              ) : (
                // 7 Days Spending sparkline trend
                <div className="w-full h-44 relative pt-4">
                  {(() => {
                    const width = 340;
                    const height = 130;
                    const padding = 15;

                    const maxVal = Math.max(...trendData.map(d => d.value), 1000);
                    
                    const points = trendData.map((d, idx) => {
                      const x = padding + (idx * (width - 2 * padding) / 6);
                      const y = height - padding - (d.value * (height - 2 * padding) / maxVal);
                      return { x, y, val: d.value, label: d.label };
                    });

                    const dPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                    const dAreaPath = `${dPath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

                    return (
                      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                        <defs>
                          <linearGradient id="chart-red-glow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ff5a52" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#ff5a52" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#21262d" strokeWidth="1" />
                        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#21262d" strokeWidth="1" strokeDasharray="3 3" />

                        <path d={dAreaPath} fill="url(#chart-red-glow)" />
                        <path d={dPath} fill="none" stroke="#ff5a52" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                        {points.map((p, idx) => (
                          <g key={idx} className="group/dot cursor-pointer">
                            <circle cx={p.x} cy={p.y} r="3.5" fill="#0d1117" stroke="#ff5a52" strokeWidth="2" />
                            <text x={p.x} y={height - 2} textAnchor="middle" fill="#666" fontSize="6.5" fontFamily="monospace" fontWeight="bold">
                              {p.label}
                            </text>
                            
                            {/* Sparkline tooltip popup */}
                            <g className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-150 pointer-events-none">
                              <rect x={p.x - 30} y={p.y - 23} width="60" height="15" rx="4" fill="#0b0d12" stroke="#gray-800" strokeWidth="1" />
                              <text x={p.x} y={p.y - 13} textAnchor="middle" fill="white" fontSize="7" fontFamily="monospace" fontWeight="bold">
                                {formatCurrency(p.val)}
                              </text>
                            </g>
                          </g>
                        ))}
                      </svg>
                    );
                  })()}
                </div>
              )}

              <div className="bg-gray-950/60 p-3 border border-gray-850 rounded-xl flex gap-2">
                <Info className="w-4 h-4 text-[#C0F500] shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-500 font-sans leading-relaxed">
                  แผนภูมิสถิตินี้คำนวณจากยอดธุรกรรมตามจริงในเดือนและปีที่แสดงผล สามารถสลับเป็นรายเดือนอื่นเพื่อดูการเติบโตได้ทันที
                </p>
              </div>
            </motion.div>
          )}

          {/* TAB 3: HISTORY LEDGER FEED */}
          {activeSubTab === 'ledger' && (
            <motion.div
              key="ledger-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-4"
            >
              {groupedTimeline.length === 0 ? (
                // Astro empty state (matching exactly the Money Mgr Astronaut screenshot mock!)
                <div className="flex flex-col items-center justify-center py-16 bg-[#14171E] border border-gray-850 rounded-2xl p-6 text-center shadow-lg space-y-4 select-none">
                  
                  {/* Space Astronaut Inline Vector SVG with Speech bubble */}
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-20 h-20 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {/* Helmet visor */}
                      <rect x="25" y="25" width="50" height="42" rx="18" fill="#1b202a" stroke="#444b58" strokeWidth="2.5" />
                      <circle cx="50" cy="46" r="14" fill="#2d3546" stroke="#444b58" />
                      {/* Reflection shine */}
                      <path d="M42 38 Q46 36 50 38" stroke="#777" strokeWidth="1.5" />
                      {/* Helmet structure */}
                      <circle cx="50" cy="46" r="28" stroke="#444b58" strokeWidth="2" />
                      {/* Antenna */}
                      <line x1="50" y1="18" x2="50" y2="8" stroke="#444b58" />
                      <circle cx="50" cy="7" r="2.5" fill="#ff5a52" />
                      {/* Shoulders */}
                      <path d="M20 85 Q30 76 50 76 T80 85" stroke="#444b58" strokeWidth="2" fill="#14171e" />
                      <circle cx="50" cy="80" r="3.5" fill="#C0F500" />
                    </svg>

                    {/* Speech bubble */}
                    <div className="absolute top-[-5px] right-[-10px] bg-gray-950 border border-gray-800 rounded-2xl px-2 py-1 flex items-center gap-1 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-400">ไม่มีข้อมูลที่เกี่ยวข้อง</h4>
                    <p className="text-[10px] text-gray-600 font-sans mt-1 max-w-[200px] mx-auto">
                      ไม่พบประวัติธุรกรรมในหน้าบัญชีนี้ ลองสลับไปยังช่วงเวลาอื่นหรือบันทึกรายรับ-รายจ่ายของคุณตอนนี้
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedTimeline.map(group => (
                    <div key={group.dateStr} className="bg-[#14171E] border border-gray-850 rounded-2xl shadow-lg overflow-hidden">
                      
                      {/* Replicating screenshot 4 header design */}
                      <div className="flex justify-between items-center bg-[#1E222B]/50 px-4 py-3 border-b border-gray-850">
                        <div className="flex items-center gap-2.5">
                          {/* Big Day Number */}
                          <span className="text-2xl font-black font-mono text-white tracking-tight leading-none">
                            {group.dayNum}
                          </span>
                          
                          {/* Small date BE and weekday grey pill box */}
                          <div className="flex flex-col text-left">
                            <span className="text-[8px] font-mono text-gray-500 font-bold leading-none">{group.beDateStr}</span>
                            <span className="px-1.5 py-0.5 mt-0.5 text-[8px] font-bold bg-gray-900 border border-gray-800 text-gray-400 rounded leading-none text-center">
                              {group.weekdayThai}
                            </span>
                          </div>
                        </div>

                        {/* Summary flow amounts and custom ledger index card icons */}
                        <div className="flex items-center gap-4 text-xs font-mono font-bold shrink-0">
                          {group.dailyIncome > 0 && (
                            <span className="text-[#56BE89]">
                              {formatCurrency(group.dailyIncome)}
                            </span>
                          )}
                          {group.dailyExpense > 0 && (
                            <span className="text-[#ff5a52]">
                              {formatCurrency(group.dailyExpense)}
                            </span>
                          )}
                          <span className="material-symbols-outlined text-gray-500" style={{ fontSize: 16 }}>list_alt</span>
                        </div>
                      </div>

                      {/* Transaction entries under this day */}
                      <div className="divide-y divide-gray-900/35 p-1 space-y-1">
                        {group.txs.map(tx => (
                          <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-[#1E222B]/20 rounded-xl transition-all">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-white tracking-wide">{tx.category}</span>
                                {tx.tags.length > 0 && (
                                  <span className="text-[7px] font-mono font-bold px-1 bg-gray-950 text-gray-500 border border-gray-900 rounded">
                                    {tx.tags[0]}
                                  </span>
                                )}
                              </div>
                              {tx.note && <p className="text-[9px] text-gray-500 mt-0.5">{tx.note}</p>}
                              {(tx.fromAccountId || tx.toAccountId) && (
                                <div className="text-[8px] text-[#C0F500] font-mono mt-1">
                                  {tx.type === 'transfer' 
                                    ? `${getAccountName(tx.fromAccountId)} ➔ ${getAccountName(tx.toAccountId)}`
                                    : getAccountName(tx.fromAccountId || tx.toAccountId)
                                  }
                                </div>
                              )}
                            </div>

                            <span className={`text-xs font-mono font-bold ${
                              tx.type === 'expense' ? 'text-[#ff5a52]' : tx.type === 'income' ? 'text-[#56BE89]' : 'text-blue-400'
                            }`}>
                              {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                              {formatCurrency(tx.amount)}
                            </span>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
};
export default FinancialCalendarAndCharts;
