-- Add emotion column to subscriptions table to track emotional motivations
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS emotion TEXT DEFAULT NULL;
