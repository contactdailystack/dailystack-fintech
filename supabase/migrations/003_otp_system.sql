-- Migration 003: OTP Email Verification System
CREATE TABLE IF NOT EXISTS otp_requests (
  id              UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  otp_code        TEXT NOT NULL,
  otp_type        TEXT NOT NULL DEFAULT 'email_verification',
  expires_at      TIMESTAMPTZ NOT NULL,
  attempts        INTEGER NOT NULL DEFAULT 0,
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_user_id ON otp_requests(user_id);

CREATE TABLE IF NOT EXISTS pending_signups (
  id              UUID NOT NULL DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  full_name       TEXT NOT NULL,
  password_hash   TEXT NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE otp_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access otp_requests"
  ON otp_requests FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access pending_signups"
  ON pending_signups FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
