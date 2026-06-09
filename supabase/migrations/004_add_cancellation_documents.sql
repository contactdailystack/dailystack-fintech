-- Migration: 004_add_cancellation_documents.sql
-- Stores cancellation document metadata (files live in Supabase Storage)

CREATE TABLE IF NOT EXISTS cancellation_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cancellation_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cancellation_documents_owner"
  ON cancellation_documents
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_cancellation_documents_user_id ON cancellation_documents(user_id);
CREATE INDEX idx_cancellation_documents_subscription_id ON cancellation_documents(subscription_id);

-- Enable storage bucket (run via Supabase dashboard or CLI if not already created)
-- supabase storage create cancellation-proofs --public
