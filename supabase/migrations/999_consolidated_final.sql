-- ============================================================
-- DailyStack FinTech — CONSOLIDATED FINAL MIGRATION
-- Canonical migration for all database schema
-- Date: 2026-06-24
-- Supersedes: Migrations 001-024
--
-- HISTORY:
--   001_initial_schema → Core tables (profiles renamed to users in 019)
--   002_add_user_memberships → Memberships
--   003_otp_system → OTP requests + pending signups
--   004_add_cancellation_documents → Cancellation docs
--   005_add_onboarding_progress → Onboarding tracking
--   006_add_user_notification_settings → Notification prefs
--   007_add_profiles_onboarding_field → onboarding_completed_at
--   008_create_user_wallets → user_wallets + is_premium
--   009_add_emotion_to_subscriptions → emotion column
--   010_add_subscription_tier → subscription_tier column
--   011_behavioral_alerts → alert_rules, behavioral_alerts, alert_preferences
--   012_add_billing_cycle → (SKIPPED - already in base schema)
--   013_create_alternative_assets → alternative_assets
--   014_create_emotional_context → emotional_context
--   015_create_fbis_meta → fbis_meta
--   016_create_user_financial_profiles → user_financial_profiles
--   017_create_constitution_tables → user_subscriptions(CONST), user_security, user_preferences
--   018_fix_profiles_rls → (incorporated)
--   019_rename_profiles_to_users → RENAME profiles→users, full_name→display_name
--   020_create_money_twin → money_twin
--   021_ai_coach → ai_coach_conversations
--   022_add_challenge_to_users → challenge column
--   023_launch_p0_fixes → RLS fixes, user_subscriptions MVP, handle_new_user fix
--   024_mvp_budget_alerts_ghosts → budget_alerts, ghost_subscriptions, budget_categories
--   024_create_net_worth_tables → net_worth_accounts, net_worth_snapshots, account_snapshots
--
-- USAGE:
--   Fresh DB: Run ONLY this migration (999_consolidated_final.sql)
--   Existing DB: Run this migration to consolidate/fix schema
--   Idempotent: Safe to re-run (uses IF NOT EXISTS, ON CONFLICT)
-- ============================================================

BEGIN;

-- ============================================================
-- PHASE 1: Extension
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PHASE 2: Core Tables
-- ============================================================

-- users table (formerly profiles, renamed in migration 019)
-- Primary user identity table
CREATE TABLE IF NOT EXISTS public.users (
    id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email                   TEXT NOT NULL,
    display_name             TEXT,
    auth_provider            TEXT DEFAULT 'phone',
    base_currency            TEXT DEFAULT 'THB',
    subscription_tier        TEXT NOT NULL DEFAULT 'basic'
                              CHECK (subscription_tier IN ('basic', 'pro', 'elite')),
    is_premium              BOOLEAN NOT NULL DEFAULT FALSE,
    onboarding_completed_at  TIMESTAMPTZ,
    email_verified           BOOLEAN NOT NULL DEFAULT FALSE,
    challenge               TEXT DEFAULT 'none',
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helper: update_updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Updated_at trigger for users
DROP TRIGGER IF EXISTS users_updated_at ON public.users;
CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Handle new user trigger function (CRITICAL: inserts into users, not profiles)
-- SECURITY DEFINER with search_path = public, auth to work correctly
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name, auth_provider, base_currency, subscription_tier)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'display_name',
            ''
        ),
        COALESCE(NEW.raw_user_meta_data->>'provider', 'email'),
        'THB',
        'basic'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Trigger on auth.users for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- monthly_records table
CREATE TABLE IF NOT EXISTS public.monthly_records (
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

DROP TRIGGER IF EXISTS monthly_records_updated_at ON public.monthly_records;
CREATE TRIGGER monthly_records_updated_at
    BEFORE UPDATE ON public.monthly_records
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id                  UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    cost                NUMERIC(10, 2) NOT NULL CHECK (cost >= 0),
    billing_cycle       TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    category            TEXT NOT NULL DEFAULT 'other',
    next_billing_date   DATE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    emotion             TEXT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- subscription_summary view
CREATE OR REPLACE VIEW public.subscription_summary AS
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
FROM public.subscriptions
GROUP BY user_id;

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON public.subscriptions(user_id, is_active);

-- ============================================================
-- PHASE 3: Memberships
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_memberships (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    plan_name       TEXT NOT NULL DEFAULT '',
    tier            TEXT,
    benefits_json   JSONB DEFAULT '[]',
    start_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date        DATE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS user_memberships_updated_at ON public.user_memberships;
CREATE TRIGGER user_memberships_updated_at
    BEFORE UPDATE ON public.user_memberships
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id ON public.user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_subscription_id ON public.user_memberships(subscription_id);

-- ============================================================
-- PHASE 4: Authentication & OTP
-- ============================================================

CREATE TABLE IF NOT EXISTS public.otp_requests (
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

CREATE INDEX IF NOT EXISTS idx_otp_user_id ON public.otp_requests(user_id);

CREATE TABLE IF NOT EXISTS public.pending_signups (
    id              UUID NOT NULL DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL UNIQUE,
    full_name       TEXT NOT NULL,
    password_hash    TEXT NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PHASE 5: Cancellation Flow
-- ============================================================

CREATE TABLE IF NOT EXISTS public.cancellation_progress (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    current_tab     INTEGER DEFAULT 0,
    form_data_json  JSONB DEFAULT '{}',
    status          TEXT NOT NULL DEFAULT 'not_started'
                    CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, subscription_id)
);

DROP TRIGGER IF EXISTS cancellation_progress_updated_at ON public.cancellation_progress;
CREATE TRIGGER cancellation_progress_updated_at
    BEFORE UPDATE ON public.cancellation_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_cancellation_progress_user_id ON public.cancellation_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_progress_subscription_id ON public.cancellation_progress(subscription_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_progress_status ON public.cancellation_progress(status);

CREATE TABLE IF NOT EXISTS public.cancellation_documents (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    document_name   TEXT NOT NULL,
    storage_path    TEXT NOT NULL,
    file_size       INTEGER,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cancellation_documents_user_id ON public.cancellation_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_documents_subscription_id ON public.cancellation_documents(subscription_id);

-- ============================================================
-- PHASE 6: Onboarding & Preferences
-- ============================================================

CREATE TABLE IF NOT EXISTS public.onboarding_progress (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    current_step    INTEGER NOT NULL DEFAULT 0,
    completed_steps INTEGER[] NOT NULL DEFAULT '{}',
    skipped         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS onboarding_progress_updated_at ON public.onboarding_progress;
CREATE TRIGGER onboarding_progress_updated_at
    BEFORE UPDATE ON public.onboarding_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON public.onboarding_progress(user_id);

CREATE TABLE IF NOT EXISTS public.user_notification_settings (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type   TEXT NOT NULL
                        CHECK (notification_type IN (
                            'billing_reminder', 'spending_alert', 'cashback',
                            'cancellation', 'newsletter'
                        )),
    enabled             BOOLEAN DEFAULT TRUE,
    threshold_amount    NUMERIC(12, 2),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, notification_type)
);

DROP TRIGGER IF EXISTS user_notification_settings_updated_at ON public.user_notification_settings;
CREATE TRIGGER user_notification_settings_updated_at
    BEFORE UPDATE ON public.user_notification_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_user_notification_settings_user_id ON public.user_notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notification_settings_type ON public.user_notification_settings(notification_type);

-- ============================================================
-- PHASE 7: Wallets & Transactions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_wallets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance     NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency    TEXT NOT NULL DEFAULT 'THB',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS user_wallets_updated_at ON public.user_wallets;
CREATE TRIGGER user_wallets_updated_at
    BEFORE UPDATE ON public.user_wallets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.user_transactions (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_id       UUID REFERENCES public.user_wallets(id) ON DELETE SET NULL,
    type            TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'cashback', 'refund', 'fee')),
    amount          NUMERIC(12, 2) NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    reference_id    TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON public.user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_wallet_id ON public.user_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_created_at ON public.user_transactions(created_at DESC);

-- ============================================================
-- PHASE 8: Constitution Tables (from 017)
-- ============================================================

-- user_subscriptions: Tier subscription product catalog (Constitution Layer 1)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_tier   TEXT NOT NULL
                        CHECK (subscription_tier IN ('basic', 'pro', 'elite')),
    plan_name           TEXT NOT NULL,
    plan_type           TEXT NOT NULL
                        CHECK (plan_type IN ('monthly', 'yearly', 'founder_monthly', 'founder_yearly')),
    price_thb           NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price_thb >= 0),
    currency            TEXT NOT NULL DEFAULT 'THB',
    status              TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'trialing')),
    started_at          TIMESTAMPTZ DEFAULT now(),
    expires_at          TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,
    auto_renew          BOOLEAN DEFAULT TRUE,
    metadata_json       JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON public.user_subscriptions(user_id, subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(user_id, status);

-- user_security: PIN hash + biometric settings (Constitution Layer 2)
CREATE TABLE IF NOT EXISTS public.user_security (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    pin_hash           TEXT,
    pin_attempts       INTEGER DEFAULT 0,
    pin_locked_until   TIMESTAMPTZ,
    biometric_enabled  BOOLEAN DEFAULT FALSE,
    biometric_type     TEXT
                      CHECK (biometric_type IN ('fingerprint', 'face', 'iris', NULL)),
    two_fa_enabled     BOOLEAN DEFAULT FALSE,
    two_fa_method      TEXT
                      CHECK (two_fa_method IN ('totp', 'sms', 'email', NULL)),
    last_login_at      TIMESTAMPTZ,
    last_login_ip      INET,
    updated_at         TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS user_security_updated_at ON public.user_security;
CREATE TRIGGER user_security_updated_at
    BEFORE UPDATE ON public.user_security
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_user_security_user_id ON public.user_security(user_id);

-- user_preferences: AI coach persona + app settings (Constitution Layer 3)
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    language_app          TEXT NOT NULL DEFAULT 'th'
                          CHECK (language_app IN ('th', 'en')),
    theme_mode            TEXT NOT NULL DEFAULT 'dark'
                          CHECK (theme_mode IN ('dark', 'light', 'system')),
    ai_coach_persona      TEXT NOT NULL DEFAULT 'supportive'
                          CHECK (ai_coach_persona IN ('strict', 'supportive', 'analytical')),
    ai_coach_name         TEXT,
    notifications_push    BOOLEAN DEFAULT TRUE,
    notifications_email   BOOLEAN DEFAULT FALSE,
    budget_alerts_enabled BOOLEAN DEFAULT TRUE,
    weekly_report_enabled BOOLEAN DEFAULT TRUE,
    currency_display      TEXT DEFAULT 'THB'
                          CHECK (currency_display IN ('THB', 'USD', 'EUR')),
    timezone              TEXT DEFAULT 'Asia/Bangkok',
    updated_at            TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Constitution: auto-create user_security and user_preferences on new signup
DROP FUNCTION IF EXISTS public.handle_new_user_constitution();
CREATE OR REPLACE FUNCTION public.handle_new_user_constitution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    INSERT INTO public.user_security (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_constitution ON auth.users;
CREATE TRIGGER on_auth_user_created_constitution
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_constitution();

-- ============================================================
-- PHASE 9: Behavioral Alerts System (from 011)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.alert_rules (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    category        TEXT NOT NULL CHECK (category IN ('impulse', 'budget', 'habit', 'savings', 'emotional', 'pattern', 'milestone', 'security')),
    severity        TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'alert', 'critical')),
    priority        TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    triggers        JSONB NOT NULL DEFAULT '[]'::jsonb,
    conditions      JSONB NOT NULL DEFAULT '[]'::jsonb,
    conditions_logic TEXT NOT NULL DEFAULT 'AND' CHECK (conditions_logic IN ('AND', 'OR')),
    channels        TEXT[] NOT NULL DEFAULT ARRAY['in_app'],
    timing          TEXT NOT NULL DEFAULT 'immediate' CHECK (timing IN ('immediate', 'hourly_digest', 'daily_digest')),
    quiet_hours     JSONB,
    cooldown_minutes INTEGER NOT NULL DEFAULT 60,
    max_per_day     INTEGER NOT NULL DEFAULT 5,
    snooze_until    TIMESTAMPTZ,
    enabled         BOOLEAN NOT NULL DEFAULT true,
    auto_resolve    BOOLEAN NOT NULL DEFAULT true,
    show_in_feed    BOOLEAN NOT NULL DEFAULT true,
    thresholds      JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_rules_user_id ON public.alert_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_category ON public.alert_rules(category);
CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON public.alert_rules(enabled);

DROP TRIGGER IF EXISTS update_alert_rules_updated_at ON public.alert_rules;
CREATE TRIGGER update_alert_rules_updated_at
    BEFORE UPDATE ON public.alert_rules
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.behavioral_alerts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id         UUID REFERENCES public.alert_rules(id) ON DELETE SET NULL,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    message         TEXT NOT NULL,
    category        TEXT NOT NULL CHECK (category IN ('impulse', 'budget', 'habit', 'savings', 'emotional', 'pattern', 'milestone', 'security')),
    severity        TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'alert', 'critical')),
    priority        TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    trigger_data    JSONB DEFAULT '{}'::jsonb,
    transactions    JSONB,
    metric_values   JSONB,
    status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at  TIMESTAMPTZ,
    resolved_at     TIMESTAMPTZ,
    dismissed_at    TIMESTAMPTZ,
    delivered_to    TEXT[] DEFAULT ARRAY[]::text[],
    delivery_status JSONB DEFAULT '{}'::jsonb,
    viewed          BOOLEAN NOT NULL DEFAULT false,
    view_count      INTEGER NOT NULL DEFAULT 0,
    action_taken    TEXT
);

CREATE INDEX IF NOT EXISTS idx_behavioral_alerts_user_id ON public.behavioral_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_alerts_status ON public.behavioral_alerts(status);
CREATE INDEX IF NOT EXISTS idx_behavioral_alerts_category ON public.behavioral_alerts(category);
CREATE INDEX IF NOT EXISTS idx_behavioral_alerts_severity ON public.behavioral_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_behavioral_alerts_created_at ON public.behavioral_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_behavioral_alerts_rule_id ON public.behavioral_alerts(rule_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_alerts_feed ON public.behavioral_alerts(user_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.alert_preferences (
    user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    alerts_enabled  BOOLEAN NOT NULL DEFAULT true,
    quiet_mode      BOOLEAN NOT NULL DEFAULT false,
    quiet_hours     JSONB NOT NULL DEFAULT '{"start": "22:00", "end": "08:00"}'::jsonb,
    channels        JSONB NOT NULL DEFAULT '{
        "in_app": {"enabled": true, "frequency": "immediate"},
        "push": {"enabled": true, "frequency": "immediate"},
        "email": {"enabled": true, "frequency": "daily_digest"},
        "sms": {"enabled": false, "frequency": "immediate"}
    }'::jsonb,
    categories      JSONB NOT NULL DEFAULT '{
        "impulse": {"enabled": true, "minSeverity": "warning", "channels": ["in_app", "push"]},
        "budget": {"enabled": true, "minSeverity": "alert", "channels": ["in_app", "push", "email"]},
        "habit": {"enabled": true, "minSeverity": "warning", "channels": ["in_app"]},
        "savings": {"enabled": true, "minSeverity": "alert", "channels": ["in_app", "email"]},
        "emotional": {"enabled": true, "minSeverity": "alert", "channels": ["in_app", "push"]},
        "pattern": {"enabled": true, "minSeverity": "warning", "channels": ["in_app"]},
        "milestone": {"enabled": true, "minSeverity": "info", "channels": ["in_app", "push"]},
        "security": {"enabled": true, "minSeverity": "critical", "channels": ["in_app", "push", "email", "sms"]}
    }'::jsonb,
    adaptive_thresholds BOOLEAN NOT NULL DEFAULT true,
    smart_timing     BOOLEAN NOT NULL DEFAULT true,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_alert_preferences_updated_at ON public.alert_preferences;
CREATE TRIGGER update_alert_preferences_updated_at
    BEFORE UPDATE ON public.alert_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- PHASE 10: Financial Profiles & Behavioral
-- ============================================================

CREATE TABLE IF NOT EXISTS public.alternative_assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_name      TEXT NOT NULL,
    asset_type      TEXT NOT NULL CHECK (asset_type IN ('gold', 'mutual_fund', 'bond', 'crypto', 'other')),
    current_value   NUMERIC(14,2),
    currency        TEXT DEFAULT 'THB',
    purchase_price  NUMERIC(14,2),
    purchase_date   DATE,
    notes           TEXT,
    updated_at      TIMESTAMPTZ DEFAULT now(),
    created_at      TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS alternative_assets_updated_at ON public.alternative_assets;
CREATE TRIGGER alternative_assets_updated_at
    BEFORE UPDATE ON public.alternative_assets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.emotional_context (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id  UUID,
    spending_intent TEXT CHECK (spending_intent IN ('planned', 'impulse', 'necessity', 'reward', 'emotional')),
    mood            TEXT CHECK (mood IN ('happy', 'sad', 'stressed', 'bored', 'excited', 'anxious', 'neutral')),
    trigger_category TEXT,
    notes           TEXT,
    recorded_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_emotional_context_user_id ON public.emotional_context(user_id);
CREATE INDEX IF NOT EXISTS idx_emotional_context_transaction_id ON public.emotional_context(transaction_id);

CREATE TABLE IF NOT EXISTS public.fbis_meta (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_score   INTEGER DEFAULT 1000,
    streak_days     INTEGER DEFAULT 0,
    last_recorded_at TIMESTAMPTZ,
    xp_multiplier   NUMERIC(3,2) DEFAULT 1.0,
    updated_at      TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS fbis_meta_updated_at ON public.fbis_meta;
CREATE TRIGGER fbis_meta_updated_at
    BEFORE UPDATE ON public.fbis_meta
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.user_financial_profiles (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    primary_financial_goal   TEXT,
    behavioral_archetype    TEXT,
    current_fbis_score      INTEGER DEFAULT 1000,
    updated_at              TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS user_financial_profiles_updated_at ON public.user_financial_profiles;
CREATE TRIGGER user_financial_profiles_updated_at
    BEFORE UPDATE ON public.user_financial_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- PHASE 11: AI Features (Money Twin, AI Coach)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.money_twin (
    id                          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id                     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    twin_version                INTEGER NOT NULL DEFAULT 1,
    twin_label                  TEXT DEFAULT 'Primary Twin',
    is_active                   BOOLEAN DEFAULT TRUE,
    spending_archetype           TEXT,
    avg_monthly_spend            NUMERIC(12,2),
    avg_monthly_income           NUMERIC(12,2),
    avg_monthly_savings_rate     NUMERIC(5,2),
    savings_rate_trend          TEXT,
    category_ratios             JSONB DEFAULT '{}',
    impulse_buy_frequency       INTEGER DEFAULT 0,
    subscription_count          INTEGER DEFAULT 0,
    avg_transaction_size         NUMERIC(10,2),
    largest_expense_category    TEXT,
    financial_health_score       NUMERIC(3,0),
    budget_adherence_score       NUMERIC(3,0),
    savings_discipline_score     NUMERIC(3,0),
    risk_tolerance              TEXT DEFAULT 'moderate',
    investment_readiness         NUMERIC(3,0),
    twin_insights               JSONB DEFAULT '[]',
    twin_recommendations        JSONB DEFAULT '[]',
    simulation_snapshots        JSONB DEFAULT '[]',
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_sync_at                TIMESTAMPTZ,
    data_sources               TEXT[] DEFAULT ARRAY[]::TEXT[],
    confidence_score            NUMERIC(3,0) DEFAULT 50,
    training_sample_size        INTEGER DEFAULT 0
);

DROP TRIGGER IF EXISTS money_twin_updated_at ON public.money_twin;
CREATE TRIGGER money_twin_updated_at
    BEFORE UPDATE ON public.money_twin
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_money_twin_user_id ON public.money_twin(user_id);
CREATE INDEX IF NOT EXISTS idx_money_twin_active ON public.money_twin(user_id, is_active) WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS public.ai_coach_conversations (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id      TEXT NOT NULL,
    message_role    TEXT NOT NULL CHECK (message_role IN ('user', 'coach')),
    message_content TEXT NOT NULL,
    archetype       TEXT,
    fbis_score      INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coach_conv_user_session ON public.ai_coach_conversations(user_id, session_id);

-- ============================================================
-- PHASE 12: Budget System (Categories, Alerts, Ghosts)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.budget_categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_name   TEXT NOT NULL,
    monthly_limit   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (monthly_limit >= 0),
    color_code      TEXT DEFAULT '#CCFF00',
    icon_name       TEXT DEFAULT 'Wallet',
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, category_name)
);

DROP TRIGGER IF EXISTS budget_categories_updated_at ON public.budget_categories;
CREATE TRIGGER budget_categories_updated_at
    BEFORE UPDATE ON public.budget_categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create default budget categories for new users
DROP FUNCTION IF EXISTS public.create_default_budget_categories();
CREATE OR REPLACE FUNCTION public.create_default_budget_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    INSERT INTO public.budget_categories (user_id, category_name, monthly_limit, color_code, icon_name, sort_order)
    VALUES
        (NEW.id, 'Food & Dining', 5000, '#F97316', 'UtensilsCrossed', 1),
        (NEW.id, 'Transport', 3000, '#3B82F6', 'Car', 2),
        (NEW.id, 'Shopping', 4000, '#CCFF00', 'ShoppingBag', 3),
        (NEW.id, 'Entertainment', 2000, '#8B5CF6', 'Tv', 4),
        (NEW.id, 'Bills & Utilities', 5000, '#F97316', 'Zap', 5),
        (NEW.id, 'Health', 2000, '#4CAF50', 'Heart', 6),
        (NEW.id, 'Other', 3000, '#9CA3AF', 'MoreHorizontal', 7)
    ON CONFLICT (user_id, category_name) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_budget_categories ON auth.users;
CREATE TRIGGER on_auth_user_created_budget_categories
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_default_budget_categories();

CREATE TABLE IF NOT EXISTS public.budget_alerts (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_name     TEXT NOT NULL,
    alert_type        TEXT NOT NULL CHECK (alert_type IN ('warning', 'danger', 'milestone')),
    threshold_amount  NUMERIC(12,2),
    current_spent     NUMERIC(12,2),
    percentage_used   NUMERIC(5,2) DEFAULT 0,
    message           TEXT,
    is_read           BOOLEAN DEFAULT false,
    created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_budget_alerts_user_id ON public.budget_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_is_read ON public.budget_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_created_at ON public.budget_alerts(created_at DESC);

DROP TRIGGER IF EXISTS update_budget_alerts_updated_at ON public.budget_alerts;
CREATE TRIGGER update_budget_alerts_updated_at
    BEFORE UPDATE ON public.budget_alerts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.ghost_subscriptions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    detected_name      TEXT NOT NULL,
    estimated_cost     NUMERIC(10,2) NOT NULL,
    confidence_score   FLOAT DEFAULT 0.5 CHECK (confidence_score BETWEEN 0 AND 1),
    status             TEXT DEFAULT 'pending'
                      CHECK (status IN ('pending', 'confirmed', 'cancelled', 'dismissed')),
    billing_cycle      TEXT DEFAULT 'monthly'
                      CHECK (billing_cycle IN ('monthly', 'yearly', 'weekly')),
    category           TEXT DEFAULT 'other',
    suggested_action   TEXT,
    notes              TEXT,
    created_at         TIMESTAMPTZ DEFAULT now(),
    resolved_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ghost_subs_user_id ON public.ghost_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_ghost_subs_status ON public.ghost_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_ghost_subs_created_at ON public.ghost_subscriptions(created_at DESC);

DROP TRIGGER IF EXISTS update_ghost_subs_updated_at ON public.ghost_subscriptions;
CREATE TRIGGER update_ghost_subs_updated_at
    BEFORE UPDATE ON public.ghost_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- PHASE 13: Net Worth Tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS public.net_worth_accounts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_name        TEXT NOT NULL,
    account_name_th     TEXT,
    account_type        TEXT NOT NULL CHECK (account_type IN ('asset', 'liability')),
    account_category    TEXT NOT NULL CHECK (account_category IN (
        'cash', 'checking', 'savings', 'investment', 'property', 'vehicle', 'crypto', 'other'
    )),
    institution         TEXT,
    current_balance     NUMERIC(14,2) DEFAULT 0,
    currency            TEXT DEFAULT 'THB',
    icon                TEXT,
    color               TEXT,
    is_manual           BOOLEAN DEFAULT false,
    is_active           BOOLEAN DEFAULT true,
    last_synced_at      TIMESTAMPTZ,
    updated_at          TIMESTAMPTZ DEFAULT now(),
    created_at          TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS net_worth_accounts_updated_at ON public.net_worth_accounts;
CREATE TRIGGER net_worth_accounts_updated_at
    BEFORE UPDATE ON public.net_worth_accounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_net_worth_accounts_user ON public.net_worth_accounts(user_id);

CREATE TABLE IF NOT EXISTS public.net_worth_snapshots (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    snapshot_date        DATE NOT NULL,
    total_assets        NUMERIC(14,2) DEFAULT 0,
    total_liabilities   NUMERIC(14,2) DEFAULT 0,
    net_worth           NUMERIC(14,2) DEFAULT 0,
    currency            TEXT DEFAULT 'THB',
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_net_worth_snapshots_user_date ON public.net_worth_snapshots(user_id, snapshot_date DESC);

CREATE TABLE IF NOT EXISTS public.account_snapshots (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id           UUID NOT NULL REFERENCES public.net_worth_accounts(id) ON DELETE CASCADE,
    snapshot_date        DATE NOT NULL,
    balance              NUMERIC(14,2) DEFAULT 0,
    currency             TEXT DEFAULT 'THB',
    created_at          TIMESTAMPTZ DEFAULT now(),
    UNIQUE(account_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_account_snapshots_account_date ON public.account_snapshots(account_id, snapshot_date DESC);

-- Function to update net worth snapshot
DROP FUNCTION IF EXISTS public.update_net_worth_snapshot(UUID);
CREATE OR REPLACE FUNCTION public.update_net_worth_snapshot(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_assets_val NUMERIC(14,2);
    total_liabilities_val NUMERIC(14,2);
    current_date_val DATE := CURRENT_DATE;
BEGIN
    SELECT COALESCE(SUM(CASE WHEN account_type = 'asset' THEN current_balance ELSE 0 END), 0),
           COALESCE(SUM(CASE WHEN account_type = 'liability' THEN current_balance ELSE 0 END), 0)
    INTO total_assets_val, total_liabilities_val
    FROM public.net_worth_accounts
    WHERE user_id = user_uuid AND is_active = true;

    INSERT INTO public.net_worth_snapshots (user_id, snapshot_date, total_assets, total_liabilities, net_worth)
    VALUES (user_uuid, current_date_val, total_assets_val, total_liabilities_val, total_assets_val - total_liabilities_val)
    ON CONFLICT (user_id, snapshot_date)
    DO UPDATE SET
        total_assets = EXCLUDED.total_assets,
        total_liabilities = EXCLUDED.total_liabilities,
        net_worth = EXCLUDED.net_worth,
        updated_at = now();
END;
$$;

-- ============================================================
-- PHASE 14: Row Level Security (RLS)
-- ============================================================
-- Enable RLS on all user-facing tables

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellation_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellation_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alternative_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotional_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fbis_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_financial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.money_twin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coach_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghost_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.net_worth_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.net_worth_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_snapshots ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PHASE 15: RLS Policies (auth.uid() = user_id everywhere)
-- ============================================================

-- users
DROP POLICY IF EXISTS "users_self" ON public.users;
CREATE POLICY "users_self" ON public.users FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- monthly_records
DROP POLICY IF EXISTS "monthly_records_self" ON public.monthly_records;
CREATE POLICY "monthly_records_self" ON public.monthly_records FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- subscriptions
DROP POLICY IF EXISTS "subscriptions_self" ON public.subscriptions;
CREATE POLICY "subscriptions_self" ON public.subscriptions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- user_memberships
DROP POLICY IF EXISTS "user_memberships_self" ON public.user_memberships;
CREATE POLICY "user_memberships_self" ON public.user_memberships FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- otp_requests (service_role full access)
DROP POLICY IF EXISTS "otp_requests_service_role" ON public.otp_requests;
CREATE POLICY "otp_requests_service_role" ON public.otp_requests
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- pending_signups (service_role full access)
DROP POLICY IF EXISTS "pending_signups_service_role" ON public.pending_signups;
CREATE POLICY "pending_signups_service_role" ON public.pending_signups
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- cancellation_progress
DROP POLICY IF EXISTS "cancellation_progress_self" ON public.cancellation_progress;
CREATE POLICY "cancellation_progress_self" ON public.cancellation_progress FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- cancellation_documents
DROP POLICY IF EXISTS "cancellation_documents_self" ON public.cancellation_documents;
CREATE POLICY "cancellation_documents_self" ON public.cancellation_documents FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- onboarding_progress
DROP POLICY IF EXISTS "onboarding_progress_self" ON public.onboarding_progress;
CREATE POLICY "onboarding_progress_self" ON public.onboarding_progress FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- user_notification_settings
DROP POLICY IF EXISTS "user_notification_settings_self" ON public.user_notification_settings;
CREATE POLICY "user_notification_settings_self" ON public.user_notification_settings FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- user_wallets
DROP POLICY IF EXISTS "user_wallets_self" ON public.user_wallets;
CREATE POLICY "user_wallets_self" ON public.user_wallets FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- user_transactions
DROP POLICY IF EXISTS "user_transactions_self" ON public.user_transactions;
CREATE POLICY "user_transactions_self" ON public.user_transactions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- user_subscriptions (Constitution version - service_role for webhook)
DROP POLICY IF EXISTS "user_subscriptions_self" ON public.user_subscriptions;
CREATE POLICY "user_subscriptions_self" ON public.user_subscriptions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_subscriptions_service_role" ON public.user_subscriptions;
CREATE POLICY "user_subscriptions_service_role" ON public.user_subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- user_security
DROP POLICY IF EXISTS "user_security_self" ON public.user_security;
CREATE POLICY "user_security_self" ON public.user_security FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- user_preferences
DROP POLICY IF EXISTS "user_preferences_self" ON public.user_preferences;
CREATE POLICY "user_preferences_self" ON public.user_preferences FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- alert_rules
DROP POLICY IF EXISTS "alert_rules_self" ON public.alert_rules;
CREATE POLICY "alert_rules_self" ON public.alert_rules FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- behavioral_alerts
DROP POLICY IF EXISTS "behavioral_alerts_self" ON public.behavioral_alerts;
CREATE POLICY "behavioral_alerts_self" ON public.behavioral_alerts FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- alert_preferences
DROP POLICY IF EXISTS "alert_preferences_self" ON public.alert_preferences;
CREATE POLICY "alert_preferences_self" ON public.alert_preferences FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- alternative_assets
DROP POLICY IF EXISTS "alternative_assets_self" ON public.alternative_assets;
CREATE POLICY "alternative_assets_self" ON public.alternative_assets FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- emotional_context
DROP POLICY IF EXISTS "emotional_context_self" ON public.emotional_context;
CREATE POLICY "emotional_context_self" ON public.emotional_context FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- fbis_meta
DROP POLICY IF EXISTS "fbis_meta_self" ON public.fbis_meta;
CREATE POLICY "fbis_meta_self" ON public.fbis_meta FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- user_financial_profiles
DROP POLICY IF EXISTS "user_financial_profiles_self" ON public.user_financial_profiles;
CREATE POLICY "user_financial_profiles_self" ON public.user_financial_profiles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- money_twin
DROP POLICY IF EXISTS "money_twin_self" ON public.money_twin;
CREATE POLICY "money_twin_self" ON public.money_twin FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ai_coach_conversations
DROP POLICY IF EXISTS "ai_coach_conversations_self" ON public.ai_coach_conversations;
CREATE POLICY "ai_coach_conversations_self" ON public.ai_coach_conversations FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- budget_categories
DROP POLICY IF EXISTS "budget_categories_self" ON public.budget_categories;
CREATE POLICY "budget_categories_self" ON public.budget_categories FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- budget_alerts
DROP POLICY IF EXISTS "budget_alerts_self" ON public.budget_alerts;
CREATE POLICY "budget_alerts_self" ON public.budget_alerts FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "budget_alerts_service_role" ON public.budget_alerts;
CREATE POLICY "budget_alerts_service_role" ON public.budget_alerts
    FOR ALL USING (auth.role() = 'service_role');

-- ghost_subscriptions
DROP POLICY IF EXISTS "ghost_subscriptions_self" ON public.ghost_subscriptions;
CREATE POLICY "ghost_subscriptions_self" ON public.ghost_subscriptions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ghost_subscriptions_service_role" ON public.ghost_subscriptions;
CREATE POLICY "ghost_subscriptions_service_role" ON public.ghost_subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- net_worth_accounts
DROP POLICY IF EXISTS "net_worth_accounts_self" ON public.net_worth_accounts;
CREATE POLICY "net_worth_accounts_self" ON public.net_worth_accounts FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- net_worth_snapshots
DROP POLICY IF EXISTS "net_worth_snapshots_self" ON public.net_worth_snapshots;
CREATE POLICY "net_worth_snapshots_self" ON public.net_worth_snapshots FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- account_snapshots
DROP POLICY IF EXISTS "account_snapshots_self" ON public.account_snapshots;
CREATE POLICY "account_snapshots_self" ON public.account_snapshots FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- PHASE 16: Grants
-- ============================================================

GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- ============================================================
-- PHASE 17: Seed existing users (fix for users created during broken period)
-- ============================================================

INSERT INTO public.users (id, email, display_name, auth_provider, base_currency, subscription_tier)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'display_name', ''),
    COALESCE(au.raw_user_meta_data->>'provider', 'email'),
    'THB',
    'basic'
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = au.id)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

SELECT '=== Consolidated Migration Complete ===' AS status;

-- Verify tables with RLS
SELECT
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename NOT IN ('supabase_migrations', 'schema_migrations')
ORDER BY tablename;

-- Verify triggers on auth.users
SELECT
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
    AND event_object_table = 'users';

-- Count tables created
SELECT
    'Tables created:' AS info,
    COUNT(*) AS count
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename NOT IN ('supabase_migrations', 'schema_migrations');
