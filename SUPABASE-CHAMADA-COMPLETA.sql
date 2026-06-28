-- Chamada completa real: tokens de acesso unico + sinalizacao WebRTC.
-- Pode rodar no SQL Editor sem apagar tabelas/conteudos existentes.

create extension if not exists pgcrypto;

create table if not exists public.chamada_completa_tokens (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  plano text not null default '5_minutos',
  duracao_minutos integer not null default 5,
  status text not null default 'novo'
    check (status in ('novo', 'em_uso', 'usado', 'cancelado', 'expirado')),
  criado_por text,
  observacoes text,
  sessao_id uuid,
  usado_por_username text,
  usado_por_ip text,
  criado_em timestamptz not null default now(),
  expira_em timestamptz not null default (now() + interval '24 hours'),
  usado_em timestamptz,
  atualizado_em timestamptz not null default now()
);

create table if not exists public.chamada_completa_sessoes (
  id uuid primary key default gen_random_uuid(),
  token_id uuid references public.chamada_completa_tokens(id) on delete set null,
  codigo text not null,
  status text not null default 'aguardando'
    check (status in ('aguardando', 'chamando', 'em_chamada', 'finalizada', 'cancelada')),
  username text,
  plano text,
  duracao_minutos integer not null default 5,
  ip text,
  sessao_id text,
  cliente_online boolean not null default false,
  admin_online boolean not null default false,
  criado_em timestamptz not null default now(),
  iniciada_em timestamptz,
  finalizada_em timestamptz,
  atualizado_em timestamptz not null default now()
);

create table if not exists public.chamada_completa_sinais (
  id bigint generated always as identity primary key,
  sessao_id uuid not null references public.chamada_completa_sessoes(id) on delete cascade,
  autor text not null check (autor in ('cliente', 'admin')),
  tipo text not null check (tipo in ('offer', 'answer', 'ice', 'end')),
  payload jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);

create index if not exists chamada_completa_tokens_codigo_idx
  on public.chamada_completa_tokens (codigo);

create index if not exists chamada_completa_tokens_status_idx
  on public.chamada_completa_tokens (status, criado_em desc);

create index if not exists chamada_completa_sessoes_status_idx
  on public.chamada_completa_sessoes (status, criado_em desc);

create index if not exists chamada_completa_sessoes_token_idx
  on public.chamada_completa_sessoes (token_id);

create index if not exists chamada_completa_sinais_sessao_idx
  on public.chamada_completa_sinais (sessao_id, id);

alter table public.chamada_completa_tokens enable row level security;
alter table public.chamada_completa_sessoes enable row level security;
alter table public.chamada_completa_sinais enable row level security;

drop policy if exists "chamada completa tokens ler" on public.chamada_completa_tokens;
drop policy if exists "chamada completa tokens inserir" on public.chamada_completa_tokens;
drop policy if exists "chamada completa tokens atualizar" on public.chamada_completa_tokens;
drop policy if exists "chamada completa sessoes ler" on public.chamada_completa_sessoes;
drop policy if exists "chamada completa sessoes inserir" on public.chamada_completa_sessoes;
drop policy if exists "chamada completa sessoes atualizar" on public.chamada_completa_sessoes;
drop policy if exists "chamada completa sinais ler" on public.chamada_completa_sinais;
drop policy if exists "chamada completa sinais inserir" on public.chamada_completa_sinais;
drop policy if exists "chamada completa sinais apagar" on public.chamada_completa_sinais;

create policy "chamada completa tokens ler"
  on public.chamada_completa_tokens for select
  using (true);

create policy "chamada completa tokens inserir"
  on public.chamada_completa_tokens for insert
  with check (true);

create policy "chamada completa tokens atualizar"
  on public.chamada_completa_tokens for update
  using (true)
  with check (true);

create policy "chamada completa sessoes ler"
  on public.chamada_completa_sessoes for select
  using (true);

create policy "chamada completa sessoes inserir"
  on public.chamada_completa_sessoes for insert
  with check (true);

create policy "chamada completa sessoes atualizar"
  on public.chamada_completa_sessoes for update
  using (true)
  with check (true);

create policy "chamada completa sinais ler"
  on public.chamada_completa_sinais for select
  using (true);

create policy "chamada completa sinais inserir"
  on public.chamada_completa_sinais for insert
  with check (true);

create policy "chamada completa sinais apagar"
  on public.chamada_completa_sinais for delete
  using (true);

do $$
begin
  alter publication supabase_realtime add table public.chamada_completa_sessoes;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.chamada_completa_sinais;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
