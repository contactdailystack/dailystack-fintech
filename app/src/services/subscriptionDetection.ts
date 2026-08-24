/**
 * ============================================================
 * DailyStack — Subscription Detection Engine
 * Rocket Money Logic Architecture Implementation
 * ============================================================
 * 
 * This service implements the Rocket Money Recurring Detection Algorithm:
 * 1. Temporal Analysis: Check day consistency (temporal variance)
 * 2. Amount Analysis: Check price consistency (coefficient of variation)
 * 3. Flag-based Detection: Known subscription keywords
 * 
 * Formula: Recurrence Score = (0.40 × Temporal) + (0.35 × Amount) + (0.25 × Flag)
 * Threshold: Score >= 0.75 = Detected as recurring
 */

import { Transaction } from '../types';

// ============================================================
// DETECTION WEIGHTS (from Rocket Money paper)
// ============================================================
const W_TEMPORAL = 0.40;  // Weight for temporal consistency
const W_AMOUNT = 0.35;     // Weight for amount consistency
const W_FLAG = 0.25;       // Weight for known merchant flags

// Thresholds
const TEMPORAL_VARIANCE_THRESHOLD = 3; // days
const AMOUNT_CV_THRESHOLD = 0.35;      // 35% coefficient of variation
const DETECTION_SCORE_THRESHOLD = 0.75;

// ============================================================
// KNOWN SUBSCRIPTION MERCHANTS
// High-confidence recurring charges
// ============================================================
const KNOWN_SUBSCRIPTIONS = [
  'netflix', 'spotify', 'youtube premium', 'youtube music',
  'disney+', 'hbo max', 'hulu', 'prime video',
  'apple tv+', 'apple music', 'apple one',
  'amazon prime', 'microsoft 365', 'dropbox', 'google one',
  'icloud', 'adobe', 'notion', 'figma',
  'ais', 'dtac', 'true', 'metropolis',
];

// Known bill merchants (utilities)
const KNOWN_BILLS = [
  'electricity', 'การไฟฟ้า', 'ค่าไฟ',
  'water', 'ประปา', 'ค่าน้ำ',
  'internet', 'เน็ต', ' broadband',
  'rent', 'ค่าเช่า',
  'insurance', 'ประกัน',
  'phone', 'โทรศัพท์',
];

export interface DetectedRecurring {
  id: string;
  merchant: string;
  normalizedMerchant: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  type: 'subscription' | 'bill';
  nextDueDate: Date;
  confidence: 'high' | 'medium' | 'low' | 'manual';
  recurrenceScore: number;
  temporalVariance: number;
  amountCV: number;
  transactionCount: number;
  isFixedAmount: boolean;
  estimatedNextAmount?: number;
  yearlyTotal?: number;
}

/**
 * Check if merchant is a known subscription
 */
const isKnownSubscription = (merchant: string): boolean => {
  const normalized = merchant.toLowerCase();
  return KNOWN_SUBSCRIPTIONS.some(sub => normalized.includes(sub));
};

/**
 * Check if merchant is a known bill
 */
const isKnownBill = (merchant: string): boolean => {
  const normalized = merchant.toLowerCase();
  return KNOWN_BILLS.some(bill => normalized.includes(bill));
};

/**
 * Calculate temporal variance (standard deviation of day gaps)
 */
const calculateTemporalVariance = (dates: Date[]): number => {
  if (dates.length < 2) return 999;
  
  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const dayGaps: number[] = [];
  
  for (let i = 1; i < sorted.length; i++) {
    const gap = Math.round((sorted[i].getTime() - sorted[i-1].getTime()) / (1000 * 60 * 60 * 24));
    dayGaps.push(gap);
  }
  
  if (dayGaps.length === 0) return 999;
  
  const avgGap = dayGaps.reduce((a, b) => a + b, 0) / dayGaps.length;
  const variance = dayGaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / dayGaps.length;
  
  return Math.sqrt(variance);
};

/**
 * Calculate temporal score (1 = consistent, 0 = inconsistent)
 */
const calculateTemporalScore = (variance: number): number => {
  if (variance <= TEMPORAL_VARIANCE_THRESHOLD) return 1.0;
  return Math.max(0, 1 - (variance - TEMPORAL_VARIANCE_THRESHOLD) / 10);
};

/**
 * Calculate coefficient of variation (CV) for amounts
 */
const calculateAmountCV = (amounts: number[]): number => {
  if (amounts.length < 2) return 0;
  
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  if (avg === 0) return 0;
  
  const variance = amounts.reduce((sum, amt) => sum + Math.pow(amt - avg, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);
  
  return stdDev / avg;
};

/**
 * Calculate amount score (1 = fixed, 0 = highly variable)
 */
const calculateAmountScore = (cv: number): number => {
  if (cv === 0) return 1.0; // Perfectly fixed
  return Math.max(0, 1 - cv / AMOUNT_CV_THRESHOLD);
};

/**
 * Detect frequency from average day gap
 */
const detectFrequency = (avgDayGap: number): 'weekly' | 'monthly' | 'yearly' => {
  if (avgDayGap <= 10) return 'weekly';
  if (avgDayGap <= 40) return 'monthly';
  return 'yearly';
};

/**
 * Group transactions by normalized merchant
 */
const groupByMerchant = (transactions: Transaction[]): Map<string, Transaction[]> => {
  const groups = new Map<string, Transaction[]>();
  
  for (const tx of transactions) {
    if (tx.amount >= 0) continue; // Skip income
    
    const key = tx.merchant.toLowerCase().trim();
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(tx);
  }
  
  return groups;
};

/**
 * Detect recurring transactions from a group
 */
const detectFromGroup = (
  merchant: string,
  transactions: Transaction[]
): DetectedRecurring | null => {
  if (transactions.length < 2) return null;
  
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Extract data
  const dates = sorted.map(t => new Date(t.date));
  const amounts = sorted.map(t => Math.abs(t.amount));
  
  // Calculate metrics
  const temporalVariance = calculateTemporalVariance(dates);
  const amountCV = calculateAmountCV(amounts);
  
  const temporalScore = calculateTemporalScore(temporalVariance);
  const amountScore = calculateAmountScore(amountCV);
  const flagScore = isKnownSubscription(merchant) || isKnownBill(merchant) ? 1.0 : 0.5;
  
  // Calculate recurrence score
  const recurrenceScore = Math.min(1,
    (W_TEMPORAL * temporalScore) +
    (W_AMOUNT * amountScore) +
    (W_FLAG * flagScore)
  );
  
  // Determine confidence
  let confidence: DetectedRecurring['confidence'];
  if (transactions.length >= 3 && recurrenceScore >= 0.75) {
    confidence = 'high';
  } else if (transactions.length >= 2 && recurrenceScore >= 0.5) {
    confidence = 'medium';
  } else if (recurrenceScore >= 0.3) {
    confidence = 'low';
  } else {
    confidence = 'manual';
  }
  
  // Detect frequency
  const dayGaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = Math.round((new Date(sorted[i].date).getTime() - new Date(sorted[i-1].date).getTime()) / (1000 * 60 * 60 * 24));
    dayGaps.push(gap);
  }
  const avgDayGap = dayGaps.length > 0
    ? dayGaps.reduce((a, b) => a + b, 0) / dayGaps.length
    : 30;
  const frequency = detectFrequency(avgDayGap);
  
  // Determine type
  const type: 'subscription' | 'bill' = isKnownBill(merchant) ? 'bill' : 'subscription';
  
  // Calculate next due date (estimate based on average gap)
  const latestTx = sorted[sorted.length - 1];
  const nextDueDate = new Date(latestTx.date);
  nextDueDate.setDate(nextDueDate.getDate() + Math.round(avgDayGap));
  
  // Calculate yearly total
  const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const yearlyMultiplier = frequency === 'weekly' ? 52 : frequency === 'monthly' ? 12 : 1;
  const yearlyTotal = avgAmount * yearlyMultiplier;
  
  // Check if amount is fixed
  const isFixedAmount = amountCV < 0.01;
  
  return {
    id: latestTx.id,
    merchant: latestTx.merchant,
    normalizedMerchant: merchant,
    amount: avgAmount,
    frequency,
    type,
    nextDueDate,
    confidence,
    recurrenceScore,
    temporalVariance: Math.round(temporalVariance * 10) / 10,
    amountCV: Math.round(amountCV * 100) / 100,
    transactionCount: sorted.length,
    isFixedAmount,
    estimatedNextAmount: isFixedAmount ? undefined : avgAmount,
    yearlyTotal: Math.round(yearlyTotal),
  };
};

/**
 * Main detection function
 * Scans all transactions and returns detected recurring charges
 */
export const detectRecurringTransactions = (
  transactions: Transaction[]
): DetectedRecurring[] => {
  const groups = groupByMerchant(transactions);
  const detected: DetectedRecurring[] = [];
  
  for (const [merchant, txs] of groups) {
    const result = detectFromGroup(merchant, txs);
    if (result && result.recurrenceScore >= DETECTION_SCORE_THRESHOLD) {
      detected.push(result);
    }
  }
  
  // Sort by recurrence score (highest first)
  return detected.sort((a, b) => b.recurrenceScore - a.recurrenceScore);
};

/**
 * Get upcoming recurring charges (next 7 days)
 */
export const getUpcomingRecurring = (
  recurring: DetectedRecurring[],
  days: number = 7
): DetectedRecurring[] => {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return recurring.filter(r => 
    r.nextDueDate >= now && r.nextDueDate <= future
  );
};

/**
 * Calculate total monthly recurring expenses
 */
export const calculateMonthlyRecurring = (
  recurring: DetectedRecurring[]
): number => {
  return recurring.reduce((sum, r) => {
    if (r.frequency === 'weekly') {
      return sum + (r.amount * 52 / 12);
    } else if (r.frequency === 'yearly') {
      return sum + (r.amount / 12);
    }
    return sum + r.amount;
  }, 0);
};

/**
 * Calculate yearly recurring expenses
 */
export const calculateYearlyRecurring = (
  recurring: DetectedRecurring[]
): number => {
  return recurring.reduce((sum, r) => {
    if (r.frequency === 'monthly') {
      return sum + (r.amount * 12);
    } else if (r.frequency === 'weekly') {
      return sum + (r.amount * 52);
    }
    return sum + r.amount;
  }, 0);
};
