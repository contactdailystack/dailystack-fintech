-- ============================================================
-- Migration 025 — Create missing `goals` table (schema-as-code)
-- Context: prod DB (pexcvfhuvqrwrabpgkzi) restored without this
-- table; it previously existed only in an old dashboard-created
-- database and was never captured in any migration file.
-- Shape mirrors src/services/goalService.ts (Goal interface).
-- ============================================================

create table if not exists public.goals (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  goal_name      text not null check (char_length(goal_name) between 1 and 100),
  target_amount  numeric(14, 2) not null check (target_amount > 0),
  current_amount numeric(14, 2) not null default 0 check (current_amount >= 0),
  target_date    date,
  icon_name      text not null default 'Target' check (char_length(icon_name) <= 50),
  color_code     text not null default '#56be89' check (color_code ~ '^#[0-9A-Fa-f]{6}$'),
  status         text not null default 'in_progress'
                 check (status in ('in_progress', 'achieved', 'paused')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.goals is 'Savings goals per user (Goal Launcher feature).';

create index if not exists idx_goals_user_id_status on public.goals (user_id, status);

-- Keep updated_at fresh on every row update.
-- NOTE: uses shared public.update_updated_at_column() — defined in
-- PROD-PATCH-2026-08-23_missing_tables.sql / 999_consolidated_final.sql.
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_goals_updated_at on public.goals;
create trigger trg_goals_updated_at
  before update on public.goals
  for each row execute function public.update_updated_at_column();

-- ─── RLS ──────────────────────────────────────────────────────
alter table public.goals enable row level security;

drop policy if exists "Users can view own goals" on public.goals;
create policy "Users can view own goals"
  on public.goals for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own goals" on public.goals;
create policy "Users can insert own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own goals" on public.goals;
create policy "Users can update own goals"
  on public.goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own goals" on public.goals;
create policy "Users can delete own goals"
  on public.goals for delete
  using (auth.uid() = user_id);
