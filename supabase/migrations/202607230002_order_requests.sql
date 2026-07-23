create table public.order_requests (
  id uuid primary key default gen_random_uuid(),
  service text not null check (service in ('art-craft', 'bridal-makeup')),
  customer_name text not null,
  phone text not null,
  event_date date,
  details text,
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.order_requests enable row level security;
