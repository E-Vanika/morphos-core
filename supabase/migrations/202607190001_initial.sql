create extension if not exists vector;

create table public.domain_profiles (
  id text primary key,
  display_name text not null,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.providers (
  id uuid primary key default gen_random_uuid(),
  domain_id text not null references public.domain_profiles(id),
  name text not null,
  specialty text not null,
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id),
  customer_id uuid references auth.users(id),
  guest_email text,
  starts_at timestamptz not null,
  status text not null check (status in ('draft', 'confirmed', 'cancelled')) default 'draft',
  payment_status text not null check (payment_status in ('simulated', 'not_required')) default 'not_required',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (customer_id is not null or guest_email is not null)
);

create table public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  domain_id text not null references public.domain_profiles(id),
  storage_path text not null unique,
  filename text not null,
  uploaded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.knowledge_documents(id) on delete cascade,
  content text not null,
  embedding vector(768),
  created_at timestamptz not null default now()
);

create or replace function public.match_knowledge_chunks(
  query_embedding vector(768),
  match_count int default 4
)
returns table (id uuid, content text, similarity float)
language sql stable
as $$
  select id, content, 1 - (embedding <=> query_embedding) as similarity
  from public.knowledge_chunks
  where embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;

alter table public.domain_profiles enable row level security;
alter table public.providers enable row level security;
alter table public.bookings enable row level security;
alter table public.knowledge_documents enable row level security;
alter table public.knowledge_chunks enable row level security;

create policy "public can read domains" on public.domain_profiles for select using (true);
create policy "public can read providers" on public.providers for select using (true);
create policy "users read own bookings" on public.bookings for select using (auth.uid() = customer_id);
create policy "users create their bookings" on public.bookings for insert with check (auth.uid() = customer_id);

insert into storage.buckets (id, name, public) values ('knowledge', 'knowledge', false)
on conflict (id) do nothing;
