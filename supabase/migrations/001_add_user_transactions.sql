-- Migration: 001_add_user_transactions.sql
-- Adds wallet transaction history for the wallet management system

CREATE TABLE IF NOT EXISTS user_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES user_wallets(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'cashback', 'refund', 'fee')),
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_transactions_owner"
  ON user_transactions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX idx_user_transactions_wallet_id ON user_transactions(wallet_id);
CREATE INDEX idx_user_transactions_created_at ON user_transactions(created_at DESC);
