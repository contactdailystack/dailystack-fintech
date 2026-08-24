/**
 * Shared Types for DailyStack FinTech App
 * Centralized type definitions for cross-component usage
 * 
 * This file re-exports and extends core types from the main types.ts file
 * for organized type definitions across the application
 */

// Re-export core types from main types file for convenience
export type { 
  Transaction, 
  StockAsset, 
  UserProfile, 
  AIInterpretation
} from '../types';

// Subscription types (not in main types.ts)
export interface Subscription {
  id: string;
  name: string;
  provider: string;
  category: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly' | 'weekly';
  nextBillingDate: string;
  status: 'active' | 'cancelled' | 'paused';
  logoUrl?: string;
  color?: string;
}

// Budget types
export interface BudgetCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  budgetLimit: number;
  spent: number;
  color: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
    deadline: string;
}

// Language types
export type Language = 'en' | 'th';

// Theme types
export type Theme = 'dark' | 'light';

// Intent types for transactions
export type TransactionIntent = 'Need' | 'Want' | 'Convenience' | 'Reward' | 'Emergency' | 'Investment' | 'Learning' | 'Relationship' | 'Business';

// Behavioral categories
export type BehavioralCategory = 'Essential' | 'Lifestyle' | 'Impulse' | 'Emotional' | 'Social' | 'Growth' | 'Investment' | 'Risk' | 'Reward';

// Time of day types
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Midnight';

// Workspace types
export type Workspace = 'Personal' | 'Family' | 'Business' | 'Travel' | 'Side Hustle' | 'Investment' | string;
