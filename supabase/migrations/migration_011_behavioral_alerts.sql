-- ============================================
-- Behavioral Alerts System - Database Schema
-- DailyStack FinTech
-- Migration: 011_behavioral_alerts
-- ============================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Alert Rules Table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Rule Configuration
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('impulse', 'budget', 'habit', 'savings', 'emotional', 'pattern', 'milestone', 'security')),
    severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'alert', 'critical')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Trigger Configuration (JSONB for flexible trigger types)
    triggers JSONB NOT NULL DEFAULT '[]'::jsonb,
    conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
    conditions_logic TEXT NOT NULL DEFAULT 'AND' CHECK (conditions_logic IN ('AND', 'OR')),
    
    -- Notification Settings
    channels TEXT[] NOT NULL DEFAULT ARRAY['in_app'],
    timing TEXT NOT NULL DEFAULT 'immediate' CHECK (timing IN ('immediate', 'hourly_digest', 'daily_digest')),
    quiet_hours JSONB,
    
    -- Cooldown & Limits
    cooldown_minutes INTEGER NOT NULL DEFAULT 60,
    max_per_day INTEGER NOT NULL DEFAULT 5,
    snooze_until TIMESTAMPTZ,
    
    -- Behavior
    enabled BOOLEAN NOT NULL DEFAULT true,
    auto_resolve BOOLEAN NOT NULL DEFAULT true,
    show_in_feed BOOLEAN NOT NULL DEFAULT true,
    thresholds JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_alert_rules_user_id ON public.alert_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_category ON public.alert_rules(category);
CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON public.alert_rules(enabled);

-- ─── Behavioral Alerts Table ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.behavioral_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES public.alert_rules(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Alert Content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('impulse', 'budget', 'habit', 'savings', 'emotional', 'pattern', 'milestone', 'security')),
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'alert', 'critical')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Context Data (JSONB for flexible storage)
    trigger_data JSONB DEFAULT '{}'::jsonb,
    transactions JSONB,
    metric_values JSONB,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    
    -- Delivery Tracking
    delivered_to TEXT[] DEFAULT ARRAY[]::text[],
    delivery_status JSONB DEFAULT '{}'::jsonb,
    
    -- Analytics
    viewed BOOLEAN NOT NULL DEFAULT false,
    view_count INTEGER NOT NULL DEFAULT 0,
    action_taken TEXT
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_behavioral_alerts_user_id ON public.behavioral_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_alerts_status ON public.behavioral_alerts(status);
CREATE INDEX IF NOT EXISTS idx_behavioral_alerts_category ON public.behavioral_alerts(category);
CREATE INDEX IF NOT EXISTS idx_behavioral_alerts_severity ON public.behavioral_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_behavioral_alerts_created_at ON public.behavioral_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_behavioral_alerts_rule_id ON public.behavioral_alerts(rule_id);

-- Composite index for feed queries
CREATE INDEX IF NOT EXISTS idx_behavioral_alerts_feed ON public.behavioral_alerts(user_id, status, created_at DESC);

-- ─── Alert Preferences Table ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.alert_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Global Settings
    alerts_enabled BOOLEAN NOT NULL DEFAULT true,
    quiet_mode BOOLEAN NOT NULL DEFAULT false,
    quiet_hours JSONB NOT NULL DEFAULT '{"start": "22:00", "end": "08:00"}'::jsonb,
    
    -- Channel Preferences
    channels JSONB NOT NULL DEFAULT '{
        "in_app": {"enabled": true, "frequency": "immediate"},
        "push": {"enabled": true, "frequency": "immediate"},
        "email": {"enabled": true, "frequency": "daily_digest"},
        "sms": {"enabled": false, "frequency": "immediate"}
    }'::jsonb,
    
    -- Category Preferences
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
    
    -- Smart Settings
    adaptive_thresholds BOOLEAN NOT NULL DEFAULT true,
    smart_timing BOOLEAN NOT NULL DEFAULT true,
    
    -- Timestamp
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_preferences ENABLE ROW LEVEL SECURITY;

-- Alert Rules Policies
CREATE POLICY "Users can view their own alert rules"
    ON public.alert_rules FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alert rules"
    ON public.alert_rules FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alert rules"
    ON public.alert_rules FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alert rules"
    ON public.alert_rules FOR DELETE
    USING (auth.uid() = user_id);

-- Behavioral Alerts Policies
CREATE POLICY "Users can view their own alerts"
    ON public.behavioral_alerts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts"
    ON public.behavioral_alerts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
    ON public.behavioral_alerts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
    ON public.behavioral_alerts FOR DELETE
    USING (auth.uid() = user_id);

-- Alert Preferences Policies
CREATE POLICY "Users can view their own preferences"
    ON public.alert_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON public.alert_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON public.alert_preferences FOR UPDATE
    USING (auth.uid() = user_id);

-- ─── Helper Functions ────────────────────────────────────────────────────────

-- Function to increment alert view count
CREATE OR REPLACE FUNCTION public.increment_alert_view_count(alert_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.behavioral_alerts
    SET 
        view_count = view_count + 1,
        viewed = true
    WHERE id = alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment any integer value (generic helper)
CREATE OR REPLACE FUNCTION public.increment(x INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN x + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_alert_rules_updated_at
    BEFORE UPDATE ON public.alert_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alert_preferences_updated_at
    BEFORE UPDATE ON public.alert_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ─── Comments ────────────────────────────────────────────────────────────────

COMMENT ON TABLE public.alert_rules IS 'Configurable alert rules for behavioral detection';
COMMENT ON TABLE public.behavioral_alerts IS 'Individual alert instances triggered by rules';
COMMENT ON TABLE public.alert_preferences IS 'User preferences for alert delivery and filtering';

COMMENT ON COLUMN public.alert_rules.triggers IS 'JSONB array of trigger configurations';
COMMENT ON COLUMN public.alert_rules.conditions IS 'JSONB array of threshold conditions';
COMMENT ON COLUMN public.alert_rules.thresholds IS 'JSONB object with warning/alert/critical threshold values';

COMMENT ON COLUMN public.behavioral_alerts.trigger_data IS 'JSONB object containing the data that triggered this alert';
COMMENT ON COLUMN public.behavioral_alerts.transactions IS 'JSONB array of related transactions';
COMMENT ON COLUMN public.behavioral_alerts.metric_values IS 'JSONB object with metric values at time of trigger';

-- ─── Initial Data: Default Alert Rules ─────────────────────────────────────

-- Insert default rules for new users (will be done in app code on first login)
-- This is just documentation of the default rules structure
/*
INSERT INTO public.alert_rules (user_id, name, description, category, severity, priority, triggers, conditions, conditions_logic, channels, timing, cooldown_minutes, max_per_day, enabled, auto_resolve, show_in_feed, thresholds)
VALUES
    (NULL, 'Impulse Spending Spike', 'Triggers when multiple impulse-driven transactions are detected', 'impulse', 'warning', 'high', 
     '[{"type": "transaction", "filter": {"emotional": "Impulse"}}]',
     '[{"metric": "emotion_impulse_count", "operator": "gte", "value": 3, "window": "weekly"}]',
     'AND', ARRAY['in_app', 'push'], 'immediate', 1440, 2, true, true, true,
     '{"warning": 3, "alert": 5, "critical": 7}'),
    ... etc
*/
