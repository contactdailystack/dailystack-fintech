export interface Transaction {
  id: string;
  merchant: string;
  category: string; // User selected: Food, Transport, Shopping, Bills, Entertainment, Health, Education, Investment
  amount: number;
  date: string;
  status: 'completed' | 'pending';

  // Context
  workspace?: 'Personal' | 'Family' | 'Business' | 'Travel' | 'Side Hustle' | 'Investment' | string;
  location?: string;
  timeOfDay?: 'Morning' | 'Afternoon' | 'Evening' | 'Midnight';
  dayOfWeek?: string;
  goalAssociation?: string;

  // Tags (user-defined, multiple per transaction)
  tags?: string[];

  // Recurring detection flag
  isRecurring?: boolean;

  // Rocket Money parity: notes / ignore / split (#6a, #6b, #6d)
  note?: string;
  isIgnored?: boolean;
  splitOf?: boolean;

  // Dynamic user field custom fields mapping
  customFields?: Record<string, string>;
}

export interface StockAsset {
  symbol: string;
  name: string;
  price: number;
  percentChange: number;
  history: number[]; // Sparkline history values
}

export interface UserProfile {
  id: string;
  
  name: string;
  email: string;
  plan: 'basic' | 'pro' | 'elite';
  balance: number;
  portfolioValue: number;
  avatarUrl: string;
  notifications?: number;
  savings?: number;
  monthlyBudget?: number; // User's monthly spending budget
  creditScore?: number; // User's credit score (300-850)
  paydayDay?: number; // Day of month when salary is received (1-31)
}

export interface AIInterpretation {
  summary: string;
  confidenceScore: number;
  archetype: string; // "The Wealth Builder", "The Mindful Growth Engine", "The Impulse Protector"
  radarAnalysis: {
    impulseRating: number; // 0-100
    futureOrientation: number; // 0-100
    socialPressureResistance: number; // 0-100
    smartValueSeeking: number; // 0-100
  };
}
