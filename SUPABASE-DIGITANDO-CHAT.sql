-- STATUS "DIGITANDO" DO CHAT
-- Seguro para rodar: cria/ajusta uma tabela pequena e nao apaga dados existentes.

create extension if not exists pgcrypto;

create table if not exists public.chamada_digitando (
  chamada_id uuid not null references public.chamadas_previas(id) on delete cascade,
  lado text not null,
  digitando boolean not null default false,
  atualizado_em timestamptz not null default now(),
  primary key (chamada_id, lado)
);

alter table public.chamada_digitando
  add column if not exists chamada_id uuid references public.chamadas_previas(id) on delete cascade,
  add column if not exists lado text not null default 'usuario',
  add column if not exists digitando boolean not null default false,
  add column if not exists atualizado_em timestamptz not null default now();

alter table public.chamada_digitando
  drop constraint if exists chamada_digitando_lado_check;

alter table public.chamada_digitando
  add constraint chamada_digitando_lado_check
  check (lado in ('usuario', 'admin'));

create index if not exists chamada_digitando_atualizado_idx
  on public.chamada_digitando (atualizado_em desc);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.chamada_digitando to anon, authenticated;

alter table public.chamada_digitando enable row level security;

drop policy if exists "chamada_digitando_select" on public.chamada_digitando;
drop policy if exists "chamada_digitando_insert" on public.chamada_digitando;
drop policy if exists "chamada_digitando_update" on public.chamada_digitando;
drop policy if exists "chamada_digitando_delete" on public.chamada_digitando;

create policy "chamada_digitando_select"
on public.chamada_digitando
for select
to anon, authenticated
using (true);

create policy "chamada_digitando_insert"
on public.chamada_digitando
for insert
to anon, authenticated
with check (true);

create policy "chamada_digitando_update"
on public.chamada_digitando
for update
to anon, authenticated
using (true)
with check (true);

create policy "chamada_digitando_delete"
on public.chamada_digitando
for delete
to anon, authenticated
using (true);
