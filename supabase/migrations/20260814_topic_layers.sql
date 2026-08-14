-- Autism Soccer — camadas, subtítulo e imagem principal
-- Incremental: não apaga tópicos nem a tabela.
-- Execute no SQL Editor do Supabase se o projeto já existir.

alter table public.iceberg_topics
  add column if not exists subtitle text,
  add column if not exists main_image_url text,
  add column if not exists layer integer;

update public.iceberg_topics
set layer = 1
where layer is null;

alter table public.iceberg_topics
  alter column layer set default 1;

alter table public.iceberg_topics
  alter column layer set not null;

alter table public.iceberg_topics
  drop constraint if exists iceberg_topics_layer_check;

alter table public.iceberg_topics
  add constraint iceberg_topics_layer_check
  check (layer >= 1 and layer <= 8);

-- x/y deprecated: deixam de ser usados na UI, mas os valores antigos permanecem.
alter table public.iceberg_topics
  alter column x drop not null;

alter table public.iceberg_topics
  alter column y drop not null;

create index if not exists iceberg_topics_layer_idx
  on public.iceberg_topics (layer);

insert into storage.buckets (id, name, public)
values ('topic-images', 'topic-images', true)
on conflict (id) do nothing;
