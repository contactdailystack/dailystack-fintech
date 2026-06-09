-- Check what tables exist in public schema
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check if auth.users trigger exists
SELECT tgname, tgtype, tgargs FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check if profiles table exists and has correct structure
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles' ORDER BY ordinal_position;

-- Check if handle_new_user function exists
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'handle_new_user';
