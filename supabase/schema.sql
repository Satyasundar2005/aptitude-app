-- ==============================================================================
-- ApptiClash Supabase Database Schema
-- Multi-track Aptitude Battle & Quiz Platform
-- ==============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. ENUMS & DOMAINS
-- ==============================================================================

do $$ begin
    create type exam_track_enum as enum (
        'all',
        'gate',
        'cat',
        'gre',
        'ese',
        'placement',
        'banking'
    );
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type difficulty_enum as enum (
        'easy',
        'medium',
        'hard'
    );
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type room_status_enum as enum (
        'lobby',
        'countdown',
        'playing',
        'round_result',
        'game_over',
        'abandoned'
    );
exception
    when duplicate_object then null;
end $$;

-- ==============================================================================
-- 2. USER PROFILES TABLE (Linked to auth.users)
-- ==============================================================================

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text unique not null,
    display_name text,
    avatar_url text,
    exam_track text not null default 'gate',
    rating_elo integer not null default 1200,
    total_matches integer not null default 0,
    wins integer not null default 0,
    losses integer not null default 0,
    draws integer not null default 0,
    best_streak integer not null default 0,
    total_solved integer not null default 0,
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Index for leaderboard queries
create index if not exists idx_profiles_rating on public.profiles(rating_elo desc);
create index if not exists idx_profiles_wins on public.profiles(wins desc);

-- ==============================================================================
-- 3. QUESTIONS TABLE (Curated and Procedural Aptitude Bank)
-- ==============================================================================

create table if not exists public.questions (
    id text primary key,
    text text not null,
    options jsonb not null, -- Array of strings: ["Option A", "Option B", "Option C", "Option D"]
    correct_index integer not null check (correct_index >= 0 and correct_index <= 3),
    category text not null,
    difficulty text not null default 'easy',
    time_limit integer not null default 60,
    exam_track text not null default 'all',
    exam_tag text,
    explanation text,
    is_verified boolean not null default true,
    created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_questions_track_diff on public.questions(exam_track, difficulty);
create index if not exists idx_questions_category on public.questions(category);

-- ==============================================================================
-- 4. ONLINE ROOMS TABLE (Realtime 1v1 Battles)
-- ==============================================================================

create table if not exists public.rooms (
    id uuid primary key default gen_random_uuid(),
    room_code text unique not null,
    status text not null default 'lobby',
    exam_track text not null default 'gate',
    difficulty text not null default 'easy',
    total_rounds integer not null default 10,
    current_round integer not null default 0,
    
    -- Host info
    host_id text not null,
    host_name text not null default 'Host',
    host_score integer not null default 0,
    host_streak integer not null default 0,
    host_ready boolean not null default false,
    
    -- Guest info
    guest_id text,
    guest_name text,
    guest_score integer not null default 0,
    guest_streak integer not null default 0,
    guest_ready boolean not null default false,
    
    -- Active Question Payload (synced across both players)
    current_question jsonb,
    round_started_at timestamptz,
    winner_id text,
    
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_rooms_code on public.rooms(room_code);
create index if not exists idx_rooms_status on public.rooms(status);

-- ==============================================================================
-- 5. ROOM ANSWERS (Audit and Realtime Round Evaluation)
-- ==============================================================================

create table if not exists public.room_answers (
    id uuid primary key default gen_random_uuid(),
    room_id uuid not null references public.rooms(id) on delete cascade,
    round_number integer not null,
    player_id text not null,
    player_name text not null,
    selected_option integer not null,
    is_correct boolean not null,
    time_taken_ms integer not null default 0,
    points_awarded integer not null default 0,
    created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_room_answers_room on public.room_answers(room_id, round_number);

-- ==============================================================================
-- 6. SOLO BLITZ RUNS & LEADERBOARD
-- ==============================================================================

create table if not exists public.solo_blitz_runs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete set null,
    player_name text not null,
    score integer not null default 0,
    best_streak integer not null default 0,
    total_solved integer not null default 0,
    accuracy numeric(5,2) not null default 0.00,
    exam_track text not null default 'all',
    difficulty text not null default 'easy',
    duration_seconds integer not null default 60,
    created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_solo_blitz_leaderboard on public.solo_blitz_runs(score desc, best_streak desc);
create index if not exists idx_solo_blitz_track on public.solo_blitz_runs(exam_track, score desc);

-- ==============================================================================
-- 7. TRIGGERS & FUNCTIONS
-- ==============================================================================

-- Auto-update updated_at timestamp function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql security definer;

-- Trigger for profiles
drop trigger if exists on_profile_updated on public.profiles;
create trigger on_profile_updated
    before update on public.profiles
    for each row
    execute function public.handle_updated_at();

-- Trigger for rooms
drop trigger if exists on_room_updated on public.rooms;
create trigger on_room_updated
    before update on public.rooms
    for each row
    execute function public.handle_updated_at();

-- Automatic profile creation on auth sign-up
create or replace function public.handle_new_user()
returns trigger as $$
declare
    derived_username text;
begin
    derived_username := coalesce(
        new.raw_user_meta_data->>'username',
        split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4)
    );
    
    insert into public.profiles (
        id,
        username,
        display_name,
        avatar_url,
        exam_track
    ) values (
        new.id,
        derived_username,
        coalesce(new.raw_user_meta_data->>'full_name', derived_username),
        new.raw_user_meta_data->>'avatar_url',
        coalesce(new.raw_user_meta_data->>'exam_track', 'gate')
    );
    return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- RPC: Increment player stats after a duel match
create or replace function public.record_match_outcome(
    p_user_id uuid,
    p_won boolean,
    p_is_draw boolean,
    p_solved_delta integer,
    p_streak_best integer
)
returns void as $$
begin
    update public.profiles
    set
        total_matches = total_matches + 1,
        wins = case when p_won and not p_is_draw then wins + 1 else wins end,
        losses = case when not p_won and not p_is_draw then losses + 1 else losses end,
        draws = case when p_is_draw then draws + 1 else draws end,
        rating_elo = case
            when p_won and not p_is_draw then rating_elo + 25
            when not p_won and not p_is_draw then greatest(800, rating_elo - 20)
            else rating_elo
        end,
        total_solved = total_solved + p_solved_delta,
        best_streak = greatest(best_streak, p_streak_best),
        updated_at = timezone('utc'::text, now())
    where id = p_user_id;
end;
$$ language plpgsql security definer;

-- RPC: Get random questions by track and difficulty
create or replace function public.get_random_questions(
    p_track text,
    p_difficulty text,
    p_limit integer default 10
)
returns setof public.questions as $$
begin
    return query
    select *
    from public.questions
    where (p_track = 'all' or exam_track = p_track or exam_track = 'all')
      and (difficulty = p_difficulty or p_difficulty is null)
    order by random()
    limit p_limit;
end;
$$ language plpgsql stable;

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.rooms enable row level security;
alter table public.room_answers enable row level security;
alter table public.solo_blitz_runs enable row level security;

-- Profiles: Anyone can view profiles, owners can update their own
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone"
    on public.profiles for select
    using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
    on public.profiles for insert
    with check (auth.uid() = id or auth.uid() is null);

-- Questions: Viewable by everyone (both authenticated and anonymous players)
drop policy if exists "Questions are readable by everyone" on public.questions;
create policy "Questions are readable by everyone"
    on public.questions for select
    using (true);

drop policy if exists "Admins/Service can insert questions" on public.questions;
create policy "Admins/Service can insert questions"
    on public.questions for insert
    with check (true);

-- Rooms: Realtime multiplayer room policies
drop policy if exists "Anyone can view rooms by code or list" on public.rooms;
create policy "Anyone can view rooms by code or list"
    on public.rooms for select
    using (true);

drop policy if exists "Anyone can create a room" on public.rooms;
create policy "Anyone can create a room"
    on public.rooms for insert
    with check (true);

drop policy if exists "Participants can update their room" on public.rooms;
create policy "Participants can update their room"
    on public.rooms for update
    using (true);

drop policy if exists "Participants can delete their room" on public.rooms;
create policy "Participants can delete their room"
    on public.rooms for delete
    using (true);

-- Room Answers: Public read and insert for match evaluation
drop policy if exists "Room answers are viewable by everyone" on public.room_answers;
create policy "Room answers are viewable by everyone"
    on public.room_answers for select
    using (true);

drop policy if exists "Room answers can be submitted by players" on public.room_answers;
create policy "Room answers can be submitted by players"
    on public.room_answers for insert
    with check (true);

-- Solo Blitz Runs: Viewable by everyone, insertable by players
drop policy if exists "Solo Blitz leaderboard is viewable by everyone" on public.solo_blitz_runs;
create policy "Solo Blitz leaderboard is viewable by everyone"
    on public.solo_blitz_runs for select
    using (true);

drop policy if exists "Players can submit Solo Blitz scores" on public.solo_blitz_runs;
create policy "Players can submit Solo Blitz scores"
    on public.solo_blitz_runs for insert
    with check (true);

-- ==============================================================================
-- 9. REALTIME PUBLICATION SETUP
-- ==============================================================================

-- Safely add tables to supabase_realtime publication if not already present
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rooms'
  ) then
    alter publication supabase_realtime add table public.rooms;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'room_answers'
  ) then
    alter publication supabase_realtime add table public.room_answers;
  end if;
end $$;
