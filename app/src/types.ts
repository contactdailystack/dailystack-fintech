export type Emotion = 'Impulse' | 'Joy' | 'Stress' | 'Social' | 'Value' | 'Investment' | 'Happy' | 'Stressed' | 'Bored' | 'Rewarding' | 'Motivated' | 'Anxious' | 'Neutral';

export interface Transaction {
  id: string;
  merchant: string;
  category: string; // User selected: Food, Transport, Shopping, Bills, Entertainment, Health, Education, Investment
  amount: number;
  date: string;
  emotion: Emotion;
  why: string; // Explaining behavior / Note
  status: 'completed' | 'pending';

  // Layer 2: Context Layer
  workspace?: 'Personal' | 'Family' | 'Business' | 'Travel' | 'Side Hustle' | 'Investment' | string;
  location?: string;
  timeOfDay?: 'Morning' | 'Afternoon' | 'Evening' | 'Midnight';
  dayOfWeek?: string;
  goalAssociation?: string;

  // Layer 3: Behavior Layer
  intent?: 'Need' | 'Want' | 'Convenience' | 'Reward' | 'Emergency' | 'Investment' | 'Learning' | 'Relationship' | 'Business';
  spendingType?: string;
  motivation?: string;
  trigger?: string;

  // Layer 4: AI Layer
  riskScore?: number; // 0-100
  habitScore?: number; // 0-100
  behavioralCategory?: 'Essential' | 'Lifestyle' | 'Impulse' | 'Emotional' | 'Social' | 'Growth' | 'Investment' | 'Risk' | 'Reward';
  patternMatch?: string;

  // Layer 5: Transformation Layer
  goalImpact?: string;
  behaviorImpact?: string;
  financialHealthImpact?: string;

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

export interface WeeklyStory {
  id: string;
  title: string;
  category: string;
  value: string;
  metricLabel: string;
  storySegment: string;
  futureImpactQuestion: string;
  visualTheme: string; // slate, emerald, gold, indigo
}
