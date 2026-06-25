-- Identificacao da chamada previa por telefone + IP
-- Seguro para rodar: nao apaga dados existentes.

alter table public.chamadas_previas
add column if not exists telefone text;

-- Remove o bloqueio antigo somente por IP.
drop index if exists public.chamadas_previas_ip_finalizado_idx;

-- A partir de agora, quem ja finalizou uma chamada previa fica bloqueado pelo telefone.
-- O IP 177.10.146.100 continua liberado para seus testes.
create unique index if not exists chamadas_previas_telefone_finalizado_idx
on public.chamadas_previas (telefone)
where status = 'finalizado'
  and telefone is not null
  and telefone <> ''
  and ip <> '177.10.146.100';

create index if not exists chamadas_previas_telefone_updated_idx
on public.chamadas_previas (telefone, updated_at desc);

