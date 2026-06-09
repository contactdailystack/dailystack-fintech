-- Layer 3 (Behavioral Core): Emotional Context
CREATE TABLE IF NOT EXISTS public.emotional_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID,
  spending_intent TEXT CHECK (spending_intent IN ('planned', 'impulse', 'necessity', 'reward', 'emotional')),
  mood TEXT CHECK (mood IN ('happy', 'sad', 'stressed', 'bored', 'excited', 'anxious', 'neutral')),
  trigger_category TEXT,
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.emotional_context ENABLE ROW LEVEL SECURITY;
CREATE POLICY "emotional_self" ON public.emotional_context FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
