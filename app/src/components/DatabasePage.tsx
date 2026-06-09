import React, { useState, useMemo } from 'react';
import {
  Database, Table, Terminal, Shield, Sliders, BrainCircuit,
  Sparkles, Layers, Hourglass, TrendingUp, AlertTriangle, Compass,
  Target, ThermometerSnowflake, Gem
,
  Check} from 'lucide-react';
import { Transaction, UserProfile } from '../types';
import { Language } from '../data/translations';

interface DatabasePageProps {
  transactions: Transaction[];
  profile: UserProfile;
  lang: Language;
}

export default function DatabasePage({ transactions, profile, lang }: DatabasePageProps) {
  const [selectedLayer, setSelectedLayer] = useState<number>(3); // Default to the Layer 3 Behavior Layer
  const [selectedTable, setSelectedTable] = useState<string>('transaction_behavior_signals');
  const [founderQuery, setFounderQuery] = useState<string>('progress'); // progress | behaviors | risks | goals | ai_next
  const [showSqlDef, setShowSqlDef] = useState<boolean>(true);

  // 11 Layers relational structure definitions
  const schemaOutline = useMemo(() => {
    return [
      {
        id: 1,
        name: 'Identity Layer',
        desc: 'Sovereign Profile & UI configuration systems',
        tables: {
          users: {
            columns: [
              { name: 'id', type: 'UUID (PK)', desc: 'Primary unique user identifier' },
              { name: 'auth_user_id', type: 'VARCHAR', desc: 'Secure OAuth credentials linking token' },
              { name: 'email', type: 'VARCHAR', desc: 'Sovereign email address' },
              { name: 'display_name', type: 'VARCHAR', desc: 'Human-friendly alias format' },
              { name: 'avatar_url', type: 'VARCHAR', desc: 'Unsplash custom secure graphic pointer' },
              { name: 'timezone', type: 'VARCHAR', desc: 'Local time-offset mapping host' },
              { name: 'language', type: 'VARCHAR(2)', desc: 'Language layout selection code (EN | TH)' },
              { name: 'currency_primary', type: 'VARCHAR(3)', desc: 'Primary accounting core standard (USD)' },
              { name: 'currency_secondary', type: 'VARCHAR(3)', desc: 'Secondary overlay ticker (THB)' },
              { name: 'created_at', type: 'TIMESTAMP', desc: 'Initial system epoch connection timestamp' },
              { name: 'updated_at', type: 'TIMESTAMP', desc: 'Latest credential metadata modifications' }
            ],
            sql: `CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url VARCHAR(500),
  timezone VARCHAR(50) DEFAULT 'UTC',
  language VARCHAR(2) DEFAULT 'en',
  currency_primary VARCHAR(3) DEFAULT 'USD',
  currency_secondary VARCHAR(3) DEFAULT 'THB',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
          },
          user_preferences: {
            columns: [
              { name: 'user_id', type: 'UUID (FK)', desc: 'Links strictly to users.id root mapping' },
              { name: 'theme', type: 'VARCHAR', desc: 'UI lighting layout rules (dark | light)' },
              { name: 'dashboard_layout', type: 'VARCHAR', desc: 'Visual grid position presets' },
              { name: 'quick_add_mode', type: 'BOOLEAN', desc: 'Bypasses verification steps for rapid logging' },
              { name: 'notification_preferences', type: 'JSONB', desc: 'Subsystem behavioral alerts schema' },
              { name: 'ai_personality', type: 'VARCHAR', desc: 'Personality dial settings (Zen | Stoic | Assertive)' },
              { name: 'coaching_style', type: 'VARCHAR', desc: 'Daily delivery formatting rules' }
            ],
            sql: `CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'dark',
  dashboard_layout VARCHAR(50) DEFAULT 'bento-standard',
  quick_add_mode BOOLEAN DEFAULT false,
  notification_preferences JSONB,
  ai_personality VARCHAR(50) DEFAULT 'Assertive',
  coaching_style VARCHAR(50) DEFAULT 'Direct'
);`
          }
        }
      },
      {
        id: 2,
        name: 'Financial Layer',
        desc: 'Core transactional events and assets ledgers',
        tables: {
          workspaces: {
            columns: [
              { name: 'id', type: 'UUID (PK)', desc: 'Workspace workspace coordinate' },
              { name: 'user_id', type: 'UUID (FK)', desc: 'Link to users.id' },
              { name: 'name', type: 'VARCHAR', desc: 'Sovereign boundary label' },
              { name: 'type', type: 'VARCHAR', desc: 'Personal | Family | Business | Travel | Investment | Side Hustle' }
            ],
            sql: `CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('Personal', 'Family', 'Business', 'Travel', 'Investment', 'Side Hustle', 'Custom'))
);`
          },
          accounts: {
            columns: [
              { name: 'id', type: 'UUID (PK)', desc: 'Account ledger link' },
              { name: 'workspace_id', type: 'UUID (FK)', desc: 'Boundary mapping container link' },
              { name: 'name', type: 'VARCHAR', desc: 'Bank or liquidity pocket name' },
              { name: 'account_type', type: 'VARCHAR', desc: 'Cash | Bank | Credit Card | E-Wallet | Investment' },
              { name: 'currency', type: 'VARCHAR(3)', desc: 'Currency designator' },
              { name: 'initial_balance', type: 'NUMERIC', desc: 'Starting balance validation matrix' },
              { name: 'current_balance', type: 'NUMERIC', desc: 'Active calculation net ledger value' }
            ],
            sql: `CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  account_type VARCHAR(50) CHECK (account_type IN ('Cash', 'Bank', 'Credit Card', 'E-Wallet', 'Investment', 'Loan', 'Other')),
  currency VARCHAR(3) DEFAULT 'USD',
  initial_balance NUMERIC(15,2) DEFAULT 0.00,
  current_balance NUMERIC(15,2) DEFAULT 0.00
);`
          },
          categories: {
            columns: [
              { name: 'id', type: 'UUID (PK)', desc: 'Dynamic category lookup link' },
              { name: 'user_id', type: 'UUID (FK)', desc: 'Link to users.id' },
              { name: 'parent_id', type: 'UUID', desc: 'Tree nesting coordinate (Subcategory layout)' },
              { name: 'name', type: 'VARCHAR', desc: 'In-app category flag' },
              { name: 'icon', type: 'VARCHAR', desc: 'Lucide glyph ID map descriptor' },
              { name: 'color', type: 'VARCHAR', desc: 'CSS theme color selection value' },
              { name: 'category_type', type: 'VARCHAR', desc: 'Income | Expense | Transfer | Investment | Debt' }
            ],
            sql: `CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(20),
  category_type VARCHAR(50) CHECK (category_type IN ('Income', 'Expense', 'Transfer', 'Investment', 'Debt', 'Goal', 'Custom'))
);`
          },
          transactions: {
            columns: [
              { name: 'id', type: 'UUID (PK)', desc: 'Root event coordinate mapping key' },
              { name: 'workspace_id', type: 'UUID (FK)', desc: 'Boundary mapping coordinate context' },
              { name: 'account_id', type: 'UUID (FK)', desc: 'Liquidity ledger update anchor' },
              { name: 'category_id', type: 'UUID (FK)', desc: 'Taxonomy anchor link' },
              { name: 'transaction_type', type: 'VARCHAR', desc: 'Trigger behavior rule (Income | Expense | Transfer)' },
              { name: 'amount', type: 'NUMERIC', desc: 'Net cost event mathematical delta' },
              { name: 'currency', type: 'VARCHAR(3)', desc: 'Transaction currency standard override' },
              { name: 'description', type: 'VARCHAR', desc: 'Sovereign invoice text field' },
              { name: 'note', type: 'TEXT', desc: 'Deep details context buffer' },
              { name: 'transaction_date', type: 'DATE', desc: 'Moment transaction took place' },
              { name: 'created_at', type: 'TIMESTAMP', desc: 'Database ingestion epoch clock' },
              { name: 'updated_at', type: 'TIMESTAMP', desc: 'Database correction tracking clock' }
            ],
            sql: `CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  account_id UUID REFERENCES accounts(id),
  category_id UUID REFERENCES categories(id),
  transaction_type VARCHAR(50) CHECK (transaction_type IN ('Income', 'Expense', 'Transfer', 'Subscription', 'Investment')),
  amount NUMERIC(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  description VARCHAR(255) NOT NULL,
  note TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
          }
        }
      },
      {
        id: 3,
        name: 'Behavior Layer',
        desc: 'Traditional apps store numbers. DailyStack stores human mechanics.',
        tables: {
          transaction_contexts: {
            columns: [
              { name: 'transaction_id', type: 'UUID (PK, FK)', desc: 'Maps perfectly to transactions.id root event' },
              { name: 'day_of_week', type: 'VARCHAR', desc: 'Context day marker (Monday, Wednesday, etc.)' },
              { name: 'hour_of_day', type: 'INTEGER', desc: 'Exact hour of execution (0-23)' },
              { name: 'time_period', type: 'VARCHAR', desc: 'Morning | Afternoon | Evening | Midnight' },
              { name: 'location', type: 'VARCHAR', desc: 'Coordinate location or regional tag' },
              { name: 'device_type', type: 'VARCHAR', desc: 'Ingestion device signature (iOS | WebOS)' },
              { name: 'goal_id', type: 'UUID', desc: 'Linked strategic growth goal association' }
            ],
            sql: `CREATE TABLE transaction_contexts (
  transaction_id UUID PRIMARY KEY REFERENCES transactions(id) ON DELETE CASCADE,
  day_of_week VARCHAR(15),
  hour_of_day INTEGER CHECK (hour_of_day BETWEEN 0 AND 23),
  time_period VARCHAR(20) CHECK (time_period IN ('Morning', 'Afternoon', 'Evening', 'Midnight')),
  location VARCHAR(255),
  device_type VARCHAR(50) DEFAULT 'iOS',
  goal_id UUID
);`
          },
          transaction_emotions: {
            columns: [
              { name: 'transaction_id', type: 'UUID (PK, FK)', desc: 'Maps to root transaction event' },
              { name: 'emotion_type', type: 'VARCHAR', desc: 'Trigger catalyst (Joy, Stress, Social, Neutral)' },
              { name: 'confidence_score', type: 'NUMERIC', desc: 'AI parser reliability percentage (0.0 - 1.0)' },
              { name: 'source', type: 'VARCHAR', desc: 'Indicates user feedback or neural model classification (User | AI)' }
            ],
            sql: `CREATE TABLE transaction_emotions (
  transaction_id UUID PRIMARY KEY REFERENCES transactions(id) ON DELETE CASCADE,
  emotion_type VARCHAR(50) CHECK (emotion_type IN ('Happy', 'Stress', 'Reward', 'Social', 'Motivated', 'Anxious', 'Neutral')),
  confidence_score NUMERIC(3,2) CHECK (confidence_score BETWEEN 0.0 AND 1.0),
  source VARCHAR(30) DEFAULT 'AI Generated'
);`
          },
          transaction_behavior_signals: {
            columns: [
              { name: 'transaction_id', type: 'UUID (PK, FK)', desc: 'Link to root transaction event' },
              { name: 'behavior_type', type: 'VARCHAR', desc: 'Behavior trait (Essential, Impulse, Investment, Growth)' },
              { name: 'confidence_score', type: 'NUMERIC', desc: 'Fidelity rating of systemic behavior categorization' },
              { name: 'ai_reason', type: 'TEXT', desc: 'Strategic explanation explaining behavioral patterns detected' }
            ],
            sql: `CREATE TABLE transaction_behavior_signals (
  transaction_id UUID PRIMARY KEY REFERENCES transactions(id) ON DELETE CASCADE,
  behavior_type VARCHAR(50) CHECK (behavior_type IN ('Essential', 'Lifestyle', 'Impulse', 'Emotional', 'Investment', 'Growth', 'Risk', 'Reward')),
  confidence_score NUMERIC(3,2) DEFAULT 1.0,
  ai_reason TEXT
);`
          },
          transaction_intents: {
            columns: [
              { name: 'transaction_id', type: 'UUID (PK, FK)', desc: 'Relational link mapping keys' },
              { name: 'intent_type', type: 'VARCHAR', desc: 'The strategic user want mapping (Need | Want | Convenience | Reward)' },
              { name: 'confidence_score', type: 'NUMERIC', desc: 'Calculation precision index' }
            ],
            sql: `CREATE TABLE transaction_intents (
  transaction_id UUID PRIMARY KEY REFERENCES transactions(id) ON DELETE CASCADE,
  intent_type VARCHAR(50) CHECK (intent_type IN ('Need', 'Want', 'Convenience', 'Emergency', 'Relationship', 'Learning', 'Business', 'Investment', 'Reward')),
  confidence_score NUMERIC(3,2) DEFAULT 1.0
);`
          }
        }
      },
      {
        id: 4,
        name: 'Goal Layer',
        desc: 'Future-orientated milestone trackers fueling the Money Twin profile',
        tables: {
          goals: {
            columns: [
              { name: 'id', type: 'UUID (PK)', desc: 'Goal anchor key ID' },
              { name: 'user_id', type: 'UUID (FK)', desc: 'Mapping user standard' },
              { name: 'title', type: 'VARCHAR', desc: 'Strategic target title' },
              { name: 'target_amount', type: 'NUMERIC', desc: 'Required capital ceiling' },
              { name: 'current_amount', type: 'NUMERIC', desc: 'Secured compound capital' },
              { name: 'deadline', type: 'DATE', desc: 'Milestone targeted timeline' },
              { name: 'priority', type: 'VARCHAR', desc: 'Level of urgency (High | Medium | Low)' },
              { name: 'status', type: 'VARCHAR', desc: 'Active | Completed | Paused' }
            ],
            sql: `CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  target_amount NUMERIC(15,2) NOT NULL,
  current_amount NUMERIC(15,2) DEFAULT 0.00,
  deadline DATE,
  priority VARCHAR(20) DEFAULT 'Medium',
  status VARCHAR(30) DEFAULT 'Active'
);`
          },
          goal_contributions: {
            columns: [
              { name: 'id', type: 'UUID (PK)', desc: 'Unique record ledger' },
              { name: 'goal_id', type: 'UUID (FK)', desc: 'Linked strategic target key' },
              { name: 'transaction_id', type: 'UUID (FK)', desc: 'Generating financial event key' },
              { name: 'amount', type: 'NUMERIC', desc: 'Portion of transaction redirected' },
              { name: 'created_at', type: 'TIMESTAMP', desc: 'Ingestion timestamp' }
            ],
            sql: `CREATE TABLE goal_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  amount NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
          }
        }
      },
      {
        id: 5,
        name: 'Subscription Layer',
        desc: 'Automated recurring commitment drains',
        tables: {
          subscriptions: {
            columns: [
              { name: 'id', type: 'UUID (PK)', desc: 'Unique subscription ID' },
              { name: 'user_id', type: 'UUID (FK)', desc: 'Root user identification' },
              { name: 'name', type: 'VARCHAR', desc: 'Service provider moniker' },
              { name: 'amount', type: 'NUMERIC', desc: 'Billing block pricing cycle cost' },
              { name: 'billing_cycle', type: 'VARCHAR', desc: 'Monthly | Yearly recurring intervals' },
              { name: 'next_billing_date', type: 'DATE', desc: 'Future scheduled billing depletion instance' },
              { name: 'category_id', type: 'UUID', desc: 'Financial taxonomy category link' },
              { name: 'status', type: 'VARCHAR', desc: 'Active | Paused | Cancelled' }
            ],
            sql: `CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  billing_cycle VARCHAR(50) DEFAULT 'Monthly',
  next_billing_date DATE,
  category_id UUID,
  status VARCHAR(20) DEFAULT 'Active'
);`
          }
        }
      },
      {
        id: 6,
        name: 'Budget Layer',
        desc: 'Algorithmic limits mapping behavioral guards onto categorical outlays',
        tables: {
          budgets: {
            columns: [
              { name: 'id', type: 'UUID (PK)', desc: 'Unique budget reference' },
              { name: 'user_id', type: 'UUID (FK)', desc: 'Link to users.id code' },
              { name: 'category_id', type: 'UUID (FK)', desc: 'Taxonomy categorical category constraint' },
              { name: 'budget_amount', type: 'NUMERIC', desc: 'Strategic spending limit' },
              { name: 'period_type', type: 'VARCHAR', desc: 'Weekly | Monthly | Quarterly limits' },
              { name: 'warning_threshold', type: 'NUMERIC', desc: 'Safety alert triggers warning percentage default (0.80)' }
            ],
            sql: `CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  budget_amount NUMERIC(15,2) NOT NULL,
  period_type VARCHAR(20) DEFAULT 'Monthly',
  warning_threshold NUMERIC(3,2) DEFAULT 0.80
);`
          }
        }
      },
      {
        id: 7,
        name: 'AI Intelligence Layer',
        desc: 'Advanced predictions and coaching vectors computed server-side',
        tables: {
          ai_insights: {
            columns: [
              { name: 'id', type: 'UUID (PK)', desc: 'Unique cognitive feedback ID' },
              { name: 'user_id', type: 'UUID (FK)', desc: 'Link to users.id code' },
              { name: 'insight_type', type: 'VARCHAR', desc: 'Spending | Behavior | Goal | Risk | Habit' },
              { name: 'title', type: 'VARCHAR', desc: 'Synthesized telemetry heading' },
              { name: 'description', type: 'TEXT', desc: 'Core actionable analytical text' },
              { name: 'priority', type: 'VARCHAR', desc: 'Urgency rating (Critical | High | Medium)' },
              { name: 'status', type: 'VARCHAR', desc: 'Active | Dismissed | Acted upon' },
              { name: 'generated_at', type: 'TIMESTAMP', desc: 'System inference timestamps' }
            ],
            sql: `CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  insight_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'Medium',
  status VARCHAR(30) DEFAULT 'Active',
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
          },
          ai_recommendations: {
            columns: [
              { name: 'id', type: 'UUID (PK)', desc: 'Recommendation reference key' },
              { name: 'user_id', type: 'UUID (FK)', desc: 'Link to users.id code' },
              { name: 'recommendation_type', type: 'VARCHAR', desc: 'Suggested operational tactical adjustment' },
              { name: 'title', type: 'VARCHAR', desc: 'Milestone target heading' },
              { name: 'description', type: 'TEXT', desc: 'Explanation detail summary' },
              { name: 'action_required', type: 'BOOLEAN', desc: 'Flag indicating user action required' },
              { name: 'priority', type: 'VARCHAR', desc: 'Dial priority range' },
              { name: 'generated_at', type: 'TIMESTAMP', desc: 'Generation timestamp' }
            ],
            sql: `CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  action_required BOOLEAN DEFAULT false,
  priority VARCHAR(20) DEFAULT 'Medium',
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
          }
        }
      },
      {
        id: 8,
        name: 'Money Twin Layer',
        desc: 'Bioreactive copy mapping of user’s behavioral traits and scoring',
        tables: {
          money_twin_profiles: {
            columns: [
              { name: 'user_id', type: 'UUID (PK, FK)', desc: 'Links strictly to sovereign user identification' },
              { name: 'behavior_score', type: 'NUMERIC', desc: 'General behavioral performance calculation (0-100)' },
              { name: 'risk_score', type: 'NUMERIC', desc: 'Volatile emotional impulse risk indicator' },
              { name: 'discipline_score', type: 'NUMERIC', desc: 'Delayed gratification consistency' },
              { name: 'goal_score', type: 'NUMERIC', desc: 'Milestone deadline proximity performance' },
              { name: 'consistency_score', type: 'NUMERIC', desc: 'Daily tracking cadence record ratio' },
              { name: 'growth_score', type: 'NUMERIC', desc: 'Asset net acceleration curve performance' },
              { name: 'last_updated', type: 'TIMESTAMP', desc: 'Biometric snapshot sync sync instance' }
            ],
            sql: `CREATE TABLE money_twin_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  behavior_score NUMERIC(5,2) DEFAULT 90.00,
  risk_score NUMERIC(5,2) DEFAULT 10.00,
  discipline_score NUMERIC(5,2) DEFAULT 85.00,
  goal_score NUMERIC(5,2) DEFAULT 75.00,
  consistency_score NUMERIC(5,2) DEFAULT 95.00,
  growth_score NUMERIC(5,2) DEFAULT 80.00,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
          },
          money_twin_traits: {
            columns: [
              { name: 'id', type: 'UUID (PK)', desc: 'Unique trait ID tag' },
              { name: 'user_id', type: 'UUID (FK)', desc: 'Root user link' },
              { name: 'trait_name', type: 'VARCHAR', desc: 'Impulse Buyer | Careful Planner | Opportunity Seeker | Lifestyle Spender' },
              { name: 'trait_value', type: 'VARCHAR', desc: 'Cognitive descriptor explanation' },
              { name: 'confidence_score', type: 'NUMERIC', desc: 'Fidelity of biometric character mapping (0.00 - 1.00)' }
            ],
            sql: `CREATE TABLE money_twin_traits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trait_name VARCHAR(100) NOT NULL,
  trait_value VARCHAR(255) NOT NULL,
  confidence_score NUMERIC(3,2) CHECK (confidence_score BETWEEN 0.0 AND 1.0)
);`
          }
        }
      },
      {
        id: 9,
        name: 'Transformation Layer',
        desc: 'Gamification algorithms, achievements, and behavioral streaks metrics',
        tables: {
          behavior_scores: {
            columns: [
              { name: 'user_id', type: 'UUID (FK)', desc: 'Link to users' },
              { name: 'date', type: 'DATE', desc: 'Calculation day' },
              { name: 'score', type: 'INTEGER', desc: 'Final score calculated (0-100)' },
              { name: 'reason', type: 'VARCHAR', desc: 'Direct catalyst driver notes' }
            ],
            sql: `CREATE TABLE behavior_scores (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  reason VARCHAR(255),
  PRIMARY KEY (user_id, date)
);`
          },
          achievements: {
            columns: [
              { name: 'id', type: 'UUID (PK)', desc: 'Achievement unique lookup ID' },
              { name: 'name', type: 'VARCHAR', desc: 'Human readable achievement label' },
              { name: 'description', type: 'TEXT', desc: 'Requirement conditions list' },
              { name: 'xp_reward', type: 'INTEGER', desc: 'Sovereign experience points award' },
              { name: 'badge', type: 'VARCHAR', desc: 'Badging symbol code map' }
            ],
            sql: `CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 100,
  badge VARCHAR(50) NOT NULL
);`
          },
          user_achievements: {
            columns: [
              { name: 'id', type: 'UUID (PK)', desc: 'Unique claim receipt record' },
              { name: 'user_id', type: 'UUID (FK)', desc: 'Link to user entity' },
              { name: 'achievement_id', type: 'UUID (FK)', desc: 'Link to achievement blueprint' },
              { name: 'earned_at', type: 'TIMESTAMP', desc: 'Moment earned unlocked' }
            ],
            sql: `CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
          },
          streaks: {
            columns: [
              { name: 'user_id', type: 'UUID (PK, FK)', desc: 'User matching key mapping' },
              { name: 'streak_type', type: 'VARCHAR', desc: 'Cadence stream identifier (Daily Active Tracking | Conscious Spending)' },
              { name: 'current_streak', type: 'INTEGER', desc: 'Active continuous milestones counts' },
              { name: 'best_streak', type: 'INTEGER', desc: 'All time historic record ceiling' },
              { name: 'updated_at', type: 'TIMESTAMP', desc: 'Cadence validation timing' }
            ],
            sql: `CREATE TABLE streaks (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  streak_type VARCHAR(100),
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, streak_type)
);`
          }
        }
      },
      {
        id: 10,
        name: 'Dashboard Widget Layer',
        desc: 'Enables custom-tailored layouts and dynamic visibility based on permissions',
        tables: {
          dashboard_widgets: {
            columns: [
              { name: 'id', type: 'UUID (PK)', desc: 'Unique master widget template lookup' },
              { name: 'widget_name', type: 'VARCHAR', desc: 'Sovereign widget title descriptor format' },
              { name: 'widget_type', type: 'VARCHAR', desc: 'Bento graph | Stock Tick | Radar | Emotion Ledger' },
              { name: 'availability_plan', type: 'VARCHAR', desc: 'Required access controls membership tiers (Core | Premium OS)' }
            ],
            sql: `CREATE TABLE dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_name VARCHAR(100) UNIQUE NOT NULL,
  widget_type VARCHAR(50) NOT NULL,
  availability_plan VARCHAR(30) DEFAULT 'Core'
);`
          },
          user_dashboard_layouts: {
            columns: [
              { name: 'user_id', type: 'UUID (FK)', desc: 'Link to users.id root code' },
              { name: 'widget_id', type: 'UUID (FK)', desc: 'Link to dashboard_widgets.id template code' },
              { name: 'position', type: 'INTEGER', desc: 'Grid alignment hierarchy code' },
              { name: 'is_visible', type: 'BOOLEAN', desc: 'Render evaluation flag toggler' },
              { name: 'custom_settings', type: 'JSONB', desc: 'Sovereign override configurations' }
            ],
            sql: `CREATE TABLE user_dashboard_layouts (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  widget_id UUID REFERENCES dashboard_widgets(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  custom_settings JSONB,
  PRIMARY KEY (user_id, widget_id)
);`
          }
        }
      },
      {
        id: 11,
        name: 'AI Memory Layer',
        desc: 'Retains long-term contextual semantic memories securely',
        tables: {
          ai_memories: {
            columns: [
              { name: 'id', type: 'UUID (PK)', desc: 'Unique memory ledger key' },
              { name: 'user_id', type: 'UUID (FK)', desc: 'Sovereign user relation' },
              { name: 'memory_type', type: 'VARCHAR', desc: 'Behavior | Goal | Preference | Habit | Risk | Achievement' },
              { name: 'memory_content', type: 'TEXT', desc: 'Natural language conceptual detail statement' },
              { name: 'importance_score', type: 'INTEGER', desc: 'Priority pruning weight system (1-10)' },
              { name: 'created_at', type: 'TIMESTAMP', desc: 'Ingestion memory epoch moment' },
              { name: 'updated_at', type: 'TIMESTAMP', desc: 'Latest corrected details moments' }
            ],
            sql: `CREATE TABLE ai_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  memory_type VARCHAR(50) CHECK (memory_type IN ('Behavior', 'Goal', 'Preference', 'Habit', 'Risk', 'Achievement')),
  memory_content TEXT NOT NULL,
  importance_score INTEGER CHECK (importance_score BETWEEN 1 AND 10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
          }
        }
      }
    ];
  }, []);

  // Compute live simulated database rows based on active standard Transactions and state
  const liveRows = useMemo(() => {
    // Standard User static uuid
    const dummyUserId = '00000000-0000-4000-8000-000000000001';
    
    // Live Users table
    const users = [
      {
        id: dummyUserId,
        auth_user_id: 'oauth|pickky_kotchakorn',
        email: profile.email,
        display_name: profile.name,
        avatar_url: profile.avatarUrl,
        timezone: 'Asia/Bangkok (UTC+7)',
        language: lang,
        currency_primary: 'USD ($)',
        currency_secondary: 'THB (฿)',
        created_at: '2026-06-01 09:00:00'
      }
    ];

    // Live preferences table
    const user_preferences = [
      {
        user_id: dummyUserId,
        theme: 'dark',
        dashboard_layout: 'bento-fbis-centric',
        quick_add_mode: false,
        notification_preferences: { email: true, alerts: true, telegram: false },
        ai_personality: 'Direct (Stoic Master)',
        coaching_style: 'Behavioral-Pattern-Focused'
      }
    ];

    // Live workspaces table
    const workMap: Record<string, string> = {
      'Personal': 'w_pers_01',
      'Business': 'w_bus_02',
      'Side Hustle': 'w_side_03',
      'Family': 'w_fam_04',
      'Travel': 'w_trav_05',
      'Investment': 'w_inv_06'
    };

    const workspaces = Object.entries(workMap).map(([name, id]) => ({
      id,
      user_id: dummyUserId,
      name,
      type: name
    }));

    // Live accounts table
    const accounts = [
      { id: 'acc_cash_01', workspace_id: 'w_pers_01', name: 'Cash Pocket', account_type: 'Cash', currency: 'USD', initial_balance: 500.00, current_balance: 240.21 },
      { id: 'acc_vault_02', workspace_id: 'w_pers_01', name: 'Sovereign Bank Vault', account_type: 'Bank', currency: 'USD', initial_balance: 200000.00, current_balance: profile.balance },
      { id: 'acc_broker_03', workspace_id: 'w_inv_06', name: 'Alpaca Automated Portfolio', account_type: 'Investment', currency: 'USD', initial_balance: 4000.00, current_balance: profile.portfolioValue }
    ];

    // Live categories table
    const categoriesList = [
      { id: 'cat_tech', user_id: dummyUserId, parent_id: null, name: 'Technology', icon: 'Laptop', color: '#C7FF2E', category_type: 'Expense' },
      { id: 'cat_transport', user_id: dummyUserId, parent_id: null, name: 'Transportation', icon: 'Car', color: '#38BDF8', category_type: 'Expense' },
      { id: 'cat_social', user_id: dummyUserId, parent_id: null, name: 'Socializing', icon: 'Users', color: '#818CF8', category_type: 'Expense' },
      { id: 'cat_dining', user_id: dummyUserId, parent_id: null, name: 'Dining', icon: 'Coffee', color: '#FB923C', category_type: 'Expense' },
      { id: 'cat_health', user_id: dummyUserId, parent_id: null, name: 'Health', icon: 'Heart', color: '#F87171', category_type: 'Expense' },
      { id: 'cat_rev', user_id: dummyUserId, parent_id: null, name: 'Inbound Revenue', icon: 'Coins', color: '#34D399', category_type: 'Income' }
    ];

    // Map categories mapping name -> id
    const getCatIdByName = (name: string) => {
      const found = categoriesList.find(c => c.name.toLowerCase() === name.toLowerCase());
      return found ? found.id : 'cat_misc';
    };

    // Live transactions table
    const mappedTransactions = transactions.map((t, idx) => {
      const isOut = t.amount < 0;
      return {
        id: `db_tx_${t.id || idx}`,
        workspace_id: workMap[t.workspace as string] || 'w_pers_01',
        account_id: isOut ? 'acc_vault_02' : 'acc_cash_01',
        category_id: getCatIdByName(t.category),
        transaction_type: isOut ? 'Expense' : 'Income',
        amount: Math.abs(t.amount),
        currency: 'USD',
        description: t.merchant,
        note: t.why ? `User conscious feedback: ${t.why}` : null,
        transaction_date: t.date || '2026-06-07',
        created_at: `${t.date || '2026-06-07'} 12:45:00`,
        updated_at: `${t.date || '2026-06-07'} 12:45:00`
      };
    });

    // Layer 3 Behavioral Tables mapped directly from active state!
    const transaction_contexts = transactions.map((t, idx) => ({
      transaction_id: `db_tx_${t.id || idx}`,
      day_of_week: t.dayOfWeek || 'Sunday',
      hour_of_day: t.timeOfDay === 'Midnight' ? 23 : (t.timeOfDay === 'Evening' ? 19 : (t.timeOfDay === 'Afternoon' ? 14 : 9)),
      time_period: t.timeOfDay || 'Morning',
      location: t.location || 'Bangkok, TH',
      device_type: 'iOS 19.4 Core',
      goal_id: t.goalAssociation ? 'goal_health_101' : null
    }));

    const transaction_emotions = transactions.map((t, idx) => {
      let emo: any = t.emotion || 'Neutral';
      if (emo === 'Stressed') emo = 'Stress';
      if (emo === 'Rewarding') emo = 'Reward';
      return {
        transaction_id: `db_tx_${t.id || idx}`,
        emotion_type: emo as any,
        confidence_score: t.emotion === 'Impulse' ? 0.94 : 0.85,
        source: 'User Selected'
      };
    });

    const transaction_behavior_signals = transactions.map((t, idx) => ({
      transaction_id: `db_tx_${t.id || idx}`,
      behavior_type: t.behavioralCategory || (t.emotion === 'Impulse' ? 'Impulse' : (t.emotion === 'Stress' ? 'Emotional' : 'Essential')),
      confidence_score: t.riskScore ? Number((t.riskScore / 100).toFixed(2)) : 0.90,
      ai_reason: t.behaviorImpact || `Calculated spending driven by ${t.emotion} triggers targeting ${t.merchant}.`
    }));

    const transaction_intents = transactions.map((t, idx) => ({
      transaction_id: `db_tx_${t.id || idx}`,
      intent_type: t.intent || (t.emotion === 'Impulse' ? 'Want' : 'Need'),
      confidence_score: 0.95
    }));

    // Layer 4 Goal tables
    const goals = [
      { id: 'goal_health_101', user_id: dummyUserId, title: 'Gym Habit Resilience', target_amount: 1000.00, current_amount: 540.00, deadline: '2026-12-31', priority: 'High', status: 'Active' },
      { id: 'goal_tech_102', user_id: dummyUserId, title: 'Autonomous Laptop Renewal', target_amount: 1500.00, current_amount: 1299.00, deadline: '2026-09-15', priority: 'Medium', status: 'Active' },
      { id: 'goal_buffer_103', user_id: dummyUserId, title: 'Sovereign Emergency Reserve (6mo)', target_amount: 30000.00, current_amount: 25000.00, deadline: '2027-06-01', priority: 'High', status: 'Active' }
    ];

    const goal_contributions = [
      { id: 'gc_01', goal_id: 'goal_tech_102', transaction_id: 'db_tx_tx_1', amount: 1299.00, created_at: '2026-06-06 14:02:11' },
      { id: 'gc_02', goal_id: 'goal_health_101', transaction_id: 'db_tx_tx_5', amount: 80.00, created_at: '2026-06-01 08:30:15' }
    ];

    // Layer 5 Subscriptions
    const subscriptions = [
      { id: 'sub_01', user_id: dummyUserId, name: 'Spotify Premium Family', amount: 18.50, billing_cycle: 'Monthly', next_billing_date: '2026-06-25', category_id: 'cat_dining', status: 'Active' },
      { id: 'sub_02', user_id: dummyUserId, name: 'OpenAI API Overdraft Retainer', amount: 120.00, billing_cycle: 'Monthly', next_billing_date: '2026-06-18', category_id: 'cat_tech', status: 'Active' },
      { id: 'sub_03', user_id: dummyUserId, name: 'Active Gym Core Membership', amount: 80.00, billing_cycle: 'Monthly', next_billing_date: '2026-07-01', category_id: 'cat_health', status: 'Active' }
    ];

    // Layer 6 Budgets
    const budgets = [
      { id: 'bud_01', user_id: dummyUserId, category_id: 'cat_dining', budget_amount: 200.00, period_type: 'Monthly', warning_threshold: 0.85 },
      { id: 'bud_02', user_id: dummyUserId, category_id: 'cat_transport', budget_amount: 150.00, period_type: 'Monthly', warning_threshold: 0.80 },
      { id: 'bud_03', user_id: dummyUserId, category_id: 'cat_tech', budget_amount: 2000.00, period_type: 'Monthly', warning_threshold: 0.90 }
    ];

    // Layer 7 AI
    const ai_insights = [
      {
        id: 'ins_01',
        user_id: dummyUserId,
        insight_type: 'Behavior',
        title: 'Impulse Control Loop Resilience',
        description: 'Your Wednesday Stress shopping triggers dropped by 34% after implementing the 48-hour Cooling Lock guard.',
        priority: 'High',
        status: 'Active',
        generated_at: '2026-06-07 04:12:00'
      },
      {
        id: 'ins_02',
        user_id: dummyUserId,
        insight_type: 'Risk',
        title: 'Extenuating Midnight Spending Risk Detected',
        description: 'Unplanned mechanical keyboard acquisitions mapped perfectly to cognitive exhaustion states after midnight work logs.',
        priority: 'Critical',
        status: 'Active',
        generated_at: '2026-06-06 23:45:10'
      }
    ];

    const ai_recommendations = [
      { id: 'rec_01', user_id: dummyUserId, recommendation_type: 'Friction Adding', title: 'Lock Midnight Shopping Nodes', description: 'Schedule an automatic routing block for e-commerce checkouts past 11:30 PM.', action_required: true, priority: 'High', generated_at: '2026-06-07 05:00:00' },
      { id: 'rec_02', user_id: dummyUserId, recommendation_type: 'Goal Acceleration', title: 'Sweep Excess Balance to Reserve', description: 'Your Business workspace has $14,500 surplus. Redirect $2,500 safely to Emergency Reserve Goal.', action_required: false, priority: 'Medium', generated_at: '2026-06-07 07:11:15' }
    ];

    // Layer 8 Money Twin profiles & traits
    const money_twin_profiles = [
      {
        user_id: dummyUserId,
        behavior_score: Number((96 - (transactions.filter(t => t.emotion === 'Impulse').length * 8) - (transactions.filter(t => t.emotion === 'Stress').length * 5)).toFixed(2)),
        risk_score: Number(((transactions.filter(t => t.emotion === 'Impulse').length / Math.max(1, transactions.length)) * 100).toFixed(2)),
        discipline_score: Number((100 - (transactions.filter(t => t.emotion === 'Impulse').length * 10)).toFixed(2)),
        goal_score: 87.20,
        consistency_score: 95.00,
        growth_score: 92.50,
        last_updated: '2026-06-07 08:00:00'
      }
    ];

    const money_twin_traits = [
      { id: 'trait_01', user_id: dummyUserId, trait_name: 'Impulse Protector', trait_value: 'Strong immediate response with cooling rules, but vulnerable in late night hours.', confidence_score: 0.94 },
      { id: 'trait_02', user_id: dummyUserId, trait_name: 'Strategic Planner', trait_value: 'Allocates high proportion to productivity investments like dev hardware.', confidence_score: 0.88 },
      { id: 'trait_03', user_id: dummyUserId, trait_name: 'Energy-ROI Maximizer', trait_value: 'Re-allocates money into health and relationship bonds consciously.', confidence_score: 0.91 }
    ];

    // Layer 9 Transformation
    const behavior_scores = [
      { user_id: dummyUserId, date: '2026-06-07', score: 92, reason: 'Zero impulse events recorded today, active self-audit.' },
      { user_id: dummyUserId, date: '2026-06-06', score: 84, reason: 'High-value developer laptop calculated purchase.' },
      { user_id: dummyUserId, date: '2026-06-05', score: 78, reason: 'Uber late-night coping escape logged under heavy strain.' },
      { user_id: dummyUserId, date: '2026-06-04', score: 96, reason: 'Highly aligned friend dinner spending logged.' }
    ];

    const achievements = [
      { id: 'ach_01', name: 'Emotional Shield Matrix', description: 'Logged 5 consecutive transactions without a stress or impulse flag.', xp_reward: 500, badge: 'Shield' },
      { id: 'ach_02', name: 'Sovereign Sovereign Mindset', description: 'Constructed an intentional purchase with custom feedback explanations.', xp_reward: 350, badge: 'Crown' },
      { id: 'ach_03', name: 'Cooling Lock Architect', description: 'Configured and triggered the 48-hour impulse delay autopilot successfully.', xp_reward: 200, badge: 'Snowflake' }
    ];

    const user_achievements = [
      { id: 'ua_01', user_id: dummyUserId, achievement_id: 'ach_02', earned_at: '2026-06-06 14:02:11' },
      { id: 'ua_02', user_id: dummyUserId, achievement_id: 'ach_03', earned_at: '2026-06-07 01:21:05' }
    ];

    const streaks = [
      { user_id: dummyUserId, streak_type: 'Conscious Daily Auditing', current_streak: 8, best_streak: 15, updated_at: '2026-06-07 08:15:00' },
      { user_id: dummyUserId, streak_type: 'Impulse Containment Cadence', current_streak: 3, best_streak: 11, updated_at: '2026-06-07 08:15:00' }
    ];

    // Layer 10 Dashboard configuration
    const dashboard_widgets = [
      { id: 'wd_01', widget_name: 'Behavior Score Ring', widget_type: 'Visual Gauge', availability_plan: 'Core' },
      { id: 'wd_02', widget_name: 'Emotional Outflows Ledger', widget_type: 'Structured Table', availability_plan: 'Core' },
      { id: 'wd_03', widget_name: 'Autopilot Behavioral Lock', widget_type: 'Interactive Toggle', availability_plan: 'Premium OS' },
      { id: 'wd_04', widget_name: 'Money Twin AI Radar Matrix', widget_type: 'Charts Radar', availability_plan: 'Premium OS' }
    ];

    const user_dashboard_layouts = [
      { user_id: dummyUserId, widget_id: 'wd_01', position: 1, is_visible: true, custom_settings: { scale: 1.2 } },
      { user_id: dummyUserId, widget_id: 'wd_02', position: 2, is_visible: true, custom_settings: { maxRows: 5 } },
      { user_id: dummyUserId, widget_id: 'wd_03', position: 3, is_visible: true, custom_settings: { allowOverride: false } },
      { user_id: dummyUserId, widget_id: 'wd_04', position: 4, is_visible: profile.plan === 'elite', custom_settings: { mode: 'radar' } }
    ];

    // Layer 11 AI Memories
    const ai_memories = [
      { id: 'mem_01', user_id: dummyUserId, memory_type: 'Habit', memory_content: 'Jonathan tends to log impulse purchases on Wednesday afternoons, usually driven by mid-week professional fatigue.', importance_score: 8, created_at: '2026-06-03 18:00:00', updated_at: '2026-06-03 18:00:00' },
      { id: 'mem_02', user_id: dummyUserId, memory_type: 'Goal', memory_content: 'Highly focused on securing tech devs hardware and gym memberships; these are consciously categorised as growth investments.', importance_score: 9, created_at: '2026-06-06 14:15:00', updated_at: '2026-06-07 08:00:00' },
      { id: 'mem_03', user_id: dummyUserId, memory_type: 'Preference', memory_content: 'Prefers an Assertive and Stoic coaching personality style to actively prune out minor consumerism.', importance_score: 7, created_at: '2026-06-02 10:00:00', updated_at: '2026-06-02 10:00:00' }
    ];

    return {
      users,
      user_preferences,
      workspaces,
      accounts,
      categories: categoriesList,
      transactions: mappedTransactions,
      transaction_contexts,
      transaction_emotions,
      transaction_behavior_signals,
      transaction_intents,
      goals,
      goal_contributions,
      subscriptions,
      budgets,
      ai_insights,
      ai_recommendations,
      money_twin_profiles,
      money_twin_traits,
      behavior_scores,
      achievements,
      user_achievements,
      streaks,
      dashboard_widgets,
      user_dashboard_layouts,
      ai_memories
    };
  }, [transactions, profile, lang]);

  // Handler to pick a layer's table and set it
  const handleLayerSelect = (layerId: number) => {
    setSelectedLayer(layerId);
    const layer = schemaOutline.find(l => l.id === layerId);
    if (layer && Object.keys(layer.tables).length > 0) {
      setSelectedTable(Object.keys(layer.tables)[0]);
    }
  };

  // Safe columns and rows extraction
  const currentTableSchema = (schemaOutline.find(l => l.id === selectedLayer)?.tables as any)?.[selectedTable];
  const tableDataRows = (liveRows as any)[selectedTable] || [];

  // Founder rule variables for visual response panel
  const founderRuleInsights = useMemo(() => {
    // 1. Improving or regressing
    const profileTwin = liveRows.money_twin_profiles?.[0] ?? { behavior_score: 0 };
    const streakData = liveRows.streaks;
    const activeRiskInfo = liveRows.ai_insights.find((i: any) => i.insight_type === 'Risk');
    const goalsList = liveRows.goals;
    const currentMemory = liveRows.ai_memories;

    return {
      progress: {
        score: profileTwin.behavior_score,
        status: profileTwin.behavior_score >= 80 ? 'Improving (Resilient)' : 'Regressing (Fatiguer)',
        statusTh: profileTwin.behavior_score >= 80 ? 'กำลังพัฒนาอย่างเหนือสติ (Resilient)' : 'มีอัตราถดถอยจากความล้าสะสม',
        trendText: 'Sovereign behavioral scores show positive recovery with streak milestones active.',
        trendTextTh: 'สถิติการใช้งานแสดงคะแนนคงเส้นคงวาในระดับดี การหลบเลี่ยงอารมณ์วันพุธลดน้อยลง',
        streakDesc: `${streakData[0]?.current_streak ?? 0} days continuous self auditing. Last records were +8 xp.`,
        streakDescTh: `รักษาแคลคูลัสสตรีค ${streakData[0]?.current_streak ?? 0} วันติดต่อกัน เพิ่มศักยภาพด้านเหตุผลอย่างสม่ำเสมอ`,
        details: [
          { label: 'Discipline Quotient', val: `${profileTwin.discipline_score}/100`, status: 'Strong' },
          { label: 'Consistency Record', val: `${profileTwin.consistency_score}/100`, status: 'Excellent' },
          { label: 'Growth Acceleration', val: `${profileTwin.growth_score}/100`, status: 'Optimum' }
        ]
      },
      behaviors: {
        totalTx: transactions.length,
        impulseRatio: ((transactions.filter(t => t.emotion === 'Impulse').length / Math.max(1, transactions.length)) * 100).toFixed(0),
        wantVsNeedRatio: '14% Wants / 86% Core Needs based on behavioral intent mappings.',
        wantVsNeedRatioTh: 'ตามดัชนีกำหนด ความต้องการชั่วครู่ (Want) อยู่ที่ 14% ส่วนปัจจัยพื้นฐาน (Need) อยู่ที่ 86%',
        shiftDescription: 'Strategic hardware updates (Growth category) hold supreme capital outlays over immediate dopamine items.',
        shiftDescriptionTh: 'พฤติกรรมการจ่ายย้ายไปค้ำจุนกลุ่มไอทีพัฒนาทักษะ (Growth) แทนกลุ่มของทานบรรเทาอารมณ์บ่อยครั้ง',
        signalsSummary: [
          { type: 'Essential Needs', ratio: '60% outlays', desc: 'Sustained base support' },
          { type: 'Growth Investment', ratio: '25% outlays', desc: 'Dev gear, Gym resilience, lifelong ROI' },
          { type: 'Impulse / Dopamine', ratio: '15% outlays', desc: 'Unplanned mechanical keyboards, coffee escapes' }
        ]
      },
      risks: {
        criticalThreat: activeRiskInfo?.title || 'No Threat',
        threatDetails: activeRiskInfo?.description || 'Your cooling rules and stoic memory structures are active.',
        vulnerabilityNode: 'Midnight Fatigue Syndrome past 11:30 PM.',
        vulnerabilityNodeTh: 'ช่วงอารมณ์เหน็ดเหนื่อยยามวิกาล (หลัง 23:30 น.) คือช่องโหว่ความเครียดผลักดันสูงสุด',
        mitigationStatus: 'Cooling Lock Autopilot is active for side hustle workspace.',
        mitigationStatusTh: 'เปิดใช้เกราะชะลอการสั่งซื้อ 48 ชั่วโมงสำหรับกลุ่มการใช้จ่าย Side Hustle แล้ว',
        riskFactors: [
          { factor: 'Extended Overtime Hours', risk: 'Stress purchases', index: 'High' },
          { factor: 'Late Night Entertainment', risk: 'Severe FOMO triggers', index: 'Medium' },
          { factor: 'Mid-week Wednesday Slump', risk: 'Micro-dopamine shopping leak', index: 'Low' }
        ]
      },
      goals: {
        activeCount: goalsList.length,
        proximityRate: '83% overall milestone approach speed.',
        overallSavingsCompound: `$${liveRows.goal_contributions.reduce((s, c) => s + Number(c.amount), 0).toLocaleString()} transferred dynamically via behavior contributions.`,
        overallSavingsCompoundTh: `สะสมเงินทุนผ่านการลบกระแสวู่วามมาเติมเป้าหมายแล้ว $${liveRows.goal_contributions.reduce((s, d) => s + Number(d.amount), 0).toLocaleString()}`,
        milestones: goalsList.map((g: any) => ({
          title: g.title,
          progress: `${Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100)}%`,
          completion: `${g.current_amount}/${g.target_amount} USD`,
          status: g.priority + ' Priority'
        }))
      },
      ai_next: {
        priorityRec: liveRows.ai_recommendations[0].title,
        recDesc: liveRows.ai_recommendations[0].description,
        memoryAnchor: currentMemory[0].memory_content,
        priorityAction: 'Engage "Late Night Shopping Shield API Lock" on premium account workspace.',
        priorityActionTh: 'ระบบเสนอให้ตั้งระบบกั้นการชำระเงินกับเครือห้างหุ้นส่วนช่วงหลังเวลา 23:30น.',
        rationalityReason: 'Preventing midnight keyboard dopamine spikes will save $440.00 this quarter, accelerating emergency net reserves.',
        rationalityReasonTh: 'การปิดกั้นธุรกรรมช่วงเผลอไผลยามวิกาล คาดว่าจะช่วยเก็บรักษาทุนสำรองได้ดีขึ้น $440.00 ต่อไตรมาส'
      }
    };
  }, [liveRows, transactions]);

  return (
    <div id="database-model-viewport" className="space-y-6 md:space-y-8 animate-slide-up text-left">
      
      {/* Dynamic Header Badge Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9.5px] font-mono font-bold uppercase tracking-widest bg-[#C7FF2E]/10 border-[#C7FF2E]/30 text-[#C7FF2E]">
            <Layers className="w-3.5 h-3.5" />
            <span>Behavioral Intelligence Schema V5.1 Engaged</span>
          </div>
          <h2 className="font-display font-black text-2xl uppercase text-white tracking-tight pt-1">
            {lang === 'en' ? 'Sovereign DB Terminal' : 'คอนโซลคลังสติระดับ 5.1'}
          </h2>
          <p className="text-[11px] text-zinc-500 font-sans max-w-xl leading-relaxed">
            {lang === 'en' 
               ? 'DailyStack stores emotional payloads, catalyst contexts, and biometric intent tags rather than raw static transactions. Explore the live PostgreSQL schema mapping below.' 
               : 'บอร์ดวิเคราะห์สถาปัตยกรรมข้อมูล DailyStack ไม่ใช่แอปบัญชีทั่วไป แต่เก็บอารมณ์ โครงสร้างอิทธิพลยามซื้อ และเกณฑ์สติจำลองเป็นคีย์หลัก'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-[#121315] border border-zinc-800 px-3 py-2 rounded-xl text-center">
            <span className="block font-mono text-[9px] text-zinc-500 uppercase">Interactive Layers</span>
            <span className="font-display font-bold text-sm text-[#C7FF2E]">11 Relational Spaces</span>
          </div>
          <div className="bg-[#121315] border border-zinc-800 px-3 py-2 rounded-xl text-center">
            <span className="block font-mono text-[9px] text-zinc-500 uppercase">Live DB Records</span>
            <span className="font-display font-bold text-sm text-emerald-400">
              {Object.values(liveRows).reduce((acc, current) => acc + current.length, 0)} Rows
            </span>
          </div>
        </div>
      </div>

      {/* CORE SPECIFICATIONS - THE 5 FOUNDER RULES BLOCK */}
      <div id="founder-rule-analyzer-box" className="p-6 rounded-[32px] border bg-zinc-950 border-[#C7FF2E]/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-bl-[150px] bg-gradient-to-br from-[#C7FF2E]/5 to-transparent pointer-events-none" />
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="font-mono text-[9px] font-black tracking-widest text-[#C7FF2E] uppercase flex items-center gap-1">
                <BrainCircuit className="w-4 h-4 text-[#C7FF2E] animate-pulse" />
                FOUNDER RULE CORE PROMPT
              </span>
              <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-tight">
                {lang === 'en' ? 'Sovereign Behavioral Diagnostic Engine' : 'คลังปัญญาตรวจสภาพมนุษย์ผ่านธุรกรรม'}
              </h3>
            </div>
            
            <p className="font-mono text-[9px] text-zinc-500 bg-zinc-900 border border-zinc-850 px-3 py-1 rounded-full uppercase self-start sm:self-center">
              RULE: UNDERSTAND HUMAN BEHAVIOR
            </p>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed font-sans max-w-2xl italic">
            &ldquo;{lang === 'en' 
              ? 'Never ask merely: How much did the user spend? Our engine must answer: Is the user improving or regressing? How are behaviors shifting? Where is the risk node? Are goals proximate? What is the AIs prioritized help segment?'
              : 'ห้ามถามเพียงว่า ผู้ใช้ใช้เงินไปเท่าไร แต่ต้องสามารถตอบได้ว่า: ผู้ใช้กำลังพัฒนาหรือถดถอย? พฤติกรรมเริ่มเปลี่ยนไปอย่างไร? จุดเปราะบางหรือความเสี่ยงอยู่ตรงไหน? เป้าหมายเข้าใกล้ขึ้นหรือห่างออกไป? และ AI ควรช่วยปกป้องอะไรในขั้นถัดไป'}&rdquo;
          </p>

          {/* Quick Query Selector Switches */}
          <div className="flex flex-wrap gap-1.5 pt-2" id="founder-tab-bar">
            {[
              { id: 'progress', label: lang === 'en' ? 'Resilient / Regress Map' : 'สภาวะพัฒนา/ถดถอย', icon: TrendingUp },
              { id: 'behaviors', label: lang === 'en' ? 'Behavioral Shifts' : 'คลื่นพฤติกรรมปรับเปลี่ยน', icon: Sliders },
              { id: 'risks', label: lang === 'en' ? 'Critical Vulnerability' : 'ดัชนีความเสี่ยงสูงสุด', icon: AlertTriangle },
              { id: 'goals', label: lang === 'en' ? 'Goal Proximity' : 'การคืบเข้าใกล้เป้าหมาย', icon: Compass },
              { id: 'ai_next', label: lang === 'en' ? 'AI Prioritized Task' : 'ลำดับถัดไปของ AI', icon: Sparkles }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  id={`btn-founder-${tab.id}`}
                  key={tab.id}
                  onClick={() => setFounderQuery(tab.id)}
                  className={`px-3 py-2 text-[10px] sm:text-xs font-mono rounded-xl border tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    founderQuery === tab.id 
                      ? 'bg-[#C7FF2E] text-black border-[#C7FF2E] font-extrabold' 
                      : 'bg-[#121315] border-zinc-850 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Live Compiled Result Panel representing database intelligence queries */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-850 space-y-4" id="query-result-panel">
            
            {founderQuery === 'progress' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id="resilient-results">
                <div className="md:col-span-4 space-y-1 bg-black/40 p-4 rounded-xl border border-zinc-850">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase block">Active Metric Status</span>
                  <span className="text-xl font-display font-black text-[#C7FF2E] block uppercase">
                    {lang === 'en' ? founderRuleInsights.progress.status : founderRuleInsights.progress.statusTh}
                  </span>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="font-mono text-xs text-zinc-200">Behavioral Index:</span>
                    <span className="font-mono text-sm font-black text-emerald-400">{founderRuleInsights.progress.score}/100</span>
                  </div>
                </div>

                <div className="md:col-span-8 space-y-3">
                  <div className="text-left">
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      {lang === 'en' ? founderRuleInsights.progress.trendText : founderRuleInsights.progress.trendTextTh}
                    </p>
                    <p className="text-[10px] font-mono text-[#C7FF2E] mt-1 font-semibold">
                      {lang === 'en' ? founderRuleInsights.progress.streakDesc : founderRuleInsights.progress.streakDescTh}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {founderRuleInsights.progress.details.map((m, i) => (
                      <div key={i} className="bg-zinc-950 p-2.5 rounded-lg text-center border border-zinc-850/60">
                        <span className="block text-[8px] font-mono text-zinc-500 uppercase">{m.label}</span>
                        <span className="block text-xs font-mono font-bold text-white mt-0.5">{m.val}</span>
                        <span className="text-[8px] font-mono text-emerald-500 uppercase block">{m.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {founderQuery === 'behaviors' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id="behavioral-results">
                <div className="md:col-span-4 space-y-1 bg-black/40 p-4 rounded-xl border border-zinc-850">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase block">Total Monitored Events</span>
                  <span className="text-xl font-display font-black text-blue-400 block uppercase">
                    {founderRuleInsights.behaviors.totalTx} transactions
                  </span>
                  <p className="text-[10px] text-zinc-400 font-mono pt-1">
                    Impulse to standard spending ratio is <span className="text-amber-400 font-bold">{founderRuleInsights.behaviors.impulseRatio}%</span>
                  </p>
                </div>

                <div className="md:col-span-8 space-y-3 text-left">
                  <p className="text-xs text-zinc-300">
                    {lang === 'en' ? founderRuleInsights.behaviors.wantVsNeedRatio : founderRuleInsights.behaviors.wantVsNeedRatioTh}
                  </p>
                  <p className="text-xs text-[#C7FF2E] font-semibold">
                    {lang === 'en' ? founderRuleInsights.behaviors.shiftDescription : founderRuleInsights.behaviors.shiftDescriptionTh}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {founderRuleInsights.behaviors.signalsSummary.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-900">
                        <span className="font-mono text-zinc-300 block">{s.type}</span>
                        <span className="font-mono text-[#C7FF2E] font-black">{s.ratio}</span>
                        <span className="text-zinc-500 text-[10px] font-sans block">{s.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {founderQuery === 'risks' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id="risk-results">
                <div className="md:col-span-4 space-y-1 bg-black/40 p-4 rounded-xl border border-red-950/40 text-left">
                  <span className="font-mono text-[9px] text-rose-500 uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Vulnerability Vector
                  </span>
                  <span className="text-sm font-display font-bold text-white block uppercase">
                    {founderRuleInsights.risks.criticalThreat}
                  </span>
                  <p className="text-[10px] text-zinc-400 leading-tight pt-1">
                    {founderRuleInsights.risks.threatDetails}
                  </p>
                </div>

                <div className="md:col-span-8 space-y-3 text-left">
                  <div className="p-3 bg-red-900/10 border border-red-500/15 rounded-xl">
                    <span className="block font-mono text-[9px] text-red-400 uppercase font-black">AI Stress Trigger Mapping Flag</span>
                    <p className="text-xs text-zinc-200 mt-1">
                      {lang === 'en' ? founderRuleInsights.risks.vulnerabilityNode : founderRuleInsights.risks.vulnerabilityNodeTh}
                    </p>
                  </div>
                  <p className="text-xs text-emerald-400 font-mono">
                    ✅ {lang === 'en' ? founderRuleInsights.risks.mitigationStatus : founderRuleInsights.risks.mitigationStatusTh}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-[10px] pt-1">
                    {founderRuleInsights.risks.riskFactors.map((r, i) => (
                      <div key={i} className="bg-zinc-950 p-2 rounded-lg border border-zinc-900">
                        <span className="block text-[8px] text-zinc-500 font-mono truncate uppercase">{r.factor}</span>
                        <span className="block text-zinc-300 truncate mt-0.5">{r.risk}</span>
                        <span className="block text-[9px] text-amber-500 font-mono font-bold mt-1 uppercase">{r.index} RISK</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {founderQuery === 'goals' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id="goals-results">
                <div className="md:col-span-4 space-y-1 bg-black/40 p-4 rounded-xl border border-zinc-850 text-left">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase block">Active Milestones Tracked</span>
                  <span className="text-xl font-display font-black text-[#C7FF2E] block uppercase">
                    {founderRuleInsights.goals.activeCount} GOAL OBJECTIVES
                  </span>
                  <p className="text-[10px] text-[#C7FF2E] font-mono font-bold pt-1">
                    {founderRuleInsights.goals.proximityRate}
                  </p>
                </div>

                <div className="md:col-span-8 space-y-3 text-left">
                  <p className="text-xs text-zinc-300">
                    {lang === 'en' ? founderRuleInsights.goals.overallSavingsCompound : founderRuleInsights.goals.overallSavingsCompoundTh}
                  </p>

                  <div className="space-y-1.5">
                    {founderRuleInsights.goals.milestones.map((m, i) => (
                      <div key={i} className="bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-900 space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-white font-bold">{m.title}</span>
                          <span className="text-[#C7FF2E] font-black">{m.progress}</span>
                        </div>
                        <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                          <span>{m.completion}</span>
                          <span>{m.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {founderQuery === 'ai_next' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id="ai-next-results">
                <div className="md:col-span-4 space-y-1.5 bg-black/40 p-4 rounded-xl border border-zinc-850 text-left">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase block">Core Priority Action Target</span>
                  <p className="text-xs font-display font-bold text-[#C7FF2E] leading-tight block">
                    {lang === 'en' ? founderRuleInsights.ai_next.priorityAction : founderRuleInsights.ai_next.priorityActionTh}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-sans">
                    Reasoning: {lang === 'en' ? founderRuleInsights.ai_next.rationalityReason : founderRuleInsights.ai_next.rationalityReasonTh}
                  </p>
                </div>

                <div className="md:col-span-8 space-y-3 text-left">
                  <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl">
                    <span className="font-mono text-[9px] text-[#C7FF2E] uppercase font-black">AI Recommendations Trigger</span>
                    <p className="text-xs text-zinc-100 font-bold mt-1">
                      {founderRuleInsights.ai_next.priorityRec}
                    </p>
                    <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                      {founderRuleInsights.ai_next.recDesc}
                    </p>
                  </div>

                  <div className="p-3 bg-[#1C1D20]/50 border border-zinc-850 rounded-xl flex items-start gap-2 text-xs">
                    <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-mono text-[8.5px] text-zinc-500 uppercase">AI Persistent Long-Term Memory Extract</span>
                      <p className="text-zinc-300 italic font-sans mt-1">
                        &ldquo;{founderRuleInsights.ai_next.memoryAnchor}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* SCHEMA EXPLORER TERMINAL SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="schema-grid-container">
        
        {/* Left Column: 11 Layers & table selectors */}
        <div className="lg:col-span-4 space-y-4" id="schema-layer-menu">
          <div className="p-4 rounded-3xl bg-zinc-950 border border-zinc-850 space-y-3">
            <h3 className="font-display font-extrabold text-sm text-zinc-300 uppercase tracking-tight flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#C7FF2E]" />
              <span>11-Layer Database Sandbox</span>
            </h3>
            <p className="text-[10px] text-zinc-500">
              Select one of the layers derived from Version 5.1 architecture below to examine the tables, SQL statements, and dynamic sandbox states.
            </p>

            <div className="space-y-1 pt-1" id="layers-list-wrapper">
              {schemaOutline.map(layer => {
                const isActive = selectedLayer === layer.id;
                return (
                  <button
                    id={`btn-layer-group-${layer.id}`}
                    key={layer.id}
                    onClick={() => handleLayerSelect(layer.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isActive 
                        ? 'bg-[#1C1D20] border-[#C7FF2E]/30 text-white' 
                        : 'bg-transparent border-transparent hover:bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold ${
                      isActive ? 'bg-[#C7FF2E] text-black font-extrabold' : 'bg-zinc-900 text-zinc-500'
                    }`}>
                      {layer.id}
                    </span>
                    <div className="space-y-0.5">
                      <span className="block text-xs font-display font-black uppercase tracking-tight leading-none text-white">
                        {layer.name}
                      </span>
                      <span className="block text-[8px] font-mono text-zinc-500 tracking-wide leading-tight line-clamp-1">
                        {layer.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table select options inside currently selected layer */}
          <div className="p-4 rounded-3xl bg-zinc-950 border border-zinc-850 space-y-3">
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">Available Relational Tables</span>
            
            <div className="grid grid-cols-1 gap-1.5" id="tables-list-wrapper">
              {Object.keys(schemaOutline.find(l => l.id === selectedLayer)?.tables || {}).map(tableName => {
                const isSelected = selectedTable === tableName;
                return (
                  <button
                    id={`btn-table-select-${tableName}`}
                    key={tableName}
                    onClick={() => setSelectedTable(tableName)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border font-mono text-xs transition-all cursor-pointer flex items-center justify-between ${
                      isSelected 
                        ? 'bg-transparent border-emerald-500/40 text-[#C7FF2E]' 
                        : 'bg-zinc-900 text-zinc-400 border-zinc-950 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Table className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C7FF2E]' : 'text-zinc-500'}`} />
                      <span>{tableName}</span>
                    </div>
                    {isSelected && <span className="w-1.5 h-1.5 bg-[#C7FF2E] rounded-full animate-ping" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Schema description / Column list AND live interactive rows sandbox */}
        <div className="lg:col-span-8 flex flex-col gap-6" id="schema-viewer-panel">
          
          {/* Header layout of table selection */}
          <div className="p-6 rounded-[28px] bg-zinc-950 border border-zinc-850 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
              <div className="text-left space-y-0.5">
                <span className="font-mono text-[9px] text-[#C7FF2E] uppercase tracking-widest block">Core Table Properties</span>
                <h4 className="font-mono font-black text-white text-lg flex items-center gap-1.5 pt-1">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                  <span>public.{selectedTable}</span>
                </h4>
              </div>

              {/* Toggle layout specs SQL definition vs columns details */}
              <div className="flex border border-zinc-850 p-1 rounded-xl bg-zinc-900">
                <button
                  id="btn-toggle-sql-cols"
                  onClick={() => setShowSqlDef(false)}
                  className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${!showSqlDef ? 'bg-[#C7FF2E] text-black font-extrabold' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Columns
                </button>
                <button
                  id="btn-toggle-sql-def"
                  onClick={() => setShowSqlDef(true)}
                  className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${showSqlDef ? 'bg-[#C7FF2E] text-black font-extrabold' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  SQL DDL Schema
                </button>
              </div>
            </div>

            {/* Display information */}
            {showSqlDef ? (
              <div className="space-y-2 text-left">
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">POSTGRESQL DDL REPRESENTATION</span>
                <pre className="p-4 rounded-xl bg-black/50 border border-zinc-900 font-mono text-[10.5px] text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed text-left">
                  <code>{currentTableSchema?.sql}</code>
                </pre>
              </div>
            ) : (
              <div className="space-y-3" id="columns-matrix-table">
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">COLUMNS PROFILE REFERENCE</span>
                <div className="rounded-xl border border-zinc-900 overflow-hidden">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead>
                      <tr className="bg-zinc-900 border-b border-zinc-850 text-zinc-400">
                        <th className="p-2.5 font-bold">Column Name</th>
                        <th className="p-2.5 font-bold">Data Type</th>
                        <th className="p-2.5 font-bold">Objective Meaning</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900 text-zinc-300">
                      {currentTableSchema?.columns.map((c: any, i: number) => (
                        <tr key={i} className="hover:bg-zinc-900/40">
                          <td className="p-2.5 font-bold text-white">{c.name}</td>
                          <td className="p-2.5 text-zinc-400">{c.type}</td>
                          <td className="p-2.5 text-[10.5px] font-sans text-zinc-400">{c.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE LIVE RECORDS VIEWER - THE SANDBOX DATA ROW STREAMER */}
          <div className="p-6 rounded-[28px] bg-zinc-950 border border-zinc-850 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-widest block">
                    Active System Memory Stream
                  </span>
                  <h4 className="font-display font-extrabold text-base text-white uppercase tracking-tight">
                    Reactive Simulated Database Records
                  </h4>
                </div>
                <div className="p-1 px-2.5 rounded-full font-mono text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                  LIVE STREAMING
                </div>
              </div>
              <p className="text-[10px] text-zinc-500">
                These are the live row calculations in memory reflecting your actual logs on the Activity page. Adding dynamic transactions immediately updates foreign context logs.
              </p>
            </div>

            {/* Sandbox Database Table Grid rows viewer styled with clean terminal display */}
            <div className="border border-zinc-900 rounded-2xl overflow-hidden flex-1 overflow-x-auto min-h-[220px]" id="sandbox-database-scroller">
              {tableDataRows.length === 0 ? (
                <div className="p-12 text-center text-zinc-600 font-mono text-xs flex flex-col items-center justify-center h-full">
                  <Hourglass className="w-8 h-8 text-zinc-700 animate-spin pb-2" />
                  <span>Table public.{selectedTable} is currently empty. Initialize seed parameters above.</span>
                </div>
              ) : (
                <table className="w-full font-mono text-[10px] text-left">
                  <thead>
                    <tr className="bg-zinc-900 border-b border-zinc-850 text-zinc-500 uppercase tracking-widest text-[8px]">
                      {Object.keys(tableDataRows[0]).map(key => (
                        <th key={key} className="p-2">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-300">
                    {tableDataRows.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#1C1D20]/40 transition-colors">
                        {Object.values(row).map((val: any, cellIdx) => {
                          let text = '-';
                          if (val !== null && typeof val === 'object') {
                            text = JSON.stringify(val);
                          } else if (val !== undefined && val !== null) {
                            text = String(val);
                          }
                          return (
                            <td key={cellIdx} className="p-2 font-mono truncate max-w-[150px]" title={text}>
                              {typeof val === 'boolean' ? (val ? 'TRUE' : 'FALSE') : text}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Ingestion footprint message */}
            <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-[9px] font-mono text-zinc-600" id="sandbox-ingest">
              <span>SQL Transaction Ingestion protocol: Active</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Last payload synchronised successfully </span>
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
