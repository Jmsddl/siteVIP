-- Chat de texto para chamadas previas
-- Seguro para rodar: nao apaga conteudo existente.

create extension if not exists pgcrypto;

alter table public.chamadas_previas
  add column if not exists meet_url text;

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

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'chamada_mensagens_autor_tipo_check'
      and conrelid = 'public.chamada_mensagens'::regclass
  ) then
    alter table public.chamada_mensagens
      add constraint chamada_mensagens_autor_tipo_check
      check (autor_tipo in ('usuario', 'admin', 'sistema'));
  end if;
end $$;

create index if not exists chamada_mensagens_chamada_created_idx
  on public.chamada_mensagens (chamada_id, created_at);

create index if not exists chamadas_previas_ip_sessao_status_idx
  on public.chamadas_previas (ip, sessao_id, status, created_at);

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.chamada_mensagens to anon, authenticated;
grant select, insert, update on public.chamadas_previas to anon, authenticated;

alter table public.chamada_mensagens enable row level security;

drop policy if exists "chamada_mensagens_select" on public.chamada_mensagens;
drop policy if exists "chamada_mensagens_insert" on public.chamada_mensagens;
drop policy if exists "chamada_mensagens_update" on public.chamada_mensagens;

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
