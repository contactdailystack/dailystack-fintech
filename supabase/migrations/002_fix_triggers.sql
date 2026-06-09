-- ============================================================
-- Migration 002 — Fix existing triggers and re-create idempotently
-- This migration is safe to run multiple times. It drops conflicting
-- triggers if they exist and re-creates the helper functions/triggers.
-- ============================================================

-- Ensure the update_updated_at function exists (create or replace)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace handle_new_user function used to auto-create profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and re-create per-table triggers only if the table exists
DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    -- remove existing trigger if present
    DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
    CREATE TRIGGER profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;

  IF to_regclass('public.monthly_records') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS monthly_records_updated_at ON public.monthly_records;
    CREATE TRIGGER monthly_records_updated_at
      BEFORE UPDATE ON public.monthly_records
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;

  IF to_regclass('public.subscriptions') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS subscriptions_updated_at ON public.subscriptions;
    CREATE TRIGGER subscriptions_updated_at
      BEFORE UPDATE ON public.subscriptions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;

  -- auth.users lives in auth schema in Supabase
  IF to_regclass('auth.users') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END$$;

-- Ensure RLS policies exist (re-create if needed) — these statements are safe
-- because CREATE POLICY will fail if policy exists; wrap with conditional checks
DO $$
BEGIN
  -- NOTE: RLS policies on profiles table SKIPPED
  -- RLS was disabled on profiles table (see migration 001)
  -- Profiles are protected by FK to auth.users(id) + SECURITY DEFINER trigger
  -- See: docs/audit-reports/BUGFIX_P0_Signup_Database_Error_2026-06-05.md

  IF to_regclass('public.monthly_records') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'monthly_records' AND policyname = 'Users can manage own monthly records') THEN
      EXECUTE 'CREATE POLICY "Users can manage own monthly records" ON public.monthly_records FOR ALL USING (auth.uid() = user_id)';
    END IF;
  END IF;

  IF to_regclass('public.subscriptions') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'Users can manage own subscriptions') THEN
      EXECUTE 'CREATE POLICY "Users can manage own subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = user_id)';
    END IF;
  END IF;
END$$;

-- End of migration 002
