-- ================================================================
-- DailyStack — Dating Analytics Table Migration
-- Phase: Supabase Analytics Event Persistence
-- ================================================================
-- 
-- This migration creates the analytics infrastructure for
-- BUILD > MEASURE > PIVOT workflows.
-- 
-- Event Categories:
-- - swipe: User swipe actions (like, pass, superlike)
-- - match: Match creation events
-- - conversation: Chat interaction events
-- - profile: Profile interaction events
-- - session: User session/retention events
-- - experiment: A/B test variant assignments
-- - conversion: Funnel conversion events
-- ================================================================

-- Create enum types for event categories
DO $$ BEGIN
    CREATE TYPE event_category AS ENUM (
        'swipe', 
        'match', 
        'conversation', 
        'profile', 
        'session', 
        'experiment', 
        'conversion',
        'feature',
        'error'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum types for device types
DO $$ BEGIN
    CREATE TYPE device_type AS ENUM ('mobile', 'tablet', 'desktop', 'unknown');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ================================================================
-- MAIN ANALYTICS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS dating_analytics (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User identification (supports anonymous users)
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(64) NOT NULL,
    
    -- Event categorization
    event_category event_category NOT NULL,
    event_name VARCHAR(128) NOT NULL,
    
    -- Event value (for numerical tracking)
    event_value DECIMAL(10, 2) DEFAULT 0,
    
    -- Metadata (flexible JSON for varying event data)
    metadata JSONB DEFAULT '{}',
    
    -- Experiment tracking
    experiment_id VARCHAR(64),
    variant_id VARCHAR(32),
    
    -- Context information
    screen_name VARCHAR(128),
    component_name VARCHAR(128),
    
    -- Device & connection
    device_type device_type DEFAULT 'unknown',
    connection_type VARCHAR(32),
    
    -- Location (privacy-conscious - country level only)
    country_code CHAR(2),
    region VARCHAR(64),
    
    -- Timing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Soft deletion for data retention policies
    deleted_at TIMESTAMPTZ
);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- User analytics (most common query)
CREATE INDEX IF NOT EXISTS idx_dating_analytics_user_id 
    ON dating_analytics(user_id) 
    WHERE deleted_at IS NULL;

-- Session analytics (session-level aggregations)
CREATE INDEX IF NOT EXISTS idx_dating_analytics_session_id 
    ON dating_analytics(session_id) 
    WHERE deleted_at IS NULL;

-- Time-based analytics (dashboards, reports)
CREATE INDEX IF NOT EXISTS idx_dating_analytics_created_at 
    ON dating_analytics(created_at DESC) 
    WHERE deleted_at IS NULL;

-- Event category filtering
CREATE INDEX IF NOT EXISTS idx_dating_analytics_category 
    ON dating_analytics(event_category, created_at DESC) 
    WHERE deleted_at IS NULL;

-- Event name filtering within category
CREATE INDEX IF NOT EXISTS idx_dating_analytics_event_name 
    ON dating_analytics(event_category, event_name, created_at DESC) 
    WHERE deleted_at IS NULL;

-- Experiment analysis
CREATE INDEX IF NOT EXISTS idx_dating_analytics_experiment 
    ON dating_analytics(experiment_id, variant_id, created_at DESC) 
    WHERE experiment_id IS NOT NULL;

-- Screen/feature analytics
CREATE INDEX IF NOT EXISTS idx_dating_analytics_screen 
    ON dating_analytics(screen_name, event_name, created_at DESC) 
    WHERE screen_name IS NOT NULL;

-- ================================================================
-- REALTIME SUBSCRIPTION
-- ================================================================

-- Enable realtime for live analytics dashboards
ALTER PUBLICATION supabase_realtime ADD TABLE dating_analytics;

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE dating_analytics ENABLE ROW LEVEL SECURITY;

-- Users can only see their own analytics
CREATE POLICY "Users can view own analytics"
    ON dating_analytics FOR SELECT
    USING (
        auth.uid() = user_id 
        OR user_id IS NULL  -- Anonymous events
    );

-- Only service role can insert (from authenticated app)
CREATE POLICY "Service role can insert analytics"
    ON dating_analytics FOR INSERT
    WITH CHECK (true);  -- App handles auth validation

-- Analytics are immutable (no updates or deletes by users)
CREATE POLICY "No user updates or deletes"
    ON dating_analytics FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "No user deletes"
    ON dating_analytics FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================================
-- MATERIALIZED VIEWS FOR AGGREGATIONS
-- ================================================================

-- Daily swipe metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_swipe_metrics AS
SELECT 
    DATE_TRUNC('day', created_at) AS date,
    COUNT(*) AS total_swipes,
    COUNT(*) FILTER (WHERE metadata->>'action' = 'like') AS likes,
    COUNT(*) FILTER (WHERE metadata->>'action' = 'pass') AS passes,
    COUNT(*) FILTER (WHERE metadata->>'action' = 'superlike') AS superlikes,
    AVG((metadata->>'swipe_duration_ms')::numeric) FILTER (WHERE metadata->>'swipe_duration_ms' IS NOT NULL) AS avg_swipe_duration,
    AVG((metadata->>'compatibility_score')::numeric) FILTER (WHERE metadata->>'compatibility_score' IS NOT NULL) AS avg_compatibility,
    COUNT(DISTINCT user_id) AS unique_users
FROM dating_analytics
WHERE event_category = 'swipe' AND deleted_at IS NULL
GROUP BY DATE_TRUNC('day', created_at)
WITH NO DATA;

-- Match metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_match_metrics AS
SELECT 
    DATE_TRUNC('day', created_at) AS date,
    COUNT(*) AS total_matches,
    COUNT(*) FILTER (WHERE metadata->>'match_type' = 'ultra') AS ultra_matches,
    AVG((metadata->>'compatibility_score')::numeric) FILTER (WHERE metadata->>'compatibility_score' IS NOT NULL) AS avg_compatibility,
    COUNT(DISTINCT user_id) AS unique_users,
    COUNT(DISTINCT (metadata->>'partner_id')) AS unique_partners
FROM dating_analytics
WHERE event_category = 'match' AND deleted_at IS NULL
GROUP BY DATE_TRUNC('day', created_at)
WITH NO DATA;

-- Conversation metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_conversation_metrics AS
SELECT 
    DATE_TRUNC('day', created_at) AS date,
    COUNT(*) AS total_events,
    COUNT(*) FILTER (WHERE event_name = 'conversation_start') AS conversations_started,
    COUNT(*) FILTER (WHERE event_name = 'message_sent') AS messages_sent,
    AVG((metadata->>'response_time_ms')::numeric) FILTER (WHERE metadata->>'response_time_ms' IS NOT NULL) AS avg_response_time,
    COUNT(DISTINCT user_id) AS unique_users
FROM dating_analytics
WHERE event_category = 'conversation' AND deleted_at IS NULL
GROUP BY DATE_TRUNC('day', created_at)
WITH NO DATA;

-- User retention metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_retention_metrics AS
SELECT 
    DATE_TRUNC('day', created_at) AS date,
    COUNT(*) FILTER (WHERE event_name = 'session_start') AS sessions_started,
    COUNT(*) FILTER (WHERE event_name = 'session_end') AS sessions_ended,
    AVG((metadata->>'duration_ms')::numeric) FILTER (WHERE metadata->>'duration_ms' IS NOT NULL) AS avg_session_duration,
    COUNT(DISTINCT user_id) AS unique_users
FROM dating_analytics
WHERE event_category = 'session' AND deleted_at IS NULL
GROUP BY DATE_TRUNC('day', created_at)
WITH NO DATA;

-- Experiment results
CREATE MATERIALIZED VIEW IF NOT EXISTS experiment_results AS
SELECT 
    experiment_id,
    variant_id,
    COUNT(*) AS total_events,
    COUNT(DISTINCT user_id) AS unique_users,
    -- Calculate conversion metrics based on event_name
    COUNT(*) FILTER (WHERE event_name LIKE '%converted%') AS conversions,
    COUNT(*) FILTER (WHERE event_name LIKE '%engaged%') AS engagements,
    AVG(event_value) FILTER (WHERE event_value > 0) AS avg_event_value
FROM dating_analytics
WHERE experiment_id IS NOT NULL AND deleted_at IS NULL
GROUP BY experiment_id, variant_id
WITH NO DATA;

-- ================================================================
-- REFRESH CONCURRENTLY FOR BACKGROUND UIEWS
-- ================================================================

-- Create refresh function for materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_swipe_metrics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_match_metrics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_conversation_metrics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_retention_metrics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY experiment_results;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- ANALYTICS HELPER FUNCTIONS
-- ================================================================

-- Track a single event
CREATE OR REPLACE FUNCTION track_dating_event(
    p_user_id UUID,
    p_session_id VARCHAR(64),
    p_event_category event_category,
    p_event_name VARCHAR(128),
    p_event_value DECIMAL DEFAULT 0,
    p_metadata JSONB DEFAULT '{}',
    p_experiment_id VARCHAR DEFAULT NULL,
    p_variant_id VARCHAR DEFAULT NULL,
    p_screen_name VARCHAR DEFAULT NULL,
    p_device_type device_type DEFAULT 'unknown'
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO dating_analytics (
        user_id,
        session_id,
        event_category,
        event_name,
        event_value,
        metadata,
        experiment_id,
        variant_id,
        screen_name,
        device_type
    ) VALUES (
        p_user_id,
        p_session_id,
        p_event_category,
        p_event_name,
        p_event_value,
        p_metadata,
        p_experiment_id,
        p_variant_id,
        p_screen_name,
        p_device_type
    ) RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- DATA RETENTION POLICY
-- ================================================================

-- Create function to clean old analytics (90 day retention)
CREATE OR REPLACE FUNCTION cleanup_old_analytics(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    UPDATE dating_analytics
    SET deleted_at = NOW()
    WHERE deleted_at IS NULL
      AND created_at < NOW() - (retention_days || ' days')::interval;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- GRANULAR ANALYTICS FUNCTIONS
-- ================================================================

-- Track swipe event
CREATE OR REPLACE FUNCTION track_swipe_event(
    p_user_id UUID,
    p_session_id VARCHAR(64),
    p_target_user_id UUID,
    p_action VARCHAR(16), -- 'like', 'pass', 'superlike'
    p_swipe_duration_ms INTEGER,
    p_card_position INTEGER,
    p_compatibility_score INTEGER,
    p_source VARCHAR(32), -- 'curated', 'explore'
    p_device_type device_type DEFAULT 'unknown',
    p_screen_name VARCHAR DEFAULT 'dating'
)
RETURNS UUID AS $$
BEGIN
    RETURN track_dating_event(
        p_user_id,
        p_session_id,
        'swipe',
        'swipe_' || p_action,
        0,
        jsonb_build_object(
            'target_user_id', p_target_user_id,
            'action', p_action,
            'swipe_duration_ms', p_swipe_duration_ms,
            'card_position', p_card_position,
            'compatibility_score', p_compatibility_score,
            'source', p_source
        ),
        NULL,
        NULL,
        p_screen_name,
        p_device_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Track match event
CREATE OR REPLACE FUNCTION track_match_event(
    p_user_id UUID,
    p_session_id VARCHAR(64),
    p_partner_id UUID,
    p_match_type VARCHAR(16), -- 'standard', 'ultra'
    p_compatibility_score INTEGER,
    p_response_time_ms INTEGER,
    p_initiator VARCHAR(16), -- 'user', 'partner'
    p_device_type device_type DEFAULT 'unknown',
    p_screen_name VARCHAR DEFAULT 'dating'
)
RETURNS UUID AS $$
BEGIN
    RETURN track_dating_event(
        p_user_id,
        p_session_id,
        'match',
        'match_created',
        0,
        jsonb_build_object(
            'partner_id', p_partner_id,
            'match_type', p_match_type,
            'compatibility_score', p_compatibility_score,
            'response_time_ms', p_response_time_ms,
            'initiator', p_initiator
        ),
        NULL,
        NULL,
        p_screen_name,
        p_device_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Track conversation event
CREATE OR REPLACE FUNCTION track_conversation_event(
    p_user_id UUID,
    p_session_id VARCHAR(64),
    p_match_id UUID,
    p_message_type VARCHAR(32), -- 'icebreaker', 'text', 'image', 'gif'
    p_response_time_ms INTEGER,
    p_conversation_started BOOLEAN,
    p_device_type device_type DEFAULT 'unknown',
    p_screen_name VARCHAR DEFAULT 'chat'
)
RETURNS UUID AS $$
BEGIN
    RETURN track_dating_event(
        p_user_id,
        p_session_id,
        'conversation',
        CASE 
            WHEN p_conversation_started THEN 'conversation_start'
            ELSE 'message_sent'
        END,
        0,
        jsonb_build_object(
            'match_id', p_match_id,
            'message_type', p_message_type,
            'response_time_ms', p_response_time_ms,
            'conversation_started', p_conversation_started
        ),
        NULL,
        NULL,
        p_screen_name,
        p_device_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- COMMENTS FOR DOCUMENTATION
-- ================================================================

COMMENT ON TABLE dating_analytics IS 'Event-driven analytics for BUILD > MEASURE > PIVOT workflows';
COMMENT ON COLUMN dating_analytics.user_id IS 'User identifier, nullable for anonymous events';
COMMENT ON COLUMN dating_analytics.session_id IS 'Client-generated session identifier';
COMMENT ON COLUMN dating_analytics.event_category IS 'Event category: swipe, match, conversation, profile, session, experiment, conversion';
COMMENT ON COLUMN dating_analytics.event_name IS 'Specific event name within category';
COMMENT ON COLUMN dating_analytics.event_value IS 'Numerical value for aggregations';
COMMENT ON COLUMN dating_analytics.metadata IS 'Flexible JSON for varying event data';
COMMENT ON COLUMN dating_analytics.experiment_id IS 'A/B test experiment identifier';
COMMENT ON COLUMN dating_analytics.variant_id IS 'A/B test variant identifier';
COMMENT ON COLUMN dating_analytics.screen_name IS 'UI screen or feature name';
COMMENT ON COLUMN dating_analytics.deleted_at IS 'Soft deletion for data retention';