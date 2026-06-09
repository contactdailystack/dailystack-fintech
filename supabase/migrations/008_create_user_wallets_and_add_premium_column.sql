-- Migration 008: Create user_wallets and add is_premium column to profiles

-- 1. Add is_premium column to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Create user_wallets table
CREATE TABLE IF NOT EXISTS public.user_wallets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency    TEXT NOT NULL DEFAULT 'THB',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable RLS on profiles and user_wallets
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

-- 4. Re-create RLS policies
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
CREATE POLICY "Users can manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage own wallets" ON public.user_wallets;
CREATE POLICY "Users can manage own wallets" ON public.user_wallets
  FOR ALL USING (auth.uid() = user_id);
