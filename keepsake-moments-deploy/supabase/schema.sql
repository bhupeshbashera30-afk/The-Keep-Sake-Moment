create extension if not exists pgcrypto;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  is_main_page boolean default false,
  parent_id uuid references categories(id) on delete set null,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete cascade,
  title text not null,
  slug text unique not null,
  summary text,
  description text,
  pricing_type text check (pricing_type in ('fixed', 'custom')) not null default 'custom',
  price_label text,
  featured boolean default false,
  created_at timestamptz default now()
);

create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  short_description text,
  details text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists booking_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  service_interest text not null,
  event_date date,
  event_location text,
  budget_range text,
  guest_count integer,
  notes text,
  created_at timestamptz default now()
);

alter table categories enable row level security;
alter table services enable row level security;
alter table packages enable row level security;
alter table booking_requests enable row level security;

create policy "public can read categories" on categories for select using (true);
create policy "public can read services" on services for select using (true);
create policy "public can read packages" on packages for select using (true);
create policy "public can insert booking requests" on booking_requests for insert with check (true);
