-- ============================================================
-- PROD PATCH 2 — 2026-08-23 — Enable RLS on user_wallets
-- Context: prod pg_tables shows rowsecurity=false for user_wallets
-- (the ONLY table in public schema without RLS). Migration 008
-- ordered this but never ran on this project.
--
-- Safe because every client query already filters
-- .eq('user_id', user.id)  (see src/services/walletService.ts).
-- service_role bypasses RLS in Supabase, so edge functions and the
-- SECURITY DEFINER atomic-transfer RPC keep working unchanged.
-- ============================================================

alter table public.user_wallets enable row level security;

drop policy if exists "Users can manage own wallets" on public.user_wallets;
create policy "Users can manage own wallets"
  on public.user_wallets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Verify (should return rowsecurity = true):
select tablename, rowsecurity
from pg_tables
where schemaname = 'public' and tablename = 'user_wallets';
