const DEMO_USERNAMES = ['teste', '123'];
const DEMO_PLAN = 'teste';
const DEMO_PREVIEW_MAX_SECONDS = 5;
const DEFAULT_VIP_CONFIG = {
  contato_nome: 'Amanda',
  telegram_url: '',
  whatsapp_url: '',
  botao_contato_texto: 'Chamar no WhatsApp',
  mensagem_video: 'Entre em contato com {contato} para assinar o VIP e continuar assistindo.',
  mensagem_foto: 'Para ver todas as fotos sem censura, assine o VIP com {contato}.',
  preview_segundos: DEMO_PREVIEW_MAX_SECONDS
};
const DEFAULT_VIP_OFFERS = [
  {
    titulo: 'CHAMADA ATE GOZAR',
    descricao: 'MAXIMO 10mn',
    valor: 'R$ 30,00',
    destaque: true
  },
  {
    titulo: 'CHAMADA 5 MINUTOS',
    descricao: '',
    valor: 'R$ 20,00',
    destaque: false
  },
  {
    titulo: '1 DIA DE ACESSO',
    descricao: '',
    valor: 'R$ 10,00',
    destaque: false
  },
  {
    titulo: 'SEMANAL 7 DIAS + VIP',
    descricao: '',
    valor: 'R$ 15,00',
    destaque: true
  },
  {
    titulo: 'MENSAL 30 DIAS + PREMIUM',
    descricao: '',
    valor: 'R$ 20,00',
    destaque: true
  },
  {
    titulo: '3 MESES DE ACESSO',
    descricao: '',
    valor: 'R$ 50,00',
    destaque: false
  },
  {
    titulo: 'MANDA UM MIMO',
    descricao: 'Em troca de uma foto minha',
    valor: 'R$ 5,00',
    destaque: false
  },
  {
    titulo: 'MANDA UM MIMO',
    descricao: 'Em troca de um video meu',
    valor: 'R$ 10,00',
    destaque: false
  }
];
const DRIVE_FILE_ID_PATTERN = /^[A-Za-z0-9_-]{10,}$/;
const DIRECT_VIDEO_EXTENSION_PATTERN = /\.(mp4|webm|ogg|m4v|mov)(\?|#|$)/i;

let vipConfig = { ...DEFAULT_VIP_CONFIG };
let floatingOfferInitialized = false;
let floatingOfferManuallyClosed = false;
let floatingOfferHintTimer = null;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function encodeImageFallbacks(urls) {
  return encodeURIComponent(JSON.stringify(urls.filter(Boolean)));
}

function loadNextImageSource(img) {
  try {
    const fallbacks = JSON.parse(decodeURIComponent(img.dataset.fallbacks || '[]'));
    const nextUrl = fallbacks.shift();

    if (nextUrl) {
      img.dataset.fallbacks = encodeImageFallbacks(fallbacks);
      img.src = nextUrl;
      return;
    }
  } catch (error) {
    console.warn('Nao foi possivel carregar fallback da imagem:', error);
  }

  const card = img.closest('.preview-photo-card, .card');

