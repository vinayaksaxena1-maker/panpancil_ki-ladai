-- =========================================================================
-- PEN FIGHT GAME (PANPANCIL KI LADAI) - SUPABASE MASTER DATABASE SETUP
-- Project Reference: boavalkwiixcpkwvccyk
-- Region: Mumbai (BOM1)
-- =========================================================================

-- 1. Enable pgcrypto extension for UUID generation
create extension if not exists "pgcrypto";

-- 2. Create public.rooms table for real-time 1v1 pen fight matchmaking
create table if not exists public.rooms (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  state text default 'seat_free', -- 'seat_free', 'watch', 'closed', 'gone'
  host_name text default 'Player 1',
  guest_name text,
  host_pen text default 'tri-edge',
  guest_pen text,
  bout integer default 1,
  score_h integer default 0,
  score_g integer default 0,
  turn text default 'h', -- 'h' or 'g'
  status text default 'terms', -- 'terms', 'playing', 'reporting', 'settled', 'void'
  data jsonb default '{}'::jsonb
);

-- 3. Enable Realtime Replication on public.rooms for live websocket sync
alter publication supabase_realtime add table public.rooms;

-- 4. Enable Row Level Security (RLS) with open public game policies
alter table public.rooms enable row level security;

drop policy if exists "Allow public read access to rooms" on public.rooms;
create policy "Allow public read access to rooms" on public.rooms
  for select using (true);

drop policy if exists "Allow public insert to rooms" on public.rooms;
create policy "Allow public insert to rooms" on public.rooms
  for insert with check (true);

drop policy if exists "Allow public update to rooms" on public.rooms;
create policy "Allow public update to rooms" on public.rooms
  for update using (true) with check (true);

-- 5. RPC Function: duel_desk_v1 (Desk info / initial room state)
create or replace function public.duel_desk_v1(p_code text)
returns jsonb
language plpgsql
security definer
as $$
declare
  r record;
begin
  select * into r from public.rooms where code = p_code;
  if not found then
    insert into public.rooms (code, state, host_name)
    values (p_code, 'seat_free', 'Host')
    returning * into r;
  end if;
  
  return jsonb_build_object(
    'state', r.state,
    'names', jsonb_build_object(
      'h', coalesce(r.host_name, 'Host'),
      'g', coalesce(r.guest_name, '')
    )
  );
end;
$$;

-- 6. RPC Function: duel_hammer_looks_v1 (Pen visual inspection)
create or replace function public.duel_hammer_looks_v1(p_code text)
returns jsonb
language plpgsql
security definer
as $$
declare
  r record;
begin
  select * into r from public.rooms where code = p_code;
  if not found then
    return jsonb_build_object('names', jsonb_build_object());
  end if;
  
  return jsonb_build_object(
    'h', r.host_pen,
    'g', r.guest_pen,
    'hn', r.host_name,
    'gn', r.guest_name
  );
end;
$$;

-- 7. RPC Function: duel_watch_v1 (Full spectator & turn state)
create or replace function public.duel_watch_v1(
  p_code text,
  p_key text default null,
  p_bout integer default 1,
  p_after integer default 0
)
returns jsonb
language plpgsql
security definer
as $$
declare
  r record;
begin
  select * into r from public.rooms where code = p_code;
  if not found then
    return jsonb_build_object('state', 'gone');
  end if;

  return jsonb_build_object(
    'state', r.state,
    'names', jsonb_build_object('h', coalesce(r.host_name, 'P1'), 'g', coalesce(r.guest_name, 'P2')),
    'record', jsonb_build_object('h', r.score_h, 'g', r.score_g),
    'me', jsonb_build_object('side', 'h', 'named', true, 'name', coalesce(r.host_name, 'Player')),
    'crowd', jsonb_build_array()
  );
end;
$$;

-- 8. RPC Function: duel_watch_act_v1 (Player gameplay actions)
create or replace function public.duel_watch_act_v1(
  p_code text,
  p_key text,
  p_kind text,
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
as $$
declare
  r record;
begin
  select * into r from public.rooms where code = p_code;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'Room not found');
  end if;

  if p_kind = 'claim_seat' then
    update public.rooms set guest_name = coalesce(p_payload->>'name', 'Challenger'), state = 'playing' where code = p_code;
  elsif p_kind = 'select_pen' then
    if p_payload->>'side' = 'h' then
      update public.rooms set host_pen = p_payload->>'pen' where code = p_code;
    else
      update public.rooms set guest_pen = p_payload->>'pen' where code = p_code;
    end if;
  end if;

  return jsonb_build_object('ok', true, 'side', coalesce(p_payload->>'side', 'g'), 'name', p_payload->>'name', 'turn', 1);
end;
$$;

-- 9. RPC Function: duel_watch_leave_v1 (Player leaves room)
create or replace function public.duel_watch_leave_v1(p_code text, p_key text default null)
returns jsonb
language plpgsql
security definer
as $$
begin
  update public.rooms set state = 'closed' where code = p_code;
  return jsonb_build_object('ok', true);
end;
$$;

-- 10. RPC Function: duel_seat_say_v1 (Chat / reactions)
create or replace function public.duel_seat_say_v1(
  p_code text,
  p_id text default null,
  p_turn integer default 0,
  p_bout integer default 1
)
returns jsonb
language plpgsql
security definer
as $$
begin
  return jsonb_build_object('ok', true);
end;
$$;

-- 11. RPC Leaderboard & Community Stats Functions
create or replace function public.tournament_wins_v1()
returns jsonb
language plpgsql
security definer
as $$
begin
  return '[]'::jsonb;
end;
$$;

create or replace function public.tournament_wins_by_user_v1()
returns jsonb
language plpgsql
security definer
as $$
begin
  return '[]'::jsonb;
end;
$$;

create or replace function public.community_title_v1()
returns jsonb
language plpgsql
security definer
as $$
begin
  return '{"title": "Pen Fight Master", "winner": "None"}'::jsonb;
end;
$$;

create or replace function public.community_tournaments_v1()
returns jsonb
language plpgsql
security definer
as $$
begin
  return '[]'::jsonb;
end;
$$;
