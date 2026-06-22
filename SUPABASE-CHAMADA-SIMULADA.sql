-- CHAMADA PREVIA SIMULADA
-- Seguro para rodar: apenas adiciona campos opcionais na tabela vip_config.

alter table public.vip_config
add column if not exists chamada_previa_video_url text;

alter table public.vip_config
add column if not exists chamada_previa_duracao integer not null default 18;

update public.vip_config
set chamada_previa_duracao = 18
where chamada_previa_duracao is null
   or chamada_previa_duracao < 5;

-- Para usar um video da Amanda na chamada simulada, troque o link abaixo
-- pelo MP4 publico do Cloudflare R2 e rode somente este update:
--
-- update public.vip_config
-- set chamada_previa_video_url = 'https://SEU-LINK-R2/video-previa.mp4',
--     chamada_previa_duracao = 18,
--     updated_at = now()
-- where ativo = true;
