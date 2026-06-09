-- ============================================================
-- Migration: 010_add_subscription_tier_to_profiles.sql
-- Add subscription_tier column to profiles table.
--
-- FIX: Removed restrictive CHECK constraint that excluded valid
-- plan values used by the app ('Premium OS', 'Premium', 'basic',
-- 'pro', 'elite'). Validation of allowed tier values is now
-- enforced at the application layer instead.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'basic';

-- Remove the too-strict CHECK that only allowed 'basic', 'pro', 'elite'.
-- The app assigns 'basic', 'pro', 'elite', 'Premium', 'Premium OS'.
-- Application-layer validation handles tier restrictions.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;
