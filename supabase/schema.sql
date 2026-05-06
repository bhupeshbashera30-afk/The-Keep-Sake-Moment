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
-- ══════════════════════════════════════════
-- COMMERCE TABLES
-- ══════════════════════════════════════════

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  image_url text,
  category text not null default 'hampers',
  stock integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  email text not null,
  phone text not null,
  address text,
  products jsonb not null default '[]',
  total numeric(10,2) not null default 0,
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','failed','refunded')),
  order_status text not null default 'processing'
    check (order_status in ('processing','confirmed','preparing','dispatched','delivered','cancelled')),
  razorpay_payment_id text,
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;

-- Profiles: user reads own row, admin reads all
create policy "users can read own profile" on profiles
  for select using (auth.uid() = id);

-- Products: public reads active ones
create policy "public can read active products" on products
  for select using (is_active = true);

-- Products: admin can do everything (via service role or RLS bypass in admin)
create policy "admin full access products" on products
  for all using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Orders: anyone can insert (guest checkout)
create policy "public can insert orders" on orders
  for insert with check (true);

-- Orders: admin can read/update all
create policy "admin can manage orders" on orders
  for all using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();