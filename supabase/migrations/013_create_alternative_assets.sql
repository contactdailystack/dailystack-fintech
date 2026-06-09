-- Layer 2: Alternative Assets (Gold, Mutual Funds, Bonds, Crypto)
CREATE TABLE IF NOT EXISTS public.alternative_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('gold', 'mutual_fund', 'bond', 'crypto', 'other')),
  current_value NUMERIC(14,2),
  currency TEXT DEFAULT 'THB',
  purchase_price NUMERIC(14,2),
  purchase_date DATE,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.alternative_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alt_assets_self" ON public.alternative_assets FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
