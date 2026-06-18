  -- ─────────────────────────────────────────────────────────────
  -- Naija ChatBoard — Day 4 Database Schema
  -- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
  -- ─────────────────────────────────────────────────────────────

  -- 1. ROOMS TABLE
  create table if not exists public.rooms (
    id          text primary key,                        -- e.g. 'naija-politics'
    name        text not null,
    description text,
    category    text,
    created_by  uuid references auth.users(id),
    created_at  timestamptz default now()
  );

  -- 2. MESSAGES TABLE
  create table if not exists public.messages (
    id          uuid primary key default gen_random_uuid(),
    room_id     text not null references public.rooms(id) on delete cascade,
    user_id     uuid not null references auth.users(id) on delete cascade,
    username    text not null,
    content     text not null,
    created_at  timestamptz default now()
  );

  -- Index for fast room message queries
  create index if not exists messages_room_id_created_at_idx
    on public.messages (room_id, created_at asc);

  -- ─────────────────────────────────────────────────────────────
  -- 3. ROW LEVEL SECURITY
  -- ─────────────────────────────────────────────────────────────

  alter table public.rooms    enable row level security;
  alter table public.messages enable row level security;

  -- Anyone logged in can read rooms
  create policy "Rooms are viewable by authenticated users"
    on public.rooms for select
    to authenticated
    using (true);

  -- Anyone logged in can read messages
  create policy "Messages are viewable by authenticated users"
    on public.messages for select
    to authenticated
    using (true);

  -- Authenticated users can insert their own messages
  create policy "Users can insert their own messages"
    on public.messages for insert
    to authenticated
    with check (auth.uid() = user_id);

  -- Users can delete their own messages only
  create policy "Users can delete their own messages"
    on public.messages for delete
    to authenticated
    using (auth.uid() = user_id);

  -- ─────────────────────────────────────────────────────────────
  -- 4. ENABLE REALTIME on messages table
  -- ─────────────────────────────────────────────────────────────

  -- Run this to enable realtime on the messages table:
  alter publication supabase_realtime add table public.messages;

  -- ─────────────────────────────────────────────────────────────
  -- 5. SEED ROOMS (matches the IDs in the frontend)
  -- ─────────────────────────────────────────────────────────────

  insert into public.rooms (id, name, description, category) values
    ('naija-politics',   'Naija Politics 🗳️',    'Hot takes and real talk on Nigerian politics, government, and policy.', 'Politics'),
    ('tech-lagos',       'Tech in Lagos 💻',      'Startups, developer gist, remote work, and tech jobs in Nigeria.',     'Tech'),
    ('jollof-war',       'Jollof War Zone 🍛',    'Nigeria vs Ghana. The debate never dies. Come settle it.',             'Food & Fun'),
    ('naija-music',      'Naija Music 🎵',        'Afrobeats, Afropop, Amapiano, Fuji — all the vibes.',                  'Music'),
    ('hustle-corner',    'Hustle Corner 💼',      'Business ideas, side hustles, SME talk, and entrepreneurship.',        'Business'),
    ('edu-talks',        'Edu Talks 🎓',          'JAMB, WAEC, university gist, scholarships, and career advice.',        'Education'),
    ('diaspora-connect', 'Diaspora Connect ✈️',  'For Nigerians abroad — visa, relocation tips, and home gist.',         'Diaspora'),
    ('sports-arena',     'Sports Arena ⚽',       'Super Eagles, NPFL, Premier League, and every sport Nigerians love.',  'Sports')
  on conflict (id) do nothing;
