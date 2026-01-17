
-- Run this in your Supabase SQL Editor

create table if not exists orders (
  id text primary key,
  user_session_id text not null,
  user_email text, -- Added to link orders to user accounts
  details jsonb not null,
  payment_id text,
  payment_status text default 'pending',
  fulfillment_status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- For prototype/demo, allow public access
alter table orders enable row level security;

create policy "Enable access to all users" on orders for all using (true) with check (true);

-- Chat History Schema

create table if not exists chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_email text not null,
  title text default 'New Chat',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table chat_sessions enable row level security;
create policy "Public sessions" on chat_sessions for all using (true) with check (true);

create table if not exists chat_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references chat_sessions(id) on delete cascade not null,
  role text not null,
  content text not null, -- Storing JSON string or plain text depending on usage
  products jsonb, -- Store extracted products for the message if any
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table chat_messages enable row level security;
create policy "Public messages" on chat_messages for all using (true) with check (true);

-- Addresses Schema
create table if not exists addresses (
  id uuid default gen_random_uuid() primary key,
  user_email text not null,
  full_name text not null,
  phone text,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text,
  zip_code text not null,
  country text default 'India',
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table addresses enable row level security;
create policy "Public addresses" on addresses for all using (true) with check (true);
