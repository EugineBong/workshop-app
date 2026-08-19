-- ════════════════════════════════════════════════════════════════
-- MyStuff workshop schema (Module 5)
-- Run this ONCE in your Supabase project's SQL editor.
-- Safe to re-run by accident: every statement is guarded.
-- Contains NO destructive statements (no drop / truncate / delete).
-- ════════════════════════════════════════════════════════════════

-- 1) The items table — one row per note, owned by exactly one user.
--    user_id is the owner column: it links each row to a signed-in user.
create table if not exists public.items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 120),
  body       text check (body is null or char_length(body) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Speeds up "list MY items, newest first" — exactly what the app does.
create index if not exists items_user_created_idx
  on public.items (user_id, created_at desc);

-- 2) Row Level Security: the DATABASE enforces "you only touch your own
--    rows". Even a modified app or a direct API call cannot cross users.
alter table public.items enable row level security;

-- 3) Four policies: read, create, edit, delete — each limited to the owner.
--    auth.uid() is the id of whoever is signed in right now.
do $$
begin
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'items'
                   and policyname = 'items_select_own') then
    create policy items_select_own on public.items
      for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'items'
                   and policyname = 'items_insert_own') then
    create policy items_insert_own on public.items
      for insert with check (auth.uid() = user_id);
  end if;

  -- update checks BOTH the old row (using) and the new row (with check),
  -- so nobody can re-assign an item to another user.
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'items'
                   and policyname = 'items_update_own') then
    create policy items_update_own on public.items
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'items'
                   and policyname = 'items_delete_own') then
    create policy items_delete_own on public.items
      for delete using (auth.uid() = user_id);
  end if;
end $$;

-- 4) Keep updated_at fresh whenever a row is edited.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger items_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();
