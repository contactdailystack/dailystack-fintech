-- ============================================================
-- Migration: 017_create_constitution_tables.sql
-- Source: Master Constitution SSOT v3.4 (Layer 1 & Layer 3)
-- Purpose: Add the 3 missing Constitution tables:
--   1. user_subscriptions  — tier subscription product catalog
--   2. user_security      — PIN hash + biometric preferences
--   3. user_preferences   — AI coach persona + app settings
-- Run after: migrations 001-016
-- ============================================================

BEGIN;

-- ============================================================
-- Table 1: user_subscriptions
-- Constitution Layer 1 (Identity): Tier subscription product catalog.
-- Tracks subscription products (BASIC/PRO/ELITE) with pricing.
-- Referenced by user_memberships(subscription_id) FK.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT NOT NULL
                    CHECK (subscription_tier IN ('basic', 'pro', 'elite')),
  plan_name       TEXT NOT NULL,
  plan_type       TEXT NOT NULL
                    CHECK (plan_type IN ('monthly', 'yearly', 'founder_monthly', 'founder_yearly')),
  price_thb       NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price_thb >= 0),
  currency        TEXT NOT NULL DEFAULT 'THB',
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'trialing')),
  started_at      TIMESTAMPTZ DEFAULT now(),
  expires_at      TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  auto_renew      BOOLEAN DEFAULT TRUE,
  metadata_json   JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_subscriptions_self"
  ON public.user_subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_subscriptions_user_id
  ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_tier
  ON public.user_subscriptions(user_id, subscription_tier);
CREATE INDEX idx_user_subscriptions_status
  ON public.user_subscriptions(user_id, status);

-- ============================================================
-- Table 2: user_security
-- Constitution Layer 2 (User Security): PIN hash + biometric settings.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_security (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  pin_hash         TEXT,
  pin_attempts     INTEGER DEFAULT 0,
  pin_locked_until TIMESTAMPTZ,
  biometric_enabled BOOLEAN DEFAULT FALSE,
  biometric_type   TEXT
                    CHECK (biometric_type IN ('fingerprint', 'face', 'iris', NULL)),
  two_fa_enabled   BOOLEAN DEFAULT FALSE,
  two_fa_method    TEXT
                    CHECK (two_fa_method IN ('totp', 'sms', 'email', NULL)),
  last_login_at    TIMESTAMPTZ,
  last_login_ip   INET,
  updated_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_security_self"
  ON public.user_security
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_security_user_id
  ON public.user_security(user_id);

-- ============================================================
-- Table 3: user_preferences
-- Constitution Layer 3 (User Preferences): AI coach persona + app settings.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  language_app         TEXT NOT NULL DEFAULT 'th'
                        CHECK (language_app IN ('th', 'en')),
  theme_mode           TEXT NOT NULL DEFAULT 'dark'
                        CHECK (theme_mode IN ('dark', 'light', 'system')),
  ai_coach_persona     TEXT NOT NULL DEFAULT 'supportive'
                        CHECK (ai_coach_persona IN ('strict', 'supportive', 'analytical')),
  ai_coach_name        TEXT,
  notifications_push    BOOLEAN DEFAULT TRUE,
  notifications_email   BOOLEAN DEFAULT FALSE,
  budget_alerts_enabled BOOLEAN DEFAULT TRUE,
  weekly_report_enabled BOOLEAN DEFAULT TRUE,
  currency_display     TEXT DEFAULT 'THB'
                        CHECK (currency_display IN ('THB', 'USD', 'EUR')),
  timezone             TEXT DEFAULT 'Asia/Bangkok',
  updated_at           TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_preferences_self"
  ON public.user_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Auto-update updated_at triggers
-- ============================================================

CREATE OR REPLACE FUNCTION constitution_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION constitution_update_updated_at();

CREATE TRIGGER user_security_updated_at
  BEFORE UPDATE ON public.user_security
  FOR EACH ROW EXECUTE FUNCTION constitution_update_updated_at();

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION constitution_update_updated_at();

-- ============================================================
-- Seed: Default preferences trigger for new users
-- Auto-creates user_security and user_preferences on new signup
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user_constitution()
RETURNS TRIGGER AS $$
BEGIN
  -- user_security: defaults to no PIN, biometric off
  INSERT INTO public.user_security (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- user_preferences: defaults per Constitution
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_constitution ON auth.users;
CREATE TRIGGER on_auth_user_created_constitution
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_constitution();

COMMIT;
