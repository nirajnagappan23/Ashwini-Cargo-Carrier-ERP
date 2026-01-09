# Supabase Setup Guide for Ashwini Cargo ERP

## Step 1: Create Supabase Project
1.  Go to [database.new](https://database.new) and create a new project.
2.  Name it **"ashwini-cargo-erp"**.
3.  Set a secure database password (save this!).
4.  Choose a region close to your users (e.g., Mumbai/Singapore).

## Step 2: Get API Keys
1.  Once the project is ready (green "Active" status).
2.  Go to **Project Settings** (cog icon) -> **API**.
3.  Copy the **Project URL** and **anon public key**.

## Step 3: Run Database SQL
Go to the **SQL Editor** (terminal icon in left sidebar) -> New Query. Copy and run the following script to set up your tables:

```sql
-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create Users Table
create table public.users (
  id uuid references auth.users not null primary key, -- Linked to Supabase Auth
  email text unique not null,
  full_name text,
  role text check (role in ('Master Admin', 'Admin', 'Director', 'Manager', 'Staff')),
  phone text,
  status text default 'Active',
  last_login timestamptz,
  created_at timestamptz default now()
);

-- 3. Create Orders Table (Using JSONB for complex nested data like consignments/history for flexibility)
create table public.orders (
  id text primary key, -- Manual IDs like ENQ-1002
  order_id text, -- ORD001/date
  client_id text,
  client_name text,
  trip_status text, -- 'Loading', 'In Transit', etc.
  origin text,
  destination text,
  total_freight numeric,
  advance numeric,
  balance numeric,
  vehicle_no text,
  driver_name text,
  driver_phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Complex Data stored as JSON (Consignments, Tracking History, Payments, Photos)
  consignments jsonb default '[]',
  tracking_history jsonb default '[]',
  payment_history jsonb default '[]',
  documents jsonb default '[]',
  photos jsonb default '{}' -- { driver: [], loading: [], unloading: [] }
);

-- 4. Create Clients Table
create table public.clients (
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

-- 5. Enable Row Level Security (RLS) - Basic Policy for now
alter table public.users enable row level security;
alter table public.orders enable row level security;
alter table public.clients enable row level security;

-- ALLOW ALL (For initial dev phase - we will lock this down later)
create policy "Enable all access for now" on public.users for all using (true);
create policy "Enable all access for now" on public.orders for all using (true);
create policy "Enable all access for now" on public.clients for all using (true);
```

## Step 4: Configure Storage (For Images/Docs)
1. Go to **Storage** (folder icon) -> **New Bucket**.
2. Name it `attachments`.
3. Toggle "Public bucket" to **ON**.
4. Click Save.

## Step 5: Connect the App
I will create a `.env` file in your project. You just need to paste the URL and Key there.
