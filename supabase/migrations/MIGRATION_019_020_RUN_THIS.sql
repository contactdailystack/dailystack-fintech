-- ============================================================
-- DailyStack SSOT v3.4 - Run in Supabase SQL Editor
-- Project: DailyStack-FinTech (pexcvfhuvqrwrabpgkzi)
-- Run order: STEP 1 FIRST, then STEP 2
-- ============================================================

-- ========================
-- STEP 1: Initialize migration tracking + apply migration 019
-- ========================

-- Create migration history table if not exists (handles projects created via dashboard)
DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
    version TEXT PRIMARY KEY,
    inserted_at TIMESTAMPTZ DEFAULT NOW()
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Migration table may already exist: %', SQLERRM;
END$$;

-- Record migration 019
INSERT INTO supabase_migrations.schema_migrations (version)
VALUES ('019_rename_profiles_to_users')
ON CONFLICT (version) DO NOTHING;

-- Check current state
SELECT 'Current tables:' AS info;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'users', 'money_twin')
ORDER BY table_name;

-- ========================
-- MIGRATION 019: Rename profiles → users + SSOT columns
-- ========================

-- 1. Rename profiles → users
ALTER TABLE IF EXISTS profiles RENAME TO users;

-- 2. Rename full_name → display_name
ALTER TABLE IF EXISTS users RENAME COLUMN full_name TO display_name;

-- 3. Add SSOT columns
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'phone'::TEXT,
  ADD COLUMN IF NOT EXISTS base_currency TEXT DEFAULT 'THB'::TEXT;

-- 4. Recreate trigger function with new column names
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, display_name, auth_provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'display_name',
      ''
    ),
    'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. Update updated_at trigger
DROP TRIGGER IF EXISTS profiles_updated_at ON users;
DROP TRIGGER IF EXISTS users_updated_at ON users;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. Verify result
SELECT 'Users table schema after migration 019:' AS info;
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

SELECT 'Migration 019 COMPLETE: profiles → users, auth_provider, base_currency, display_name added'
  AS status;
