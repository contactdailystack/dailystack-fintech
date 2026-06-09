-- Layer 4: Financial Behavioral Baseline
CREATE TABLE IF NOT EXISTS public.user_financial_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_financial_goal TEXT,
  behavioral_archetype TEXT,
  current_fbis_score INTEGER DEFAULT 1000,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_financial_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_fp_self" ON public.user_financial_profiles FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
