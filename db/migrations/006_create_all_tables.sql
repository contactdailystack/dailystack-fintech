-- Migration: create all canonical tables for DailyStack
-- Run this in Supabase SQL editor. Backup production data first.

-- Ensure UUID helper
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) user_settings (includes RLS policy + updated_at trigger)
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id uuid PRIMARY KEY,
  notif_threshold integer DEFAULT 3,
  urgent_badge_days integer DEFAULT 7,
  push_subscription jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policy only if missing (Postgres has no CREATE POLICY IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_settings'
      AND policyname = 'Users can upsert their settings'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Users can upsert their settings" ON public.user_settings
        FOR ALL USING (auth.role() = 'authenticated' AND user_id = auth.uid())
        WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());
    $p$;
  END IF;
END $$;

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

-- 2) subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  provider text,
  category text,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'THB',
  billing_interval text DEFAULT 'monthly',
  billing_day int,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- 3) subscription_templates
CREATE TABLE IF NOT EXISTS public.subscription_templates (
  id serial PRIMARY KEY,
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  default_amount numeric(10,2) DEFAULT 0,
  category text,
  created_at timestamptz DEFAULT now()
);

-- 4) user_events
CREATE TABLE IF NOT EXISTS public.user_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_name text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  platform text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON public.user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_event_name ON public.user_events(event_name);
CREATE INDEX IF NOT EXISTS idx_user_events_created_at ON public.user_events(created_at);

-- 5) cancellation_progress (composite PK for upsert on user+subscription)
CREATE TABLE IF NOT EXISTS public.cancellation_progress (
  user_id uuid NOT NULL,
  subscription_id uuid NOT NULL,
  current_step integer DEFAULT 1,
  completed boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, subscription_id)
);

CREATE INDEX IF NOT EXISTS idx_cancellation_progress_user_id ON public.cancellation_progress(user_id);

-- 6) cancellation_documents
CREATE TABLE IF NOT EXISTS public.cancellation_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subscription_id uuid,
  file_url text NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cancellation_documents_user_id ON public.cancellation_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_documents_subscription_id ON public.cancellation_documents(subscription_id);

-- End of migration
