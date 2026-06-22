-- CHAMADA PREVIA SIMULADA
-- Seguro para rodar: apenas adiciona campos opcionais na tabela vip_config.

alter table public.vip_config
add column if not exists chamada_previa_video_url text;

alter table public.vip_config
add column if not exists chamada_previa_duracao integer;

alter table public.vip_config
alter column chamada_previa_duracao drop not null;

alter table public.vip_config
alter column chamada_previa_duracao drop default;

-- Deixe chamada_previa_duracao vazio/null ou 0 para usar a duracao real do video.
-- Se quiser cortar antes, coloque a quantidade de segundos desejada.
update public.vip_config
set chamada_previa_duracao = null
where chamada_previa_duracao is not null
  and chamada_previa_duracao < 5;

-- Para usar um video da Amanda na chamada simulada, troque o link abaixo
-- pelo MP4 publico do Cloudflare R2 e rode somente este update:
--
-- update public.vip_config
-- set chamada_previa_video_url = 'https://SEU-LINK-R2/video-previa.mp4',
--     chamada_previa_duracao = null,
--     updated_at = now()
-- where ativo = true;
