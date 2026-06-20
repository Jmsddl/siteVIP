-- Sistema de expiracao automatica para usuarios VIP.
-- Rode este arquivo no SQL Editor do Supabase.

alter table public.usuarios
add column if not exists ativo boolean not null default true;

alter table public.usuarios
add column if not exists plano text;

alter table public.usuarios
add column if not exists expira_em timestamptz;

alter table public.usuarios
add column if not exists criado_em timestamptz not null default now();

alter table public.usuarios
add column if not exists atualizado_em timestamptz not null default now();

create or replace function public.bloquear_usuarios_expirados()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.usuarios
  set
    ativo = false,
    atualizado_em = now()
  where ativo = true
    and expira_em is not null
    and expira_em <= now();
end;
$$;

grant execute on function public.bloquear_usuarios_expirados() to anon, authenticated;

create or replace function public.criar_ou_renovar_usuario(
  p_username text,
  p_senha text,
  p_plano text,
  p_dias integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.usuarios
  set
    senha = p_senha,
    ativo = true,
    plano = p_plano,
    expira_em = now() + make_interval(days => p_dias),
    atualizado_em = now()
  where username = p_username;

  if not found then
    insert into public.usuarios (
      username,
      senha,
      ativo,
      plano,
      expira_em,
      criado_em,
      atualizado_em
    )
    values (
      p_username,
      p_senha,
      true,
      p_plano,
      now() + make_interval(days => p_dias),
      now(),
      now()
    );
  end if;
end;
$$;

revoke execute on function public.criar_ou_renovar_usuario(text, text, text, integer) from public;

update public.usuarios
set
  senha = '123',
  ativo = true,
  plano = 'teste',
  expira_em = null,
  atualizado_em = now()
where username = 'teste';

insert into public.usuarios (username, senha, ativo, plano, expira_em)
select 'teste', '123', true, 'teste', null
where not exists (
  select 1 from public.usuarios where username = 'teste'
);

update public.usuarios
set
  senha = '123',
  ativo = true,
  plano = 'teste',
  expira_em = null,
  atualizado_em = now()
where username = '123';

insert into public.usuarios (username, senha, ativo, plano, expira_em)
select '123', '123', true, 'teste', null
where not exists (
  select 1 from public.usuarios where username = '123'
);

-- Exemplos para criar ou renovar usuario:

-- 1 dia:
-- select public.criar_ou_renovar_usuario('cliente1', 'senha123', '1_dia', 1);

-- 7 dias:
-- select public.criar_ou_renovar_usuario('cliente1', 'senha123', '7_dias', 7);

-- 30 dias:
-- select public.criar_ou_renovar_usuario('cliente1', 'senha123', '30_dias', 30);

-- 3 meses:
-- select public.criar_ou_renovar_usuario('cliente1', 'senha123', '3_meses', 90);

-- Bloquear imediatamente todos os vencidos:
-- select public.bloquear_usuarios_expirados();

-- Ver acessos:
-- select username, plano, ativo, expira_em
-- from public.usuarios
-- order by expira_em nulls last;
