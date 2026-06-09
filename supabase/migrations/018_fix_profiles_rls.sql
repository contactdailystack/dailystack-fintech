-- ============================================================
-- Migration: 018_fix_profiles_rls.sql
-- Fix P0 Constitution Gap: Enable RLS on profiles table
--
-- Problem: profiles table has RLS disabled, exposing all user
-- data without authentication. Any anon key bearer can read
-- any user's email and profile information.
--
-- Solution: Re-enable RLS with proper policies.
-- The handle_new_user() trigger uses SECURITY DEFINER which
-- bypasses RLS, so user creation still works.
-- ============================================================

BEGIN;

-- Step 1: Re-enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Create secure RLS policies for profiles
-- Users can only read their own profile
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own profile
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can only insert their own profile (via trigger)
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Service role can do everything (for admin operations)
DROP POLICY IF EXISTS "service_role_profiles_full_access" ON public.profiles;
CREATE POLICY "service_role_profiles_full_access"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 3: Verify handle_new_user trigger still works
-- The SECURITY DEFINER function should bypass RLS when called
-- as the trigger (runs as function owner, not calling user)
-- This is already set correctly in migration 002/003

-- Step 4: Grant necessary permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

COMMIT;

-- ============================================================
-- Verification query (run after applying):
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public' AND tablename = 'profiles';
-- Expected: rowsecurity = true
-- ============================================================
