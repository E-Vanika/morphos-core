create table public.services (
  id uuid primary key default gen_random_uuid(),
  site text not null check (site in ('art-craft', 'bridal')),
  name text not null,
  description text,
  price text not null,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.services enable row level security;
