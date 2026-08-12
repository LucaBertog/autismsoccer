-- Autism Soccer — schema do iceberg
-- Execute no SQL Editor do Supabase (Dashboard → SQL → New query)

create extension if not exists "pgcrypto";

create table if not exists public.iceberg_topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  x double precision not null check (x >= 0 and x <= 1),
  y double precision not null check (y >= 0 and y <= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists iceberg_topics_created_at_idx
  on public.iceberg_topics (created_at);

alter table public.iceberg_topics enable row level security;

-- Leitura pública
create policy "Public can read iceberg topics"
  on public.iceberg_topics
  for select
  to anon, authenticated
  using (true);

-- Escrita apenas para usuários autenticados (admins)
create policy "Authenticated can insert iceberg topics"
  on public.iceberg_topics
  for insert
  to authenticated
  with check (true);

create policy "Authenticated can update iceberg topics"
  on public.iceberg_topics
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete iceberg topics"
  on public.iceberg_topics
  for delete
  to authenticated
  using (true);

-- Opcional: trigger para updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists iceberg_topics_set_updated_at on public.iceberg_topics;
create trigger iceberg_topics_set_updated_at
  before update on public.iceberg_topics
  for each row
  execute function public.set_updated_at();
