-- ============================================================
-- DailyStack FinTech — Atomic Activation Stored Procedure
-- Migration: 011_add_process_activation_proc.sql
-- Run after: 001_initial_schema.sql
-- ============================================================

CREATE OR REPLACE FUNCTION process_activation(
  p_payment_request_id UUID,
  p_transaction_id     TEXT,
  p_user_id            UUID,
  p_subscription_id    UUID,
  p_amount             NUMERIC,
  p_activated_by       TEXT DEFAULT 'system'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_activation_id UUID;
  v_existing      RECORD;
BEGIN
  -- Idempotency: skip if this transaction_id was already activated
  SELECT id, transaction_id INTO v_existing
  FROM activations
  WHERE transaction_id = p_transaction_id
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'status',          'duplicate',
      'message',         'Transaction already activated',
      'activation_id',   v_existing.id,
      'transaction_id',  v_existing.transaction_id
    );
  END IF;

  -- Insert activation record
  INSERT INTO activations (
    payment_request_id,
    transaction_id,
    user_id,
    subscription_id,
    amount,
    status,
    activated_by
  ) VALUES (
    p_payment_request_id,
    p_transaction_id,
    p_user_id,
    p_subscription_id,
    p_amount,
    'active',
    p_activated_by
  )
  RETURNING id INTO v_activation_id;

  -- Audit log entry
  INSERT INTO activation_audit_log (
    activation_id,
    action,
    performed_by,
    metadata
  ) VALUES (
    v_activation_id,
    'activated',
    p_activated_by,
    jsonb_build_object(
      'transaction_id',  p_transaction_id,
      'amount',           p_amount,
      'subscription_id', p_subscription_id
    )
  );

  RETURN jsonb_build_object(
    'status',        'ok',
    'activation_id', v_activation_id,
    'message',       'Activation completed'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'status',  'error',
      'message', SQLERRM
    );
END;
$$;
