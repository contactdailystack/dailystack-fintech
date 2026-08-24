/**
 * ============================================================
 * DailyStack — Transaction Cleansing Pipeline
 * Rocket Money Logic Architecture Implementation
 * ============================================================
 * 
 * This service handles:
 * 1. Merchant Normalization: "AMZN MKTP US*1A2B3C" → "Amazon"
 * 2. Merchant Enrichment: Attach logo URL, category
 * 3. Duplicate Detection: Identify and flag duplicate transactions
 * 
 * Reference: Rocket Money Data Enrichment & Cleansing Pipeline
 */

import { Transaction } from '../types';

// ============================================================
// MERCHANT NORMALIZATION MAP
// Global merchant names mapped from raw bank strings
// ============================================================
const MERCHANT_ALIASES: Record<string, { name: string; logo: string; category: string }> = {
  // Streaming
  'netflix': { name: 'Netflix', logo: 'NF', category: 'Entertainment' },
  'spotify': { name: 'Spotify', logo: 'SP', category: 'Entertainment' },
  'youtube': { name: 'YouTube', logo: 'YT', category: 'Entertainment' },
  'youtube premium': { name: 'YouTube Premium', logo: 'YP', category: 'Entertainment' },
  'youtube music': { name: 'YouTube Music', logo: 'YM', category: 'Entertainment' },
  'disney': { name: 'Disney+', logo: 'DS', category: 'Entertainment' },
  'disney+': { name: 'Disney+', logo: 'DS', category: 'Entertainment' },
  'hbo': { name: 'HBO Max', logo: 'HB', category: 'Entertainment' },
  'hbo max': { name: 'HBO Max', logo: 'HB', category: 'Entertainment' },
  'hulu': { name: 'Hulu', logo: 'HL', category: 'Entertainment' },
  'prime video': { name: 'Prime Video', logo: 'PV', category: 'Entertainment' },
  'amazon prime': { name: 'Amazon Prime', logo: 'AP', category: 'Entertainment' },
  'apple tv': { name: 'Apple TV+', logo: 'AT', category: 'Entertainment' },
  
  // E-commerce & Tech
  'amazon': { name: 'Amazon', logo: 'AZ', category: 'Shopping' },
  'amzn': { name: 'Amazon', logo: 'AZ', category: 'Shopping' },
  'shopee': { name: 'Shopee', logo: 'SH', category: 'Shopping' },
  'lazada': { name: 'Lazada', logo: 'LZ', category: 'Shopping' },
  'central': { name: 'Central', logo: 'CT', category: 'Shopping' },
  ' Robinson': { name: 'Robinson', logo: 'RB', category: 'Shopping' },
  'big c': { name: 'Big C', logo: 'BC', category: 'Shopping' },
  'tesco lotus': { name: 'Tesco Lotus', logo: 'TL', category: 'Shopping' },
  'makro': { name: 'Makro', logo: 'MK', category: 'Shopping' },
  'grab': { name: 'Grab', logo: 'GR', category: 'Transport' },
  'line man': { name: 'LINE MAN', logo: 'LM', category: 'Food' },
  'foodpanda': { name: 'Foodpanda', logo: 'FP', category: 'Food' },
  
  // Utilities & Bills
  'ais': { name: 'AIS', logo: 'AIS', category: 'Bills' },
  'dtac': { name: 'DTAC', logo: 'DT', category: 'Bills' },
  'true': { name: 'True', logo: 'TR', category: 'Bills' },
  'metropolis': { name: 'Metropolis', logo: 'MT', category: 'Bills' },
  'meb': { name: 'MEA', logo: 'ME', category: 'Bills' },
  'pea': { name: 'PEA', logo: 'PE', category: 'Bills' },
  'การไฟฟ้า': { name: 'Electricity', logo: 'EF', category: 'Bills' },
  'ค่าไฟ': { name: 'Electricity', logo: 'EF', category: 'Bills' },
  'ประปา': { name: 'Water', logo: 'WT', category: 'Bills' },
  'ค่าน้ำ': { name: 'Water', logo: 'WT', category: 'Bills' },
  'internet': { name: 'Internet', logo: 'IN', category: 'Bills' },
  'เน็ต': { name: 'Internet', logo: 'IN', category: 'Bills' },
  
  // Banks
  'scb': { name: 'SCB', logo: 'SC', category: 'Transfer' },
  'kbank': { name: 'Kasikorn', logo: 'KB', category: 'Transfer' },
  'bbl': { name: 'Bangkok Bank', logo: 'BB', category: 'Transfer' },
  'krungsri': { name: 'Krungsri', logo: 'KS', category: 'Transfer' },
  'ttb': { name: 'TTB', logo: 'TT', category: 'Transfer' },
  
  // Food
  'mcdonald': { name: 'McDonald', logo: 'MC', category: 'Food' },
  'mcd': { name: 'McDonald', logo: 'MC', category: 'Food' },
  'kfc': { name: 'KFC', logo: 'KF', category: 'Food' },
  'starbucks': { name: 'Starbucks', logo: 'SB', category: 'Food' },
  'coffee': { name: 'Coffee Shop', logo: 'CF', category: 'Food' },
  
  // Transport
  'bts': { name: 'BTS', logo: 'BT', category: 'Transport' },
  'mrt': { name: 'MRT', logo: 'MR', category: 'Transport' },
  ' Airport': { name: 'Airport Rail Link', logo: 'AR', category: 'Transport' },
};

// Regex patterns for raw bank string cleaning
const CLEANING_PATTERNS = [
  // Remove transaction IDs and codes
  /\*[A-Z0-9]+/g,
  // Remove country codes
  /\s+[A-Z]{2}\s*/g,
  // Remove location info
  /\s+[A-Z][a-z]+\s*/g,
  // Remove extra whitespace
  /\s+/g,
  // Remove common prefixes
  /^(POS|ATM|TRANSFER|PAYMENT|DEBIT|CREDIT)\s*/gi,
];

/**
 * Normalize a raw merchant name from bank statement
 * "AMZN MKTP US*1A2B3C SEATTLE" → "Amazon"
 */
export const normalizeMerchant = (rawMerchant: string): string => {
  if (!rawMerchant) return 'Unknown';
  
  const normalized = rawMerchant
    .toLowerCase()
    .trim();
  
  // Check against known aliases
  for (const [key, value] of Object.entries(MERCHANT_ALIASES)) {
    if (normalized.includes(key)) {
      return value.name;
    }
  }
  
  // Apply cleaning patterns
  let cleaned = rawMerchant;
  for (const pattern of CLEANING_PATTERNS) {
    cleaned = cleaned.replace(pattern, ' ');
  }
  
  // Title case and trim
  const titleCase = cleaned
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
  
  return titleCase || rawMerchant;
};

/**
 * Get merchant display info (name, logo initials, category)
 */
export const getMerchantInfo = (rawMerchant: string): {
  name: string;
  logo: string;
  category: string;
} => {
  if (!rawMerchant) {
    return { name: 'Unknown', logo: '??', category: 'Other' };
  }
  
  const normalized = rawMerchant.toLowerCase().trim();
  
  // Check against known aliases
  for (const [key, value] of Object.entries(MERCHANT_ALIASES)) {
    if (normalized.includes(key)) {
      return value;
    }
  }
  
  // Generate initials from cleaned name
  const cleaned = normalizeMerchant(rawMerchant);
  const words = cleaned.split(' ');
  const logo = words.length > 1
    ? words.slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : cleaned.substring(0, 2).toUpperCase();
  
  return {
    name: cleaned,
    logo,
    category: 'Other',
  };
};

/**
 * Transaction Cleansing Pipeline
 * Applies full enrichment to a raw transaction
 */
export const cleanseTransaction = (transaction: Transaction): Transaction => {
  const merchantInfo = getMerchantInfo(transaction.merchant);
  
  return {
    ...transaction,
    merchant: merchantInfo.name,
  };
};

/**
 * Batch cleanse transactions
 */
export const cleanseTransactions = (transactions: Transaction[]): Transaction[] => {
  return transactions.map(cleanseTransaction);
};

/**
 * Detect duplicate transactions
 * Rocket Money uses this to prevent double-charging
 */
export const detectDuplicates = (transactions: Transaction[]): {
  duplicates: Transaction[];
  unique: Transaction[];
} => {
  const seen = new Map<string, Transaction>();
  const duplicates: Transaction[] = [];
  
  for (const tx of transactions) {
    // Create a unique key based on merchant, amount, and date (within 1 day)
    const txDate = new Date(tx.date);
    const dateKey = `${txDate.getFullYear()}-${txDate.getMonth()}-${txDate.getDate()}`;
    const key = `${tx.merchant.toLowerCase()}-${Math.abs(tx.amount)}-${dateKey}`;
    
    if (seen.has(key)) {
      duplicates.push(tx);
    } else {
      seen.set(key, tx);
    }
  }
  
  const unique = transactions.filter(tx => !duplicates.includes(tx));
  
  return { duplicates, unique };
};
