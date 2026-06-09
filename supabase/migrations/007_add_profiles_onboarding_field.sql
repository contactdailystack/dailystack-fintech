-- Migration: 007_add_profiles_onboarding_field.sql
-- Adds onboarding completion tracking to the existing profiles table

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.onboarding_completed_at IS
  'Timestamp when user completed the onboarding wizard. NULL = not completed.';
