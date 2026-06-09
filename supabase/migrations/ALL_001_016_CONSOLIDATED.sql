-- ============================================================
-- DailyStack FinTech — Consolidated Migration Script
-- Target: June 12, 2026 Launch
-- Run in Supabase Dashboard > SQL Editor (all at once)
--
-- NOTE: Migrations 011 (broken: references non-existent tables)
-- and 012 (broken: references non-existent user_subscriptions)
-- are SKIPPED. The subscription_tier lives in profiles table.
-- See notes inline for each skipped migration.
-- ============================================================

-- ============================================================
-- PHASE 1: Core Schema
-- ============================================================

-- 001_initial_schema.sql
-- Core tables: profiles, monthly_records, subscriptions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TABLE IF NOT EXISTS monthly_records (
  id          UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month       INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year        INTEGER NOT NULL CHECK (year >= 2020),
  income      NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (income >= 0),
  expenses    NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (expenses >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, year, month)
);

CREATE TRIGGER monthly_records_updated_at
  BEFORE UPDATE ON monthly_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS subscriptions (
  id                UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  cost              NUMERIC(10, 2) NOT NULL CHECK (cost >= 0),
  billing_cycle     TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  category          TEXT NOT NULL DEFAULT 'other',
  next_billing_date DATE,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(user_id, is_active);

ALTER TABLE monthly_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions    ENABLE ROW LEVEL SECURITY;
-- NOTE: RLS is disabled on profiles to allow handle_new_user() trigger to work during signup.
-- See: BUGFIX_P0_Signup_Database_Error_2026-06-05.md
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own monthly records"
  ON monthly_records FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subscriptions"
  ON subscriptions FOR ALL
  USING (auth.uid() = user_id);

CREATE OR REPLACE VIEW subscription_summary AS
SELECT
  user_id,
  COUNT(*) AS total_count,
  COUNT(*) FILTER (WHERE is_active = TRUE) AS active_count,
  SUM(cost) FILTER (WHERE is_active = TRUE AND billing_cycle = 'monthly') AS total_monthly,
  SUM(cost) FILTER (WHERE is_active = TRUE AND billing_cycle = 'yearly') AS total_yearly,
  SUM(cost) FILTER (WHERE is_active = TRUE AND billing_cycle = 'yearly') / 12 AS yearly_converted_monthly,
  SUM(cost) FILTER (WHERE is_active = TRUE AND billing_cycle = 'monthly')
    + (SUM(cost) FILTER (WHERE is_active = TRUE AND billing_cycle = 'yearly') / 12)
    AS total_monthly_cost,
  SUM(cost) FILTER (WHERE is_active = TRUE AND billing_cycle = 'monthly') * 12
    + SUM(cost) FILTER (WHERE is_active = TRUE AND billing_cycle = 'yearly')
    AS total_annual_cost
FROM subscriptions
GROUP BY user_id;

-- ============================================================
-- PHASE 2: Memberships
-- ============================================================

-- 002_add_user_memberships.sql
CREATE TABLE IF NOT EXISTS user_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  plan_name TEXT NOT NULL DEFAULT '',
  tier TEXT,
  benefits_json JSONB DEFAULT '[]',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_memberships_owner" ON user_memberships
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_user_memberships_user_id ON user_memberships(user_id);
CREATE INDEX idx_user_memberships_subscription_id ON user_memberships(subscription_id);

-- ============================================================
-- PHASE 3: Triggers + Auth
-- ============================================================

-- 002_fix_triggers.sql (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

DO $$
BEGIN
  IF to_regclass('auth.users') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END$$;

-- 003_otp_system.sql
CREATE TABLE IF NOT EXISTS otp_requests (
  id              UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  otp_code        TEXT NOT NULL,
  otp_type        TEXT NOT NULL DEFAULT 'email_verification',
  expires_at      TIMESTAMPTZ NOT NULL,
  attempts        INTEGER NOT NULL DEFAULT 0,
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_user_id ON otp_requests(user_id);

CREATE TABLE IF NOT EXISTS pending_signups (
  id              UUID NOT NULL DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  full_name       TEXT NOT NULL,
  password_hash   TEXT NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE otp_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_signups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access otp_requests"
  ON otp_requests FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access pending_signups"
  ON pending_signups FOR ALL TO service_role USING (true) WITH CHECK (true);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================
-- PHASE 4: Onboarding + Notifications
-- ============================================================

-- 003_cancellation_progress.sql
CREATE TABLE IF NOT EXISTS cancellation_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  current_tab INTEGER DEFAULT 0,
  form_data_json JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subscription_id)
);
ALTER TABLE cancellation_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cancellation_progress_owner"
  ON cancellation_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_cancellation_progress_user_id ON cancellation_progress(user_id);
CREATE INDEX idx_cancellation_progress_subscription_id ON cancellation_progress(subscription_id);
CREATE INDEX idx_cancellation_progress_status ON cancellation_progress(status);

-- 004_cancellation_documents.sql
CREATE TABLE IF NOT EXISTS cancellation_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE cancellation_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cancellation_documents_owner"
  ON cancellation_documents FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_cancellation_documents_user_id ON cancellation_documents(user_id);
CREATE INDEX idx_cancellation_documents_subscription_id ON cancellation_documents(subscription_id);

-- 005_onboarding_progress.sql
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 0,
  completed_steps INTEGER[] NOT NULL DEFAULT '{}',
  skipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "onboarding_progress_owner"
  ON onboarding_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_onboarding_progress_user_id ON onboarding_progress(user_id);

-- 006_user_notification_settings.sql
CREATE TABLE IF NOT EXISTS user_notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL
    CHECK (notification_type IN (
      'billing_reminder', 'spending_alert', 'cashback',
      'cancellation', 'newsletter'
    )),
  enabled BOOLEAN DEFAULT TRUE,
  threshold_amount NUMERIC(12, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, notification_type)
);
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_notification_settings_owner"
  ON user_notification_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_user_notification_settings_user_id ON user_notification_settings(user_id);
CREATE INDEX idx_user_notification_settings_type ON user_notification_settings(notification_type);

-- ============================================================
-- PHASE 5: Profiles Extensions + Wallets
-- ============================================================

-- 007_profiles_onboarding_field.sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- 008_user_wallets.sql (MUST run before user_transactions)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.user_wallets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency    TEXT NOT NULL DEFAULT 'THB',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
CREATE POLICY "Users can manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage own wallets" ON public.user_wallets;
CREATE POLICY "Users can manage own wallets" ON public.user_wallets
  FOR ALL USING (auth.uid() = user_id);

-- 001_add_user_transactions.sql (AFTER user_wallets)
CREATE TABLE IF NOT EXISTS user_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES user_wallets(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'cashback', 'refund', 'fee')),
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_transactions_owner"
  ON user_transactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX idx_user_transactions_wallet_id ON user_transactions(wallet_id);
CREATE INDEX idx_user_transactions_created_at ON user_transactions(created_at DESC);

-- ============================================================
-- PHASE 6: Subscription + Tier Extensions
-- ============================================================

-- 009_add_emotion_to_subscriptions.sql
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS emotion TEXT DEFAULT NULL;

-- 010_add_subscription_tier_to_profiles.sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'basic';
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

-- ============================================================
-- PHASE 7: LAUNCH FEATURES (012-016 equivalent)
-- These are the migrations needed for June 12 launch.
-- Migrations 011 and 012 are SKIPPED (broken — reference non-existent tables).
-- ============================================================

-- 013_create_alternative_assets.sql
-- Tracks: Gold, Mutual Funds, Bonds, Crypto, Other
CREATE TABLE IF NOT EXISTS public.alternative_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('gold', 'mutual_fund', 'bond', 'crypto', 'other')),
  current_value NUMERIC(14,2),
  currency TEXT DEFAULT 'THB',
  purchase_price NUMERIC(14,2),
  purchase_date DATE,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.alternative_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alt_assets_self" ON public.alternative_assets FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 014_create_emotional_context.sql
-- Records emotional state linked to transactions
CREATE TABLE IF NOT EXISTS public.emotional_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID,
  spending_intent TEXT CHECK (spending_intent IN ('planned', 'impulse', 'necessity', 'reward', 'emotional')),
  mood TEXT CHECK (mood IN ('happy', 'sad', 'stressed', 'bored', 'excited', 'anxious', 'neutral')),
  trigger_category TEXT,
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.emotional_context ENABLE ROW LEVEL SECURITY;
CREATE POLICY "emotional_self" ON public.emotional_context FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 015_create_fbis_meta.sql
-- Financial Behavior Improvement Score storage
CREATE TABLE IF NOT EXISTS public.fbis_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_score INTEGER DEFAULT 1000,
  streak_days INTEGER DEFAULT 0,
  last_recorded_at TIMESTAMPTZ,
  xp_multiplier NUMERIC(3,2) DEFAULT 1.0,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.fbis_meta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fbis_meta_self" ON public.fbis_meta FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 016_create_user_financial_profiles.sql
-- Behavioral archetype and financial goals
CREATE TABLE IF NOT EXISTS public.user_financial_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_financial_goal TEXT,
  behavioral_archetype TEXT,
  current_fbis_score INTEGER DEFAULT 1000,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_financial_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_fp_self" ON public.user_financial_profiles FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- DONE
-- ============================================================
