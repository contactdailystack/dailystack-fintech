-- ============================================================
-- DailyStack SSOT v3.4 - STEP 3: AI Coach infrastructure
-- Run AFTER MIGRATIONS 019 + 020
-- ============================================================

-- 1. AI Coach conversations history table
CREATE TABLE IF NOT EXISTS public.ai_coach_conversations (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id      TEXT        NOT NULL,
  message_role    TEXT        NOT NULL CHECK (message_role IN ('user', 'coach')),
  message_content TEXT        NOT NULL,
  archetype       TEXT,
  fbis_score      INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ai_coach_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own coach conversations" ON public.ai_coach_conversations;
CREATE POLICY "Users manage own coach conversations"
  ON public.ai_coach_conversations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_coach_conv_user_session
  ON public.ai_coach_conversations(user_id, session_id);

GRANT SELECT, INSERT ON public.ai_coach_conversations TO authenticated;
GRANT ALL ON public.ai_coach_conversations TO service_role;

-- 2. Record migration
INSERT INTO supabase_migrations.schema_migrations (version)
VALUES ('021_ai_coach_infrastructure')
ON CONFLICT (version) DO NOTHING;

SELECT 'Migration 021 COMPLETE: ai_coach_conversations table created' AS status;
