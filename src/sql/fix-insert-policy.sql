-- =====================================================
-- Fix: Add INSERT policy for users table
-- This allows the handle_new_user trigger to insert records
-- =====================================================

-- Drop existing insert policy if exists
DROP POLICY IF EXISTS "Users can insert via trigger" ON public.users;

-- Add INSERT policy to allow trigger insertion
CREATE POLICY "Users can insert via trigger" ON public.users 
    FOR INSERT WITH CHECK (true);

-- Also ensure discovery_profiles and user_match_limits have proper insert policies
DROP POLICY IF EXISTS "Users can insert discovery via trigger" ON public.discovery_profiles;
CREATE POLICY "Users can insert discovery via trigger" ON public.discovery_profiles 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert limits via trigger" ON public.user_match_limits;
CREATE POLICY "Users can insert limits via trigger" ON public.user_match_limits 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
