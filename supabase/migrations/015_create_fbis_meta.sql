-- Layer 9: Transformation — FBIS Meta & Streaks
CREATE TABLE IF NOT EXISTS public.fbis_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_score INTEGER DEFAULT 1000,
  streak_days INTEGER DEFAULT 0,
  last_recorded_at TIMESTAMPTZ,
  xp_multiplier NUMERIC(3,2) DEFAULT 1.0,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.fbis_meta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fbis_meta_self" ON public.fbis_meta FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
