-- Time slots table
create table time_slots (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  slot_time text not null, -- e.g., '18h00'
  max_reservations int not null default 10,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Reservations table
create table reservations (
  id uuid primary key default gen_random_uuid(),
  time_slot_id uuid references time_slots(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  week_start date not null,
  slot_time text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  status text default 'pending' -- or 'confirmed', 'cancelled'
);

-- (Optional) Users table
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);