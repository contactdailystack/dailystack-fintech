-- =====================================================
-- DailyStack - Lark Tasks System Schema Migration
-- Architecture: Supabase RLS, Indexes, Subtasks checklists
-- =====================================================

-- 1. Create Task Table
CREATE TABLE IF NOT EXISTS public.todo_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    note TEXT,
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium' NOT NULL,
    due_date DATE,
    is_completed BOOLEAN DEFAULT false NOT NULL,
    is_starred BOOLEAN DEFAULT false NOT NULL,
    tags TEXT[] DEFAULT '{}',
    subtasks JSONB DEFAULT '[]'::JSONB, -- Array of { id, title, completed }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimize queries
CREATE INDEX IF NOT EXISTS idx_todo_tasks_user ON public.todo_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_completed ON public.todo_tasks(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_due ON public.todo_tasks(due_date DESC);

-- Enable RLS
ALTER TABLE public.todo_tasks ENABLE ROW LEVEL SECURITY;

-- Select/Insert/Update/Delete Policies
DROP POLICY IF EXISTS "Users manage own tasks" ON public.todo_tasks;
CREATE POLICY "Users manage own tasks" ON public.todo_tasks 
    FOR ALL USING (auth.uid() = user_id);
