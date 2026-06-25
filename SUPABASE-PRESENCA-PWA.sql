-- Presenca online/offline da sala virtual
-- Seguro para rodar: nao apaga conteudo das tabelas.

create table if not exists public.sala_status (
  chave text primary key,
  online boolean not null default false,
  heartbeat_em timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.sala_status (chave, online, heartbeat_em, updated_at)
values ('amanda', false, now(), now())
on conflict (chave) do nothing;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.sala_status to anon, authenticated;

alter table public.sala_status enable row level security;

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

-- Ajuste do IP de teste: 177.10.146.100 pode finalizar varias chamadas previas.
-- Isso substitui somente o indice de bloqueio por IP finalizado, sem apagar linhas.
drop index if exists public.chamadas_previas_ip_finalizado_idx;

create unique index if not exists chamadas_previas_ip_finalizado_idx
  on public.chamadas_previas (ip)
  where status = 'finalizado'
    and ip <> '177.10.146.100';
