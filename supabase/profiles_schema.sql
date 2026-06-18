-- ─────────────────────────────────────────────────────────────
-- Naija ChatBoard — Day 5: Profiles Schema
-- Run this in your Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique not null,
  display_name text,
  bio          text,
  location     text,
  avatar_color text default '#008751',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- 2. ROW LEVEL SECURITY
alter table public.profiles enable row level security;

-- Anyone logged in can read any profile
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

-- Users can only update their own profile
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Users can insert their own profile (for manual creation fallback)
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- 3. AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- This runs automatically every time a new user registers
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it exists, then recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. BACKFILL existing users (run once to create profiles for users already signed up)
insert into public.profiles (id, username, display_name)
select
  id,
  coalesce(raw_user_meta_data->>'username', split_part(email, '@', 1)),
  coalesce(raw_user_meta_data->>'username', split_part(email, '@', 1))
from auth.users
on conflict (id) do nothing;

-- 5. UPDATE messages to join with profiles (optional view for later use)
-- This view makes it easy to fetch messages with profile info
create or replace view public.messages_with_profiles as
select
  m.*,
  p.display_name,
  p.avatar_color
from public.messages m
left join public.profiles p on p.id = m.user_id;