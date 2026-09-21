create table if not exists public.user_snapshots (user_id uuid not null references auth.users(id) on delete cascade,bucket text not null default 'main',payload jsonb not null default '{}'::jsonb,updated_at timestamptz not null default now(),primary key(user_id,bucket));
alter table public.user_snapshots enable row level security;
grant select,insert,update,delete on table public.user_snapshots to authenticated;
drop policy if exists user_snapshots_select_own on public.user_snapshots; create policy user_snapshots_select_own on public.user_snapshots for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists user_snapshots_insert_own on public.user_snapshots; create policy user_snapshots_insert_own on public.user_snapshots for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists user_snapshots_update_own on public.user_snapshots; create policy user_snapshots_update_own on public.user_snapshots for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists user_snapshots_delete_own on public.user_snapshots; create policy user_snapshots_delete_own on public.user_snapshots for delete to authenticated using ((select auth.uid())=user_id);
