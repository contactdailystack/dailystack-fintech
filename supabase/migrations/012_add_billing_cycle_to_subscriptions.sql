-- Add billing_cycle column to user_subscriptions
ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly'
CHECK (billing_cycle IN ('monthly', 'yearly', 'weekly'));
