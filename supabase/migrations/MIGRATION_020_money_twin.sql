-- ============================================================
-- DailyStack SSOT v3.4 - STEP 2: money_twin table
-- Run AFTER MIGRATION 019 (step 1) in the same SQL Editor session
-- ============================================================

-- Record migration 020
INSERT INTO supabase_migrations.schema_migrations (version)
VALUES ('020_create_money_twin')
ON CONFLICT (version) DO NOTHING;

-- ========================
-- MIGRATION 020: money_twin table
-- ========================

-- 1. Create money_twin table
CREATE TABLE IF NOT EXISTS public.money_twin (
  id                        UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                   UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identity & versioning
  twin_version              INTEGER       NOT NULL DEFAULT 1,
  twin_label                TEXT          DEFAULT 'Primary Twin',
  is_active                 BOOLEAN       DEFAULT TRUE,

  -- Spending twin data
  spending_archetype        TEXT,
  avg_monthly_spend         NUMERIC(12,2),
  avg_monthly_income        NUMERIC(12,2),
  avg_monthly_savings_rate  NUMERIC(5,2),
  savings_rate_trend        TEXT,

  -- Category spending ratios
  category_ratios           JSONB        DEFAULT '{}',

  -- Behavioral signals
  impulse_buy_frequency     INTEGER       DEFAULT 0,
  subscription_count        INTEGER       DEFAULT 0,
  avg_transaction_size      NUMERIC(10,2),
  largest_expense_category  TEXT,

  -- Financial health scores (0-100)
  financial_health_score   NUMERIC(3,0),
  budget_adherence_score    NUMERIC(3,0),
  savings_discipline_score  NUMERIC(3,0),

  -- Risk profile
  risk_tolerance            TEXT          DEFAULT 'moderate',
  investment_readiness      NUMERIC(3,0),

  -- AI outputs
  twin_insights             JSONB        DEFAULT '[]',
  twin_recommendations      JSONB        DEFAULT '[]',
  simulation_snapshots      JSONB        DEFAULT '[]',

  -- Timestamps
  created_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  last_sync_at              TIMESTAMPTZ,

  -- Metadata
  data_sources              TEXT[]       DEFAULT ARRAY[]::TEXT[],
  confidence_score          NUMERIC(3,0) DEFAULT 50,
  training_sample_size      INTEGER      DEFAULT 0
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
DROP TRIGGER IF EXISTS money_twin_updated_at ON public.money_twin;
CREATE TRIGGER money_twin_updated_at
  BEFORE UPDATE ON public.money_twin
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_money_twin_user_id
  ON public.money_twin(user_id);
CREATE INDEX IF NOT EXISTS idx_money_twin_active
  ON public.money_twin(user_id, is_active)
  WHERE is_active = TRUE;

-- 5. Grant access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.money_twin TO authenticated;
GRANT ALL ON public.money_twin TO service_role;

-- 6. Verify
SELECT 'Money twin table created:' AS info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'money_twin'
ORDER BY ordinal_position;

SELECT 'Migration 020 COMPLETE: money_twin table created' AS status;
