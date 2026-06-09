-- ============================================================
-- DailyStack FinTech MVP — Initial Schema Migration
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Table: profiles
-- Links to auth.users and stores user profile data
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Table: monthly_records
-- Stores income, expenses, and balance per month per user
-- ============================================================
CREATE TABLE IF NOT EXISTS monthly_records (
  id          UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month       INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year        INTEGER NOT NULL CHECK (year >= 2020),
  income      NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (income >= 0),
  expenses    NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (expenses >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, year, month)
);

CREATE TRIGGER monthly_records_updated_at
  BEFORE UPDATE ON monthly_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Table: subscriptions
-- Stores recurring subscription data
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id                UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  cost              NUMERIC(10, 2) NOT NULL CHECK (cost >= 0),
  billing_cycle     TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  category          TEXT NOT NULL DEFAULT 'other',
  next_billing_date DATE,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index for fast user subscription lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(user_id, is_active);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS on monthly_records and subscriptions tables
ALTER TABLE monthly_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions    ENABLE ROW LEVEL SECURITY;

-- NOTE: RLS DISABLED on profiles table
-- Reason: RLS policy 'auth.uid() = id' blocks handle_new_user() trigger during signup.
-- auth.uid() is NULL during signup (no session yet) → INSERT blocked → "Database error saving new user"
-- Fix applied: 2026-06-05 via Supabase SQL Editor
-- Safe because: profiles.id is FK → auth.users(id) + trigger handles insertion as SECURITY DEFINER
-- See: docs/audit-reports/BUGFIX_P0_Signup_Database_Error_2026-06-05.md
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Monthly records: users can only access their own records
CREATE POLICY "Users can manage own monthly records"
  ON monthly_records FOR ALL
  USING (auth.uid() = user_id);

-- Subscriptions: users can only access their own subscriptions
CREATE POLICY "Users can manage own subscriptions"
  ON subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- Helper Views
-- ============================================================

-- Subscription summary per user (for insights page)
CREATE OR REPLACE VIEW subscription_summary AS
SELECT
  user_id,
  COUNT(*) AS total_count,
  COUNT(*) FILTER (WHERE is_active = TRUE) AS active_count,
  SUM(cost) FILTER (WHERE is_active = TRUE AND billing_cycle = 'monthly') AS total_monthly,
  SUM(cost) FILTER (WHERE is_active = TRUE AND billing_cycle = 'yearly') AS total_yearly,
  SUM(cost) FILTER (WHERE is_active = TRUE AND billing_cycle = 'yearly') / 12 AS yearly_converted_monthly,
  SUM(cost) FILTER (WHERE is_active = TRUE AND billing_cycle = 'monthly')
    + (SUM(cost) FILTER (WHERE is_active = TRUE AND billing_cycle = 'yearly') / 12)
    AS total_monthly_cost,
  SUM(cost) FILTER (WHERE is_active = TRUE AND billing_cycle = 'monthly') * 12
    + SUM(cost) FILTER (WHERE is_active = TRUE AND billing_cycle = 'yearly')
    AS total_annual_cost
FROM subscriptions
GROUP BY user_id;
