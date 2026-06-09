-- Migration: 002_add_user_memberships.sql
-- Tracks subscription plan tiers and benefits

CREATE TABLE IF NOT EXISTS user_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  plan_name TEXT NOT NULL DEFAULT '',
  tier TEXT,
  benefits_json JSONB DEFAULT '[]',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_memberships_owner"
  ON user_memberships
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_memberships_user_id ON user_memberships(user_id);
CREATE INDEX idx_user_memberships_subscription_id ON user_memberships(subscription_id);
