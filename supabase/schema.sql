-- Autism Soccer — schema do iceberg
-- Execute no SQL Editor do Supabase (Dashboard → SQL → New query)

create extension if not exists "pgcrypto";

create table if not exists public.iceberg_topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  description text not null default '',
  main_image_url text,
  layer integer not null default 1 check (layer >= 1 and layer <= 8),
  -- x/y deprecated: mantidos por compatibilidade com registros antigos
  x double precision check (x is null or (x >= 0 and x <= 1)),
  y double precision check (y is null or (y >= 0 and y <= 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists iceberg_topics_created_at_idx
  on public.iceberg_topics (created_at);

create index if not exists iceberg_topics_layer_idx
  on public.iceberg_topics (layer);

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

insert into storage.buckets (id, name, public)
values ('topic-images', 'topic-images', true)
on conflict (id) do nothing;

create policy "Public can view topic images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'topic-images');

create policy "Authenticated can upload topic images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'topic-images');

create policy "Authenticated can update topic images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'topic-images')
  with check (bucket_id = 'topic-images');

create policy "Authenticated can delete topic images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'topic-images');
