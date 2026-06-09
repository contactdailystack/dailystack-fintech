-- ============================================================
-- Migration 003 — Ensure handle_new_user() uses correct search_path
-- - schema-qualify INSERT into public.profiles
-- - set search_path to public to avoid "relation \"profiles\" does not exist" errors
-- - mark SECURITY DEFINER and idempotent
-- Safe to run multiple times
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- Recreate trigger on auth.users to ensure it calls the updated function
DO $$
BEGIN
  IF to_regclass('auth.users') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END$$;

-- End Migration 003
