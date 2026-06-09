-- Migration: 005_add_onboarding_progress.sql
-- Tracks onboarding wizard state per user

CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 0,
  completed_steps INTEGER[] NOT NULL DEFAULT '{}',
  skipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "onboarding_progress_owner"
  ON onboarding_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_onboarding_progress_user_id ON onboarding_progress(user_id);
