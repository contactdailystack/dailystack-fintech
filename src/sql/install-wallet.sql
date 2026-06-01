-- =====================================================
-- DailyStack - Wallet System Schema Migration
-- Architecture: Supabase RLS, Double-Entry Triggers, Cascades
-- =====================================================

-- 1. WALLET ACCOUNTS
CREATE TABLE IF NOT EXISTS public.wallet_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('cash', 'bank', 'credit_card', 'investment', 'debt')) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    currency VARCHAR(10) DEFAULT 'THB' NOT NULL,
    credit_limit DECIMAL(15,2),
    interest_rate DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_accounts_user ON public.wallet_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_accounts_type ON public.wallet_accounts(type);

ALTER TABLE public.wallet_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own wallet accounts" ON public.wallet_accounts;
CREATE POLICY "Users manage own wallet accounts" ON public.wallet_accounts 
    FOR ALL USING (auth.uid() = user_id);

-- 2. WALLET TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(15,2) CHECK (amount >= 0) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('expense', 'income', 'transfer')) NOT NULL,
    from_account_id UUID REFERENCES public.wallet_accounts(id) ON DELETE SET NULL,
    to_account_id UUID REFERENCES public.wallet_accounts(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL,
    note TEXT,
    tags TEXT[] DEFAULT '{}',
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_date ON public.wallet_transactions(transaction_date DESC);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Users manage own wallet transactions" ON public.wallet_transactions 
    FOR ALL USING (auth.uid() = user_id);

-- 3. WALLET BUDGETS
CREATE TABLE IF NOT EXISTS public.wallet_budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category VARCHAR(50) NOT NULL,
    limit_amount DECIMAL(15,2) CHECK (limit_amount > 0) NOT NULL,
    period VARCHAR(20) DEFAULT 'monthly' NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, category)
);

CREATE INDEX IF NOT EXISTS idx_wallet_budgets_user ON public.wallet_budgets(user_id);

ALTER TABLE public.wallet_budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own wallet budgets" ON public.wallet_budgets;
CREATE POLICY "Users manage own wallet budgets" ON public.wallet_budgets 
    FOR ALL USING (auth.uid() = user_id);
