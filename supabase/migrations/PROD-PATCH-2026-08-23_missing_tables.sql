-- ============================================================
-- PROD PATCH — 2026-08-23 — Missing tables on pexcvfhuvqrwrabpgkzi
-- Run once in Supabase Dashboard > SQL Editor.
-- Idempotent: safe to run multiple times (IF NOT EXISTS everywhere).
--
-- Creates what prod is missing after restore:
--   1. budget_categories          (was only in 999_consolidated_final.sql,
--                                  never applied to this project)
--   2. Default-category seed      (trigger on new signups)
--   3. budget_alerts              (024_mvp)
--   4. ghost_subscriptions        (024_mvp)
--   5. net_worth_accounts /
--      net_worth_snapshots /
--      account_snapshots          (024_net_worth, with updated_at bug fixed)
--   6. goals                      (never had a migration before -> 025)
-- Supersedes running 024_*.sql / 025_create_goals.sql individually.
-- ============================================================

-- ─── 0. Shared helper ─────────────────────────────────────────
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── 1. budget_categories ─────────────────────────────────────
create table if not exists public.budget_categories (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references auth.users(id) on delete cascade,
    category_name   text not null,
    monthly_limit   numeric(12,2) not null default 0 check (monthly_limit >= 0),
    color_code      text default '#CCFF00',
    icon_name       text default 'Wallet',
    sort_order      integer default 0,
    created_at      timestamptz default now(),
    updated_at      timestamptz default now(),
    unique(user_id, category_name)
);

create index if not exists idx_budget_categories_user_id
  on public.budget_categories(user_id);

alter table public.budget_categories enable row level security;

drop policy if exists "budget_categories_select_own" on public.budget_categories;
create policy "budget_categories_select_own" on public.budget_categories
  for select using (auth.uid() = user_id);

drop policy if exists "budget_categories_insert_own" on public.budget_categories;
create policy "budget_categories_insert_own" on public.budget_categories
  for insert with check (auth.uid() = user_id);

drop policy if exists "budget_categories_update_own" on public.budget_categories;
create policy "budget_categories_update_own" on public.budget_categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "budget_categories_delete_own" on public.budget_categories;
create policy "budget_categories_delete_own" on public.budget_categories
  for delete using (auth.uid() = user_id);

drop trigger if exists budget_categories_updated_at on public.budget_categories;
create trigger budget_categories_updated_at
    before update on public.budget_categories
    for each row execute function public.update_updated_at_column();

-- ─── 2. Seed defaults for every NEW signup ────────────────────
create or replace function public.create_default_budget_categories()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
    insert into public.budget_categories (user_id, category_name, monthly_limit, color_code, icon_name, sort_order)
    values
        (new.id, 'Food & Dining', 5000, '#F97316', 'UtensilsCrossed', 1),
        (new.id, 'Transport', 3000, '#3B82F6', 'Car', 2),
        (new.id, 'Shopping', 4000, '#CCFF00', 'ShoppingBag', 3),
        (new.id, 'Entertainment', 2000, '#8B5CF6', 'Tv', 4),
        (new.id, 'Bills & Utilities', 5000, '#F97316', 'Zap', 5),
        (new.id, 'Health', 2000, '#4CAF50', 'Heart', 6),
        (new.id, 'Other', 3000, '#9CA3AF', 'MoreHorizontal', 7)
    on conflict (user_id, category_name) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created_budget_categories on auth.users;
create trigger on_auth_user_created_budget_categories
    after insert on auth.users
    for each row execute function public.create_default_budget_categories();

-- Backfill categories for users created BEFORE this patch
insert into public.budget_categories (user_id, category_name, monthly_limit, color_code, icon_name, sort_order)
select u.id, c.category_name, c.limit_val, c.color, c.icon, c.sort
from auth.users u
cross join (values
    ('Food & Dining', 5000, '#F97316', 'UtensilsCrossed', 1),
    ('Transport', 3000, '#3B82F6', 'Car', 2),
    ('Shopping', 4000, '#CCFF00', 'ShoppingBag', 3),
    ('Entertainment', 2000, '#8B5CF6', 'Tv', 4),
    ('Bills & Utilities', 5000, '#F97316', 'Zap', 5),
    ('Health', 2000, '#4CAF50', 'Heart', 6),
    ('Other', 3000, '#9CA3AF', 'MoreHorizontal', 7)
) as c(category_name, limit_val, color, icon, sort)
where not exists (
    select 1 from public.budget_categories bc
    where bc.user_id = u.id and bc.category_name = c.category_name
);

-- ─── 3. budget_alerts ─────────────────────────────────────────
create table if not exists public.budget_alerts (
    id                uuid primary key default gen_random_uuid(),
    user_id           uuid not null references auth.users(id) on delete cascade,
    category_name     text not null,
    alert_type        text not null check (alert_type in ('warning', 'danger', 'milestone')),
    threshold_amount  numeric(12,2),
    current_spent     numeric(12,2),
    percentage_used   numeric(5,2) default 0,
    message           text,
    is_read           boolean default false,
    created_at        timestamptz default now()
);

create index if not exists idx_budget_alerts_user_id on public.budget_alerts(user_id);
create index if not exists idx_budget_alerts_is_read on public.budget_alerts(is_read);
create index if not exists idx_budget_alerts_created_at on public.budget_alerts(created_at desc);

alter table public.budget_alerts enable row level security;

drop policy if exists "budget_alerts_users_can_read_own" on public.budget_alerts;
create policy "budget_alerts_users_can_read_own" on public.budget_alerts
  for select using (auth.uid() = user_id);

drop policy if exists "budget_alerts_users_can_insert_own" on public.budget_alerts;
create policy "budget_alerts_users_can_insert_own" on public.budget_alerts
  for insert with check (auth.uid() = user_id);

drop policy if exists "budget_alerts_service_role" on public.budget_alerts;
create policy "budget_alerts_service_role" on public.budget_alerts
  for all using (auth.role() = 'service_role');

-- ─── 4. ghost_subscriptions ───────────────────────────────────
create table if not exists public.ghost_subscriptions (
    id                uuid primary key default gen_random_uuid(),
    user_id           uuid not null references auth.users(id) on delete cascade,
    detected_name     text not null,
    estimated_cost    numeric(10,2) not null,
    confidence_score  float default 0.5 check (confidence_score between 0 and 1),
    status            text default 'pending'
                      check (status in ('pending', 'confirmed', 'cancelled', 'dismissed')),
    billing_cycle     text default 'monthly'
                      check (billing_cycle in ('monthly', 'yearly', 'weekly')),
    category          text default 'other',
    suggested_action  text,
    notes             text,
    created_at        timestamptz default now(),
    resolved_at       timestamptz
);

create index if not exists idx_ghost_subs_user_id on public.ghost_subscriptions(user_id);
create index if not exists idx_ghost_subs_status on public.ghost_subscriptions(status);
create index if not exists idx_ghost_subs_created_at on public.ghost_subscriptions(created_at desc);

alter table public.ghost_subscriptions enable row level security;

drop policy if exists "ghost_subs_users_can_read_own" on public.ghost_subscriptions;
create policy "ghost_subs_users_can_read_own" on public.ghost_subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "ghost_subs_users_can_update_own" on public.ghost_subscriptions;
create policy "ghost_subs_users_can_update_own" on public.ghost_subscriptions
  for update using (auth.uid() = user_id);

drop policy if exists "ghost_subs_service_role" on public.ghost_subscriptions;
create policy "ghost_subs_service_role" on public.ghost_subscriptions
  for all using (auth.role() = 'service_role');

-- ─── 5. Net worth tracking ────────────────────────────────────
create table if not exists public.net_worth_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_name text not null,
  account_name_th text,
  account_type text not null check (account_type in ('asset', 'liability')),
  account_category text not null check (account_category in (
    'cash', 'checking', 'savings', 'investment', 'property', 'vehicle', 'crypto', 'other'
  )),
  institution text,
  current_balance numeric(14,2) default 0,
  currency text default 'THB',
  icon text,
  color text,
  is_manual boolean default false,
  is_active boolean default true,
  last_synced_at timestamptz,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.net_worth_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  snapshot_date date not null,
  total_assets numeric(14,2) default 0,
  total_liabilities numeric(14,2) default 0,
  net_worth numeric(14,2) default 0,
  currency text default 'THB',
  notes text,
  created_at timestamptz default now(),
  unique(user_id, snapshot_date)
);

create table if not exists public.account_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.net_worth_accounts(id) on delete cascade,
  snapshot_date date not null,
  balance numeric(14,2) default 0,
  currency text default 'THB',
  created_at timestamptz default now(),
  unique(account_id, snapshot_date)
);

create index if not exists idx_net_worth_accounts_user on public.net_worth_accounts(user_id);
create index if not exists idx_net_worth_snapshots_user_date on public.net_worth_snapshots(user_id, snapshot_date desc);
create index if not exists idx_account_snapshots_account_date on public.account_snapshots(account_id, snapshot_date desc);

alter table public.net_worth_accounts enable row level security;
alter table public.net_worth_snapshots enable row level security;
alter table public.account_snapshots enable row level security;

drop policy if exists "net_worth_accounts_self" on public.net_worth_accounts;
create policy "net_worth_accounts_self" on public.net_worth_accounts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "net_worth_snapshots_self" on public.net_worth_snapshots;
create policy "net_worth_snapshots_self" on public.net_worth_snapshots for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "account_snapshots_self" on public.account_snapshots;
create policy "account_snapshots_self" on public.account_snapshots for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists trg_net_worth_accounts_updated_at on public.net_worth_accounts;
create trigger trg_net_worth_accounts_updated_at
    before update on public.net_worth_accounts
    for each row execute function public.update_updated_at_column();

-- Snapshot upsert (FIXED: net_worth_snapshots has no updated_at column)
create or replace function public.update_net_worth_snapshot(user_uuid uuid)
returns void as $$
declare
  total_assets_val numeric(14,2);
  total_liabilities_val numeric(14,2);
  current_date_val date := current_date;
begin
  select coalesce(sum(case when account_type = 'asset' then current_balance else 0 end), 0),
         coalesce(sum(case when account_type = 'liability' then current_balance else 0 end), 0)
  into total_assets_val, total_liabilities_val
  from public.net_worth_accounts
  where user_id = user_uuid and is_active = true;

  insert into public.net_worth_snapshots (user_id, snapshot_date, total_assets, total_liabilities, net_worth)
  values (user_uuid, current_date_val, total_assets_val, total_liabilities_val, total_assets_val - total_liabilities_val)
  on conflict (user_id, snapshot_date)
  do update set
    total_assets = excluded.total_assets,
    total_liabilities = excluded.total_liabilities,
    net_worth = excluded.net_worth;
end;
$$ language plpgsql security definer;

-- ─── 6. goals (Goal Launcher) ─────────────────────────────────
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

drop trigger if exists trg_goals_updated_at on public.goals;
create trigger trg_goals_updated_at
  before update on public.goals
  for each row execute function public.update_updated_at_column();

-- ─── 7. Verify RLS coverage ───────────────────────────────────
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
