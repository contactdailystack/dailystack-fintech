-- ============================================================
-- DailyStack FinTech — Fix + Apply Remaining Migrations
-- Target: June 12, 2026 Launch
-- Run in Supabase Dashboard > SQL Editor (all at once)
-- ============================================================

-- ── 0. FIX broken subscriptions PK if missing (from failed earlier runs) ──
DO $$
BEGIN
  -- Check if subscriptions has a PK; if not, add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'subscriptions_pkey'
      AND table_name = 'subscriptions'
  ) THEN
    ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);
  END IF;
END$$;

-- ── 1. CORE TABLES (001 — already exist, fix triggers) ──
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS monthly_records_updated_at ON monthly_records;
DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER monthly_records_updated_at
  BEFORE UPDATE ON monthly_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── 2. RLS on core tables ──
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions    ENABLE ROW LEVEL SECURITY;

-- ── 3. CORE TABLES RLS policies ──
DROP POLICY IF EXISTS "Users can manage own monthly records" ON monthly_records;
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON subscriptions;
CREATE POLICY "Users can manage own monthly records"
  ON monthly_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own subscriptions"
  ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- ── 4. subscription_summary view ──
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

-- ── 5. MIGRATION 002: User memberships ──
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
DROP POLICY IF EXISTS "user_memberships_owner" ON user_memberships;
CREATE POLICY "user_memberships_owner" ON user_memberships
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id ON user_memberships(user_id);

-- ── 6. MIGRATION 003: OTP system ──
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
DROP POLICY IF EXISTS "Service role full access otp_requests" ON otp_requests;
DROP POLICY IF EXISTS "Service role full access pending_signups" ON pending_signups;
CREATE POLICY "Service role full access otp_requests"
  ON otp_requests FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access pending_signups"
  ON pending_signups FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_otp_user_id ON otp_requests(user_id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- ── 7. MIGRATION 003: Cancellation progress ──
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
DROP POLICY IF EXISTS "cancellation_progress_owner" ON cancellation_progress;
CREATE POLICY "cancellation_progress_owner"
  ON cancellation_progress FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_progress_user_id ON cancellation_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_progress_subscription_id ON cancellation_progress(subscription_id);

-- ── 8. MIGRATION 004: Cancellation documents ──
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
DROP POLICY IF EXISTS "cancellation_documents_owner" ON cancellation_documents;
CREATE POLICY "cancellation_documents_owner"
  ON cancellation_documents FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_documents_user_id ON cancellation_documents(user_id);

-- ── 9. MIGRATION 005: Onboarding progress ──
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
DROP POLICY IF EXISTS "onboarding_progress_owner" ON onboarding_progress;
CREATE POLICY "onboarding_progress_owner"
  ON onboarding_progress FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON onboarding_progress(user_id);

-- ── 10. MIGRATION 006: Notification settings ──
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
DROP POLICY IF EXISTS "user_notification_settings_owner" ON user_notification_settings;
CREATE POLICY "user_notification_settings_owner"
  ON user_notification_settings FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_user_notification_settings_user_id ON user_notification_settings(user_id);

-- ── 11. MIGRATION 007: Onboarding field on profiles ──
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- ── 12. MIGRATION 008: User wallets ──
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE;

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
DROP POLICY IF EXISTS "Users can manage own wallets" ON public.user_wallets;
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own wallets" ON public.user_wallets FOR ALL USING (auth.uid() = user_id);

-- ── 13. MIGRATION 001b: User transactions ──
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
DROP POLICY IF EXISTS "user_transactions_owner" ON user_transactions;
CREATE POLICY "user_transactions_owner"
  ON user_transactions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_wallet_id ON user_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_created_at ON user_transactions(created_at DESC);

-- ── 14. MIGRATION 009: Emotion field on subscriptions ──
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS emotion TEXT DEFAULT NULL;

-- ── 15. MIGRATION 010: Subscription tier on profiles ──
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'basic';

-- ── 16. MIGRATION 013: Alternative assets (LAUNCH FEATURE) ──
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
DROP POLICY IF EXISTS "alt_assets_self" ON public.alternative_assets;
CREATE POLICY "alt_assets_self" ON public.alternative_assets FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 17. MIGRATION 014: Emotional context (LAUNCH FEATURE) ──
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
DROP POLICY IF EXISTS "emotional_self" ON public.emotional_context;
CREATE POLICY "emotional_self" ON public.emotional_context FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 18. MIGRATION 015: FBIS meta (LAUNCH FEATURE) ──
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
DROP POLICY IF EXISTS "fbis_meta_self" ON public.fbis_meta;
CREATE POLICY "fbis_meta_self" ON public.fbis_meta FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 19. MIGRATION 016: User financial profiles (LAUNCH FEATURE) ──
CREATE TABLE IF NOT EXISTS public.user_financial_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_financial_goal TEXT,
  behavioral_archetype TEXT,
  current_fbis_score INTEGER DEFAULT 1000,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_financial_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_fp_self" ON public.user_financial_profiles;
CREATE POLICY "user_fp_self" ON public.user_financial_profiles FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- DONE — All tables for June 12 launch created
-- ============================================================
