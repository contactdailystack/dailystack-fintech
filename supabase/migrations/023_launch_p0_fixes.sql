-- ============================================================
-- Migration: Launch P0 Fixes — June 12, 2026
-- Project: DailyStack-FinTech (pexcvfhuvqrwrabpgkzi)
-- Purpose: Fix RLS, create missing tables, fix trigger
-- ============================================================

-- ============================================================
-- PART 1: RLS on users table (Bug 3)
-- The ALL_001_016_CONSOLIDATED creates policies on `profiles`
-- but migration 019 renames it to `users`. No policy exists.
-- This creates the missing policy.
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_self" ON users;
CREATE POLICY "users_self" ON users FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- PART 2: Create user_subscriptions table (Bug 4)
-- stripe-webhook inserts here but the table was never created.
-- Migration 012 (skipped) was supposed to create it.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier   TEXT NOT NULL DEFAULT 'basic'
                       CHECK (subscription_tier IN ('basic', 'pro', 'elite')),
  plan_name           TEXT,
  plan_type           TEXT DEFAULT 'monthly',
  price_thb           NUMERIC(10,2),
  currency            TEXT DEFAULT 'THB',
  status              TEXT DEFAULT 'active'
                       CHECK (status IN ('active', 'cancelled', 'expired')),
  expires_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_one_active_sub UNIQUE (user_id)
    -- Note: Only one active subscription per user enforced by app logic
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Service role bypass (for stripe-webhook Edge Function)
DROP POLICY IF EXISTS "user_subscriptions_service_role" ON user_subscriptions;
CREATE POLICY "user_subscriptions_service_role" ON user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- User can read their own subscriptions
DROP POLICY IF EXISTS "user_subscriptions_self" ON user_subscriptions;
CREATE POLICY "user_subscriptions_self" ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- PART 3: Fix handle_new_user trigger (Bug 6)
-- The trigger might still reference `profiles` or have wrong path.
-- Replace with clean version targeting `users` table.
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO users (id, email, display_name, auth_provider, base_currency, subscription_tier)
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- PART 4: Ensure existing users have a row (fix for users
-- who signed up during the broken period)
-- ============================================================
INSERT INTO users (id, email, display_name, auth_provider, base_currency, subscription_tier)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'display_name', ''),
  COALESCE(au.raw_user_meta_data->>'provider', 'email'),
  'THB',
  'basic'
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = au.id)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PART 5: Add missing RLS policies for dependent tables
-- ============================================================
-- user_transactions
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_transactions_owner" ON user_transactions;
CREATE POLICY "user_transactions_owner" ON user_transactions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- fbis_meta
ALTER TABLE fbis_meta ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fbis_meta_self" ON fbis_meta;
CREATE POLICY "fbis_meta_self" ON fbis_meta FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Verification
-- ============================================================
SELECT 'Tables with RLS:' AS info;
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'user_subscriptions', 'user_transactions', 'fbis_meta');

SELECT 'Trigger check:' AS info;
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';

SELECT 'Migration 023 complete: RLS + user_subscriptions + trigger fix' AS status;
