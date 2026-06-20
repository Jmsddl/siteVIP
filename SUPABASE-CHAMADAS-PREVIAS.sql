-- Sala virtual para chamada previa
-- Seguro para rodar: nao apaga dados existentes.

create extension if not exists pgcrypto;

create table if not exists public.chamadas_previas (
  id uuid primary key default gen_random_uuid(),
  username text not null default 'Anonimo',
  plano text,
  sessao_id text,
  ip text not null,
  status text not null default 'aguardando',
  meet_url text not null default 'https://meet.google.com/xso-udcm-kgc',
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
  add column if not exists meet_url text not null default 'https://meet.google.com/xso-udcm-kgc',
  add column if not exists entrou_em timestamptz,
  add column if not exists liberado_em timestamptz,
  add column if not exists finalizado_em timestamptz,
  add column if not exists detalhes jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'chamadas_previas_status_check'
      and conrelid = 'public.chamadas_previas'::regclass
  ) then
    alter table public.chamadas_previas
      add constraint chamadas_previas_status_check
      check (status in ('aguardando', 'liberado', 'em_chamada', 'finalizado', 'cancelado'));
  end if;
end $$;

create index if not exists chamadas_previas_status_created_idx
  on public.chamadas_previas (status, created_at);

create index if not exists chamadas_previas_ip_status_idx
  on public.chamadas_previas (ip, status);

-- Impede duas filas ativas para o mesmo IP.
create unique index if not exists chamadas_previas_ip_ativa_idx
  on public.chamadas_previas (ip)
  where status in ('aguardando', 'liberado', 'em_chamada');

-- Depois que a chamada previa for finalizada, o mesmo IP nao participa de novo.
create unique index if not exists chamadas_previas_ip_finalizado_idx
  on public.chamadas_previas (ip)
  where status = 'finalizado';
