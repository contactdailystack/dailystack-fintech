-- Clean up orphaned RLS policies on profiles table
-- These policies exist but RLS is disabled, creating confusion
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
-- Keep "Users can manage own profile" (already correct)
