-- ============================================================
-- Migration: Add challenge column to users table
-- Purpose: Store user's selected financial challenge from onboarding
-- ============================================================

BEGIN;

ALTER TABLE IF EXISTS users
ADD COLUMN IF NOT EXISTS challenge TEXT DEFAULT 'none';

COMMIT;