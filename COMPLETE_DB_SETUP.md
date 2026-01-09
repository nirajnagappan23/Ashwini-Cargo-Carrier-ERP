
-- COMPLETE DATABASE SETUP
-- 1. Run this entire script in the Supabase SQL Editor.
-- 2. It will create all necessary tables and columns at once.

-- EXTENSIONS
create extension if not exists "uuid-ossp";

-- 1. USERS TABLE
create table if not exists public.users (
  id text primary key, -- Using text ID to match our mock data (USR-001) for now, can migrate to UUID later
  email text unique not null,
  name text,
  role text,
  phone text,
  status text default 'Active',
  last_login text,
  password text, -- Storing plain for demo only
  created_at timestamptz default now()
);

-- 2. CLIENTS TABLE
create table if not exists public.clients (
  id text primary key, -- CLT-001
  name text not null,
  email text,
  phone text,
  gst text,
  address text,
  total_orders int default 0,
  pending_payment numeric default 0,
  created_at timestamptz default now()
);

-- 3. BROKERS TABLE
create table if not exists public.brokers (
  id text primary key, -- BRK-001
  name text,
  phone text,
  email text,
  address text,
  gst text,
  total_trips int default 0,
  last_used date default current_date,
  created_at timestamptz default now()
);

-- 4. ORDERS TABLE (Core)
create table if not exists public.orders (
  id text primary key, -- ENQ-1002
  order_id text, -- ORD001/date
  order_date text,
  client_ref text,
  
  -- Client Data
  client_name text,
  client_phone text,
  client_email text,
  
  -- Trip Details
  origin text,
  destination text,
  trip_status text, 
  status text, -- 'Confirmed', 'Negotiation'
  vehicle_type text,
  
  -- Financials
  total_freight numeric,
  advance numeric,
  balance numeric,
  quote_amount numeric,
  client_price numeric,
  freight_rate numeric,
  freight_unit text,
  pay_type text, -- 'To Pay'
  payment_mode text,
  
  -- Truck Financials (NEW COLUMNS)
  truck_hire numeric default 0,
  truck_advance_paid numeric default 0, -- Sum of advances
  truck_total_expenses numeric default 0,
  truck_total_paid numeric default 0,
  truck_balance numeric default 0,

  -- Operational
  vehicle_no text,
  driver_name text,
  driver_phone text,
  
  -- JSON Complex Data
  pickups jsonb default '[]',
  drops jsonb default '[]',
  materials jsonb default '[]',
  consignments jsonb default '[]',
  
  -- History & Docs
  tracking_history jsonb default '[]',
  payment_history jsonb default '[]',
  truck_payment_history jsonb default '[]', -- NEW
  truck_expenses jsonb default '[]', -- NEW
  documents jsonb default '[]',
  chats jsonb default '[]',
  
  -- Photos
  driver_photos jsonb default '[]',
  loading_photos jsonb default '[]',
  unloading_photos jsonb default '[]',
  
  created_at timestamptz default now()
);

-- 5. SECURITY POLICIES (Allow All for Demo)
alter table public.users enable row level security;
alter table public.orders enable row level security;
alter table public.clients enable row level security;
alter table public.brokers enable row level security;

create policy "Enable all access for users" on public.users for all using (true);
create policy "Enable all access for orders" on public.orders for all using (true);
create policy "Enable all access for clients" on public.clients for all using (true);
create policy "Enable all access for brokers" on public.brokers for all using (true);
