-- Sala virtual para chamada previa
-- Seguro para rodar: nao apaga dados existentes.

create extension if not exists pgcrypto;

create table if not exists public.chamadas_previas (
  id uuid primary key default gen_random_uuid(),
  username text not null default 'Anonimo',
  plano text,
  sessao_id text,
  ip text not null,
  telefone text,
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
  add column if not exists telefone text,
  add column if not exists status text not null default 'aguardando',
  add column if not exists meet_url text,
  add column if not exists entrou_em timestamptz,
  add column if not exists liberado_em timestamptz,
  add column if not exists finalizado_em timestamptz,
  add column if not exists detalhes jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.chamadas_previas
  drop constraint if exists chamadas_previas_status_check;

alter table public.chamadas_previas
  add constraint chamadas_previas_status_check
  check (status in ('aguardando', 'chamando', 'liberado', 'em_chamada', 'finalizado', 'cancelado'));

create index if not exists chamadas_previas_status_created_idx
  on public.chamadas_previas (status, created_at);

create index if not exists chamadas_previas_ip_status_idx
  on public.chamadas_previas (ip, status);

create index if not exists chamadas_previas_ip_updated_idx
  on public.chamadas_previas (ip, updated_at desc);

create index if not exists chamadas_previas_telefone_updated_idx
  on public.chamadas_previas (telefone, updated_at desc);

drop index if exists public.chamadas_previas_ip_ativa_idx;

-- Depois que a chamada previa for finalizada, o mesmo telefone nao participa de novo.
drop index if exists public.chamadas_previas_ip_finalizado_idx;
drop index if exists public.chamadas_previas_telefone_finalizado_idx;

create unique index if not exists chamadas_previas_telefone_finalizado_idx
  on public.chamadas_previas (telefone)
  where status = 'finalizado'
    and telefone is not null
    and telefone <> ''
    and ip <> '177.10.146.100';
