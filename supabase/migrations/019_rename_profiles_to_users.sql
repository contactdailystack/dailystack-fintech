-- ============================================================
-- DailyStack SSOT v3.4 Migration 019: Rename profiles → users
-- + Add SSOT-compliant columns
-- Run in Supabase Dashboard > SQL Editor (all at once)
-- ============================================================

-- 0. Pre-flight check
SELECT 'Starting migration 019: profiles → users rename + SSOT columns'
  AS status;

-- 1. Rename profiles → users (SSOT table name)
ALTER TABLE IF EXISTS profiles
  RENAME TO users;

-- 2. Rename full_name → display_name (SSOT column name)
ALTER TABLE IF EXISTS users
  RENAME COLUMN full_name TO display_name;

-- 3. Add SSOT columns
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'phone'::TEXT,
  ADD COLUMN IF NOT EXISTS base_currency TEXT DEFAULT 'THB'::TEXT;

-- 4. Update handle_new_user trigger to use new column names
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, display_name, auth_provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', ''),
    'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. Update updated_at trigger to use new table name
DROP TRIGGER IF EXISTS profiles_updated_at ON users;
DROP TRIGGER IF EXISTS users_updated_at ON users;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. Verify schema
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

SELECT 'Migration 019 complete: profiles → users' AS status;
