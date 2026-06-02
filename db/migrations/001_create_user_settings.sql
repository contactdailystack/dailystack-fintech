-- Migration: create user_settings table for storing per-user preferences and push subscriptions
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id uuid PRIMARY KEY,
  notif_threshold integer DEFAULT 3,
  urgent_badge_days integer DEFAULT 7,
  push_subscription jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert/update their own settings
CREATE POLICY "Users can upsert their settings" ON public.user_settings
  FOR ALL USING (auth.role() = 'authenticated' AND user_id = auth.uid())
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER tr_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW EXECUTE FUNCTION public.user_settings_updated_at();

-- Notes:
-- Run this SQL in your Supabase SQL editor or psql. Ensure RLS is enabled and policies match your auth setup.
