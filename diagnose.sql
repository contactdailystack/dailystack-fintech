-- Diagnostic queries to run in Supabase SQL Editor
-- Run all 4 and paste results back here

-- 1. Check what tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- 2. Check if the trigger exists on auth.users
SELECT tgname, proname, pronargs, pronargtypes
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE nspname = 'pg_catalog' OR nspname = 'public'
ORDER BY tgname;

-- 3. Check auth.users for any duplicate emails (may cause 500)
SELECT email, COUNT(*) as cnt
FROM auth.users
GROUP BY email
HAVING COUNT(*) > 1;

-- 4. Check how many users exist
SELECT COUNT(*) as user_count FROM auth.users;
