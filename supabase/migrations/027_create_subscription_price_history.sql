-- Migration 027: Subscription price history + price-hike detection
-- Tracks every cost change on subscriptions so the app can surface
-- price hikes (Rocket-Money style) via subscription_price_history.

CREATE TABLE IF NOT EXISTS public.subscription_price_history (
  id              UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  old_cost        NUMERIC(10, 2),
  new_cost        NUMERIC(10, 2) NOT NULL,
  change_pct      NUMERIC(8, 4),
  source          TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'detected')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_sub_price_hist_sub
  ON public.subscription_price_history(subscription_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sub_price_hist_user
  ON public.subscription_price_history(user_id, created_at DESC);

ALTER TABLE public.subscription_price_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own price history" ON public.subscription_price_history;
CREATE POLICY "Users view own price history"
  ON public.subscription_price_history
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own price history" ON public.subscription_price_history;
CREATE POLICY "Users insert own price history"
  ON public.subscription_price_history
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Auto-log a history row whenever a subscription's cost changes.
CREATE OR REPLACE FUNCTION public.log_subscription_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cost IS DISTINCT FROM OLD.cost THEN
    INSERT INTO public.subscription_price_history
      (user_id, subscription_id, old_cost, new_cost, change_pct, source)
    VALUES (
      NEW.user_id,
      NEW.id,
      OLD.cost,
      NEW.cost,
      CASE WHEN OLD.cost > 0
           THEN ROUND(((NEW.cost - OLD.cost) / OLD.cost) * 100, 2)
           ELSE NULL END,
      'manual'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_subscription_price_change ON public.subscriptions;
CREATE TRIGGER trg_subscription_price_change
  AFTER UPDATE OF cost ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.log_subscription_price_change();
