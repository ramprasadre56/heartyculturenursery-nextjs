
-- Run this in your Supabase SQL Editor

create table if not exists orders (
  id text primary key,
  user_session_id text not null,
  details jsonb not null,
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
