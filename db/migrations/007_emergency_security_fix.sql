-- ============================================================
-- DailyStack Emergency Security Fix — Phase 1: Survival Mode
-- Run this FIRST before any deployment
-- ============================================================
-- WARNING: Backup production data before running!
-- Run in Supabase SQL Editor
-- ============================================================

BEGIN;

-- ============================================================
-- 1. ENABLE RLS ON ALL TABLES (5/6 tables are currently open!)
-- ============================================================

-- subscriptions — enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscriptions (per-user isolation)
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can delete own subscriptions" ON public.subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- user_events — enable RLS
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own events" ON public.user_events;
CREATE POLICY "Users can view own events" ON public.user_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own events" ON public.user_events;
CREATE POLICY "Users can insert own events" ON public.user_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- cancellation_progress — enable RLS
ALTER TABLE public.cancellation_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cancellation progress" ON public.cancellation_progress;
CREATE POLICY "Users can manage own cancellation progress" ON public.cancellation_progress
  FOR ALL USING (auth.uid() = user_id);

-- cancellation_documents — enable RLS
ALTER TABLE public.cancellation_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cancellation documents" ON public.cancellation_documents;
CREATE POLICY "Users can manage own cancellation documents" ON public.cancellation_documents
  FOR ALL USING (auth.uid() = user_id);

-- subscription_templates — enable RLS (public read)
ALTER TABLE public.subscription_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view subscription templates" ON public.subscription_templates;
CREATE POLICY "Anyone can view subscription templates" ON public.subscription_templates
  FOR SELECT USING (true);

-- ============================================================
-- 1b. FIX TABLE NAMING MISMATCH
-- Code uses 'user_subscriptions' but DB has 'subscriptions'
-- Quick fix: rename subscriptions to user_subscriptions
-- ============================================================

ALTER TABLE IF EXISTS public.subscriptions RENAME TO user_subscriptions;

-- Update indexes to match new table name
DROP INDEX IF EXISTS idx_subscriptions_user_id;
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);

-- ============================================================
-- 2. CREATE MISSING TABLES
-- ============================================================

-- user_profiles — referenced by authService.ts
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  email text,
  nickname text DEFAULT 'DailyStack Member',
  bio text,
  birthdate date,
  gender text,
  interested_in text,
  interest_tags text[],
  photos text[],
  lifestyle_preferences jsonb DEFAULT '{}',
  onboarding_preferences jsonb,
  onboarding_completed_at timestamptz,
  notifications_enabled boolean DEFAULT true,
  last_login_at timestamptz,
  profile_status text DEFAULT 'active',
  profile_completion_score integer,
  display_name text,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- user_credit_cards — referenced by rewardsService.ts
CREATE TABLE IF NOT EXISTS public.user_credit_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  card_name text NOT NULL,
  bank_name text,
  card_type text CHECK (card_type IN ('visa', 'mastercard', 'jcb', 'cash', 'other')),
  color_gradient text,
  last_four text,
  rules jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_credit_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own credit cards" ON public.user_credit_cards;
CREATE POLICY "Users can manage own credit cards" ON public.user_credit_cards
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_credit_cards_user_id ON public.user_credit_cards(user_id);

-- ============================================================
-- 3. ADD VALIDATION CONSTRAINTS
-- ============================================================

-- Add billing_day validation (1-31)
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS chk_billing_day;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT chk_billing_day
  CHECK (billing_day >= 1 AND billing_day <= 31 OR billing_day IS NULL);

-- Add positive amount validation
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS chk_positive_amount;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT chk_positive_amount
  CHECK (amount > 0);

-- ============================================================
-- 3. CREATE WALLET & TRANSACTION TABLES (for Dashboard)
-- ============================================================

-- user_wallets — stores user's bank accounts, cash, credit cards
CREATE TABLE IF NOT EXISTS public.user_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  wallet_type text NOT NULL CHECK (wallet_type IN ('cash', 'bank', 'credit_card')),
  balance numeric(12,2) DEFAULT 0,
  color_gradient text DEFAULT 'from-[#CCFF00] to-[#B9F72B]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own wallets" ON public.user_wallets;
CREATE POLICY "Users can manage own wallets" ON public.user_wallets
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON public.user_wallets(user_id);

-- user_transactions — stores manual transaction log entries
CREATE TABLE IF NOT EXISTS public.user_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  wallet_id uuid REFERENCES public.user_wallets(id) ON DELETE SET NULL,
  wallet_name text NOT NULL,
  category_name text NOT NULL,
  amount numeric(12,2) NOT NULL,
  notes text,
  transaction_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own transactions" ON public.user_transactions;
CREATE POLICY "Users can manage own transactions" ON public.user_transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON public.user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_wallet_id ON public.user_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_date ON public.user_transactions(transaction_date DESC);

COMMIT;

-- ============================================================
-- VERIFICATION QUERIES (run these to confirm)
-- ============================================================
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
