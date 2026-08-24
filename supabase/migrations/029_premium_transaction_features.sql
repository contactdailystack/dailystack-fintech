-- ============================================================
-- Migration 029 — Premium Transaction Features (Rocket Money parity)
-- 1. subscriptions.trial_end_date          → free-trial tracking (#3)
-- 2. user_transactions.note                → transaction notes (#6a)
-- 3. user_transactions.is_ignored          → ignore transactions (#6b)
-- 4. user_transactions.split_category /
--    user_transactions.split_amount        → category splits (#6d)
-- 5. transaction_rules table               → auto-categorization rules (#6c)
-- All statements idempotent (safe to re-run).
-- ============================================================

-- ── 1. Free trial tracking ──────────────────────────────────
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS trial_end_date DATE;

-- ── 2/3/4. Transaction notes, ignore flag, split fields ─────
ALTER TABLE public.user_transactions
  ADD COLUMN IF NOT EXISTS note TEXT,
  ADD COLUMN IF NOT EXISTS is_ignored BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS split_category TEXT,
  ADD COLUMN IF NOT EXISTS split_amount NUMERIC(12,2);

-- Partial index: rules lookup per user is always by user_id
CREATE INDEX IF NOT EXISTS idx_user_transactions_ignored
  ON public.user_transactions (user_id)
  WHERE is_ignored = FALSE;

-- ── 5. Auto-categorization rules ────────────────────────────
CREATE TABLE IF NOT EXISTS public.transaction_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern TEXT NOT NULL CHECK (length(pattern) BETWEEN 2 AND 100),
  category TEXT NOT NULL CHECK (length(category) BETWEEN 1 AND 50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transaction_rules_user
  ON public.transaction_rules (user_id);

ALTER TABLE public.transaction_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own rules" ON public.transaction_rules;
CREATE POLICY "Users can view own rules"
  ON public.transaction_rules FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own rules" ON public.transaction_rules;
CREATE POLICY "Users can insert own rules"
  ON public.transaction_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own rules" ON public.transaction_rules;
CREATE POLICY "Users can delete own rules"
  ON public.transaction_rules FOR DELETE
  USING (auth.uid() = user_id);
