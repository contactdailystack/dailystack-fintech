-- Migration: create subscriptions table
-- Run with supabase/migration tooling or psql as appropriate
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  provider text,
  category text,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'THB',
  billing_interval text DEFAULT 'monthly', -- 'monthly' | 'yearly' | 'one-time'
  billing_day int, -- day of month if applicable
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
