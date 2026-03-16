-- Enable UUID extension
create extension if not exists "pgcrypto";

-- dispatches
create table dispatches (
  id             uuid primary key default gen_random_uuid(),
  number         integer unique not null,
  content        text not null,
  phase          text not null check (phase in ('acceptance','urgency','frenzy','death')),
  days_remaining integer not null,
  is_anomaly     boolean not null default false,
  type           text not null default 'dispatch' check (type in ('dispatch','will','death')),
  created_at     timestamptz not null default now()
);

-- fragments
create table fragments (
  id         uuid primary key default gen_random_uuid(),
  content    text not null,
  created_at timestamptz not null default now()
);

-- community_inputs
create table community_inputs (
  id                uuid primary key default gen_random_uuid(),
  content           text not null,
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending','acknowledged','rejected')),
  acknowledged_in   integer references dispatches(number),
  created_at        timestamptz not null default now()
);

-- burn_events
create table burn_events (
  id               uuid primary key default gen_random_uuid(),
  burn_number      integer not null,
  amount_burned    numeric not null,
  amount_remaining numeric not null,
  tx_hash          text not null,
  dispatch_id      uuid references dispatches(id),
  created_at       timestamptz not null default now()
);

-- site_config
create table site_config (
  key   text primary key,
  value text not null
);

-- Seed site_config
insert into site_config (key, value) values
  ('tombstone_unlocked', 'false'),
  ('memory_count',       '0'),
  ('anomaly_triggered',  'false'),
  ('will_generated',     'false');

-- RLS
alter table dispatches       enable row level security;
alter table fragments        enable row level security;
alter table community_inputs enable row level security;
alter table burn_events      enable row level security;
alter table site_config      enable row level security;

create policy "public read dispatches"
  on dispatches for select using (true);

create policy "public read fragments"
  on fragments for select using (true);

create policy "public read burn_events"
  on burn_events for select using (true);

create policy "public read site_config"
  on site_config for select using (true);

create policy "anon insert community_inputs"
  on community_inputs for insert with check (true);

create policy "public read acknowledged inputs"
  on community_inputs for select
  using (moderation_status = 'acknowledged');

-- Realtime
alter publication supabase_realtime add table dispatches;
alter publication supabase_realtime add table fragments;
alter publication supabase_realtime add table burn_events;
