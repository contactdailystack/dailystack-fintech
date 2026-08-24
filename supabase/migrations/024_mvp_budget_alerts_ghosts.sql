-- ============================================================
-- DailyStack MVP — Database Enhancement Migration
-- Version: 1.0
-- Date: June 12, 2026
-- Purpose: Add MVP tables for budget alerts, ghost subscriptions
-- ============================================================

-- Run in Supabase Dashboard > SQL Editor

-- ============================================================
-- PART 1: Budget Alerts Table
-- Purpose: Budget Guardian — proactive spending warnings
-- ============================================================

CREATE TABLE IF NOT EXISTS public.budget_alerts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_name     TEXT NOT NULL,
  alert_type        TEXT NOT NULL CHECK (alert_type IN ('warning', 'danger', 'milestone')),
  threshold_amount  NUMERIC(12,2),
  current_spent     NUMERIC(12,2),
  percentage_used   NUMERIC(5,2) DEFAULT 0,
  message           TEXT,
  is_read           BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_budget_alerts_user_id ON budget_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_is_read ON budget_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_created_at ON budget_alerts(created_at DESC);

-- RLS: Users can only see their own alerts
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "budget_alerts_users_can_read_own" ON budget_alerts;
CREATE POLICY "budget_alerts_users_can_read_own" ON budget_alerts
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "budget_alerts_users_can_insert_own" ON budget_alerts;
CREATE POLICY "budget_alerts_users_can_insert_own" ON budget_alerts
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "budget_alerts_users_can_update_own" ON budget_alerts;
CREATE POLICY "budget_alerts_users_can_update_own" ON budget_alerts
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "budget_alerts_users_can_delete_own" ON budget_alerts;
CREATE POLICY "budget_alerts_users_can_delete_own" ON budget_alerts
  FOR DELETE USING (user_id = auth.uid());

-- Service role can manage all (for Edge Functions)
DROP POLICY IF EXISTS "budget_alerts_service_role" ON budget_alerts;
CREATE POLICY "budget_alerts_service_role" ON budget_alerts
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- PART 2: Ghost Subscriptions Table
-- Purpose: Detected forgotten subscriptions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ghost_subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  detected_name     TEXT NOT NULL,
  estimated_cost    NUMERIC(10,2) NOT NULL,
  confidence_score  FLOAT DEFAULT 0.5 CHECK (confidence_score BETWEEN 0 AND 1),
  status            TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'dismissed')),
  billing_cycle     TEXT DEFAULT 'monthly'
                    CHECK (billing_cycle IN ('monthly', 'yearly', 'weekly')),
  category          TEXT DEFAULT 'other',
  suggested_action  TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  resolved_at       TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ghost_subs_user_id ON ghost_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_ghost_subs_status ON ghost_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_ghost_subs_created_at ON ghost_subscriptions(created_at DESC);

-- RLS: Users can only see their own ghost detections
ALTER TABLE ghost_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ghost_subs_users_can_read_own" ON ghost_subscriptions;
CREATE POLICY "ghost_subs_users_can_read_own" ON ghost_subscriptions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "ghost_subs_users_can_insert_own" ON ghost_subscriptions;
CREATE POLICY "ghost_subs_users_can_insert_own" ON ghost_subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "ghost_subs_users_can_update_own" ON ghost_subscriptions;
CREATE POLICY "ghost_subs_users_can_update_own" ON ghost_subscriptions
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "ghost_subs_users_can_delete_own" ON ghost_subscriptions;
CREATE POLICY "ghost_subs_users_can_delete_own" ON ghost_subscriptions
  FOR DELETE USING (user_id = auth.uid());

-- Service role can manage all (for Edge Functions)
DROP POLICY IF EXISTS "ghost_subs_service_role" ON ghost_subscriptions;
CREATE POLICY "ghost_subs_service_role" ON ghost_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- PART 3: Trigger — Auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to budget_alerts
DROP TRIGGER IF EXISTS update_budget_alerts_updated_at ON budget_alerts;
CREATE TRIGGER update_budget_alerts_updated_at
  BEFORE UPDATE ON budget_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Apply to ghost_subscriptions
DROP TRIGGER IF EXISTS update_ghost_subs_updated_at ON ghost_subscriptions;
CREATE TRIGGER update_ghost_subs_updated_at
  BEFORE UPDATE ON ghost_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- PART 4: Default Budget Categories Seed
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_default_budget_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO budget_categories (user_id, category_name, monthly_limit, color_code, icon_name, sort_order)
  VALUES
    (NEW.id, 'Food & Dining', 5000, '#F97316', 'UtensilsCrossed', 1),
    (NEW.id, 'Transport', 3000, '#3B82F6', 'Car', 2),
    (NEW.id, 'Shopping', 4000, '#CCFF00', 'ShoppingBag', 3),
    (NEW.id, 'Entertainment', 2000, '#8B5CF6', 'Tv', 4),
    (NEW.id, 'Bills & Utilities', 5000, '#F97316', 'Zap', 5),
    (NEW.id, 'Health', 2000, '#4CAF50', 'Heart', 6),
    (NEW.id, 'Other', 3000, '#9CA3AF', 'MoreHorizontal', 7)
  ON CONFLICT (user_id, category_name) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created_budget_categories ON auth.users;
CREATE TRIGGER on_auth_user_created_budget_categories
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_budget_categories();

-- ============================================================
-- PART 5: Verify RLS Coverage
-- ============================================================

-- Check all tables have RLS enabled
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected: All DailyStack tables should have rowsecurity = true

-- ============================================================
-- Migration Complete
-- Run this in Supabase > SQL Editor
-- ============================================================
