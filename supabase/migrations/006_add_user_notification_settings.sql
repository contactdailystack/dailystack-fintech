-- Migration: 006_add_user_notification_settings.sql
-- Stores push notification preferences per user

CREATE TABLE IF NOT EXISTS user_notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL
    CHECK (notification_type IN (
      'billing_reminder', 'spending_alert', 'cashback',
      'cancellation', 'newsletter'
    )),
  enabled BOOLEAN DEFAULT TRUE,
  threshold_amount NUMERIC(12, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, notification_type)
);

ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_notification_settings_owner"
  ON user_notification_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_notification_settings_user_id ON user_notification_settings(user_id);
CREATE INDEX idx_user_notification_settings_type ON user_notification_settings(notification_type);

-- Seed default notification settings for new users
-- (handled in the onboarding flow or via DB trigger)
