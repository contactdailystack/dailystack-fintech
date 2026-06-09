-- Fix: Disable RLS on profiles table
-- The trigger handle_new_user() needs to INSERT into profiles during signup,
-- but RLS was re-enabled by migration 008.
-- SECURITY DEFINER should bypass this, but let's be explicit.

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets DISABLE ROW LEVEL SECURITY;
