
-- Update Orders Table to support Truck Financials
-- Run this in your Supabase SQL Editor if you want to persist Truck Payments and Expenses

-- 1. Add jsonb columns for Truck History and Expenses
alter table public.orders 
add column if not exists truck_payment_history jsonb default '[]',
add column if not exists truck_expenses jsonb default '[]';

-- 2. Add numeric columns for Truck Financial Totals
alter table public.orders
add column if not exists truck_hire numeric default 0,
add column if not exists truck_advance_paid numeric default 0,
add column if not exists truck_total_expenses numeric default 0,
add column if not exists truck_total_paid numeric default 0,
add column if not exists truck_balance numeric default 0;

-- 3. Add Brokers Table (Optional - for future use)
create table if not exists public.brokers (
  id text primary key,
  name text,
  phone text,
  email text,
  address text,
  gst text,
  total_trips int default 0,
  last_used date default current_date
);

-- Enable RLS for Brokers
alter table public.brokers enable row level security;
create policy "Enable all access for now" on public.brokers for all using (true);
