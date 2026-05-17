create extension if not exists pgcrypto;

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
  category text not null default 'hampers'
    check (
      category in (
        'hampers',
        'flowers',
        'crochets',
        'photobooth-rental',
        'dinner-night',
        'event-and-decor',
        'birthday',
        'anniversary',
        'proposal',
        'corporate',
        'special-occasion'
      )
    ),
  stock integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  email text,
  phone text not null,
  address text,
  products jsonb not null default '[]',
  total numeric(10,2) not null default 0,
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','failed','refunded')),
  order_status text not null default 'processing'
    check (order_status in ('processing','confirmed','preparing','dispatched','delivered','cancelled')),
  razorpay_payment_id text,
  notes text,
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

create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  subject text,
  message text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table booking_requests enable row level security;
alter table contact_submissions enable row level security;

create policy "users can read own profile" on profiles
  for select using (auth.uid() = id);

create policy "public can read active products" on products
  for select using (is_active = true);

create policy "admin full access products" on products
  for all using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "public can insert orders" on orders
  for insert with check (true);

create policy "admin can manage orders" on orders
  for all using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "public can insert booking requests" on booking_requests
  for insert with check (true);

create policy "admin can read booking requests" on booking_requests
  for select using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "public can insert contact submissions" on contact_submissions
  for insert with check (true);

create policy "admin can read contact submissions" on contact_submissions
  for select using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

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
