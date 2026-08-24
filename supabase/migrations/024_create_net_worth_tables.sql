-- ============================================================
-- Net Worth Tables for Historical Tracking
-- ============================================================

-- Net Worth Accounts (Assets & Liabilities)
CREATE TABLE IF NOT EXISTS public.net_worth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  account_name_th TEXT,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset', 'liability')),
  account_category TEXT NOT NULL CHECK (account_category IN (
    'cash', 'checking', 'savings', 'investment', 'property', 'vehicle', 'crypto', 'other'
  )),
  institution TEXT,
  current_balance NUMERIC(14,2) DEFAULT 0,
  currency TEXT DEFAULT 'THB',
  icon TEXT,
  color TEXT,
  is_manual BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Net Worth Snapshots (Monthly tracking)
CREATE TABLE IF NOT EXISTS public.net_worth_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_assets NUMERIC(14,2) DEFAULT 0,
  total_liabilities NUMERIC(14,2) DEFAULT 0,
  net_worth NUMERIC(14,2) DEFAULT 0,
  currency TEXT DEFAULT 'THB',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

-- Account Snapshots (Monthly per-account tracking)
CREATE TABLE IF NOT EXISTS public.account_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.net_worth_accounts(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  balance NUMERIC(14,2) DEFAULT 0,
  currency TEXT DEFAULT 'THB',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_id, snapshot_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_net_worth_accounts_user ON public.net_worth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_net_worth_snapshots_user_date ON public.net_worth_snapshots(user_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_account_snapshots_account_date ON public.account_snapshots(account_id, snapshot_date DESC);

-- Enable RLS
ALTER TABLE public.net_worth_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.net_worth_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "net_worth_accounts_self" ON public.net_worth_accounts FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "net_worth_snapshots_self" ON public.net_worth_snapshots FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "account_snapshots_self" ON public.account_snapshots FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Function to update snapshot (can be called daily via cron)
CREATE OR REPLACE FUNCTION public.update_net_worth_snapshot(user_uuid UUID)
RETURNS void AS $$
DECLARE
  total_assets_val NUMERIC(14,2);
  total_liabilities_val NUMERIC(14,2);
  current_date_val DATE := CURRENT_DATE;
BEGIN
  -- Calculate totals from accounts
  SELECT COALESCE(SUM(CASE WHEN account_type = 'asset' THEN current_balance ELSE 0 END), 0),
         COALESCE(SUM(CASE WHEN account_type = 'liability' THEN current_balance ELSE 0 END), 0)
  INTO total_assets_val, total_liabilities_val
  FROM public.net_worth_accounts
  WHERE user_id = user_uuid AND is_active = true;

  -- Upsert monthly snapshot
  INSERT INTO public.net_worth_snapshots (user_id, snapshot_date, total_assets, total_liabilities, net_worth)
  VALUES (user_uuid, current_date_val, total_assets_val, total_liabilities_val, total_assets_val - total_liabilities_val)
  ON CONFLICT (user_id, snapshot_date) 
  DO UPDATE SET 
    total_assets = EXCLUDED.total_assets,
    total_liabilities = EXCLUDED.total_liabilities,
    net_worth = EXCLUDED.net_worth,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
