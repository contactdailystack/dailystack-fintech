-- Migration: 003_add_cancellation_progress.sql
-- Tracks cancellation assistant state per subscription

CREATE TABLE IF NOT EXISTS cancellation_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  current_tab INTEGER DEFAULT 0,
  form_data_json JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subscription_id)
);

ALTER TABLE cancellation_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cancellation_progress_owner"
  ON cancellation_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_cancellation_progress_user_id ON cancellation_progress(user_id);
CREATE INDEX idx_cancellation_progress_subscription_id ON cancellation_progress(subscription_id);
CREATE INDEX idx_cancellation_progress_status ON cancellation_progress(status);
