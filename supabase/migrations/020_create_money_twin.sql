-- ============================================================
-- DailyStack SSOT v3.4 Migration 020: money_twin table
-- Purpose: AI-powered financial twin - clones & analyzes user
--          financial behavior for personalized recommendations
-- Run in Supabase Dashboard > SQL Editor (all at once)
-- ============================================================

-- 1. Create money_twin table
CREATE TABLE IF NOT EXISTS public.money_twin (
  id                        UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                   UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identity & versioning
  twin_version              INTEGER       NOT NULL DEFAULT 1,
  twin_label                TEXT          DEFAULT 'Primary Twin',
  is_active                 BOOLEAN       DEFAULT TRUE,
  
  -- Spending twin data
  spending_archetype        TEXT,                            -- e.g. 'conservative', 'balanced', 'aggressive'
  avg_monthly_spend         NUMERIC(12,2),
  avg_monthly_income        NUMERIC(12,2),
  avg_monthly_savings_rate  NUMERIC(5,2),                   -- percentage 0-100
  savings_rate_trend        TEXT,                            -- 'improving', 'stable', 'declining'
  
  -- Category spending ratios (JSON for flexibility)
  category_ratios           JSONB        DEFAULT '{}',
  -- Example: {"food": 0.30, "transport": 0.15, "entertainment": 0.10, "savings": 0.25, "other": 0.20}
  
  -- Behavioral signals
  impulse_buy_frequency     INTEGER       DEFAULT 0,        -- times per month
  subscription_count        INTEGER       DEFAULT 0,
  avg_transaction_size      NUMERIC(10,2),
  largest_expense_category  TEXT,
  
  -- Financial health scores
  financial_health_score   NUMERIC(3,0),                   -- 0-100
  budget_adherence_score    NUMERIC(3,0),                   -- 0-100
  savings_discipline_score  NUMERIC(3,0),                   -- 0-100
  
  -- Risk profile
  risk_tolerance            TEXT          DEFAULT 'moderate', -- 'conservative', 'moderate', 'aggressive'
  investment_readiness      NUMERIC(3,0),                   -- 0-100
  
  -- AI model outputs
  twin_insights             JSONB        DEFAULT '[]',      -- Array of insight objects
  twin_recommendations      JSONB        DEFAULT '[]',      -- Array of recommendation objects
  
  -- Simulation snapshots (stored ML model outputs)
  simulation_snapshots      JSONB        DEFAULT '[]',
  
  -- Timestamps
  created_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  last_sync_at              TIMESTAMPTZ,
  
  -- Metadata
  data_sources              TEXT[]       DEFAULT ARRAY[]::TEXT[],
  confidence_score          NUMERIC(3,0) DEFAULT 50,       -- How confident the twin is (0-100)
  training_sample_size      INTEGER      DEFAULT 0          -- Number of transactions used to train
);

-- 2. RLS
ALTER TABLE public.money_twin ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own money twin" ON public.money_twin;
CREATE POLICY "Users manage own money twin"
  ON public.money_twin
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Updated_at trigger
CREATE TRIGGER money_twin_updated_at
  BEFORE UPDATE ON public.money_twin
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_money_twin_user_id
  ON public.money_twin(user_id);
CREATE INDEX IF NOT EXISTS idx_money_twin_active
  ON public.money_twin(user_id, is_active)
  WHERE is_active = TRUE;

-- 5. Grant access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.money_twin TO authenticated;
GRANT ALL ON public.money_twin TO service_role;

SELECT 'Migration 020 complete: money_twin table created' AS status;
