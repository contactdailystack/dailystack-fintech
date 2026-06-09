$headers = @{
    'Authorization' = 'Bearer [SUPABASE_TOKEN]'
    'Content-Type' = 'application/json'
}
$uri = 'https://api.supabase.com/v1/projects/pexcvfhuvqrwrabpgkzi/database/query'

function Invoke-Migration {
    param($name, $sql)
    Write-Host "`n=== Applying: $name ===" -ForegroundColor Cyan
    $body = @{ query = $sql } | ConvertTo-Json -Compress
    try {
        $result = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body -ContentType 'application/json' -TimeoutSec 30
        Write-Host "SUCCESS: $name" -ForegroundColor Green
        if ($result -and $result.Count -eq 0) { Write-Host "  (no rows returned - OK)" }
        else { Write-Host "  Result: $($result | ConvertTo-Json -Compress)" }
    } catch {
        $err = $_.Exception.Message
        if ($err -match "already exists" -or $err -match "duplicate key" -or $err -match "42P07" -or $err -match "42710") {
            Write-Host "SKIPPED (already exists): $name" -ForegroundColor Yellow
        } else {
            Write-Host "ERROR: $err" -ForegroundColor Red
        }
    }
}

# ─── MIGRATION 017: user_subscriptions + user_security + user_preferences ───────
$m017 = @"
BEGIN;

-- user_subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('basic', 'pro', 'elite')),
  plan_name       TEXT NOT NULL,
  plan_type       TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly', 'founder_monthly', 'founder_yearly')),
  price_thb       NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price_thb >= 0),
  currency        TEXT NOT NULL DEFAULT 'THB',
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'trialing')),
  started_at      TIMESTAMPTZ DEFAULT now(),
  expires_at      TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  auto_renew      BOOLEAN DEFAULT TRUE,
  metadata_json   JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_subscriptions_self" ON public.user_subscriptions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON public.user_subscriptions(user_id, subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(user_id, status);

-- user_security
CREATE TABLE IF NOT EXISTS public.user_security (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  pin_hash         TEXT,
  pin_attempts     INTEGER DEFAULT 0,
  pin_locked_until TIMESTAMPTZ,
  biometric_enabled BOOLEAN DEFAULT FALSE,
  biometric_type   TEXT CHECK (biometric_type IN ('fingerprint', 'face', 'iris', NULL)),
  two_fa_enabled   BOOLEAN DEFAULT FALSE,
  two_fa_method    TEXT CHECK (two_fa_method IN ('totp', 'sms', 'email', NULL)),
  last_login_at    TIMESTAMPTZ,
  last_login_ip   INET,
  updated_at       TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_security_self" ON public.user_security FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_user_security_user_id ON public.user_security(user_id);

-- user_preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  language_app         TEXT NOT NULL DEFAULT 'th' CHECK (language_app IN ('th', 'en')),
  theme_mode           TEXT NOT NULL DEFAULT 'dark' CHECK (theme_mode IN ('dark', 'light', 'system')),
  ai_coach_persona     TEXT NOT NULL DEFAULT 'supportive' CHECK (ai_coach_persona IN ('strict', 'supportive', 'analytical')),
  ai_coach_name        TEXT,
  notifications_push    BOOLEAN DEFAULT TRUE,
  notifications_email  BOOLEAN DEFAULT FALSE,
  budget_alerts_enabled BOOLEAN DEFAULT TRUE,
  weekly_report_enabled BOOLEAN DEFAULT TRUE,
  currency_display     TEXT DEFAULT 'THB' CHECK (currency_display IN ('THB', 'USD', 'EUR')),
  timezone             TEXT DEFAULT 'Asia/Bangkok',
  updated_at           TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_preferences_self" ON public.user_preferences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.constitution_update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

-- triggers
DROP TRIGGER IF EXISTS user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION constitution_update_updated_at();
DROP TRIGGER IF EXISTS user_security_updated_at ON public.user_security;
CREATE TRIGGER user_security_updated_at BEFORE UPDATE ON public.user_security FOR EACH ROW EXECUTE FUNCTION constitution_update_updated_at();
DROP TRIGGER IF EXISTS user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION constitution_update_updated_at();

-- auto-create on new user signup
CREATE OR REPLACE FUNCTION handle_new_user_constitution()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_security (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_preferences (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_created_constitution ON auth.users;
CREATE TRIGGER on_auth_user_created_constitution AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user_constitution();

COMMIT;
"@

Invoke-Migration "017: user_subscriptions + user_security + user_preferences" $m017

# ─── MIGRATION 011: alert_preferences (alert_rules + behavioral_alerts already exist) ───
$m011 = @"
BEGIN;

-- alert_preferences (alert_rules + behavioral_alerts already created by prior agent)
CREATE TABLE IF NOT EXISTS public.alert_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    alerts_enabled BOOLEAN NOT NULL DEFAULT true,
    quiet_mode BOOLEAN NOT NULL DEFAULT false,
    quiet_hours JSONB NOT NULL DEFAULT '{"start": "22:00", "end": "08:00"}'::jsonb,
    channels JSONB NOT NULL DEFAULT '{
        "in_app": {"enabled": true, "frequency": "immediate"},
        "push": {"enabled": true, "frequency": "immediate"},
        "email": {"enabled": true, "frequency": "daily_digest"},
        "sms": {"enabled": false, "frequency": "immediate"}
    }'::jsonb,
    categories JSONB NOT NULL DEFAULT '{
        "impulse": {"enabled": true, "minSeverity": "warning", "channels": ["in_app", "push"]},
        "budget": {"enabled": true, "minSeverity": "alert", "channels": ["in_app", "push", "email"]},
        "habit": {"enabled": true, "minSeverity": "warning", "channels": ["in_app"]},
        "savings": {"enabled": true, "minSeverity": "alert", "channels": ["in_app", "email"]},
        "emotional": {"enabled": true, "minSeverity": "alert", "channels": ["in_app", "push"]},
        "pattern": {"enabled": true, "minSeverity": "warning", "channels": ["in_app"]},
        "milestone": {"enabled": true, "minSeverity": "info", "channels": ["in_app", "push"]},
        "security": {"enabled": true, "minSeverity": "critical", "channels": ["in_app", "push", "email", "sms"]}
    }'::jsonb,
    adaptive_thresholds BOOLEAN NOT NULL DEFAULT true,
    smart_timing BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.alert_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alert_preferences_self" ON public.alert_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "alert_preferences_insert" ON public.alert_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "alert_preferences_update" ON public.alert_preferences FOR UPDATE USING (auth.uid() = user_id);

-- updated_at trigger for alert_preferences
CREATE OR REPLACE FUNCTION public.update_alert_prefs_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_alert_preferences_updated_at ON public.alert_preferences;
CREATE TRIGGER update_alert_preferences_updated_at BEFORE UPDATE ON public.alert_preferences FOR EACH ROW EXECUTE FUNCTION update_alert_prefs_updated_at();

COMMIT;
"@

Invoke-Migration "011: alert_preferences" $m011

# ─── MIGRATION 021: ai_coaching_sessions ─────────────────────────────────────
$m021 = @"
BEGIN;

CREATE TABLE IF NOT EXISTS public.ai_coaching_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type    TEXT NOT NULL DEFAULT 'chat'
                    CHECK (session_type IN ('chat', 'insight', 'review', 'goal', 'budget', 'simulation')),
    persona         TEXT NOT NULL DEFAULT 'supportive'
                    CHECK (persona IN ('strict', 'supportive', 'analytical')),
    title           TEXT,
    summary         TEXT,
    duration_seconds INTEGER,
    messages_count  INTEGER DEFAULT 0,
    fbis_score_at_start INTEGER,
    fbis_score_at_end   INTEGER,
    sentiment_score NUMERIC(5,3),
    topics          TEXT[] DEFAULT ARRAY[]::text[],
    recommendations JSONB DEFAULT '[]'::jsonb,
    rating          INTEGER CHECK (rating >= 1 AND rating <= 5),
    completed       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    ended_at        TIMESTAMPTZ
);

ALTER TABLE public.ai_coaching_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_coaching_sessions_self"
    ON public.ai_coaching_sessions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ai_coaching_sessions_user_id
    ON public.ai_coaching_sessions(user_id);
CREATE INDEX idx_ai_coaching_sessions_created_at
    ON public.ai_coaching_sessions(user_id, created_at DESC);
CREATE INDEX idx_ai_coaching_sessions_session_type
    ON public.ai_coaching_sessions(user_id, session_type);

COMMIT;
"@

Invoke-Migration "021: ai_coaching_sessions" $m021

# ─── Verify All Tables Now Exist ───────────────────────────────────────────────
Write-Host "`n=== VERIFICATION ===" -ForegroundColor Cyan
$tables = @('user_subscriptions', 'user_security', 'user_preferences', 'alert_preferences', 'ai_coaching_sessions')
foreach ($t in $tables) {
    $body = @{ query = "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$t'" } | ConvertTo-Json -Compress
    $result = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body -ContentType 'application/json' -TimeoutSec 15
    $exists = $result.Count -gt 0
    if ($exists) { Write-Host "  $t : EXISTS" -ForegroundColor Green }
    else { Write-Host "  $t : MISSING!" -ForegroundColor Red }
}
