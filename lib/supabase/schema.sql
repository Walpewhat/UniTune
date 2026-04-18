-- ============================================================
-- UniTune — Supabase schema
-- Run this in the Supabase SQL editor on a fresh project.
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- profiles
-- ============================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  avatar_url    text,
  locale        text check (locale in ('en','ru')) default 'en',
  theme         text check (theme in ('system','light','dark')) default 'system',
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles self upsert" on public.profiles;
create policy "profiles self upsert" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create profile row on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- provider_connections
-- Encrypted OAuth tokens for third-party music providers.
-- ============================================================
create table if not exists public.provider_connections (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references public.profiles(id) on delete cascade,
  provider                  text not null check (provider in ('spotify','soundcloud')),
  provider_user_id          text,
  provider_display_name     text,
  access_token_encrypted    text not null,
  refresh_token_encrypted   text,
  expires_at                timestamptz,
  scopes                    text[],
  connected_at              timestamptz not null default now(),
  meta                      jsonb,
  unique (user_id, provider)
);

create index if not exists provider_connections_user_idx
  on public.provider_connections(user_id);

alter table public.provider_connections enable row level security;

drop policy if exists "conn owner all" on public.provider_connections;
create policy "conn owner all" on public.provider_connections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- super_playlists
-- ============================================================
create table if not exists public.super_playlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null check (length(name) between 1 and 200),
  description text check (length(description) <= 1000),
  cover_path  text,
  is_public   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists super_playlists_user_idx on public.super_playlists(user_id);

alter table public.super_playlists enable row level security;

drop policy if exists "sp owner all" on public.super_playlists;
create policy "sp owner all" on public.super_playlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "sp public read" on public.super_playlists;
create policy "sp public read" on public.super_playlists
  for select using (is_public = true);

-- ============================================================
-- super_playlist_tracks
-- ============================================================
create table if not exists public.super_playlist_tracks (
  id                uuid primary key default gen_random_uuid(),
  playlist_id       uuid not null references public.super_playlists(id) on delete cascade,
  provider          text not null check (provider in ('spotify','soundcloud')),
  provider_track_id text not null,
  title             text not null,
  artists           text[] not null default '{}',
  album             text,
  cover_url         text,
  duration_ms       integer not null default 0,
  position          integer not null default 0,
  added_at          timestamptz not null default now()
);

create index if not exists spt_playlist_idx
  on public.super_playlist_tracks(playlist_id, position);

alter table public.super_playlist_tracks enable row level security;

drop policy if exists "spt owner all" on public.super_playlist_tracks;
create policy "spt owner all" on public.super_playlist_tracks
  for all using (
    exists (
      select 1 from public.super_playlists p
      where p.id = playlist_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.super_playlists p
      where p.id = playlist_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "spt public read" on public.super_playlist_tracks;
create policy "spt public read" on public.super_playlist_tracks
  for select using (
    exists (
      select 1 from public.super_playlists p
      where p.id = playlist_id and p.is_public = true
    )
  );

-- ============================================================
-- liked_tracks
-- ============================================================
create table if not exists public.liked_tracks (
  user_id           uuid not null references public.profiles(id) on delete cascade,
  provider          text not null check (provider in ('spotify','soundcloud')),
  provider_track_id text not null,
  title             text not null,
  artists           text[] not null default '{}',
  album             text,
  cover_url         text,
  duration_ms       integer not null default 0,
  liked_at          timestamptz not null default now(),
  primary key (user_id, provider, provider_track_id)
);

alter table public.liked_tracks enable row level security;

drop policy if exists "liked owner all" on public.liked_tracks;
create policy "liked owner all" on public.liked_tracks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- play_history
-- ============================================================
create table if not exists public.play_history (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  provider          text not null check (provider in ('spotify','soundcloud')),
  provider_track_id text not null,
  title             text not null,
  artists           text[] not null default '{}',
  duration_ms       integer not null default 0,
  played_at         timestamptz not null default now(),
  completion_pct    numeric(5,2) not null default 0
);

create index if not exists ph_user_played_idx
  on public.play_history(user_id, played_at desc);

alter table public.play_history enable row level security;

drop policy if exists "ph owner all" on public.play_history;
create policy "ph owner all" on public.play_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Storage: playlist covers
-- ============================================================
insert into storage.buckets (id, name, public)
  values ('playlist-covers', 'playlist-covers', true)
  on conflict (id) do nothing;

drop policy if exists "playlist covers read" on storage.objects;
create policy "playlist covers read" on storage.objects
  for select using (bucket_id = 'playlist-covers');

drop policy if exists "playlist covers owner write" on storage.objects;
create policy "playlist covers owner write" on storage.objects
  for insert with check (
    bucket_id = 'playlist-covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "playlist covers owner update" on storage.objects;
create policy "playlist covers owner update" on storage.objects
  for update using (
    bucket_id = 'playlist-covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "playlist covers owner delete" on storage.objects;
create policy "playlist covers owner delete" on storage.objects
  for delete using (
    bucket_id = 'playlist-covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
