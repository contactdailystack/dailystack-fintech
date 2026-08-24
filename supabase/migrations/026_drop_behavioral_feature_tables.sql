-- Migration 026: Remove deprecated behavioral feature tables
-- Drops: alternative_assets (Alternative Assets feature)
--        emotional_context  (Emotion tracking on transactions)
--        fbis_meta          (Financial Behavior Intelligence Score)
--        money_twin         (Money Twin persona engine)
-- Also removes the unused `emotion` column from subscriptions.

-- Drop dependent objects first (guarded — tables may not exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'money_twin') THEN
    DROP TRIGGER IF EXISTS money_twin_updated_at ON public.money_twin;
    DROP POLICY IF EXISTS "Users manage own money twin" ON public.money_twin;
  END IF;
END $$;

DROP TABLE IF EXISTS public.money_twin CASCADE;
DROP TABLE IF EXISTS public.fbis_meta CASCADE;
DROP TABLE IF EXISTS public.emotional_context CASCADE;
DROP TABLE IF EXISTS public.alternative_assets CASCADE;

ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS emotion;
