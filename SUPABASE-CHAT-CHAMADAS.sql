-- SALA VIRTUAL + CHAT DE CHAMADA PREVIA
-- Seguro para rodar: nao apaga conteudo existente.

create extension if not exists pgcrypto;

create table if not exists public.chamadas_previas (
  id uuid primary key default gen_random_uuid(),
  username text not null default 'Anonimo',
  plano text,
  sessao_id text,
  ip text not null default 'sem-ip',
  status text not null default 'aguardando',
  meet_url text,
  entrou_em timestamptz,
  liberado_em timestamptz,
  finalizado_em timestamptz,
  detalhes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chamadas_previas
  add column if not exists username text not null default 'Anonimo',
  add column if not exists plano text,
  add column if not exists sessao_id text,
  add column if not exists ip text not null default 'sem-ip',
  add column if not exists status text not null default 'aguardando',
  add column if not exists meet_url text,
  add column if not exists entrou_em timestamptz,
  add column if not exists liberado_em timestamptz,
  add column if not exists finalizado_em timestamptz,
  add column if not exists detalhes jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.chamadas_previas
  alter column meet_url drop default;

alter table public.chamadas_previas
  drop constraint if exists chamadas_previas_status_check;

alter table public.chamadas_previas
  add constraint chamadas_previas_status_check
  check (status in ('aguardando', 'chamando', 'liberado', 'em_chamada', 'finalizado', 'cancelado'));

drop index if exists public.chamadas_previas_ip_ativa_idx;
drop index if exists public.chamadas_previas_ip_finalizado_idx;

create unique index if not exists chamadas_previas_ip_finalizado_idx
  on public.chamadas_previas (ip)
  where status = 'finalizado'
    and ip <> '177.10.146.100';

create index if not exists chamadas_previas_status_created_idx
  on public.chamadas_previas (status, created_at);

create index if not exists chamadas_previas_ip_status_idx
  on public.chamadas_previas (ip, status);

create index if not exists chamadas_previas_ip_updated_idx
  on public.chamadas_previas (ip, updated_at desc);

create table if not exists public.chamada_mensagens (
  id uuid primary key default gen_random_uuid(),
  chamada_id uuid not null references public.chamadas_previas(id) on delete cascade,
  autor_tipo text not null default 'usuario',
  autor_nome text,
  texto text not null,
  created_at timestamptz not null default now()
);

alter table public.chamada_mensagens
  add column if not exists chamada_id uuid references public.chamadas_previas(id) on delete cascade,
  add column if not exists autor_tipo text not null default 'usuario',
  add column if not exists autor_nome text,
  add column if not exists texto text not null default '',
  add column if not exists created_at timestamptz not null default now();

alter table public.chamada_mensagens
  drop constraint if exists chamada_mensagens_autor_tipo_check;

alter table public.chamada_mensagens
  add constraint chamada_mensagens_autor_tipo_check
  check (autor_tipo in ('usuario', 'admin', 'sistema'));

create index if not exists chamada_mensagens_chamada_created_idx
  on public.chamada_mensagens (chamada_id, created_at);

create table if not exists public.sala_status (
  chave text primary key,
  online boolean not null default false,
  heartbeat_em timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.sala_status
  add column if not exists online boolean not null default false,
  add column if not exists heartbeat_em timestamptz,
  add column if not exists updated_at timestamptz not null default now();

insert into public.sala_status (chave, online, heartbeat_em, updated_at)
values ('amanda', false, now(), now())
on conflict (chave) do nothing;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.chamadas_previas to anon, authenticated;
grant select, insert, update, delete on public.chamada_mensagens to anon, authenticated;
grant select, insert, update on public.sala_status to anon, authenticated;

alter table public.chamadas_previas enable row level security;
alter table public.chamada_mensagens enable row level security;
alter table public.sala_status enable row level security;

drop policy if exists "chamadas_previas_select" on public.chamadas_previas;
drop policy if exists "chamadas_previas_insert" on public.chamadas_previas;
drop policy if exists "chamadas_previas_update" on public.chamadas_previas;

create policy "chamadas_previas_select"
on public.chamadas_previas
for select
to anon, authenticated
using (true);

create policy "chamadas_previas_insert"
on public.chamadas_previas
for insert
to anon, authenticated
with check (true);

create policy "chamadas_previas_update"
on public.chamadas_previas
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "chamada_mensagens_select" on public.chamada_mensagens;
drop policy if exists "chamada_mensagens_insert" on public.chamada_mensagens;
drop policy if exists "chamada_mensagens_update" on public.chamada_mensagens;
drop policy if exists "chamada_mensagens_delete" on public.chamada_mensagens;

create policy "chamada_mensagens_select"
on public.chamada_mensagens
for select
to anon, authenticated
using (true);

create policy "chamada_mensagens_insert"
on public.chamada_mensagens
for insert
to anon, authenticated
with check (true);

create policy "chamada_mensagens_update"
on public.chamada_mensagens
for update
to anon, authenticated
using (true)
with check (true);

create policy "chamada_mensagens_delete"
on public.chamada_mensagens
for delete
to anon, authenticated
using (true);

drop policy if exists "sala_status_select" on public.sala_status;
drop policy if exists "sala_status_insert" on public.sala_status;
drop policy if exists "sala_status_update" on public.sala_status;

create policy "sala_status_select"
on public.sala_status
for select
to anon, authenticated
using (true);

create policy "sala_status_insert"
on public.sala_status
for insert
to anon, authenticated
with check (true);

create policy "sala_status_update"
on public.sala_status
for update
to anon, authenticated
using (true)
with check (true);
