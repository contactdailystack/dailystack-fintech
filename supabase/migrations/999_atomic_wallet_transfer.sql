-- P2-04: Atomic wallet transfer — prevents race conditions on concurrent transfers
-- Adds decrement_wallet_balance() function with row-level locking (FOR UPDATE)
-- and transfer_funds() function for atomic wallet-to-wallet transfers.
--
-- Deploy: supabase db push
-- Or run manually in Supabase Dashboard SQL editor
--
-- Tests:
--   1. 50 concurrent transfers of 10 THB from 100 THB wallet → exactly 10 succeed
--   2. Balance ends at 0, never negative
--   3. Each failed transfer returns 'Insufficient balance'

-- ══════════════════════════════════════════════════════════════
-- decrement_wallet_balance(p_user_id, p_amount)
-- Returns: new balance after decrement
-- Throws:  'Wallet not found'
--           'Insufficient balance'
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION decrement_wallet_balance(p_user_id UUID, p_amount NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance NUMERIC;
  new_balance    NUMERIC;
BEGIN
  -- Lock the row for update to prevent concurrent modifications
  SELECT balance INTO current_balance
  FROM user_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user_id: %', p_user_id;
  END IF;

  IF current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance: have % THB, need % THB', current_balance, p_amount;
  END IF;

  new_balance := current_balance - p_amount;

  UPDATE user_wallets
  SET balance = new_balance, updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN new_balance;
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- transfer_funds(p_from_user_id, p_to_user_id, p_amount, p_description)
-- Returns: JSON { success, transaction_id, error }
-- Both users must have wallets.
-- Uses FOR UPDATE on both rows in consistent order (by user_id) to prevent deadlocks.
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION transfer_funds(
  p_from_user_id  UUID,
  p_to_user_id    UUID,
  p_amount        NUMERIC,
  p_description   TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  from_balance_after NUMERIC;
  tx_id             UUID;
BEGIN
  IF p_from_user_id = p_to_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot transfer to yourself');
  END IF;

  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;

  -- Lock rows in consistent order by user_id to prevent deadlocks
  IF p_from_user_id < p_to_user_id THEN
    PERFORM (SELECT balance FROM user_wallets WHERE user_id = p_from_user_id FOR UPDATE);
    PERFORM (SELECT balance FROM user_wallets WHERE user_id = p_to_user_id FOR UPDATE);
  ELSE
    PERFORM (SELECT balance FROM user_wallets WHERE user_id = p_to_user_id FOR UPDATE);
    PERFORM (SELECT balance FROM user_wallets WHERE user_id = p_from_user_id FOR UPDATE);
  END IF;

  -- Deduct from sender
  from_balance_after := decrement_wallet_balance(p_from_user_id, p_amount);

  -- Credit recipient (add, no locking needed since we already hold to_user_id lock)
  UPDATE user_wallets
  SET balance = balance + p_amount, updated_at = NOW()
  WHERE user_id = p_to_user_id;

  -- Record sender's transaction (debit)
  INSERT INTO user_transactions (user_id, type, amount, description, reference_id, created_at)
  VALUES (p_from_user_id, 'debit', p_amount, COALESCE(p_description, 'Wallet transfer'), p_to_user_id, NOW())
  RETURNING id INTO tx_id;

  -- Record recipient's transaction (credit)
  INSERT INTO user_transactions (user_id, type, amount, description, reference_id, created_at)
  VALUES (p_to_user_id, 'credit', p_amount, COALESCE(p_description, 'Wallet transfer'), p_from_user_id, NOW());

  RETURN json_build_object(
    'success', true,
    'transaction_id', tx_id,
    'new_balance', from_balance_after
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

COMMENT ON FUNCTION decrement_wallet_balance IS
  'Atomically decrements wallet balance with row-level locking. Throws if wallet missing or insufficient funds.';
COMMENT ON FUNCTION transfer_funds IS
  'Atomically transfers funds between two wallets. Uses row-level locking to prevent race conditions.';
