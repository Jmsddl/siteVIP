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
  preview_segundos: DEMO_PREVIEW_MAX_SECONDS,
  chamada_previa_video_url: '',
  chamada_previa_duracao: 0
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
    descricao: 'Em troca de um vídeo meu',
    valor: 'R$ 10,00',
    destaque: false
  }
];
const DRIVE_FILE_ID_PATTERN = /^[A-Za-z0-9_-]{10,}$/;
const DIRECT_VIDEO_EXTENSION_PATTERN = /\.(mp4|webm|ogg|m4v|mov)(\?|#|$)/i;
const ANALYTICS_SESSION_KEY = 'analytics_session_id';
const ADMIN_PLAN = 'admin';
const VIP_LOCK_MESSAGE = 'Assine o VIP e continue assistindo.';
const VIP_CHECKOUT_OPTIONS = [
  {
    value: '7_dias',
    label: '7 dias de acesso',
    url: 'https://paylume.fans/c/amandavip'
  },
  {
    value: '30_dias',
    label: '30 dias de acesso',
    url: 'https://paylume.fans/c/amandavip-3034'
  },
  {
    value: '3_meses',
    label: '3 meses de acesso',
    url: 'https://naomeclonaporfavor.com/c/amandavip-ff1e'
  }
];
const PREVIEW_CALL_TABLE = 'chamadas_previas';
const PREVIEW_CALL_MESSAGES_TABLE = 'chamada_mensagens';
const PREVIEW_TYPING_TABLE = 'chamada_digitando';
const JAAS_APP_ID = 'vpaas-magic-cookie-40aa8f8eaa4b44919530d6a192485f88';
const JAAS_TOKEN_ENDPOINT = '/api/jaas-token';
const PREVIEW_CALL_VIDEO_DOMAIN = '8x8.vc';
const PREVIEW_CALL_VIDEO_BASE_URL = `https://${PREVIEW_CALL_VIDEO_DOMAIN}/${JAAS_APP_ID}`;
const PREVIEW_CALL_POLL_MS = 1200;
const PREVIEW_CHAT_POLL_MS = 1200;
const PREVIEW_CALL_RING_TIMEOUT_MS = 45000;
const PREVIEW_SIMULATED_RING_MS = 5600;
const PREVIEW_SIMULATED_CALL_DEFAULT_SECONDS = 18;
const PREVIEW_SIMULATED_CONTROLS_HIDE_MS = 5200;
const PREVIEW_CALL_ACTIVE_STATUSES = ['aguardando', 'chamando', 'liberado', 'em_chamada'];
const PREVIEW_CHAT_VISIBLE_STATUSES = ['aguardando', 'chamando', 'liberado', 'em_chamada', 'finalizado'];
const PREVIEW_CALL_TEST_IPS = ['177.10.146.100'];
const PREVIEW_VISITOR_STORAGE_KEY = 'amanda_preview_visitor_name';
const PREVIEW_PHONE_STORAGE_KEY = 'amanda_preview_phone';
const PREVIEW_PHONE_IP_STORAGE_KEY = 'amanda_preview_phone_ip';
const PREVIEW_FORCE_FINISH_STORAGE_KEY = 'amanda_preview_force_finish_call';
const PREVIEW_FINISHED_MESSAGE = 'Voce ja participou, agora pague a chamada completa.';
const PREVIEW_CONNECT_DELAY_MS = 6000;
const PREVIEW_VISITOR_SYSTEM_TTL_MS = 10000;
const PREVIEW_TYPING_TTL_MS = 20000;
const PREVIEW_TYPING_THROTTLE_MS = 1600;
const PREVIEW_UNREAD_POLL_MS = 5000;
const PRESENCE_TABLE = 'sala_status';
const PRESENCE_KEY = 'amanda';
const PRESENCE_POLL_MS = 15000;
const PRESENCE_ONLINE_WINDOW_MS = 180000;
const FULL_CALL_OPTIONS = [
  {
    value: '5_min',
    label: 'Chamada 5 minutos',
    url: 'https://paylume.fans/c/chamada-com-amanda-7732'
  },
  {
    value: '10_min',
    label: 'Chamada 10 minutos',
    url: 'https://paylume.fans/c/chamada-com-amanda'
  }
];
const COMPLETE_CALL_TOKENS_TABLE = 'chamada_completa_tokens';
const COMPLETE_CALL_SESSIONS_TABLE = 'chamada_completa_sessoes';
const COMPLETE_CALL_SIGNALS_TABLE = 'chamada_completa_sinais';
const COMPLETE_CALL_SIGNAL_POLL_MS = 1500;
const COMPLETE_CALL_PRECONNECT_SECONDS = 9;
const COMPLETE_CALL_PRECONNECT_SYNC_DELAY_MS = 6000;
const COMPLETE_CALL_RINGING_MS = 3600;
const COMPLETE_CALL_ANSWER_TIMEOUT_MS = 60000;
const COMPLETE_CALL_CLIPBOARD_KEY = 'amanda_last_complete_call_code';
const COMPLETE_CALL_RTC_CONFIG = {
  iceCandidatePoolSize: 10,
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};
const COMPLETE_CALL_CONTROLS_HIDE_MS = 5200;
const COMPLETE_CALL_MIC_HINT_MS = 5600;

let vipConfig = { ...DEFAULT_VIP_CONFIG };
let floatingOfferInitialized = false;
let floatingOfferManuallyClosed = false;
let floatingOfferHintTimer = null;
let analyticsIpPromise = null;
let previewCallRecord = null;
let previewCallPollTimer = null;
let previewCallTimer = null;
let previewChatPollTimer = null;
let previewUnreadPollTimer = null;
let previewUnreadChecking = false;
let previewCallRingTimer = null;
let previewIncomingPollTimer = null;
let previewSimulatedFinishTimer = null;
let previewSimulatedProgressTimer = null;
let previewSimulatedMetadataTimer = null;
let previewSimulatedControlsTimer = null;
let previewChatTemporaryRenderTimer = null;
let previewVibrationTimer = null;
let previewRingAudioTimer = null;
let previewRingAudioContext = null;
let previewCameraStream = null;
let previewCameraFacingMode = 'user';
let previewMicEnabled = false;
let previewCameraEnabled = true;
let previewJitsiApi = null;
let previewAutoJoinPending = false;
let previewIncomingCallKey = '';
let previewCallStartedAt = null;
let previewChatOpenedAt = null;
let presencePollTimer = null;
let previewChatLastRenderKey = '';
let previewChatLastMessageKey = '';
let previewTypingLastSentAt = 0;
let previewAdminTypingActive = false;
let previewTypingChannel = null;
let previewTypingChannelId = '';
let previewTypingResetTimer = null;
let previewAdminTypingLiveUntil = 0;
let previewCallClosingForBackground = false;
let amandaPresenceOnline = false;
let completeCallSession = null;
let completeCallPeer = null;
let completeCallLocalStream = null;
let completeCallRemoteStream = null;
let completeCallSignalChannel = null;
let completeCallSignalPollTimer = null;
let completeCallLastSignalId = 0;
let completeCallStarted = false;
let completeCallPendingIce = [];
let completeCallEnding = false;
let completeCallFacingMode = 'user';
let completeCallCameraEnabled = true;
let completeCallMicEnabled = false;
let completeCallControlsTimer = null;
let completeCallClockTimer = null;
let completeCallAutoEndTimer = null;
let completeCallConnected = false;
let completeCallMicHintShown = false;
let completeCallAnswerTimer = null;
let completeCallPreparing = false;
let completeCallSessionPollTimer = null;

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

  if (card) {
    card.classList.add('is-broken');
  }
}

function getStoredUser() {
  try {
    return JSON.parse(sessionStorage.getItem('user')) || {};
  } catch (error) {
    return {};
  }
}

function isAdminUser() {
  return String(getStoredUser().plano || '').toLowerCase() === ADMIN_PLAN;
}

function isDemoUser() {
  const user = getStoredUser();
  const username = String(user.username || '').toLowerCase();
  const plan = String(user.plano || '').toLowerCase();

  return plan === DEMO_PLAN || DEMO_USERNAMES.includes(username);
}

function getAnalyticsSessionId() {
  let sessionId = sessionStorage.getItem(ANALYTICS_SESSION_KEY);

  if (!sessionId) {
    if (window.crypto?.randomUUID) {
      sessionId = window.crypto.randomUUID();
    } else {
      sessionId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    sessionStorage.setItem(ANALYTICS_SESSION_KEY, sessionId);
  }

  return sessionId;
}

function getClientIp() {
  if (!analyticsIpPromise) {
    analyticsIpPromise = fetch('/cdn-cgi/trace', { cache: 'no-store' })
      .then((response) => (response.ok ? response.text() : ''))
      .then((text) => {
        const match = text.match(/^ip=(.+)$/m);
        return match ? match[1].trim() : '';
      })
      .catch(() => '');
  }

  return analyticsIpPromise;
}

function trackEvent(evento, detalhes = {}) {
  const user = getStoredUser();

  if (typeof _supa === 'undefined' || !_supa || !evento) {
    return Promise.resolve();
  }

  return getClientIp().then((ip) => (
    _supa
      .from('analytics_eventos')
      .insert({
        username: user.username || 'Anonimo',
        plano: user.plano || '',
        sessao_id: getAnalyticsSessionId(),
        ip: ip || null,
        evento,
        alvo_tipo: detalhes.alvo_tipo || null,
        alvo_titulo: detalhes.alvo_titulo || null,
        alvo_url: detalhes.alvo_url || null,
        pagina: window.location.pathname,
        user_agent: navigator.userAgent,
        detalhes
      })
      .then(({ error }) => {
        if (error) {
          console.warn('Analytics nao registrado:', error.message || error);
        }
      })
  )).catch((error) => {
    console.warn('Analytics nao registrado:', error.message || error);
  });
}

function setupAdminAnalyticsLink() {
  const analyticsButton = document.getElementById('btn-analytics');
  const roomButton = document.getElementById('btn-call-room-admin');
  const hidden = !isAdminUser();

  if (analyticsButton) {
    analyticsButton.hidden = hidden;
  }

  if (roomButton) {
    roomButton.hidden = hidden;
  }
}

function normalizeVipConfig(config) {
  const configuredCallDuration = Number(config?.chamada_previa_duracao);

  return {
    ...DEFAULT_VIP_CONFIG,
    ...(config || {}),
    preview_segundos: Math.min(
      DEMO_PREVIEW_MAX_SECONDS,
      Math.max(1, Number(config?.preview_segundos || DEFAULT_VIP_CONFIG.preview_segundos))
    ),
    chamada_previa_video_url: String(config?.chamada_previa_video_url || '').trim(),
    chamada_previa_duracao: Number.isFinite(configuredCallDuration) && configuredCallDuration > 0
      ? Math.min(180, Math.max(5, configuredCallDuration))
      : 0
  };
}

async function loadVipConfig() {
  const { data, error } = await _supa
    .from('vip_config')
    .select('*')
    .eq('ativo', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('Usando configuracao VIP padrao:', error);
    return normalizeVipConfig();
  }

  return normalizeVipConfig(data);
}

async function loadVipOffers() {
  const { data, error } = await _supa
    .from('vip_ofertas')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('Usando ofertas VIP padrao:', error);
    return DEFAULT_VIP_OFFERS;
  }

  return data?.length ? data : DEFAULT_VIP_OFFERS;
}

function buildVipMessage(type) {
  const template = type === 'foto'
    ? vipConfig.mensagem_foto
    : vipConfig.mensagem_video;
  const contato = vipConfig.contato_nome || DEFAULT_VIP_CONFIG.contato_nome;

  return String(template || '').replaceAll('{contato}', contato);
}

function getContactUrl() {
  return vipConfig.whatsapp_url || '';
}

function getContactButtonText() {
  return vipConfig.botao_contato_texto || DEFAULT_VIP_CONFIG.botao_contato_texto;
}

function getVipCheckoutOption(value) {
  return VIP_CHECKOUT_OPTIONS.find((option) => option.value === value) || null;
}

function waitBrieflyForAnalytics(eventPromise) {
  return Promise.race([
    Promise.resolve(eventPromise),
    new Promise((resolve) => window.setTimeout(resolve, 450))
  ]);
}

function buildVipCheckoutHtml() {
  return `
    <div class="vip-checkout-box">
      <label class="vip-checkout-label">
        Escolha seu tempo de acesso
      </label>
      <select class="vip-plan-select" aria-label="Escolha o tempo de acesso">
        <option value="">Selecione uma opcao</option>
        ${VIP_CHECKOUT_OPTIONS.map((option) => `
          <option value="${escapeHtml(option.value)}">
            ${escapeHtml(option.label)}
          </option>
        `).join('')}
      </select>
      <button class="vip-lock-button vip-checkout-button" type="button" disabled>
        Liberar VIP
      </button>
    </div>
  `;
}

function buildVipNoticeHtml(type, extraClass = '') {
  return `
    <div class="vip-lock-card ${extraClass}">
      <span class="vip-lock-kicker">Acesso VIP</span>
      <h3>Conteudo bloqueado</h3>
      <p>${VIP_LOCK_MESSAGE}</p>
      ${buildVipCheckoutHtml()}
    </div>
  `;
}

function setupVipCheckoutHandlers() {
  document.addEventListener('change', (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const select = event.target.closest('.vip-plan-select');

    if (!select) {
      return;
    }

    const card = select.closest('.vip-lock-card');
    const button = card?.querySelector('.vip-checkout-button');
    const selectedOption = getVipCheckoutOption(select.value);

    if (!button) {
      return;
    }

    button.disabled = !selectedOption;
    button.classList.toggle('is-ready', Boolean(selectedOption));

    if (selectedOption) {
      trackEvent('selecionou_plano_vip', {
        alvo_tipo: 'checkout',
        alvo_titulo: selectedOption.label,
        alvo_url: selectedOption.url
      });
    }
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const button = event.target.closest('.vip-checkout-button');

    if (!button || button.disabled) {
      return;
    }

    const card = button.closest('.vip-lock-card');
    const select = card?.querySelector('.vip-plan-select');
    const selectedOption = getVipCheckoutOption(select?.value || '');

    if (!selectedOption) {
      return;
    }

    const analyticsPromise = trackEvent('clicou_liberar_vip', {
      alvo_tipo: 'checkout',
      alvo_titulo: selectedOption.label,
      alvo_url: selectedOption.url
    });

    waitBrieflyForAnalytics(analyticsPromise).finally(() => {
      window.location.href = selectedOption.url;
    });
  });
}

function getFullCallOption(value) {
  return FULL_CALL_OPTIONS.find((option) => option.value === value) || null;
}

function normalizeCompleteCallCode(value) {
  const text = String(value || '').trim().toUpperCase();
  const embeddedCode = extractCompleteCallCode(text);

  if (embeddedCode) {
    return embeddedCode;
  }

  return text
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

function extractCompleteCallCode(value) {
  const match = String(value || '').toUpperCase().match(/\bVIP-[A-Z0-9]{4,12}\b/);

  return match ? match[0] : '';
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const input = document.createElement('textarea');
  input.value = text;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  input.remove();
}

async function copyCompleteCodeFromChat(button) {
  const code = button?.dataset?.copyCode || '';

  if (!code) {
    return;
  }

  const normalizedCode = normalizeCompleteCallCode(code);

  if (normalizedCode) {
    try {
      window.localStorage?.setItem(COMPLETE_CALL_CLIPBOARD_KEY, normalizedCode);
    } catch (storageError) {
      console.warn('Nao consegui salvar codigo localmente:', storageError);
    }
  }

  try {
    await copyTextToClipboard(normalizedCode || code);
    button.textContent = 'Copiado';
    button.classList.add('is-copied');
    window.setTimeout(() => {
      if (!button.isConnected) {
        return;
      }

      button.textContent = 'Copiar código';
      button.classList.remove('is-copied');
    }, 1800);
  } catch (error) {
    console.warn('Nao consegui copiar codigo:', error);
    button.textContent = code;
  }
}

function setCompleteTokenStatus(message, type = '') {
  const status = document.getElementById('complete-token-status');

  if (!status) {
    return;
  }

  status.textContent = message || '';
  status.classList.toggle('is-error', type === 'error');
  status.classList.toggle('is-ok', type === 'ok');
}

async function pasteCompleteCallToken() {
  const input = document.getElementById('complete-token-input');
  const pasteButton = document.getElementById('complete-token-paste');

  if (!input) {
    return;
  }

  const fillCode = (value, source = 'manual') => {
    const normalizedCode = normalizeCompleteCallCode(value);

    if (!normalizedCode) {
      return '';
    }

    input.value = normalizedCode;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    setCompleteTokenStatus('Codigo colado. Agora toque em Liberar chamada.', 'ok');
    input.focus();
    input.select?.();
    if (pasteButton) {
      pasteButton.textContent = 'Colado';
      window.setTimeout(() => {
        if (pasteButton.isConnected) {
          pasteButton.textContent = 'Colar codigo';
        }
      }, 1600);
    }
    trackEvent('colou_token_chamada_completa', {
      alvo_tipo: 'chamada_completa',
      alvo_titulo: normalizedCode,
      alvo_origem: source
    });
    return normalizedCode;
  };

  try {
    const savedCode = window.localStorage?.getItem(COMPLETE_CALL_CLIPBOARD_KEY);

    if (fillCode(savedCode, 'chat')) {
      return;
    }
  } catch (storageError) {
    console.warn('Nao consegui ler codigo salvo localmente:', storageError);
  }

  try {
    if (!navigator.clipboard?.readText) {
      throw new Error('clipboard_read_unavailable');
    }

    const clipboardText = await navigator.clipboard.readText();

    if (!fillCode(clipboardText, 'clipboard')) {
      setCompleteTokenStatus('Nao encontrei um codigo copiado. Copie o codigo no chat e tente de novo.', 'error');
      input.focus();
      return;
    }
  } catch (error) {
    console.warn('Nao consegui colar codigo automaticamente:', error);
    setCompleteTokenStatus('Toque no codigo dentro do chat em Copiar codigo e depois volte aqui em Colar codigo.', 'error');
    input.focus();
    input.select?.();
  }
}

function setCompleteVideoStatus(message) {
  const status = document.getElementById('complete-video-status');

  if (status) {
    status.textContent = message || '';
  }
}

function getCompleteVideoConstraints(facingMode = completeCallFacingMode) {
  return {
    facingMode,
    width: { ideal: 540, max: 720 },
    height: { ideal: 960, max: 1280 },
    frameRate: { ideal: 24, max: 30 }
  };
}

function setCompleteCallControlsVisible(visible) {
  const screen = document.querySelector('[data-complete-screen]');

  if (!screen || !completeCallStarted) {
    return;
  }

  screen.classList.toggle('is-controls-hidden', !visible);

  if (!visible) {
    screen.classList.remove('is-mic-hint-visible');
  }
}

function scheduleCompleteCallControlsHide() {
  if (completeCallControlsTimer) {
    window.clearTimeout(completeCallControlsTimer);
  }

  completeCallControlsTimer = window.setTimeout(() => {
    completeCallControlsTimer = null;
    setCompleteCallControlsVisible(false);
  }, COMPLETE_CALL_CONTROLS_HIDE_MS);
}

function showCompleteCallControlsTemporarily() {
  if (!completeCallStarted) {
    return;
  }

  setCompleteCallControlsVisible(true);
  scheduleCompleteCallControlsHide();
}

function showCompleteMicHint() {
  if (completeCallMicHintShown) {
    return;
  }

  const screen = document.querySelector('[data-complete-screen]');

  if (!screen) {
    return;
  }

  completeCallMicHintShown = true;
  setCompleteCallControlsVisible(true);
  screen.classList.add('is-mic-hint-visible');

  if (completeCallControlsTimer) {
    window.clearTimeout(completeCallControlsTimer);
  }

  completeCallControlsTimer = window.setTimeout(() => {
    completeCallControlsTimer = null;
    screen.classList.remove('is-mic-hint-visible');
    setCompleteCallControlsVisible(false);
  }, COMPLETE_CALL_MIC_HINT_MS);
}

function updateCompleteCallControls() {
  const cameraButton = document.querySelector('[data-complete-toggle-camera]');
  const micButton = document.querySelector('[data-complete-toggle-mic]');
  const cameraLabel = document.querySelector('[data-complete-camera-label]');
  const micLabel = document.querySelector('[data-complete-mic-label]');

  if (cameraButton) {
    cameraButton.classList.toggle('is-muted', !completeCallCameraEnabled);
  }

  if (cameraLabel) {
    cameraLabel.textContent = completeCallCameraEnabled ? 'Desligar câmera' : 'Ligar câmera';
  }

  if (micButton) {
    micButton.classList.toggle('is-muted', !completeCallMicEnabled);
  }

  if (micLabel) {
    micLabel.textContent = completeCallMicEnabled ? 'Silenciar' : 'Mic desligado';
  }
}

function resetCompleteCallClock() {
  if (completeCallClockTimer) {
    window.clearInterval(completeCallClockTimer);
    completeCallClockTimer = null;
  }

  if (completeCallAutoEndTimer) {
    window.clearTimeout(completeCallAutoEndTimer);
    completeCallAutoEndTimer = null;
  }

  const clock = document.getElementById('complete-call-time');

  if (clock) {
    clock.textContent = '00:00';
  }
}

function clearCompleteCallAnswerTimer() {
  if (completeCallAnswerTimer) {
    window.clearTimeout(completeCallAnswerTimer);
    completeCallAnswerTimer = null;
  }
}

function stopCompleteCallSessionPolling() {
  if (completeCallSessionPollTimer) {
    window.clearInterval(completeCallSessionPollTimer);
    completeCallSessionPollTimer = null;
  }
}

function getCompleteCallFailureMessage(reason) {
  if (reason === 'recusada') {
    return 'Amanda recusou a chamada. Pergunte ela no chat e tente novamente com outro codigo.';
  }

  return 'Amanda nao atendeu a chamada. Pergunte ela no chat e tente novamente com outro codigo.';
}

async function markCompleteCallCancelled(reason) {
  const session = completeCallSession;

  if (!session?.id || typeof _supa === 'undefined' || !_supa) {
    return;
  }

  await _supa
    .from(COMPLETE_CALL_SESSIONS_TABLE)
    .update({
      status: 'cancelada',
      cliente_online: false,
      finalizada_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString()
    })
    .eq('id', session.id);

  if (session.token_id) {
    await _supa
      .from(COMPLETE_CALL_TOKENS_TABLE)
      .update({
        status: 'usado',
        atualizado_em: new Date().toISOString()
      })
      .eq('id', session.token_id)
      .in('status', ['novo', 'em_uso']);
  }
}

async function finishCompleteCallBeforeAnswer(reason = 'nao_atendeu') {
  if (completeCallConnected) {
    return;
  }

  clearCompleteCallAnswerTimer();
  await markCompleteCallCancelled(reason);
  setCompleteCallRingingState(false);
  cleanupCompleteCallConnection();
  completeCallSession = null;
  completeCallPendingIce = [];
  completeCallEnding = false;
  completeCallPreparing = false;

  const startButton = document.getElementById('complete-start-call');

  if (startButton) {
    startButton.disabled = true;
    startButton.textContent = 'Chamada encerrada';
  }

  setCompleteVideoStatus(getCompleteCallFailureMessage(reason));
}

function scheduleCompleteCallAnswerTimeout() {
  clearCompleteCallAnswerTimer();
  completeCallAnswerTimer = window.setTimeout(() => {
    finishCompleteCallBeforeAnswer('nao_atendeu');
  }, COMPLETE_CALL_ANSWER_TIMEOUT_MS);
}

function resetPreviewCallTimerText() {
  const timer = document.getElementById('preview-call-timer');

  if (previewCallTimer) {
    window.clearInterval(previewCallTimer);
    previewCallTimer = null;
  }

  previewCallStartedAt = null;
  previewChatOpenedAt = null;

  if (timer) {
    timer.textContent = '00:00';
  }
}

function startCompleteCallClock() {
  if (completeCallClockTimer) {
    return;
  }

  const clock = document.getElementById('complete-call-time');
  const startedAt = Date.now();
  const maxMs = Math.max(1, Number(completeCallSession?.duracao_minutos) || 5) * 60 * 1000;

  completeCallClockTimer = window.setInterval(() => {
    const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));

    if (clock) {
      clock.textContent = formatSimulatedElapsedClock(elapsed);
    }
  }, 500);

  completeCallAutoEndTimer = window.setTimeout(() => {
    endCompleteVideoCall('tempo_esgotado');
  }, maxMs);
}

function setCompleteCallStartedState(started) {
  const screen = document.querySelector('[data-complete-screen]');

  if (!screen) {
    return;
  }

  screen.classList.toggle('is-call-started', Boolean(started));

  if (started) {
    screen.classList.remove('is-ringing');
    showCompleteCallControlsTemporarily();
  } else {
    screen.classList.remove('is-controls-hidden', 'is-mic-hint-visible', 'is-ringing');
  }
}

function setCompleteCallRingingState(ringing) {
  const screen = document.querySelector('[data-complete-screen]');

  if (screen) {
    screen.classList.toggle('is-ringing', Boolean(ringing));
  }
}

function bindCompleteCallControlReveal() {
  const screen = document.querySelector('[data-complete-screen]');

  if (!screen || screen.dataset.controlsBound === 'true') {
    return;
  }

  screen.dataset.controlsBound = 'true';
  screen.addEventListener('pointerdown', showCompleteCallControlsTemporarily, { passive: true });
  screen.addEventListener('mousemove', showCompleteCallControlsTemporarily, { passive: true });
  screen.addEventListener('contextmenu', (event) => event.preventDefault());
}

function replaceCompleteVideoTrack(track) {
  const sender = completeCallPeer?.getSenders?.()
    .find((item) => item.track?.kind === 'video');

  if (sender && track) {
    return sender.replaceTrack(track);
  }

  return Promise.resolve();
}

async function requestCompleteCameraStream(facingMode = completeCallFacingMode) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Camera indisponivel neste navegador.');
  }

  return navigator.mediaDevices.getUserMedia({
    video: getCompleteVideoConstraints(facingMode),
    audio: false
  });
}

async function flipCompleteCamera() {
  if (!completeCallStarted) {
    return;
  }

  const nextFacingMode = completeCallFacingMode === 'user' ? 'environment' : 'user';
  const localVideo = document.getElementById('complete-local-video');

  try {
    const nextStream = await requestCompleteCameraStream(nextFacingMode);
    const nextTrack = nextStream.getVideoTracks()[0];

    await replaceCompleteVideoTrack(nextTrack);
    completeCallLocalStream?.getVideoTracks().forEach((track) => track.stop());
    completeCallLocalStream = nextStream;
    completeCallFacingMode = nextFacingMode;
    completeCallCameraEnabled = true;

    if (localVideo) {
      localVideo.srcObject = completeCallLocalStream;
      localVideo.play?.().catch(() => {});
    }

    updateCompleteCallControls();
    showCompleteCallControlsTemporarily();
  } catch (error) {
    console.warn('Nao consegui virar camera da chamada completa:', error.message || error);
    setCompleteVideoStatus('Nao consegui virar a camera neste aparelho.');
  }
}

function toggleCompleteCamera() {
  completeCallCameraEnabled = !completeCallCameraEnabled;
  completeCallLocalStream?.getVideoTracks().forEach((track) => {
    track.enabled = completeCallCameraEnabled;
  });
  updateCompleteCallControls();
  showCompleteCallControlsTemporarily();
}

function toggleCompleteMic() {
  completeCallMicEnabled = false;
  updateCompleteCallControls();
  showCompleteCallControlsTemporarily();
}

function openPaidCallTokenModal() {
  const modal = document.getElementById('paid-call-token-modal');
  const input = document.getElementById('complete-token-input');

  if (!modal) {
    return;
  }

  modal.hidden = false;
  hideFloatingOfferPanel();
  setCompleteTokenStatus('');

  window.setTimeout(() => input?.focus(), 80);
  trackEvent('abriu_token_chamada_completa', {
    alvo_tipo: 'chamada_completa',
    alvo_titulo: 'Token de chamada'
  });
}

function closePaidCallTokenModal() {
  const modal = document.getElementById('paid-call-token-modal');

  if (modal) {
    modal.hidden = true;
  }

  if (!completeCallSession) {
    showFloatingOfferPanel();
  }
}

function openCompleteVideoModal(session) {
  const tokenModal = document.getElementById('paid-call-token-modal');
  const videoModal = document.getElementById('complete-video-modal');
  const title = document.getElementById('complete-video-title');
  const startButton = document.getElementById('complete-start-call');

  completeCallSession = session;
  completeCallLastSignalId = 0;
  completeCallPendingIce = [];
  completeCallEnding = false;
  completeCallFacingMode = 'user';
  completeCallCameraEnabled = true;
  completeCallMicEnabled = false;
  completeCallConnected = false;
  completeCallMicHintShown = false;
  completeCallStarted = false;
  completeCallPreparing = false;

  if (tokenModal) {
    tokenModal.hidden = true;
  }

  if (videoModal) {
    videoModal.hidden = false;
  }

  if (title) {
    title.textContent = `Chamada liberada (${session?.duracao_minutos || 5} min)`;
  }

  if (startButton) {
    startButton.disabled = false;
    startButton.textContent = 'Ligar agora por vídeo';
  }

  setCompleteVideoStatus('Clique em ligar para iniciar a chamada de video com Amanda.');
  resetCompleteCallClock();
  setCompleteCallStartedState(false);
  updateCompleteCallControls();
  bindCompleteCallControlReveal();
  hideFloatingOfferPanel();
}

function stopCompleteVideoStreams() {
  [completeCallLocalStream, completeCallRemoteStream].forEach((stream) => {
    stream?.getTracks?.().forEach((track) => track.stop());
  });

  completeCallLocalStream = null;
  completeCallRemoteStream = null;

  ['complete-local-video', 'complete-remote-video'].forEach((id) => {
    const video = document.getElementById(id);

    if (video) {
      video.srcObject = null;
    }
  });
}

function hideCompletePreconnectOverlay() {
  const preconnect = document.getElementById('complete-preconnect');

  if (preconnect) {
    preconnect.hidden = true;
  }
}

function hideCompletePreconnectWhenVideoReady(video) {
  let done = false;

  const finish = () => {
    if (done) {
      return;
    }

    done = true;
    hideCompletePreconnectOverlay();
  };

  if (!video) {
    window.setTimeout(finish, 1800);
    return;
  }

  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
    window.setTimeout(finish, 300);
    return;
  }

  video.addEventListener('loadeddata', finish, { once: true });
  video.addEventListener('canplay', finish, { once: true });
  window.setTimeout(finish, 4200);
}

function cleanupCompleteCallConnection() {
  hideCompletePreconnectOverlay();

  clearCompleteCallAnswerTimer();
  stopCompleteCallSessionPolling();

  if (completeCallSignalPollTimer) {
    window.clearInterval(completeCallSignalPollTimer);
    completeCallSignalPollTimer = null;
  }

  if (completeCallSignalChannel && typeof _supa !== 'undefined' && _supa) {
    try {
      _supa.removeChannel(completeCallSignalChannel);
    } catch (error) {
      console.warn('Nao consegui remover canal da chamada completa:', error);
    }
  }

  completeCallSignalChannel = null;

  if (completeCallPeer) {
    completeCallPeer.onicecandidate = null;
    completeCallPeer.ontrack = null;
    completeCallPeer.onconnectionstatechange = null;
    completeCallPeer.close();
  }

  completeCallPeer = null;
  completeCallStarted = false;
  completeCallConnected = false;
  completeCallPreparing = false;
  resetCompleteCallClock();
  setCompleteCallStartedState(false);
  stopCompleteVideoStreams();
}

async function sendCompleteCallSignal(tipo, payload = {}) {
  if (!completeCallSession?.id || typeof _supa === 'undefined' || !_supa) {
    return;
  }

  const { error } = await _supa
    .from(COMPLETE_CALL_SIGNALS_TABLE)
    .insert({
      sessao_id: completeCallSession.id,
      autor: 'cliente',
      tipo,
      payload
    });

  if (error) {
    console.warn('Nao consegui enviar sinal da chamada completa:', error.message || error);
  }
}

async function flushCompletePendingIce() {
  if (!completeCallPeer?.remoteDescription || !completeCallPendingIce.length) {
    return;
  }

  const pending = [...completeCallPendingIce];
  completeCallPendingIce = [];

  for (const candidate of pending) {
    try {
      await completeCallPeer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.warn('Nao consegui aplicar ICE pendente:', error);
    }
  }
}

async function handleCompleteCallSignal(signal) {
  if (!signal || signal.autor === 'cliente' || signal.id <= completeCallLastSignalId) {
    return;
  }

  completeCallLastSignalId = signal.id;

  if (signal.payload?.control === 'declined') {
    await finishCompleteCallBeforeAnswer('recusada');
    return;
  }

  if (signal.payload?.control === 'accepted') {
    clearCompleteCallAnswerTimer();
    await prepareCompleteVideoConnection(signal.payload);
    return;
  }

  if (signal.tipo === 'answer' && completeCallPeer) {
    if (!completeCallPeer.remoteDescription) {
      clearCompleteCallAnswerTimer();
      await completeCallPeer.setRemoteDescription(new RTCSessionDescription(signal.payload));
      await flushCompletePendingIce();
      setCompleteVideoStatus('Chamada conectada. Vídeo ao vivo ativo.');
      setCompleteCallStartedState(true);
    }
    return;
  }

  if (signal.tipo === 'ice' && signal.payload) {
    if (!completeCallPeer?.remoteDescription) {
      completeCallPendingIce.push(signal.payload);
      return;
    }

    try {
      await completeCallPeer.addIceCandidate(new RTCIceCandidate(signal.payload));
    } catch (error) {
      console.warn('Nao consegui adicionar ICE da chamada completa:', error);
    }
    return;
  }

  if (signal.tipo === 'end') {
    endCompleteVideoCall('remoto');
  }
}

async function pollCompleteCallSignals() {
  if (!completeCallSession?.id || typeof _supa === 'undefined' || !_supa) {
    return;
  }

  const { data, error } = await _supa
    .from(COMPLETE_CALL_SIGNALS_TABLE)
    .select('id, autor, tipo, payload')
    .eq('sessao_id', completeCallSession.id)
    .gt('id', completeCallLastSignalId)
    .order('id', { ascending: true });

  if (error) {
    console.warn('Nao consegui buscar sinais da chamada completa:', error.message || error);
    return;
  }

  for (const signal of data || []) {
    await handleCompleteCallSignal(signal);
  }
}

async function pollCompleteCallSessionState() {
  if (
    !completeCallSession?.id ||
    !completeCallStarted ||
    completeCallConnected ||
    completeCallPeer ||
    typeof _supa === 'undefined' ||
    !_supa
  ) {
    return;
  }

  const { data, error } = await _supa
    .from(COMPLETE_CALL_SESSIONS_TABLE)
    .select('id, status, admin_online')
    .eq('id', completeCallSession.id)
    .maybeSingle();

  if (error) {
    console.warn('Nao consegui conferir aceite da chamada completa:', error.message || error);
    return;
  }

  if (!data) {
    return;
  }

  if (data.status === 'cancelada' || data.status === 'finalizada') {
    await finishCompleteCallBeforeAnswer('nao_atendeu');
    return;
  }

  if (data.admin_online && data.status === 'chamando') {
    clearCompleteCallAnswerTimer();
    await prepareCompleteVideoConnection({
      preconnect_start_at: new Date(Date.now() + 800).toISOString()
    });
  }
}

function startCompleteCallSessionPolling() {
  stopCompleteCallSessionPolling();
  completeCallSessionPollTimer = window.setInterval(
    pollCompleteCallSessionState,
    COMPLETE_CALL_SIGNAL_POLL_MS
  );
}

function subscribeCompleteCallSignals() {
  if (!completeCallSession?.id || typeof _supa === 'undefined' || !_supa) {
    return;
  }

  if (completeCallSignalChannel) {
    _supa.removeChannel(completeCallSignalChannel);
  }

  completeCallSignalChannel = _supa
    .channel(`complete-call-client-${completeCallSession.id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: COMPLETE_CALL_SIGNALS_TABLE,
        filter: `sessao_id=eq.${completeCallSession.id}`
      },
      (payload) => {
        handleCompleteCallSignal(payload.new);
      }
    )
    .subscribe();

  pollCompleteCallSignals();

  if (completeCallSignalPollTimer) {
    window.clearInterval(completeCallSignalPollTimer);
  }

  completeCallSignalPollTimer = window.setInterval(
    pollCompleteCallSignals,
    COMPLETE_CALL_SIGNAL_POLL_MS
  );
}

async function validateCompleteCallToken(code) {
  if (typeof _supa === 'undefined' || !_supa) {
    setCompleteTokenStatus('Nao consegui conectar ao banco agora.', 'error');
    return;
  }

  const normalizedCode = normalizeCompleteCallCode(code);

  if (!normalizedCode) {
    setCompleteTokenStatus('Digite o codigo enviado por Amanda.', 'error');
    return;
  }

  setCompleteTokenStatus('Validando codigo...');

  const { data: token, error } = await _supa
    .from(COMPLETE_CALL_TOKENS_TABLE)
    .select('*')
    .eq('codigo', normalizedCode)
    .maybeSingle();

  if (error) {
    console.error('Erro ao validar token de chamada:', error);
    setCompleteTokenStatus('Nao consegui validar o codigo agora.', 'error');
    return;
  }

  if (!token) {
    setCompleteTokenStatus('Codigo nao encontrado. Confira e tente novamente.', 'error');
    return;
  }

  if (token.status !== 'novo') {
    setCompleteTokenStatus('Esse codigo ja foi usado ou cancelado.', 'error');
    return;
  }

  if (token.expira_em && new Date(token.expira_em).getTime() < Date.now()) {
    setCompleteTokenStatus('Esse codigo expirou. Peça um novo codigo.', 'error');
    return;
  }

  const user = getStoredUser();
  const ip = await getClientIp();
  const sessionPayload = {
    token_id: token.id,
    codigo: token.codigo,
    status: 'aguardando',
    username: user.username || 'Anonimo',
    plano: token.plano || '',
    duracao_minutos: Number(token.duracao_minutos) || 5,
    ip: ip || null,
    sessao_id: getAnalyticsSessionId(),
    cliente_online: true,
    atualizado_em: new Date().toISOString()
  };

  const { data: session, error: sessionError } = await _supa
    .from(COMPLETE_CALL_SESSIONS_TABLE)
    .insert(sessionPayload)
    .select('*')
    .single();

  if (sessionError) {
    console.error('Erro ao criar sessao de chamada completa:', sessionError);
    setCompleteTokenStatus('Nao consegui abrir a chamada agora.', 'error');
    return;
  }

  const { data: lockedToken, error: updateError } = await _supa
    .from(COMPLETE_CALL_TOKENS_TABLE)
    .update({
      status: 'em_uso',
      sessao_id: session.id,
      usado_por_username: user.username || 'Anonimo',
      usado_por_ip: ip || null,
      usado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString()
    })
    .eq('id', token.id)
    .eq('status', 'novo')
    .select('id')
    .maybeSingle();

  if (updateError || !lockedToken) {
    console.warn('Nao consegui marcar token em uso:', updateError?.message || updateError || 'token ja usado');
    await _supa
      .from(COMPLETE_CALL_SESSIONS_TABLE)
      .update({
        status: 'cancelada',
        finalizada_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      })
      .eq('id', session.id);
    setCompleteTokenStatus('Esse codigo acabou de ser usado. Peça um novo codigo.', 'error');
    return;
  }

  setCompleteTokenStatus('Codigo liberado. Abrindo chamada...', 'ok');
  openCompleteVideoModal(session);
  trackEvent('validou_token_chamada_completa', {
    alvo_tipo: 'chamada_completa',
    alvo_titulo: token.plano || token.codigo
  });
}

async function prepareCompleteVideoConnection(acceptPayload = {}) {
  const startButton = document.getElementById('complete-start-call');
  const localVideo = document.getElementById('complete-local-video');
  const remoteVideo = document.getElementById('complete-remote-video');

  if (!completeCallSession?.id || completeCallPreparing || completeCallPeer || completeCallEnding) {
    return;
  }

  const sessionId = completeCallSession.id;

  try {
    completeCallPreparing = true;
    stopCompleteCallSessionPolling();
    setCompleteCallRingingState(false);

    if (startButton) {
      startButton.disabled = true;
      startButton.textContent = 'Conectando...';
    }

    setCompleteCallStartedState(true);
    updateCompleteCallControls();
    const preconnectStartAt = acceptPayload?.preconnect_start_at || '';

    setCompleteVideoStatus('Amanda atendeu. Preparando chamada...');
    await sendCompleteCallSignal('ice', {
      control: 'preconnect',
      started_at: new Date().toISOString(),
      seconds: COMPLETE_CALL_PRECONNECT_SECONDS,
      preconnect_start_at: preconnectStartAt
    });
    setCompleteVideoStatus('Trocando chaves criptograficas...');
    await runCompletePreconnect(preconnectStartAt, true);

    if (!completeCallSession || completeCallSession.id !== sessionId || completeCallEnding) {
      return;
    }

    showCompleteMicHint();
    setCompleteVideoStatus('Abrindo sua camera sem audio...');
    completeCallLocalStream = await requestCompleteCameraStream('user');
    completeCallFacingMode = 'user';

    if (localVideo) {
      localVideo.srcObject = completeCallLocalStream;
    }

    completeCallRemoteStream = new MediaStream();

    if (remoteVideo) {
      remoteVideo.srcObject = completeCallRemoteStream;
    }

    completeCallPeer = new RTCPeerConnection(COMPLETE_CALL_RTC_CONFIG);

    completeCallLocalStream.getVideoTracks().forEach((track) => {
      completeCallPeer.addTrack(track, completeCallLocalStream);
    });

    completeCallPeer.ontrack = (event) => {
      event.streams?.[0]?.getTracks?.().forEach((track) => {
        completeCallRemoteStream.addTrack(track);
      });
      hideCompletePreconnectWhenVideoReady(remoteVideo);
    };

    completeCallPeer.onicecandidate = (event) => {
      if (event.candidate) {
        sendCompleteCallSignal('ice', event.candidate.toJSON());
      }
    };

    completeCallPeer.onconnectionstatechange = () => {
      const state = completeCallPeer?.connectionState;

      if (state === 'connected') {
        completeCallConnected = true;
        clearCompleteCallAnswerTimer();
        hideCompletePreconnectWhenVideoReady(remoteVideo);
        setCompleteVideoStatus('Chamada conectada. Video ao vivo ativo.');
        startCompleteCallClock();
        setCompleteCallStartedState(true);
      }

      if (state === 'failed' || state === 'disconnected') {
        setCompleteVideoStatus('Conexao instavel. Tentando estabilizar...');
        try {
          completeCallPeer?.restartIce?.();
        } catch (error) {
          console.warn('Nao consegui reiniciar ICE:', error);
        }
      }
    };

    setCompleteVideoStatus('Conectando com Amanda...');
    const offer = await completeCallPeer.createOffer({
      offerToReceiveVideo: true,
      offerToReceiveAudio: false
    });
    await completeCallPeer.setLocalDescription(offer);
    await sendCompleteCallSignal('offer', offer);

    trackEvent('chamada_completa_aceita_cliente_preparou_video', {
      alvo_tipo: 'chamada_completa',
      alvo_titulo: completeCallSession.codigo
    });
  } catch (error) {
    console.error('Erro na chamada completa:', error);
    completeCallStarted = false;
    completeCallPreparing = false;
    cleanupCompleteCallConnection();
    setCompleteVideoStatus('Nao consegui abrir a camera ou conectar a chamada.');

    if (startButton) {
      startButton.disabled = false;
      startButton.textContent = 'Tentar novamente';
    }
    setCompleteCallStartedState(false);
  } finally {
    completeCallPreparing = false;
  }
}

async function startCompleteVideoCall() {
  const startButton = document.getElementById('complete-start-call');

  if (!completeCallSession || completeCallStarted) {
    return;
  }

  const sessionId = completeCallSession.id;

  try {
    completeCallStarted = true;
    completeCallPreparing = false;
    completeCallConnected = false;

    if (startButton) {
      startButton.disabled = true;
      startButton.textContent = 'Chamando...';
    }

    setCompleteCallRingingState(true);
    setCompleteVideoStatus('Chamando Amanda... Aguarde ela atender.');
    subscribeCompleteCallSignals();
    startCompleteCallSessionPolling();

    await _supa
      .from(COMPLETE_CALL_SESSIONS_TABLE)
      .update({
        status: 'chamando',
        cliente_online: true,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', sessionId);

    scheduleCompleteCallAnswerTimeout();

    trackEvent('chamou_amanda_chamada_completa', {
      alvo_tipo: 'chamada_completa',
      alvo_titulo: completeCallSession.codigo
    });
  } catch (error) {
    console.error('Erro ao chamar Amanda:', error);
    completeCallStarted = false;
    completeCallPreparing = false;
    clearCompleteCallAnswerTimer();
    setCompleteCallRingingState(false);
    setCompleteVideoStatus('Nao consegui iniciar a chamada agora.');

    if (startButton) {
      startButton.disabled = false;
      startButton.textContent = 'Tentar novamente';
    }
  }
}
async function endCompleteVideoCall(origin = 'cliente') {
  if (completeCallEnding) {
    return;
  }

  completeCallEnding = true;
  const session = completeCallSession;

  if (origin !== 'remoto' && session?.id) {
    await sendCompleteCallSignal('end', { encerrado_por: 'cliente' });
  }

  if (session?.id && typeof _supa !== 'undefined' && _supa) {
    await _supa
      .from(COMPLETE_CALL_SESSIONS_TABLE)
      .update({
        status: 'finalizada',
        cliente_online: false,
        finalizada_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      })
      .eq('id', session.id);

    if (session.token_id) {
      await _supa
        .from(COMPLETE_CALL_TOKENS_TABLE)
        .update({
          status: 'usado',
          atualizado_em: new Date().toISOString()
        })
        .eq('id', session.token_id)
        .in('status', ['novo', 'em_uso']);
    }
  }

  cleanupCompleteCallConnection();
  completeCallSession = null;
  completeCallPendingIce = [];
  completeCallEnding = false;

  const modal = document.getElementById('complete-video-modal');

  if (modal) {
    modal.hidden = true;
  }

  showFloatingOfferPanel();
}

function formatCallWaitTime(startedAt) {
  const startTime = startedAt ? new Date(startedAt).getTime() : Date.now();
  const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');

  return `${minutes}:${seconds}`;
}

function setPreviewCallMessage(title, message) {
  const titleEl = document.getElementById('preview-call-title');
  const messageEl = document.getElementById('preview-call-message');

  if (titleEl) {
    titleEl.textContent = title;
  }

  if (messageEl) {
    messageEl.textContent = message;
  }
}

function setPreviewChatStatus(message, force = false) {
  const messageEl = document.getElementById('preview-call-message');

  if (previewAdminTypingActive && !force && message !== 'Amanda está digitando...') {
    return;
  }

  if (messageEl) {
    messageEl.textContent = message;
  }
}

function getPreviewDefaultStatusText(record = previewCallRecord) {
  if (!record) {
    return amandaPresenceOnline ? 'Amanda está online' : 'Amanda está offline';
  }

  if (record.status === 'finalizado') {
    return 'Chamada prévia finalizada';
  }

  if (record.status === 'em_chamada') {
    return 'Chamada de video em andamento';
  }

  if (record.status === 'chamando') {
    return 'Chamando Amanda...';
  }

  if (record.status === 'liberado') {
    return isPreviewIncomingAdminCall(record)
      ? 'Amanda está te chamando agora'
      : 'Amanda atendeu. Toque para entrar na chamada.';
  }

  if (record.status === 'cancelado') {
    return 'Chamada indisponivel agora';
  }

  return amandaPresenceOnline ? 'Amanda está online' : 'Amanda está offline';
}

function setPreviewTypingStatus(isTyping) {
  const messageEl = document.getElementById('preview-call-message');

  previewAdminTypingActive = Boolean(isTyping);
  messageEl?.classList.toggle('is-typing', Boolean(isTyping));
  setPreviewChatStatus(isTyping ? 'Amanda está digitando...' : getPreviewDefaultStatusText(), true);
}

function clearPreviewTypingResetTimer() {
  if (previewTypingResetTimer) {
    window.clearTimeout(previewTypingResetTimer);
    previewTypingResetTimer = null;
  }
}

function schedulePreviewTypingReset() {
  clearPreviewTypingResetTimer();
  previewTypingResetTimer = window.setTimeout(() => {
    previewTypingResetTimer = null;
    setPreviewTypingStatus(false);
  }, 4200);
}

function handlePreviewTypingBroadcast(payload = {}) {
  if (payload.lado !== 'admin') {
    return;
  }

  const isTyping = payload.digitando === true;
  previewAdminTypingLiveUntil = isTyping ? Date.now() + 4200 : 0;
  setPreviewTypingStatus(isTyping);

  if (isTyping) {
    schedulePreviewTypingReset();
  } else {
    clearPreviewTypingResetTimer();
  }
}

function getPreviewTypingChannelName(id) {
  return `chat-typing-${id}`;
}

function ensurePreviewTypingChannel() {
  const id = previewCallRecord?.id;

  if (!id || typeof _supa === 'undefined' || !_supa) {
    return null;
  }

  if (previewTypingChannel && previewTypingChannelId === id) {
    return previewTypingChannel;
  }

  if (previewTypingChannel) {
    try {
      _supa.removeChannel(previewTypingChannel);
    } catch (error) {
      console.warn('Nao consegui remover canal de digitacao:', error);
    }
  }

  previewTypingChannelId = id;
  previewTypingChannel = _supa
    .channel(getPreviewTypingChannelName(id))
    .on('broadcast', { event: 'typing' }, ({ payload }) => {
      handlePreviewTypingBroadcast(payload);
    })
    .subscribe();

  return previewTypingChannel;
}

function sendPreviewTypingBroadcast(isTyping) {
  const channel = ensurePreviewTypingChannel();

  if (!channel) {
    return;
  }

  const payload = {
    lado: 'usuario',
    digitando: Boolean(isTyping),
    enviado_em: new Date().toISOString()
  };

  const send = () => {
    try {
      Promise.resolve(channel.send({
        type: 'broadcast',
        event: 'typing',
        payload
      })).catch((error) => {
        console.warn('Nao consegui enviar digitacao em tempo real:', error);
      });
    } catch (error) {
      console.warn('Nao consegui enviar digitacao em tempo real:', error);
    }
  };

  send();

  if (isTyping) {
    window.setTimeout(send, 250);
  }
}

function cleanupPreviewTypingChannel() {
  clearPreviewTypingResetTimer();

  if (previewTypingChannel && typeof _supa !== 'undefined' && _supa) {
    try {
      _supa.removeChannel(previewTypingChannel);
    } catch (error) {
      console.warn('Nao consegui limpar canal de digitacao:', error);
    }
  }

  previewTypingChannel = null;
  previewTypingChannelId = '';
  previewAdminTypingActive = false;
}

function setPreviewPresenceIndicator(isOnline) {
  const dot = document.getElementById('preview-presence-dot');
  const status = document.getElementById('preview-presence-text');

  if (dot) {
    dot.classList.toggle('is-online', Boolean(isOnline));
    dot.classList.toggle('is-offline', !isOnline);
  }

  if (status) {
    status.textContent = isOnline ? 'online agora' : 'offline agora';
  }
}

function setPreviewCallEnterEnabled(enabled, label = 'Entrar na chamada') {
  const button = document.getElementById('preview-call-enter');

  if (!button) {
    return;
  }

  button.disabled = !enabled;
  button.textContent = label;
  button.classList.toggle('is-ready', Boolean(enabled));
}

function showPreviewCompleteShortcut(show) {
  const shortcut = document.getElementById('preview-call-complete-shortcut');

  if (shortcut) {
    shortcut.hidden = !show;
  }
}

function setPreviewCardMode(mode = '') {
  const card = document.querySelector('#preview-call-modal .telegram-chat-card');

  if (!card) {
    return;
  }

  card.classList.toggle('is-phone-gate', mode === 'phone');
  card.classList.toggle('is-ringing', mode === 'ringing');
  card.classList.toggle('is-in-call', mode === 'call');
}

function setPreviewPhoneGateVisible(show) {
  const gate = document.getElementById('preview-phone-gate');

  if (gate) {
    gate.hidden = !show;
  }

  setPreviewCardMode(show ? 'phone' : '');
}

function normalizePreviewPhone(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 14);
}

function formatPreviewPhone(value) {
  const phone = normalizePreviewPhone(value);

  if (phone.length <= 2) {
    return phone;
  }

  if (phone.length <= 7) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2)}`;
  }

  if (phone.length <= 11) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, phone.length - 4)}-${phone.slice(-4)}`;
  }

  return `+${phone.slice(0, phone.length - 11)} (${phone.slice(-11, -9)}) ${phone.slice(-9, -4)}-${phone.slice(-4)}`;
}

function getBrazilMobileDigits(value) {
  const phone = normalizePreviewPhone(value);

  return phone.length === 13 && phone.startsWith('55')
    ? phone.slice(2)
    : phone;
}

function isValidPreviewPhone(value) {
  const phone = getBrazilMobileDigits(value);

  if (phone.length !== 11 || /^(\d)\1+$/.test(phone)) {
    return false;
  }

  const ddd = Number(phone.slice(0, 2));
  const startsLikeMobile = phone[2] === '9';

  return ddd >= 11 && ddd <= 99 && startsLikeMobile;
}

function getStoredPreviewPhone() {
  try {
    return normalizePreviewPhone(localStorage.getItem(PREVIEW_PHONE_STORAGE_KEY));
  } catch (error) {
    return '';
  }
}

function getStoredPreviewPhoneIp() {
  try {
    return localStorage.getItem(PREVIEW_PHONE_IP_STORAGE_KEY) || '';
  } catch (error) {
    return '';
  }
}

function storePreviewPhone(phone, ip) {
  try {
    localStorage.setItem(PREVIEW_PHONE_STORAGE_KEY, phone);
    localStorage.setItem(PREVIEW_PHONE_IP_STORAGE_KEY, ip || '');
  } catch (error) {
    // Sem localStorage, o telefone ainda funciona nesta sessao pelo Supabase.
  }
}

function askPreviewPhone(ip) {
  const gate = document.getElementById('preview-phone-gate');
  const form = document.getElementById('preview-phone-form');
  const input = document.getElementById('preview-phone-input');
  const errorEl = document.getElementById('preview-phone-error');
  const cachedPhone = getStoredPreviewPhone();

  if (!gate || !form || !input) {
    return Promise.resolve(cachedPhone);
  }

  input.value = cachedPhone ? formatPreviewPhone(cachedPhone) : '';
  if (errorEl) {
    errorEl.hidden = true;
  }

  setPreviewPhoneGateVisible(true);
  window.setTimeout(() => input.focus(), 80);
  input.oninput = () => {
    input.value = formatPreviewPhone(input.value);

    if (errorEl) {
      errorEl.hidden = true;
    }
  };

  return new Promise((resolve) => {
    form.onsubmit = (event) => {
      event.preventDefault();
      const phone = normalizePreviewPhone(input.value);

      if (!isValidPreviewPhone(phone)) {
        if (errorEl) {
          errorEl.hidden = false;
        }
        return;
      }

      storePreviewPhone(phone, ip);
      setPreviewPhoneGateVisible(false);
      resolve(phone);
    };
  });
}

async function ensurePreviewPhone(ip) {
  const cachedPhone = getStoredPreviewPhone();
  const cachedIp = getStoredPreviewPhoneIp();

  if (cachedPhone && cachedIp === ip) {
    return cachedPhone;
  }

  return askPreviewPhone(ip);
}

function setPreviewRingingActions({ answer = false, decline = true } = {}) {
  const answerButton = document.getElementById('preview-call-ring-answer');
  const declineButton = document.getElementById('preview-call-ring-decline');

  if (answerButton) {
    answerButton.hidden = !answer;
  }

  if (declineButton) {
    declineButton.hidden = !decline;
  }
}

function stopPreviewRingFeedback() {
  if (previewVibrationTimer) {
    window.clearInterval(previewVibrationTimer);
    previewVibrationTimer = null;
  }

  if (previewRingAudioTimer) {
    window.clearInterval(previewRingAudioTimer);
    previewRingAudioTimer = null;
  }

  try {
    navigator.vibrate?.(0);
  } catch (error) {
    // Alguns navegadores ignoram vibracao.
  }
}

function playPreviewRingTone() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    if (!previewRingAudioContext) {
      previewRingAudioContext = new AudioContextClass();
    }

    previewRingAudioContext.resume?.();

    const oscillator = previewRingAudioContext.createOscillator();
    const gain = previewRingAudioContext.createGain();
    const startAt = previewRingAudioContext.currentTime;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(760, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.12, startAt + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.42);
    oscillator.connect(gain);
    gain.connect(previewRingAudioContext.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.46);
  } catch (error) {
    // Autoplay de audio pode ser bloqueado ate haver interacao do usuario.
  }
}

function startPreviewRingFeedback({ sound = false } = {}) {
  stopPreviewRingFeedback();

  try {
    navigator.vibrate?.([420, 140, 420, 520]);
  } catch (error) {
    // Vibracao e apenas reforco no celular.
  }

  previewVibrationTimer = window.setInterval(() => {
    try {
      navigator.vibrate?.([420, 140, 420, 520]);
    } catch (error) {
      // Ignora quando o aparelho/navegador nao suporta.
    }
  }, 1500);

  if (sound) {
    playPreviewRingTone();
    previewRingAudioTimer = window.setInterval(playPreviewRingTone, 1450);
  }
}

function setPreviewRingingVisible(show) {
  const ringing = document.getElementById('preview-call-ringing');

  if (ringing) {
    ringing.hidden = !show;
  }

  setPreviewCardMode(show ? 'ringing' : '');

  if (!show) {
    stopPreviewRingFeedback();
  }
}

function setPreviewRingingContent(title, message) {
  const ringing = document.getElementById('preview-call-ringing');
  const titleEl = ringing?.querySelector('strong');
  const messageEl = ringing?.querySelector('p');

  if (titleEl) {
    titleEl.textContent = title;
  }

  if (messageEl) {
    messageEl.textContent = message;
  }
}

function stopPreviewRinging() {
  setPreviewRingingVisible(false);

  if (previewCallRingTimer) {
    window.clearTimeout(previewCallRingTimer);
    previewCallRingTimer = null;
  }

  if (previewChatTemporaryRenderTimer) {
    window.clearTimeout(previewChatTemporaryRenderTimer);
    previewChatTemporaryRenderTimer = null;
  }
}

function updateSimulatedCallControls(container = document) {
  const micButton = container.querySelector('[data-sim-toggle-mic]');
  const cameraButton = container.querySelector('[data-sim-toggle-camera]');
  const cameraBlocked = container.querySelector('[data-sim-camera-blocked]');

  if (micButton) {
    micButton.classList.toggle('is-muted', !previewMicEnabled);
    const micLabel = micButton.querySelector('[data-sim-control-label]');
    if (micLabel) {
      micLabel.textContent = previewMicEnabled ? 'Silenciar' : 'Ativar mic';
    }
  }

  if (cameraButton) {
    cameraButton.classList.toggle('is-muted', !previewCameraEnabled);
    const cameraLabel = cameraButton.querySelector('[data-sim-control-label]');
    if (cameraLabel) {
      cameraLabel.textContent = previewCameraEnabled ? 'Desligar camera' : 'Ligar camera';
    }
  }

  if (cameraBlocked) {
    cameraBlocked.hidden = previewCameraEnabled && Boolean(previewCameraStream?.getVideoTracks().length);
    cameraBlocked.textContent = previewCameraEnabled ? 'Camera nao liberada' : 'Camera desligada';
  }
}

function waitPreviewDelay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function waitCompleteDelay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function waitUntilCompleteTimestamp(timestamp) {
  const target = timestamp ? new Date(timestamp).getTime() : 0;

  if (!Number.isFinite(target) || target <= Date.now()) {
    return;
  }

  await waitCompleteDelay(Math.min(6000, target - Date.now()));
}

async function runCompleteRingingDelay() {
  const startButton = document.getElementById('complete-start-call');

  setCompleteVideoStatus('Chamando Amanda...');

  if (startButton) {
    startButton.textContent = 'Chamando...';
  }

  await waitCompleteDelay(COMPLETE_CALL_RINGING_MS);
}

async function runCompletePreconnect(startAt = '', keepVisible = false) {
  const overlay = document.getElementById('complete-preconnect');
  const count = document.getElementById('complete-preconnect-count');

  if (!overlay) {
    return;
  }

  await waitUntilCompleteTimestamp(startAt);
  overlay.hidden = false;

  for (let value = COMPLETE_CALL_PRECONNECT_SECONDS; value >= 1; value -= 1) {
    if (count) {
      count.textContent = String(value);
    }

    await waitCompleteDelay(1000);
  }

  if (keepVisible) {
    if (count) {
      count.textContent = '...';
    }
    return;
  }

  overlay.hidden = true;
}

async function registerPreviewCameraState(status, message) {
  if (!previewCallRecord?.id) {
    return;
  }

  const now = new Date().toISOString();
  const details = {
    ...getPreviewCallDetails(previewCallRecord),
    simulated_call: true,
    camera_status: status,
    camera_status_updated_at: now
  };

  previewCallRecord = {
    ...previewCallRecord,
    detalhes: details
  };

  try {
    await _supa
      .from(PREVIEW_CALL_TABLE)
      .update({
        detalhes: details,
        updated_at: now
      })
      .eq('id', previewCallRecord.id);

    if (message) {
      await _supa
        .from(PREVIEW_CALL_MESSAGES_TABLE)
        .insert({
          chamada_id: previewCallRecord.id,
          autor_tipo: 'sistema',
          autor_nome: 'Sistema',
          texto: message
        });
    }
  } catch (error) {
    console.warn('Nao consegui registrar estado da camera:', error.message || error);
  }
}

function getSimulatedPreviewVideoUrl(record) {
  const details = getPreviewCallDetails(record);
  const candidates = [
    details.chamada_previa_video_url,
    details.preview_video_url,
    details.simulated_video_url,
    vipConfig.chamada_previa_video_url,
    record?.meet_url
  ];

  for (const candidate of candidates) {
    const value = String(candidate || '').trim();

    if (!value || !/^https?:\/\//i.test(value)) {
      continue;
    }

    try {
      const parsed = new URL(value);

      if (parsed.hostname === PREVIEW_CALL_VIDEO_DOMAIN || parsed.hostname === 'meet.jit.si') {
        continue;
      }
    } catch (error) {
      continue;
    }

    return value;
  }

  return '';
}

function getSimulatedPreviewDuration(record) {
  const details = getPreviewCallDetails(record);
  const seconds = Number(
    details.chamada_previa_duracao ||
    details.preview_duration ||
    details.simulated_duration ||
    vipConfig.chamada_previa_duracao
  );

  return Number.isFinite(seconds) && seconds > 0
    ? Math.min(180, Math.max(5, seconds))
    : 0;
}

function clearPreviewSimulatedTimers() {
  if (previewSimulatedFinishTimer) {
    window.clearTimeout(previewSimulatedFinishTimer);
    previewSimulatedFinishTimer = null;
  }

  if (previewSimulatedProgressTimer) {
    window.clearInterval(previewSimulatedProgressTimer);
    previewSimulatedProgressTimer = null;
  }

  if (previewSimulatedMetadataTimer) {
    window.clearTimeout(previewSimulatedMetadataTimer);
    previewSimulatedMetadataTimer = null;
  }

  if (previewSimulatedControlsTimer) {
    window.clearTimeout(previewSimulatedControlsTimer);
    previewSimulatedControlsTimer = null;
  }
}

function formatSimulatedElapsedClock(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
  const rest = String(safeSeconds % 60).padStart(2, '0');

  return `${minutes}:${rest}`;
}

function setSimulatedCallControlsVisible(screen, visible) {
  if (!screen) {
    return;
  }

  screen.classList.toggle('is-controls-hidden', !visible);
}

function scheduleSimulatedCallControlsHide(screen) {
  if (previewSimulatedControlsTimer) {
    window.clearTimeout(previewSimulatedControlsTimer);
  }

  previewSimulatedControlsTimer = window.setTimeout(() => {
    previewSimulatedControlsTimer = null;
    setSimulatedCallControlsVisible(screen, false);
  }, PREVIEW_SIMULATED_CONTROLS_HIDE_MS);
}

function showSimulatedCallControlsTemporarily(screen) {
  if (!screen || screen.classList.contains('is-connecting')) {
    return;
  }

  setSimulatedCallControlsVisible(screen, true);
  scheduleSimulatedCallControlsHide(screen);
}

function bindSimulatedCallControlsAutoHide(screen) {
  if (!screen) {
    return;
  }

  const reveal = () => showSimulatedCallControlsTemporarily(screen);

  screen.addEventListener('pointerdown', reveal, { passive: true });
  screen.addEventListener('mousemove', reveal, { passive: true });
  screen.addEventListener('contextmenu', (event) => event.preventDefault());
}

function stopPreviewCameraStream() {
  if (!previewCameraStream) {
    return;
  }

  previewCameraStream.getTracks().forEach((track) => track.stop());
  previewCameraStream = null;
  previewMicEnabled = false;
  previewCameraEnabled = true;
}

async function requestPreviewCameraStream(facingMode = previewCameraFacingMode, options = {}) {
  if (previewCameraStream) {
    previewCameraStream.getVideoTracks().forEach((track) => track.stop());
    previewCameraStream.getVideoTracks().forEach((track) => previewCameraStream.removeTrack(track));
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    return null;
  }

  try {
    const videoStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode,
        width: { ideal: 640 },
        height: { ideal: 960 }
      },
      audio: false
    });

    if (!previewCameraStream) {
      previewCameraStream = new MediaStream();
    }

    videoStream.getVideoTracks().forEach((track) => previewCameraStream.addTrack(track));
    previewCameraFacingMode = facingMode;
    previewCameraEnabled = true;
    if (!options.silent) {
      trackEvent('permitiu_camera_chamada_previa', {
        alvo_tipo: 'chamada_previa',
        alvo_titulo: 'Camera local liberada'
      });
    }

    return previewCameraStream;
  } catch (error) {
    console.warn('Câmera local não liberada para chamada prévia:', error.message || error);
    if (!options.silent) {
      trackEvent('bloqueou_camera_chamada_previa', {
        alvo_tipo: 'chamada_previa',
        alvo_titulo: 'Camera local bloqueada'
      });
    }
    return null;
  }
}

async function flipPreviewCamera() {
  const localVideo = document.querySelector('[data-sim-local-video]');
  const nextFacingMode = previewCameraFacingMode === 'user' ? 'environment' : 'user';
  const stream = await requestPreviewCameraStream(nextFacingMode, { silent: true });

  if (stream && localVideo) {
    localVideo.srcObject = stream;
    localVideo.play?.().catch(() => {});
  }

  updateSimulatedCallControls(document);
}

function togglePreviewCamera() {
  previewCameraEnabled = !previewCameraEnabled;

  previewCameraStream?.getVideoTracks().forEach((track) => {
    track.enabled = previewCameraEnabled;
  });

  registerPreviewCameraState(
    previewCameraEnabled ? 'ligada' : 'desligada',
    previewCameraEnabled
      ? 'Visitante ligou a câmera durante a chamada prévia.'
      : 'Visitante desligou a câmera durante a chamada prévia.'
  );
  trackEvent(previewCameraEnabled ? 'ligou_camera_chamada_previa' : 'desligou_camera_chamada_previa', {
    alvo_tipo: 'chamada_previa',
    alvo_titulo: previewCameraEnabled ? 'Ligou camera' : 'Desligou camera'
  });
  updateSimulatedCallControls(document);
}

async function togglePreviewMic() {
  if (!navigator.mediaDevices?.getUserMedia) {
    previewMicEnabled = false;
    updateSimulatedCallControls(document);
    return;
  }

  if (!previewMicEnabled && !previewCameraStream?.getAudioTracks().length) {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      if (!previewCameraStream) {
        previewCameraStream = new MediaStream();
      }

      audioStream.getAudioTracks().forEach((track) => previewCameraStream.addTrack(track));
    } catch (error) {
      console.warn('Microfone local nao liberado:', error.message || error);
      previewMicEnabled = false;
      updateSimulatedCallControls(document);
      return;
    }
  }

  previewMicEnabled = !previewMicEnabled;
  previewCameraStream?.getAudioTracks().forEach((track) => {
    track.enabled = previewMicEnabled;
  });

  updateSimulatedCallControls(document);
}

function renderSimulatedPreviewFallback(container) {
  container.innerHTML = `
    <div class="sim-call-fallback">
      <img src="sua-foto.jpg" alt="Amanda Oliveira" />
      <strong>Amanda conectada</strong>
      <span>Prévia sem áudio em andamento</span>
    </div>
  `;
}

function getPreviewFinishSystemMessage(reason) {
  if (reason === 'saiu_da_aba' || reason === 'saiu_da_pagina') {
    return 'Chamada prévia encerrada porque a tela saiu da chamada.';
  }

  if (reason === 'usuario_encerrou') {
    return 'Chamada prévia encerrada pelo visitante.';
  }

  return 'Chamada prévia encerrada automaticamente.';
}

function isActiveSimulatedPreviewCall() {
  return Boolean(
    previewCallRecord?.id &&
    previewCallRecord.status === 'em_chamada' &&
    getPreviewCallDetails(previewCallRecord).simulated_call
  );
}

function rememberPreviewForcedFinish(reason) {
  if (!previewCallRecord?.id) {
    return;
  }

  try {
    localStorage.setItem(PREVIEW_FORCE_FINISH_STORAGE_KEY, JSON.stringify({
      id: previewCallRecord.id,
      reason,
      created_at: new Date().toISOString()
    }));
  } catch (error) {
    // Se o navegador bloquear storage, a tentativa online ainda acontece.
  }
}

function getPreviewForcedFinishMarker() {
  try {
    return JSON.parse(localStorage.getItem(PREVIEW_FORCE_FINISH_STORAGE_KEY) || 'null');
  } catch (error) {
    return null;
  }
}

function clearPreviewForcedFinishMarker(callId = '') {
  const marker = getPreviewForcedFinishMarker();

  if (callId && marker?.id && marker.id !== callId) {
    return;
  }

  try {
    localStorage.removeItem(PREVIEW_FORCE_FINISH_STORAGE_KEY);
  } catch (error) {
    // Ignora storage indisponivel.
  }
}

async function finishPreviewCallIfMarkedAsLeft(record) {
  const marker = getPreviewForcedFinishMarker();

  if (!record?.id || marker?.id !== record.id) {
    return record;
  }

  if (record.status === 'finalizado') {
    clearPreviewForcedFinishMarker(record.id);
    return record;
  }

  if (record.status !== 'em_chamada') {
    clearPreviewForcedFinishMarker(record.id);
    return record;
  }

  const finishedRecord = await persistPreviewCallFinished(
    record,
    marker.reason || 'saiu_da_aba'
  );
  clearPreviewForcedFinishMarker(record.id);
  return finishedRecord;
}

function finishPreviewCallOnBackgroundExit(reason = 'saiu_da_aba') {
  if (!isActiveSimulatedPreviewCall() || previewCallClosingForBackground) {
    return;
  }

  previewCallClosingForBackground = true;
  rememberPreviewForcedFinish(reason);

  finishSimulatedPreviewCall(reason)
    .catch((error) => {
      console.warn('Nao consegui encerrar chamada ao sair da tela:', error.message || error);
    })
    .finally(() => {
      previewCallClosingForBackground = false;
    });
}

async function persistPreviewCallFinished(record, reason = 'tempo_esgotado') {
  if (!record?.id || record.status === 'finalizado') {
    return record;
  }

  const now = new Date().toISOString();
  const details = {
    ...getPreviewCallDetails(record),
    simulated_call: true,
    simulated_finished_reason: reason,
    simulated_finished_at: now
  };
  const finishedRecord = {
    ...record,
    status: 'finalizado',
    finalizado_em: now,
    detalhes: details
  };

  await _supa
    .from(PREVIEW_CALL_TABLE)
    .update({
      status: 'finalizado',
      finalizado_em: now,
      detalhes: details,
      updated_at: now
    })
    .eq('id', record.id);

  await ensurePreviewFinishedMessage(finishedRecord);

  await _supa
    .from(PREVIEW_CALL_MESSAGES_TABLE)
    .insert({
      chamada_id: record.id,
      autor_tipo: 'sistema',
      autor_nome: 'Sistema',
      texto: getPreviewFinishSystemMessage(reason)
    });

  return finishedRecord;
}

async function finishSimulatedPreviewCall(reason = 'tempo_esgotado') {
  if (!previewCallRecord?.id || previewCallRecord.status === 'finalizado') {
    return;
  }

  clearPreviewSimulatedTimers();
  stopPreviewCameraStream();

  previewCallRecord = await persistPreviewCallFinished(previewCallRecord, reason);
  clearPreviewForcedFinishMarker(previewCallRecord?.id);

  trackEvent('finalizou_chamada_previa_simulada', {
    alvo_tipo: 'chamada_previa',
    alvo_titulo: 'Previa simulada finalizada'
  });

  setPreviewChatStatus('Chamada prévia finalizada');
  loadPreviewChatMessages();
  applyPreviewCallStatus(previewCallRecord);
}

async function mountSimulatedPreviewCall(container, record) {
  const videoUrl = getSimulatedPreviewVideoUrl(record);
  const configuredDuration = getSimulatedPreviewDuration(record);
  const initialDuration = configuredDuration || PREVIEW_SIMULATED_CALL_DEFAULT_SECONDS;
  let countdownStarted = false;

  clearPreviewSimulatedTimers();
  stopPreviewCameraStream();
  previewCameraFacingMode = 'user';
  previewMicEnabled = false;
  previewCameraEnabled = true;
  setPreviewCardMode('call');
  container.innerHTML = `
    <div class="sim-call-screen is-connecting" data-sim-screen>
      <div class="sim-call-main" data-sim-main>
        <video
          class="sim-call-amanda-video"
          data-sim-amanda-video
          autoplay
          muted
          playsinline
          preload="auto"
          controlslist="nodownload noplaybackrate"
          disablepictureinpicture
        ></video>
      </div>
      <div class="sim-call-local">
        <video
          data-sim-local-video
          autoplay
          muted
          playsinline
        ></video>
        <div class="sim-call-camera-blocked" data-sim-camera-blocked hidden>
          Camera nao liberada
        </div>
      </div>
      <div class="sim-call-preconnect" data-sim-preconnect>
        <strong>Amanda Oliveira</strong>
        <span>Trocando chaves criptográficas <i></i></span>
      </div>
      <div class="sim-call-top">
        <div class="sim-call-emojis" aria-hidden="true">😱 🍕 🐙 🇫🇷</div>
        <strong>Amanda Oliveira</strong>
        <span><i></i> <b data-sim-call-time>00:00</b></span>
      </div>
      <div class="sim-call-bottom">
        <button class="sim-call-control" type="button" data-sim-flip-camera>
          <b>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 7h7a5 5 0 1 1-4.4 7.4" />
              <path d="M7 7V3" />
              <path d="M7 7H3" />
              <path d="M17 17h-7a5 5 0 0 1-4.4-7.4" />
              <path d="M17 17v4" />
              <path d="M17 17h4" />
            </svg>
          </b>
          <span data-sim-control-label>Virar</span>
        </button>
        <button class="sim-call-control" type="button" data-sim-toggle-camera>
          <b>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h8A2.5 2.5 0 0 1 17 7.5v9A2.5 2.5 0 0 1 14.5 19h-8A2.5 2.5 0 0 1 4 16.5z" />
              <path d="m17 10 4-2.5v9L17 14" />
            </svg>
          </b>
          <span data-sim-control-label>Desligar camera</span>
        </button>
        <button class="sim-call-control" type="button" data-sim-toggle-mic>
          <span class="sim-call-mic-hint">Amanda desligou o microfone dela</span>
          <b>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 14a4 4 0 0 0 4-4V6a4 4 0 0 0-8 0v4a4 4 0 0 0 4 4z" />
              <path d="M18 10a6 6 0 0 1-12 0" />
              <path d="M12 18v3" />
              <path d="M8.5 21h7" />
            </svg>
          </b>
          <span data-sim-control-label>Ativar som</span>
        </button>
        <button class="sim-call-control is-end" type="button" data-sim-end-call>
          <b>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.8 14.8c3.1-2.2 7.3-2.2 10.4 0" />
              <path d="m7.2 14.5-2.1 2.1a2 2 0 0 0 0 2.8l.4.4a2 2 0 0 0 2.8 0l1.1-1.1" />
              <path d="m16.8 14.5 2.1 2.1a2 2 0 0 1 0 2.8l-.4.4a2 2 0 0 1-2.8 0l-1.1-1.1" />
            </svg>
          </b>
          <span data-sim-control-label>Encerrar</span>
        </button>
      </div>
      <div class="sim-call-progress" aria-hidden="true">
        <span data-sim-progress></span>
      </div>
    </div>
  `;

  const screen = container.querySelector('[data-sim-screen]');
  const preconnect = container.querySelector('[data-sim-preconnect]');
  const main = container.querySelector('[data-sim-main]');
  const amandaVideo = container.querySelector('[data-sim-amanda-video]');
  const localVideo = container.querySelector('[data-sim-local-video]');
  const blocked = container.querySelector('[data-sim-camera-blocked]');
  const progress = container.querySelector('[data-sim-progress]');
  const time = container.querySelector('[data-sim-call-time]');
  const endButton = container.querySelector('[data-sim-end-call]');
  const flipButton = container.querySelector('[data-sim-flip-camera]');
  const cameraButton = container.querySelector('[data-sim-toggle-camera]');
  const micButton = container.querySelector('[data-sim-toggle-mic]');
  const cameraStream = await requestPreviewCameraStream();
  bindSimulatedCallControlsAutoHide(screen);

  if (cameraStream && localVideo) {
    localVideo.srcObject = cameraStream;
    localVideo.play?.().catch(() => {});
    registerPreviewCameraState(
      'ligada',
      'Câmera do visitante entrou ligada na chamada prévia.'
    );
  } else if (blocked) {
    blocked.hidden = false;
    registerPreviewCameraState(
      'desligada_ou_bloqueada',
      'Câmera do visitante entrou desligada ou não foi permitida.'
    );
  }

  function startSimulatedCountdown(nextDuration) {
    if (countdownStarted) {
      return;
    }

    countdownStarted = true;
    if (previewSimulatedMetadataTimer) {
      window.clearTimeout(previewSimulatedMetadataTimer);
      previewSimulatedMetadataTimer = null;
    }
    const duration = Math.max(5, Math.ceil(nextDuration || PREVIEW_SIMULATED_CALL_DEFAULT_SECONDS));
    const startedAt = Date.now();

    if (time) {
      time.textContent = '00:00';
    }

    previewSimulatedProgressTimer = window.setInterval(() => {
      const elapsed = Math.min(duration, Math.floor((Date.now() - startedAt) / 1000));

      if (progress) {
        progress.style.width = `${Math.min(100, (elapsed / duration) * 100)}%`;
      }

      if (time) {
        time.textContent = formatSimulatedElapsedClock(elapsed);
      }
    }, 250);

    previewSimulatedFinishTimer = window.setTimeout(() => {
      finishSimulatedPreviewCall('tempo_esgotado');
    }, duration * 1000);
  }

  if (videoUrl && amandaVideo) {
    amandaVideo.loop = Boolean(configuredDuration);
    amandaVideo.src = videoUrl;
    amandaVideo.addEventListener('loadedmetadata', () => {
      if (!configuredDuration && Number.isFinite(amandaVideo.duration) && amandaVideo.duration > 0) {
        startSimulatedCountdown(amandaVideo.duration);
      }
    });
    amandaVideo.addEventListener('ended', () => {
      if (!configuredDuration) {
        finishSimulatedPreviewCall('video_finalizado');
      }
    });
    amandaVideo.play?.().catch(() => {
      renderSimulatedPreviewFallback(main);
    });
    if (configuredDuration) {
      startSimulatedCountdown(configuredDuration);
    } else {
      previewSimulatedMetadataTimer = window.setTimeout(() => {
        startSimulatedCountdown(PREVIEW_SIMULATED_CALL_DEFAULT_SECONDS);
      }, 3500);
    }
  } else if (main) {
    renderSimulatedPreviewFallback(main);
    startSimulatedCountdown(configuredDuration || PREVIEW_SIMULATED_CALL_DEFAULT_SECONDS);
  }

  if (endButton) {
    endButton.addEventListener('click', () => {
      finishSimulatedPreviewCall('usuario_encerrou');
    });
  }

  flipButton?.addEventListener('click', flipPreviewCamera);
  cameraButton?.addEventListener('click', togglePreviewCamera);
  micButton?.addEventListener('click', togglePreviewMic);
  updateSimulatedCallControls(container);

  window.setTimeout(() => {
    if (!container.isConnected || !screen) {
      return;
    }

    screen.classList.remove('is-connecting');

    if (preconnect) {
      preconnect.hidden = true;
    }

    screen.classList.add('is-mic-hint-visible');
    window.setTimeout(() => {
      screen.classList.remove('is-mic-hint-visible');
    }, 5600);
    showSimulatedCallControlsTemporarily(screen);
  }, PREVIEW_CONNECT_DELAY_MS);
}

function disposePreviewJitsi() {
  clearPreviewSimulatedTimers();
  stopPreviewCameraStream();

  const api = previewJitsiApi;

  if (!api) {
    return;
  }

  previewJitsiApi = null;

  try {
    api.dispose();
  } catch (error) {
    console.warn('Não consegui fechar a chamada de vídeo:', error);
  }
}

function stopPreviewCallTimers() {
  clearPreviewSimulatedTimers();
  stopPreviewCameraStream();

  if (previewCallPollTimer) {
    window.clearInterval(previewCallPollTimer);
    previewCallPollTimer = null;
  }

  if (previewChatPollTimer) {
    window.clearInterval(previewChatPollTimer);
    previewChatPollTimer = null;
  }

  if (previewCallTimer) {
    window.clearInterval(previewCallTimer);
    previewCallTimer = null;
  }

  previewCallStartedAt = null;
  previewChatOpenedAt = null;

  const previewTimer = document.getElementById('preview-call-timer');

  if (previewTimer) {
    previewTimer.textContent = '00:00';
  }

  if (previewCallRingTimer) {
    window.clearTimeout(previewCallRingTimer);
    previewCallRingTimer = null;
  }
}

function startPreviewCallTimer(startedAt, status = '') {
  const timer = document.getElementById('preview-call-timer');

  if (!previewChatOpenedAt) {
    previewChatOpenedAt = new Date().toISOString();
  }

  previewCallStartedAt = previewChatOpenedAt;

  if (!timer) {
    return;
  }

  timer.textContent = formatCallWaitTime(previewCallStartedAt);

  if (previewCallTimer) {
    window.clearInterval(previewCallTimer);
  }

  previewCallTimer = window.setInterval(() => {
    timer.textContent = formatCallWaitTime(previewCallStartedAt);
  }, 1000);
}

function getPreviewCallIpKey(ip) {
  return ip || `sessao:${getAnalyticsSessionId()}`;
}

function isPreviewCallTestIp(ip) {
  return PREVIEW_CALL_TEST_IPS.includes(String(ip || '').trim());
}

function getPreviewCallDetails(record) {
  return record?.detalhes && typeof record.detalhes === 'object'
    ? record.detalhes
    : {};
}

function isTypingRecent(value) {
  if (!value) {
    return false;
  }

  const time = new Date(value).getTime();

  return Number.isFinite(time) && Date.now() - time < PREVIEW_TYPING_TTL_MS;
}

async function setPreviewUserTyping(isTyping) {
  if (!previewCallRecord?.id || typeof _supa === 'undefined' || !_supa) {
    return;
  }

  sendPreviewTypingBroadcast(isTyping);

  const nowMs = Date.now();

  if (isTyping && nowMs - previewTypingLastSentAt < PREVIEW_TYPING_THROTTLE_MS) {
    return;
  }

  previewTypingLastSentAt = nowMs;
  const nowIso = new Date(nowMs).toISOString();

  const { error } = await _supa
    .from(PREVIEW_CALL_TABLE)
    .update({
      usuario_digitando: Boolean(isTyping),
      usuario_digitando_em: isTyping ? nowIso : null,
      updated_at: nowIso
    })
    .eq('id', previewCallRecord.id);

  if (error) {
    console.warn('Nao consegui atualizar digitando do usuario:', error.message || error);
    await _supa
      .from(PREVIEW_TYPING_TABLE)
      .upsert({
        chamada_id: previewCallRecord.id,
        lado: 'usuario',
        digitando: Boolean(isTyping),
        atualizado_em: nowIso
      }, { onConflict: 'chamada_id,lado' });
  }
}

function markPreviewUserTyping() {
  setPreviewUserTyping(true);
}

function stopPreviewUserTyping() {
  setPreviewUserTyping(false);
}

function isPreviewIncomingAdminCall(record) {
  return (
    record?.status === 'liberado' &&
    !record.entrou_em &&
    getPreviewCallDetails(record).call_direction === 'admin'
  );
}

function notifyPreviewIncomingCall(record) {
  const key = `${record?.id || ''}:${record?.meet_url || ''}`;

  if (!key || key === previewIncomingCallKey) {
    return;
  }

  previewIncomingCallKey = key;

  try {
    navigator.vibrate?.([220, 90, 220, 90, 320]);
  } catch (error) {
    // Vibracao e apenas um reforco visual no celular.
  }

  startPreviewRingFeedback({ sound: true });
}

function getPreviewVisitorName() {
  try {
    let visitorName = localStorage.getItem(PREVIEW_VISITOR_STORAGE_KEY);

    if (!visitorName) {
      visitorName = `Visitante ${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem(PREVIEW_VISITOR_STORAGE_KEY, visitorName);
    }

    return visitorName;
  } catch (error) {
    return `Visitante ${Math.floor(1000 + Math.random() * 9000)}`;
  }
}

async function getPreviewConversation(ip, includeFinished = true, phone = '') {
  const statuses = includeFinished
    ? PREVIEW_CHAT_VISIBLE_STATUSES
    : PREVIEW_CALL_ACTIVE_STATUSES;
  let query = _supa
    .from(PREVIEW_CALL_TABLE)
    .select('*')
    .in('status', statuses)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1);

  if (phone) {
    query = query.eq('telefone', phone);
  } else {
    query = query.eq('ip', ip);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  if (data?.[0]) {
    return data[0];
  }

  if (phone && ip) {
    const { data: ipData, error: ipError } = await _supa
      .from(PREVIEW_CALL_TABLE)
      .select('*')
      .eq('ip', ip)
      .in('status', statuses)
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1);

    if (ipError) {
      throw ipError;
    }

    return ipData?.[0] || null;
  }

  return null;
}

async function syncPreviewConversationIdentity(record, ip, phone) {
  if (!record?.id || (!phone && record.ip === ip)) {
    return record;
  }

  const now = new Date().toISOString();
  const details = {
    ...getPreviewCallDetails(record),
    telefone: phone || record.telefone || '',
    current_ip: ip,
    last_identity_sync_at: now
  };
  const updates = {
    ip,
    telefone: phone || record.telefone || null,
    detalhes: details,
    updated_at: now
  };
  const { data, error } = await _supa
    .from(PREVIEW_CALL_TABLE)
    .update(updates)
    .eq('id', record.id)
    .select('*')
    .maybeSingle();

  if (error) {
    console.warn('Nao consegui atualizar telefone/IP da chamada:', error.message || error);
    return record;
  }

  return data || { ...record, ...updates };
}

async function createPreviewCall(ip, phone = '') {
  const user = getStoredUser();
  const visitorName = getPreviewVisitorName();
  const now = new Date().toISOString();
  const roomSlug = `AmandaVip-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  const videoUrl = `${PREVIEW_CALL_VIDEO_BASE_URL}/${roomSlug}`;
  const { data, error } = await _supa
    .from(PREVIEW_CALL_TABLE)
    .insert({
      username: visitorName,
      plano: user.plano || '',
      sessao_id: getAnalyticsSessionId(),
      ip,
      telefone: phone || null,
      status: 'aguardando',
      meet_url: videoUrl,
      detalhes: {
        login_username: user.username || '',
        visitor_name: visitorName,
        telefone: phone || '',
        current_ip: ip
      },
      created_at: now,
      updated_at: now
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

function getPreviewVideoUrl(record) {
  if (record?.meet_url && /^https?:\/\//i.test(String(record.meet_url))) {
    try {
      const parsed = new URL(record.meet_url);
      const room = parsed.pathname.split('/').filter(Boolean).pop();

      if (parsed.hostname === 'meet.jit.si' && room) {
        return `${PREVIEW_CALL_VIDEO_BASE_URL}/${room}`;
      }

      if (parsed.hostname === PREVIEW_CALL_VIDEO_DOMAIN) {
        const parts = parsed.pathname.split('/').filter(Boolean);

        if (parts[0] === JAAS_APP_ID && parts[1]) {
          return parsed.toString();
        }

        if (parts[0]) {
          return `${PREVIEW_CALL_VIDEO_BASE_URL}/${parts[0]}`;
        }
      }
    } catch (error) {
      // Usa fallback abaixo quando a URL antiga estiver incompleta.
    }
  }

  return `${PREVIEW_CALL_VIDEO_BASE_URL}/AmandaVip-${String(record?.id || getAnalyticsSessionId()).replace(/[^a-zA-Z0-9]/g, '')}`;
}

function getPreviewVideoDomain(record) {
  try {
    return new URL(getPreviewVideoUrl(record)).hostname;
  } catch (error) {
    return PREVIEW_CALL_VIDEO_DOMAIN;
  }
}

function getPreviewVideoRoomName(record) {
  const url = getPreviewVideoUrl(record);

  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);

    if (parsed.hostname === PREVIEW_CALL_VIDEO_DOMAIN && parts[0] === JAAS_APP_ID && parts[1]) {
      return `${parts[0]}/${parts[1]}`;
    }

    const room = parts.pop();

    if (room) {
      return room;
    }
  } catch (error) {
    // Mantem fallback abaixo para valores antigos ou incompletos.
  }

  return `AmandaVip-${String(record?.id || getAnalyticsSessionId()).replace(/[^a-zA-Z0-9]/g, '')}`;
}

async function getPreviewJaasToken(record, displayName, moderator = false) {
  if (getPreviewVideoDomain(record) !== PREVIEW_CALL_VIDEO_DOMAIN) {
    return getPreviewCallDetails(record).jaas_jwt || '';
  }

  const response = await fetch(JAAS_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      roomName: getPreviewVideoRoomName(record),
      displayName,
      moderator
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.jwt) {
    throw new Error(data.error || 'Nao consegui gerar o token da chamada.');
  }

  return data.jwt;
}

function buildPreviewVideoEmbedUrl(record, jwt = '') {
  const displayName = encodeURIComponent(getPreviewVisitorName());
  const baseUrl = getPreviewVideoUrl(record);
  const url = new URL(baseUrl);

  if (jwt) {
    url.searchParams.set('jwt', jwt);
  }

  return `${url.toString()}#userInfo.displayName="${displayName}"&config.prejoinPageEnabled=false&config.prejoinConfig.enabled=false&config.disableDeepLinking=true&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;
}

function getPreviewJitsiConfig() {
  return {
    prejoinPageEnabled: false,
    prejoinConfig: { enabled: false },
    disableDeepLinking: true,
    startWithAudioMuted: false,
    startWithVideoMuted: false,
    startAudioOnly: false,
    enableClosePage: false,
    p2p: { enabled: true }
  };
}

function getPreviewJitsiInterfaceConfig() {
  return {
    MOBILE_APP_PROMO: false,
    SHOW_JITSI_WATERMARK: false,
    SHOW_BRAND_WATERMARK: false,
    SHOW_POWERED_BY: false,
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
  };
}

function handlePreviewJitsiClosed() {
  const videoStage = document.getElementById('preview-video-stage');
  const videoFrame = document.getElementById('preview-video-frame');

  disposePreviewJitsi();

  if (videoFrame) {
    videoFrame.innerHTML = '';
  }

  if (videoStage) {
    videoStage.hidden = true;
  }

  if (previewCallRecord?.status === 'em_chamada') {
    setPreviewChatStatus('Chamada encerrada no aparelho');
  }
}

function attachPreviewJitsiListeners(api) {
  api.addListener('videoConferenceJoined', () => {
    setPreviewChatStatus('Chamada de vídeo conectada');
  });
  api.addListener('videoConferenceLeft', handlePreviewJitsiClosed);
  api.addListener('readyToClose', handlePreviewJitsiClosed);
  api.addListener('cameraError', () => {
    setPreviewChatStatus('Permita o acesso à câmera e tente novamente');
  });
  api.addListener('micError', () => {
    setPreviewChatStatus('Permita o acesso ao microfone e tente novamente');
  });
  api.addListener('peerConnectionFailure', () => {
    setPreviewChatStatus('Conexão instável. Feche e toque em atender novamente.');
  });
}

async function mountPreviewJitsiMeeting(container, record) {
  const displayName = getPreviewVisitorName();
  const jwt = await getPreviewJaasToken(record, displayName, false);

  disposePreviewJitsi();
  container.innerHTML = '';

  if (window.JitsiMeetExternalAPI) {
    previewJitsiApi = new window.JitsiMeetExternalAPI(getPreviewVideoDomain(record), {
      roomName: getPreviewVideoRoomName(record),
      parentNode: container,
      width: '100%',
      height: '100%',
      userInfo: { displayName },
      ...(jwt ? { jwt } : {}),
      configOverwrite: getPreviewJitsiConfig(),
      interfaceConfigOverwrite: getPreviewJitsiInterfaceConfig()
    });
    attachPreviewJitsiListeners(previewJitsiApi);
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.title = 'Chamada de video';
  iframe.allow = 'camera; microphone; fullscreen; display-capture; autoplay';
  iframe.allowFullscreen = true;
  iframe.src = buildPreviewVideoEmbedUrl(record, jwt);
  container.appendChild(iframe);
}

function isTemporaryPreviewSystemMessage(message) {
  if (message.autor_tipo !== 'sistema') {
    return false;
  }

  const text = String(message.texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  return [
    'usuario iniciou uma chamada previa',
    'camera do visitante',
    'visitante desligou a camera',
    'visitante ligou a camera',
    'chamada previa encerrada automaticamente'
  ].some((pattern) => text.includes(pattern));
}

function shouldShowPreviewSystemMessageToVisitor(message) {
  if (message.autor_tipo !== 'sistema') {
    return true;
  }

  const text = String(message.texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  return text.includes('conversa iniciada')
    || text.includes('voce ja participou')
    || text.includes('agora pague a chamada completa')
    || text.includes('pague para fazer uma completa');
}

function getPreviewAdminReadAtMs() {
  const readAt = getPreviewCallDetails(previewCallRecord).admin_read_at;
  const time = readAt ? new Date(readAt).getTime() : 0;

  return Number.isNaN(time) ? 0 : time;
}

function getPreviewUserReadAtMs(record = previewCallRecord) {
  const readAt = getPreviewCallDetails(record).usuario_read_at;
  const time = readAt ? new Date(readAt).getTime() : 0;

  return Number.isNaN(time) ? 0 : time;
}

function countPreviewUnreadAdminMessages(messages = [], record = previewCallRecord) {
  const readAtMs = getPreviewUserReadAtMs(record);

  return messages.filter((message) => {
    if (message.autor_tipo !== 'admin' || !message.created_at) {
      return false;
    }

    const createdAtMs = new Date(message.created_at).getTime();

    return !Number.isNaN(createdAtMs) && (!readAtMs || createdAtMs > readAtMs);
  }).length;
}

function setPreviewUnreadBadge(count) {
  const badge = document.getElementById('preview-chat-unread-badge');

  if (!badge) {
    return;
  }

  const safeCount = Math.max(0, Number(count) || 0);
  badge.hidden = safeCount <= 0;
  badge.textContent = safeCount > 99 ? '99+' : String(safeCount);
}

async function markPreviewChatReadByUser(messages = []) {
  if (!previewCallRecord?.id || typeof _supa === 'undefined' || !_supa) {
    return;
  }

  if (!countPreviewUnreadAdminMessages(messages, previewCallRecord)) {
    setPreviewUnreadBadge(0);
    return;
  }

  const now = new Date().toISOString();
  const details = {
    ...getPreviewCallDetails(previewCallRecord),
    usuario_read_at: now
  };

  previewCallRecord = {
    ...previewCallRecord,
    detalhes: details
  };
  setPreviewUnreadBadge(0);

  const { error } = await _supa
    .from(PREVIEW_CALL_TABLE)
    .update({ detalhes: details })
    .eq('id', previewCallRecord.id);

  if (error) {
    console.warn('Nao consegui marcar mensagens como lidas:', error.message || error);
  }
}

function isPreviewTypingStateActive(state) {
  return state?.digitando === true && isTypingRecent(state.atualizado_em);
}

function renderPreviewChatMessages(messages, adminTypingState = null) {
  const container = document.getElementById('preview-chat-messages');

  if (!container) {
    return;
  }

  const visibleMessages = messages.filter(shouldShowPreviewSystemMessageToVisitor);
  const adminReadAtMs = getPreviewAdminReadAtMs();
  const previewDetails = getPreviewCallDetails(previewCallRecord);
  const adminTyping = (
      Date.now() < previewAdminTypingLiveUntil
    ) || (
      isPreviewTypingStateActive(adminTypingState)
    ) || (
      previewCallRecord?.admin_digitando === true
      && isTypingRecent(previewCallRecord.admin_digitando_em)
    ) || (
      previewDetails.admin_typing === true
      && isTypingRecent(previewDetails.admin_typing_at)
    );
  setPreviewTypingStatus(adminTyping);
  const messageKey = JSON.stringify(visibleMessages.map((message) => message.id || message.created_at || message.texto));
  const shouldScrollToLatest = messageKey !== previewChatLastMessageKey;

  if (previewChatTemporaryRenderTimer) {
    window.clearTimeout(previewChatTemporaryRenderTimer);
    previewChatTemporaryRenderTimer = null;
  }

  const renderKey = JSON.stringify(visibleMessages.map((message) => [
    message.id,
    message.texto,
    message.autor_tipo,
    message.created_at,
    adminReadAtMs
  ]).concat([adminTyping ? 'admin_typing' : '']));

  if (renderKey === previewChatLastRenderKey) {
    return;
  }

  previewChatLastRenderKey = renderKey;
  previewChatLastMessageKey = messageKey;

  if (!visibleMessages.length) {
    container.innerHTML = `
      <div class="telegram-empty">
        Mande uma mensagem para Amanda ou chame por chamada de vídeo.
      </div>
    `;
    return;
  }

  const messagesHtml = visibleMessages.map((message) => {
    const mine = message.autor_tipo === 'usuario';
    const system = message.autor_tipo === 'sistema';
    const time = message.created_at
      ? new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : '';
    const createdAtMs = message.created_at ? new Date(message.created_at).getTime() : 0;
    const wasRead = mine
      && adminReadAtMs
      && createdAtMs
      && !Number.isNaN(createdAtMs)
      && createdAtMs <= adminReadAtMs;
    const meta = [time, wasRead ? 'Lida' : ''].filter(Boolean).join(' · ');
    const completeCode = extractCompleteCallCode(message.texto);
    const copyCodeButton = completeCode
      ? `<button class="telegram-copy-code" type="button" data-copy-code="${escapeHtml(completeCode)}">Copiar codigo</button>`
      : '';

    if (system) {
      return `
        <div class="telegram-system-message">
          ${escapeHtml(message.texto || '')}
        </div>
      `;
    }

    return `
      <div class="telegram-message ${mine ? 'is-mine' : 'is-admin'}">
        <span>${escapeHtml(message.texto || '')}</span>
        ${copyCodeButton}
        <small>${escapeHtml(meta)}</small>
      </div>
    `;
  }).join('');

  container.innerHTML = messagesHtml;

  if (shouldScrollToLatest) {
    container.scrollTop = container.scrollHeight;
  }
}

async function loadPreviewChatMessages() {
  if (!previewCallRecord?.id) {
    return;
  }

  const callId = previewCallRecord.id;
  const [messagesResult, callResult, typingResult] = await Promise.all([
    _supa
      .from(PREVIEW_CALL_MESSAGES_TABLE)
      .select('*')
      .eq('chamada_id', callId)
      .order('created_at', { ascending: true })
      .limit(200),
    _supa
      .from(PREVIEW_CALL_TABLE)
      .select('id, status, detalhes, admin_digitando, admin_digitando_em, usuario_digitando, usuario_digitando_em, updated_at')
      .eq('id', callId)
      .maybeSingle(),
    _supa
      .from(PREVIEW_TYPING_TABLE)
      .select('digitando, atualizado_em')
      .eq('chamada_id', callId)
      .eq('lado', 'admin')
      .maybeSingle()
  ]);

  const { data, error } = messagesResult;

  if (error) {
    console.warn('Nao consegui carregar mensagens:', error.message || error);
    return;
  }

  if (callResult.error) {
    console.warn('Nao consegui carregar estado da chamada:', callResult.error.message || callResult.error);
  } else if (callResult.data && previewCallRecord?.id === callId) {
    previewCallRecord = {
      ...previewCallRecord,
      ...callResult.data
    };
  }

  if (typingResult.error && typingResult.error.code !== 'PGRST116') {
    console.warn('Nao consegui carregar estado de digitacao:', typingResult.error.message || typingResult.error);
  }

  const messages = data || [];
  renderPreviewChatMessages(messages, typingResult.data || null);

  const modal = document.getElementById('preview-call-modal');

  if (modal && !modal.hidden) {
    markPreviewChatReadByUser(messages);
  }
}

async function sendPreviewChatMessage(text, authorType = 'usuario') {
  if (!previewCallRecord?.id || !text.trim()) {
    return;
  }

  const { error } = await _supa
    .from(PREVIEW_CALL_MESSAGES_TABLE)
    .insert({
      chamada_id: previewCallRecord.id,
      autor_tipo: authorType,
      autor_nome: authorType === 'usuario' ? getPreviewVisitorName() : 'Amanda',
      texto: text.trim()
    });

  if (error) {
    console.warn('Nao consegui enviar mensagem:', error.message || error);
    alert('Nao consegui enviar sua mensagem agora.');
    return;
  }

  trackEvent('enviou_mensagem_chamada_previa', {
    alvo_tipo: 'chat_chamada',
    alvo_titulo: text.trim().slice(0, 80)
  });
  loadPreviewChatMessages();
}

function showPreviewCallMissed() {
  previewAutoJoinPending = false;
  stopPreviewRinging();
  setPreviewChatStatus('Amanda não atendeu, tente mais tarde');
  setPreviewCallEnterEnabled(false, 'Chamada de vídeo indisponível');

  const button = document.getElementById('preview-call-request');

  if (button) {
    button.disabled = false;
    button.textContent = 'Chamar por videochamada';
    button.classList.add('is-call-action');
    button.classList.remove('is-answer-action');
  }

  window.setTimeout(() => {
    closePreviewCallRoom();
  }, 2600);
}

async function declinePreviewCall() {
  const isSimulatedCall = Boolean(getPreviewCallDetails(previewCallRecord).simulated_call);

  stopPreviewRinging();
  previewAutoJoinPending = false;
  previewIncomingCallKey = '';

  if (!previewCallRecord?.id) {
    closePreviewCallRoom();
    return;
  }

  if (isSimulatedCall) {
    await finishSimulatedPreviewCall('usuario_recusou');
    closePreviewCallRoom();
    return;
  }

  const now = new Date().toISOString();

  await _supa
    .from(PREVIEW_CALL_TABLE)
    .update({
      status: 'cancelado',
      updated_at: now,
      detalhes: {
        ...getPreviewCallDetails(previewCallRecord),
        declined_at: now
      }
    })
    .eq('id', previewCallRecord.id);

  await _supa
    .from(PREVIEW_CALL_MESSAGES_TABLE)
    .insert({
      chamada_id: previewCallRecord.id,
      autor_tipo: 'sistema',
      autor_nome: 'Sistema',
      texto: 'Usuario recusou a chamada.'
    });

  trackEvent('recusou_chamada_previa', {
    alvo_tipo: 'chamada_previa',
    alvo_titulo: 'Recusou chamada'
  });

  closePreviewCallRoom();
}

function startPreviewRingingTimeout() {
  setPreviewRingingVisible(true);

  if (previewCallRingTimer) {
    return;
  }

  previewCallRingTimer = window.setTimeout(async () => {
    previewCallRingTimer = null;
    if (!previewCallRecord?.id || previewCallRecord.status !== 'chamando') {
      return;
    }

    await _supa
      .from(PREVIEW_CALL_TABLE)
      .update({
        status: 'aguardando',
        updated_at: new Date().toISOString()
      })
      .eq('id', previewCallRecord.id);

    await _supa
      .from(PREVIEW_CALL_MESSAGES_TABLE)
      .insert({
        chamada_id: previewCallRecord.id,
        autor_tipo: 'sistema',
        autor_nome: 'Sistema',
        texto: 'Amanda não atendeu a chamada de vídeo. Tente novamente mais tarde.'
      });

    showPreviewCallMissed();
  }, PREVIEW_CALL_RING_TIMEOUT_MS);
}

async function requestPreviewVideoCall() {
  const button = document.getElementById('preview-call-request');

  if (!previewCallRecord?.id) {
    return;
  }

  if (previewCallRecord.status === 'finalizado') {
    setPreviewChatStatus('Chamada prévia finalizada');
    showPreviewCompleteShortcut(true);
    return;
  }

  if (previewCallRecord.status === 'em_chamada') {
    setPreviewChatStatus('Chamada previa em andamento');
    return;
  }

  if (previewCallRecord.status === 'liberado') {
    enterPreviewCall();
    return;
  }

  if (previewCallRecord.status === 'chamando' || previewAutoJoinPending) {
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = 'Chamando Amanda...';
  }

  previewAutoJoinPending = true;
  previewCallRecord = {
    ...previewCallRecord,
    status: 'chamando',
    detalhes: {
      ...getPreviewCallDetails(previewCallRecord),
      simulated_call: true
    }
  };
  setPreviewChatStatus('Chamando Amanda...');
  setPreviewRingingContent(
    'Chamando Amanda...',
    amandaPresenceOnline
      ? 'Aguarde alguns segundos. Amanda está recebendo sua chamada prévia.'
      : 'Amanda está offline agora. Se ela não atender, a chamada encerra sozinha.'
  );
  setPreviewRingingActions({ answer: false, decline: true });
  setPreviewRingingVisible(true);
  const now = new Date().toISOString();

  await _supa
    .from(PREVIEW_CALL_TABLE)
    .update({
      status: 'chamando',
      detalhes: {
        ...getPreviewCallDetails(previewCallRecord),
        simulated_call: true,
        call_direction: 'usuario',
        call_requested_at: now
      },
      updated_at: now
    })
    .eq('id', previewCallRecord.id);

  await _supa
    .from(PREVIEW_CALL_MESSAGES_TABLE)
    .insert({
      chamada_id: previewCallRecord.id,
      autor_tipo: 'sistema',
      autor_nome: 'Sistema',
      texto: 'Usuário iniciou uma chamada prévia.'
    });

  trackEvent('solicitou_videochamada_previa', {
    alvo_tipo: 'chat_chamada',
    alvo_titulo: 'Iniciou chamada previa simulada'
  });
  if (amandaPresenceOnline) {
    previewCallRingTimer = window.setTimeout(() => {
      previewCallRingTimer = null;
      if (!previewAutoJoinPending || !previewCallRecord?.id || previewCallRecord.status !== 'chamando') {
        return;
      }
      enterPreviewCall();
    }, PREVIEW_SIMULATED_RING_MS);
  } else {
    startPreviewRingingTimeout();
  }
  loadPreviewChatMessages();
}

async function ensurePreviewWelcomeMessage(record) {
  if (!record?.id) {
    return;
  }

  const { count, error } = await _supa
    .from(PREVIEW_CALL_MESSAGES_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('chamada_id', record.id);

  if (error || count) {
    return;
  }

  await _supa
    .from(PREVIEW_CALL_MESSAGES_TABLE)
    .insert({
      chamada_id: record.id,
      autor_tipo: 'sistema',
      autor_nome: 'Sistema',
      texto: `Conversa iniciada. Amanda está ${amandaPresenceOnline ? 'online' : 'offline'}. Amanda foi notificada e responderá por aqui.`
    });
}

async function ensurePreviewFinishedMessage(record) {
  if (!record?.id) {
    return;
  }

  const { count, error } = await _supa
    .from(PREVIEW_CALL_MESSAGES_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('chamada_id', record.id)
    .eq('texto', PREVIEW_FINISHED_MESSAGE);

  if (error || count) {
    return;
  }

  await _supa
    .from(PREVIEW_CALL_MESSAGES_TABLE)
    .insert({
      chamada_id: record.id,
      autor_tipo: 'sistema',
      autor_nome: 'Sistema',
      texto: PREVIEW_FINISHED_MESSAGE
    });
}

function startPreviewChatPolling() {
  loadPreviewChatMessages();

  if (previewChatPollTimer) {
    window.clearInterval(previewChatPollTimer);
  }

  previewChatPollTimer = window.setInterval(loadPreviewChatMessages, PREVIEW_CHAT_POLL_MS);
}

function applyPreviewCallStatus(record) {
  const previousStatus = previewCallRecord?.status;
  previewCallRecord = record;
  const requestButton = document.getElementById('preview-call-request');

  if (!record) {
    return;
  }

  startPreviewCallTimer(record.created_at, record.status);
  showPreviewCompleteShortcut(false);

  if (record.status === 'liberado' || record.status === 'em_chamada') {
    const incomingAdminCall = isPreviewIncomingAdminCall(record);

    if (incomingAdminCall) {
      setPreviewRingingContent(
        'Amanda está ligando para você...',
        'Toque em Atender chamada para entrar direto na videochamada.'
      );
      setPreviewRingingActions({ answer: true, decline: true });
      setPreviewRingingVisible(true);
      notifyPreviewIncomingCall(record);
      setPreviewChatStatus('Amanda está te chamando agora');
    } else {
      stopPreviewRinging();
      setPreviewChatStatus(record.status === 'em_chamada'
        ? 'Chamada de vídeo em andamento'
        : 'Amanda atendeu. Toque para entrar na chamada.');
    }
    setPreviewCallEnterEnabled(false, 'Chamada de vídeo liberada');
    if (requestButton) {
      requestButton.disabled = false;
      requestButton.textContent = incomingAdminCall ? 'Atender chamada' : 'Entrar na chamada de vídeo';
      requestButton.classList.add('is-ready', 'is-call-action');
      requestButton.classList.toggle('is-answer-action', incomingAdminCall);
    }
    previewAutoJoinPending = false;
    return;
  }

  if (record.status === 'chamando') {
    const isSimulatedCall = Boolean(getPreviewCallDetails(record).simulated_call);
    const simulatedMessage = amandaPresenceOnline
      ? 'Aguarde alguns segundos. Amanda está recebendo sua chamada prévia.'
      : 'Amanda está offline agora. Se ela não atender, a chamada encerra sozinha.';

    previewIncomingCallKey = '';
    setPreviewRingingContent(
      'Chamando Amanda...',
      isSimulatedCall
        ? simulatedMessage
        : 'Aguarde ela atender sua chamada de vídeo.'
    );
    setPreviewRingingActions({ answer: false, decline: true });
    setPreviewChatStatus('Chamando Amanda...');
    setPreviewCallEnterEnabled(false, 'Chamando Amanda...');
    setPreviewRingingVisible(true);
    if (requestButton) {
      requestButton.disabled = true;
      requestButton.textContent = 'Chamando Amanda...';
      requestButton.classList.add('is-call-action');
      requestButton.classList.remove('is-answer-action');
    }

    if (isSimulatedCall && amandaPresenceOnline && previewAutoJoinPending && !previewCallRingTimer) {
      previewCallRingTimer = window.setTimeout(() => {
        previewCallRingTimer = null;
        if (!previewAutoJoinPending || !previewCallRecord?.id || previewCallRecord.status !== 'chamando') {
          return;
        }
        enterPreviewCall();
      }, PREVIEW_SIMULATED_RING_MS);
    } else if (!isSimulatedCall || !amandaPresenceOnline) {
      startPreviewRingingTimeout();
    }

    return;
  }

  if (record.status === 'finalizado') {
    const videoStage = document.getElementById('preview-video-stage');
    const videoFrame = document.getElementById('preview-video-frame');

    previewIncomingCallKey = '';
    previewAutoJoinPending = false;
    stopPreviewRinging();
    disposePreviewJitsi();

    if (videoFrame) {
      videoFrame.innerHTML = '';
    }

    if (videoStage) {
      videoStage.hidden = true;
    }

    setPreviewChatStatus('Chamada prévia finalizada');
    setPreviewCallEnterEnabled(false, 'Chamada prévia usada');
    if (requestButton) {
      requestButton.disabled = true;
      requestButton.textContent = 'Chamada finalizada';
      requestButton.classList.remove('is-answer-action');
    }
    showPreviewCompleteShortcut(true);
    return;
  }

  if (record.status === 'cancelado') {
    previewIncomingCallKey = '';
    stopPreviewRinging();
    setPreviewChatStatus('Chamada indisponivel agora');
    setPreviewCallEnterEnabled(false, 'Indisponivel');
    if (requestButton) {
      requestButton.disabled = true;
      requestButton.textContent = 'Indisponivel';
      requestButton.classList.remove('is-answer-action');
    }
    stopPreviewCallTimers();
    return;
  }

  if (previousStatus === 'chamando' && previewAutoJoinPending) {
    showPreviewCallMissed();
    return;
  }

  stopPreviewRinging();
  previewIncomingCallKey = '';
  setPreviewChatStatus(amandaPresenceOnline ? 'Amanda está online' : 'Amanda está offline');
  setPreviewCallEnterEnabled(false, 'Chamada de video');
  if (requestButton) {
    requestButton.disabled = false;
    requestButton.textContent = 'Chamar por videochamada';
    requestButton.classList.add('is-call-action');
    requestButton.classList.remove('is-answer-action');
  }
}

async function refreshPreviewCallStatus() {
  if (!previewCallRecord?.id) {
    return;
  }

  const { data, error } = await _supa
    .from(PREVIEW_CALL_TABLE)
    .select('*')
    .eq('id', previewCallRecord.id)
    .maybeSingle();

  if (error) {
    console.warn('Nao consegui atualizar a sala de espera:', error);
    return;
  }

  if (data?.status === 'finalizado') {
    await ensurePreviewFinishedMessage(data);
  }

  applyPreviewCallStatus(data);
}

function startPreviewCallPolling() {
  if (previewCallPollTimer) {
    window.clearInterval(previewCallPollTimer);
  }

  previewCallPollTimer = window.setInterval(refreshPreviewCallStatus, PREVIEW_CALL_POLL_MS);
}

async function checkIncomingPreviewCallInBackground() {
  const modal = document.getElementById('preview-call-modal');

  if (!modal || !modal.hidden || typeof _supa === 'undefined' || !_supa || isAdminUser()) {
    return;
  }

  try {
    const ip = getPreviewCallIpKey(await getClientIp());
    const activeCall = await getPreviewConversation(ip, true, getStoredPreviewPhone());

    if (isPreviewIncomingAdminCall(activeCall)) {
      openPreviewCallRoom();
    }
  } catch (error) {
    console.warn('Nao consegui verificar chamada recebida:', error.message || error);
  }
}

function startPreviewIncomingCallWatcher() {
  if (previewIncomingPollTimer || isAdminUser()) {
    return;
  }

  previewIncomingPollTimer = window.setInterval(
    checkIncomingPreviewCallInBackground,
    PREVIEW_CALL_POLL_MS
  );
  checkIncomingPreviewCallInBackground();
}

async function checkPreviewUnreadMessages() {
  const modal = document.getElementById('preview-call-modal');

  if (!modal || !modal.hidden || typeof _supa === 'undefined' || !_supa || isAdminUser() || previewUnreadChecking) {
    return;
  }

  previewUnreadChecking = true;

  try {
    const ip = getPreviewCallIpKey(await getClientIp());
    const activeCall = await getPreviewConversation(ip, true, getStoredPreviewPhone());

    if (!activeCall?.id) {
      setPreviewUnreadBadge(0);
      return;
    }

    const { data, error } = await _supa
      .from(PREVIEW_CALL_MESSAGES_TABLE)
      .select('id, autor_tipo, created_at')
      .eq('chamada_id', activeCall.id)
      .eq('autor_tipo', 'admin')
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.warn('Nao consegui verificar mensagens nao lidas:', error.message || error);
      return;
    }

    setPreviewUnreadBadge(countPreviewUnreadAdminMessages(data || [], activeCall));
  } catch (error) {
    console.warn('Nao consegui verificar mensagens nao lidas:', error.message || error);
  } finally {
    previewUnreadChecking = false;
  }
}

function startPreviewUnreadWatcher() {
  if (previewUnreadPollTimer || isAdminUser()) {
    return;
  }

  previewUnreadPollTimer = window.setInterval(
    checkPreviewUnreadMessages,
    PREVIEW_UNREAD_POLL_MS
  );
  checkPreviewUnreadMessages();
}

async function openPreviewCallRoom() {
  const modal = document.getElementById('preview-call-modal');

  if (!modal) {
    return;
  }

  modal.hidden = false;
  hideFloatingOfferPanel();
  stopPreviewCallTimers();
  startPreviewCallTimer();
  previewChatLastRenderKey = '';
  setPreviewChatStatus('Abrindo conversa...');
  setPreviewCallEnterEnabled(false, 'Preparando...');
  showPreviewCompleteShortcut(false);
  const requestButton = document.getElementById('preview-call-request');

  if (requestButton) {
    requestButton.disabled = false;
    requestButton.textContent = 'Chamar por videochamada';
    requestButton.classList.add('is-call-action');
    requestButton.classList.remove('is-answer-action');
  }

  try {
    trackEvent('abriu_chamada_previa', {
      alvo_tipo: 'chamada_previa',
      alvo_titulo: 'Sala de espera'
    });

    const ip = getPreviewCallIpKey(await getClientIp());
    const phone = await ensurePreviewPhone(ip);
    const includeFinished = !isPreviewCallTestIp(ip);
    let activeCall = await getPreviewConversation(ip, includeFinished, phone);

    if (!activeCall) {
      activeCall = await createPreviewCall(ip, phone);
      trackEvent('entrou_fila_chamada_previa', {
        alvo_tipo: 'chamada_previa',
        alvo_titulo: 'Aguardando Amanda'
      });
    } else {
      activeCall = await syncPreviewConversationIdentity(activeCall, ip, phone);
    }

    activeCall = await finishPreviewCallIfMarkedAsLeft(activeCall);

    await ensurePreviewWelcomeMessage(activeCall);

    if (activeCall.status === 'finalizado') {
      trackEvent('chamada_previa_repetida', {
        alvo_tipo: 'chamada_previa',
        alvo_titulo: 'Telefone ja participou'
      });
      await ensurePreviewFinishedMessage(activeCall);
    }

    applyPreviewCallStatus(activeCall);
    ensurePreviewTypingChannel();
    startPreviewCallPolling();
    startPreviewChatPolling();
  } catch (error) {
    console.error('Erro ao abrir chamada prévia:', error);
    setPreviewChatStatus('Não consegui abrir a conversa');
    setPreviewCallEnterEnabled(false, 'Indisponivel');
  }
}

function closePreviewCallRoom() {
  const modal = document.getElementById('preview-call-modal');
  const videoStage = document.getElementById('preview-video-stage');
  const videoFrame = document.getElementById('preview-video-frame');
  const shouldFinishSimulated = (
    previewCallRecord?.id &&
    ['chamando', 'em_chamada'].includes(previewCallRecord.status) &&
    getPreviewCallDetails(previewCallRecord).simulated_call
  );

  stopPreviewCallTimers();
  previewAutoJoinPending = false;
  setPreviewPhoneGateVisible(false);
  stopPreviewRinging();
  disposePreviewJitsi();
  stopPreviewUserTyping();
  cleanupPreviewTypingChannel();

  if (videoFrame) {
    videoFrame.innerHTML = '';
  }

  if (videoStage) {
    videoStage.hidden = true;
  }

  if (modal) {
    modal.hidden = true;
  }

  if (shouldFinishSimulated) {
    finishSimulatedPreviewCall('usuario_fechou').catch((error) => {
      console.warn('Não consegui finalizar prévia simulada ao fechar:', error.message || error);
    });
  }

  showFloatingOfferPanel();
}

async function enterPreviewCall() {
  if (!previewCallRecord?.id) {
    return;
  }

  const videoStage = document.getElementById('preview-video-stage');
  const videoFrame = document.getElementById('preview-video-frame');
  const videoUrl = getSimulatedPreviewVideoUrl(previewCallRecord);
  const now = new Date().toISOString();
  const analyticsPromise = trackEvent('clicou_entrar_chamada_previa', {
    alvo_tipo: 'chamada_previa',
    alvo_titulo: 'Entrou na chamada prévia simulada',
    alvo_url: videoUrl
  });

  stopPreviewRinging();
  previewIncomingCallKey = '';

  try {
    if (videoStage) {
      videoStage.hidden = false;
    }

    if (videoFrame) {
      setPreviewChatStatus('Trocando chaves criptográficas...');
      await mountSimulatedPreviewCall(videoFrame, previewCallRecord);
    }
  } catch (error) {
    console.warn('Não consegui abrir chamada prévia simulada:', error.message || error);
    setPreviewChatStatus(error.message || 'Não consegui abrir a chamada prévia.');
    if (videoStage) {
      videoStage.hidden = true;
    }
    return;
  }

  previewCallRecord = {
    ...previewCallRecord,
    status: 'em_chamada',
    entrou_em: now,
    detalhes: {
      ...getPreviewCallDetails(previewCallRecord),
      simulated_call: true,
      call_answered_at: now,
      simulated_started_at: now,
      simulated_duration: getSimulatedPreviewDuration(previewCallRecord),
      simulated_video_url: videoUrl
    }
  };

  _supa
    .from(PREVIEW_CALL_TABLE)
    .update({
      status: 'em_chamada',
      entrou_em: now,
      detalhes: getPreviewCallDetails(previewCallRecord),
      updated_at: now
    })
    .eq('id', previewCallRecord.id)
    .then(({ error }) => {
      if (error) {
        console.warn('Nao consegui marcar entrada na chamada:', error);
      }
    });

  setPreviewChatStatus('Chamada previa em andamento');

  waitBrieflyForAnalytics(analyticsPromise).finally(() => {
    loadPreviewChatMessages();
  });
}

function openFullCallModal() {
  const modal = document.getElementById('full-call-modal');

  if (!modal) {
    return;
  }

  closePreviewCallRoom();
  modal.hidden = false;
  hideFloatingOfferPanel();
  trackEvent('abriu_chamada_completa', {
    alvo_tipo: 'chamada_completa',
    alvo_titulo: 'Escolha de tempo'
  });
}

function closeFullCallModal() {
  const modal = document.getElementById('full-call-modal');

  if (modal) {
    modal.hidden = true;
  }

  showFloatingOfferPanel();
}

function setupCallHandlers() {
  const previewEnter = document.getElementById('preview-call-enter');
  const previewRequest = document.getElementById('preview-call-request');
  const previewRingAnswer = document.getElementById('preview-call-ring-answer');
  const previewRingDecline = document.getElementById('preview-call-ring-decline');
  const previewChatForm = document.getElementById('preview-chat-form');
  const previewChatInput = document.getElementById('preview-chat-input');
  const fullSelect = document.getElementById('full-call-select');
  const fullCheckout = document.getElementById('full-call-checkout');
  const completeTokenForm = document.getElementById('complete-token-form');
  const completeTokenInput = document.getElementById('complete-token-input');
  const completeTokenPaste = document.getElementById('complete-token-paste');
  const completeStartButton = document.getElementById('complete-start-call');
  const completeFlipButton = document.querySelector('[data-complete-flip-camera]');
  const completeCameraButton = document.querySelector('[data-complete-toggle-camera]');
  const completeMicButton = document.querySelector('[data-complete-toggle-mic]');
  const completeEndButton = document.querySelector('[data-complete-end-call]');

  if (previewEnter) {
    previewEnter.addEventListener('click', () => {
      if (!previewEnter.disabled) {
        enterPreviewCall();
      }
    });
  }

  if (previewRequest) {
    previewRequest.addEventListener('click', () => {
      if (!previewRequest.disabled) {
        requestPreviewVideoCall();
      }
    });
  }

  if (previewRingAnswer) {
    previewRingAnswer.addEventListener('click', () => {
      enterPreviewCall();
    });
  }

  if (previewRingDecline) {
    previewRingDecline.addEventListener('click', () => {
      declinePreviewCall();
    });
  }

  if (previewChatForm && previewChatInput) {
    previewChatInput.addEventListener('focus', markPreviewUserTyping);
    previewChatInput.addEventListener('pointerdown', markPreviewUserTyping);
    previewChatInput.addEventListener('input', () => {
      markPreviewUserTyping();
    });
    previewChatInput.addEventListener('blur', stopPreviewUserTyping);

    previewChatForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const text = previewChatInput.value.trim();

      if (!text) {
        return;
      }

      previewChatInput.value = '';
      stopPreviewUserTyping();
      sendPreviewChatMessage(text);
    });
  }

  if (fullSelect && fullCheckout) {
    fullSelect.addEventListener('change', () => {
      const selectedOption = getFullCallOption(fullSelect.value);

      fullCheckout.disabled = !selectedOption;
      fullCheckout.classList.toggle('is-ready', Boolean(selectedOption));

      if (selectedOption) {
        trackEvent('selecionou_chamada_completa', {
          alvo_tipo: 'checkout_chamada',
          alvo_titulo: selectedOption.label,
          alvo_url: selectedOption.url
        });
      }
    });

    fullCheckout.addEventListener('click', () => {
      const selectedOption = getFullCallOption(fullSelect.value);

      if (!selectedOption || fullCheckout.disabled) {
        return;
      }

      const analyticsPromise = trackEvent('clicou_pagar_chamada_completa', {
        alvo_tipo: 'checkout_chamada',
        alvo_titulo: selectedOption.label,
        alvo_url: selectedOption.url
      });

      waitBrieflyForAnalytics(analyticsPromise).finally(() => {
        window.location.href = selectedOption.url;
      });
    });
  }

  if (completeTokenForm && completeTokenInput) {
    completeTokenForm.addEventListener('submit', (event) => {
      event.preventDefault();
      validateCompleteCallToken(completeTokenInput.value);
    });
  }

  if (completeTokenInput) {
    completeTokenInput.addEventListener('input', () => {
      completeTokenInput.value = normalizeCompleteCallCode(completeTokenInput.value);
      setCompleteTokenStatus('');
    });
  }

  completeTokenPaste?.addEventListener('click', pasteCompleteCallToken);

  if (completeStartButton) {
    completeStartButton.addEventListener('click', startCompleteVideoCall);
  }

  completeFlipButton?.addEventListener('click', flipCompleteCamera);
  completeCameraButton?.addEventListener('click', toggleCompleteCamera);
  completeMicButton?.addEventListener('click', toggleCompleteMic);
  completeEndButton?.addEventListener('click', () => endCompleteVideoCall('cliente'));
  bindCompleteCallControlReveal();

  if (document.body && document.body.dataset.copyCodeBound !== 'true') {
    document.body.dataset.copyCodeBound = 'true';
    document.addEventListener('click', (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const button = event.target.closest('[data-copy-code]');

      if (button) {
        copyCompleteCodeFromChat(button);
      }
    });
  }
}

function setAmandaPresence(isOnline) {
  const wrapper = document.getElementById('profile-presence');
  const text = document.getElementById('profile-presence-text');
  amandaPresenceOnline = Boolean(isOnline);
  setPreviewPresenceIndicator(amandaPresenceOnline);

  if (!wrapper || !text) {
    return;
  }

  wrapper.classList.toggle('is-online', amandaPresenceOnline);
  wrapper.classList.toggle('is-offline', !amandaPresenceOnline);
  text.textContent = amandaPresenceOnline ? 'Amanda está online' : 'Amanda está offline';
}

async function refreshAmandaPresence() {
  const wrapper = document.getElementById('profile-presence');

  if (!wrapper || typeof _supa === 'undefined' || !_supa) {
    return;
  }

  const { data, error } = await _supa
    .from(PRESENCE_TABLE)
    .select('online, heartbeat_em, updated_at')
    .eq('chave', PRESENCE_KEY)
    .maybeSingle();

  if (error) {
    console.warn('Nao consegui carregar status online:', error.message || error);
    setAmandaPresence(false);
    return;
  }

  const heartbeat = data?.heartbeat_em || data?.updated_at;
  const heartbeatTime = heartbeat ? new Date(heartbeat).getTime() : 0;
  const isFresh = heartbeatTime && Date.now() - heartbeatTime <= PRESENCE_ONLINE_WINDOW_MS;

  setAmandaPresence(Boolean(data?.online && isFresh));
}

function startAmandaPresencePolling() {
  refreshAmandaPresence();

  if (presencePollTimer) {
    window.clearInterval(presencePollTimer);
  }

  presencePollTimer = window.setInterval(refreshAmandaPresence, PRESENCE_POLL_MS);
}

function getPreviewSeconds() {
  return Math.min(
    DEMO_PREVIEW_MAX_SECONDS,
    Math.max(1, Number(vipConfig.preview_segundos || DEMO_PREVIEW_MAX_SECONDS))
  );
}

function getFloatingOfferElements() {
  return {
    panel: document.getElementById('floating-offer-panel'),
    handle: document.getElementById('floating-offer-drag-handle'),
    list: document.getElementById('floating-offer-list'),
    telegram: document.getElementById('floating-offer-telegram'),
    close: document.getElementById('floating-offer-close'),
    closeHint: document.getElementById('floating-offer-close-hint'),
    reopen: document.getElementById('floating-offer-reopen')
  };
}

function hideFloatingOfferHint() {
  const { closeHint } = getFloatingOfferElements();

  if (floatingOfferHintTimer) {
    window.clearTimeout(floatingOfferHintTimer);
    floatingOfferHintTimer = null;
  }

  if (closeHint) {
    closeHint.classList.remove('is-visible');
  }
}

function showFloatingOfferHint() {
  const { panel, closeHint } = getFloatingOfferElements();

  if (!panel || !closeHint || panel.hidden) {
    return;
  }

  hideFloatingOfferHint();
  closeHint.classList.add('is-visible');
  floatingOfferHintTimer = window.setTimeout(hideFloatingOfferHint, 7500);
}

function clampFloatingOfferPanel(panel) {
  if (!panel || panel.hidden) {
    return;
  }

  const rect = panel.getBoundingClientRect();
  const margin = 10;
  const maxLeft = Math.max(margin, window.innerWidth - rect.width - margin);
  const maxTop = Math.max(margin, window.innerHeight - rect.height - margin);
  const left = Math.min(Math.max(rect.left, margin), maxLeft);
  const top = Math.min(Math.max(rect.top, margin), maxTop);

  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
  panel.style.right = 'auto';
  panel.style.bottom = 'auto';
}

function saveFloatingOfferPosition(panel) {
  if (!panel) {
    return;
  }

  const rect = panel.getBoundingClientRect();
  localStorage.setItem('floatingOfferPosition', JSON.stringify({
    left: rect.left,
    top: rect.top
  }));
}

function restoreFloatingOfferPosition(panel) {
  if (!panel) {
    return;
  }

  try {
    const saved = JSON.parse(localStorage.getItem('floatingOfferPosition') || 'null');

    if (!saved || !Number.isFinite(saved.left) || !Number.isFinite(saved.top)) {
      return;
    }

    panel.style.left = `${saved.left}px`;
    panel.style.top = `${saved.top}px`;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    window.requestAnimationFrame(() => clampFloatingOfferPanel(panel));
  } catch (error) {
    localStorage.removeItem('floatingOfferPosition');
  }
}

function setupFloatingOfferDrag() {
  const { panel, handle } = getFloatingOfferElements();

  if (!panel || !handle || floatingOfferInitialized) {
    return;
  }

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  handle.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button, a')) {
      return;
    }

    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    const rect = panel.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    panel.style.left = `${startLeft}px`;
    panel.style.top = `${startTop}px`;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    handle.setPointerCapture(event.pointerId);
  });

  handle.addEventListener('pointermove', (event) => {
    if (!dragging) {
      return;
    }

    const rect = panel.getBoundingClientRect();
    const margin = 10;
    const maxLeft = Math.max(margin, window.innerWidth - rect.width - margin);
    const maxTop = Math.max(margin, window.innerHeight - rect.height - margin);
    const left = Math.min(Math.max(startLeft + event.clientX - startX, margin), maxLeft);
    const top = Math.min(Math.max(startTop + event.clientY - startY, margin), maxTop);

    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  });

  handle.addEventListener('pointerup', () => {
    if (!dragging) {
      return;
    }

    dragging = false;
    saveFloatingOfferPosition(panel);
  });

  handle.addEventListener('pointercancel', () => {
    dragging = false;
  });

  window.addEventListener('resize', () => clampFloatingOfferPanel(panel));
  window.addEventListener('orientationchange', () => {
    window.setTimeout(() => clampFloatingOfferPanel(panel), 200);
  });

  floatingOfferInitialized = true;
}

function hideFloatingOfferPanel() {
  const { panel } = getFloatingOfferElements();

  hideFloatingOfferHint();

  if (panel) {
    panel.hidden = true;
  }
}

function showFloatingOfferPanel(force = false) {
  const { panel, reopen } = getFloatingOfferElements();

  if (!panel || (floatingOfferManuallyClosed && !force)) {
    return;
  }

  panel.hidden = false;
  if (reopen) {
    reopen.hidden = !floatingOfferManuallyClosed;
  }

  window.requestAnimationFrame(() => {
    clampFloatingOfferPanel(panel);
    showFloatingOfferHint();
  });
}

function renderFloatingOfferPanel(offers) {
  const { panel, list, telegram, close, closeHint, reopen } = getFloatingOfferElements();

  if (!panel || !list) {
    return;
  }

  list.innerHTML = offers.map((offer) => {
    const description = offer.descricao
      ? `<span>${escapeHtml(offer.descricao)}</span>`
      : '';
    const itemClass = offer.destaque ? ' is-featured' : '';

    return `
      <div class="floating-offer-item${itemClass}">
        <div>
          <strong>${escapeHtml(offer.titulo || '')}</strong>
          ${description}
        </div>
        <b>${escapeHtml(offer.valor || '')}</b>
      </div>
    `;
  }).join('');

  if (telegram) {
    const contactUrl = getContactUrl();

    if (contactUrl) {
      telegram.href = contactUrl;
      telegram.textContent = getContactButtonText();
      telegram.hidden = false;
    } else {
      telegram.hidden = true;
    }
  }

  if (close && reopen && !floatingOfferInitialized) {
    close.addEventListener('click', () => {
      trackEvent('fechou_janela_valores', {
        alvo_tipo: 'janelinha',
        alvo_titulo: 'Valores e VIP'
      });
      floatingOfferManuallyClosed = true;
      hideFloatingOfferHint();
      hideFloatingOfferPanel();
      reopen.hidden = false;
    });

    reopen.addEventListener('click', () => {
      trackEvent('reabriu_janela_valores', {
        alvo_tipo: 'janelinha',
        alvo_titulo: 'Valores e VIP'
      });
      floatingOfferManuallyClosed = false;
      reopen.hidden = true;
      showFloatingOfferPanel(true);
    });

  }

  setupFloatingOfferDrag();
  restoreFloatingOfferPosition(panel);
  showFloatingOfferPanel();
}

function switchTab(tab, btn) {
  trackEvent('clicou_aba', {
    alvo_tipo: 'aba',
    alvo_titulo: tab
  });

  document.querySelectorAll('.tab').forEach((tabButton) => tabButton.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.content-section, .comments-section').forEach((section) => {
    section.style.display = 'none';
  });

  if (tab === 'videos') {
    document.getElementById('tab-videos').style.display = 'block';
  }
  if (tab === 'fotos') {
    document.getElementById('tab-fotos').style.display = 'block';
  }
  if (tab === 'comentarios') {
    document.getElementById('tab-comentarios').style.display = 'block';
  }
}

function normalizeContentType(type) {
  return String(type || '').trim().toLowerCase();
}

function renderGridMessage(gridId, message) {
  const grid = document.getElementById(gridId);

  if (!grid) {
    return;
  }

  grid.innerHTML = `
    <div class="content-empty">
      ${escapeHtml(message)}
    </div>
  `;
}

async function loadContent() {
  try {
    const demoMode = isDemoUser();

    setupAdminAnalyticsLink();
    trackEvent('acessou_home', {
      alvo_tipo: 'pagina',
      alvo_titulo: 'home',
      modo_teste: demoMode
    });

    vipConfig = await loadVipConfig();
    renderFloatingOfferPanel(await loadVipOffers());

    const { data, error } = await _supa
      .from('conteudo')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar conteudo:', error);
      document.getElementById('count-videos').textContent = '0';
      document.getElementById('count-fotos').textContent = '0';
      renderGridMessage('videos-grid', 'Não consegui carregar os vídeos agora.');
      renderGridMessage('fotos-grid', 'Nao consegui carregar as fotos agora.');
      return;
    }

    const contentItems = data || [];
    const videos = contentItems.filter((item) => normalizeContentType(item.tipo) === 'video');
    let fotos = contentItems.filter((item) => normalizeContentType(item.tipo) === 'foto');

    if (demoMode) {
      const { data: previewFotos, error: previewFotosError } = await _supa
        .from('fotos_previas')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true })
        .order('created_at', { ascending: false });

      if (previewFotosError) {
        console.warn('Erro ao carregar fotos de previa:', previewFotosError);
        fotos = [];
      } else {
        fotos = previewFotos || [];
      }
    }

    document.getElementById('count-videos').textContent = String(videos.length);
    document.getElementById('count-fotos').textContent = String(fotos.length);

    renderVideos(videos);
    renderFotos(fotos, { previewMode: demoMode });
  } catch (error) {
    console.error('Falha ao carregar conteudo:', error);
    document.getElementById('count-videos').textContent = '0';
    document.getElementById('count-fotos').textContent = '0';
    renderGridMessage('videos-grid', 'Erro ao carregar vídeos.');
    renderGridMessage('fotos-grid', 'Erro ao carregar fotos.');
  } finally {
    loadComments();
  }
}

function renderVideos(videos) {
  const grid = document.getElementById('videos-grid');
  grid.innerHTML = '';

  if (!videos.length) {
    renderGridMessage('videos-grid', 'Nenhum vídeo disponível no momento.');
    return;
  }

  videos.forEach((video) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = function () {
      trackEvent('clicou_video', {
        alvo_tipo: 'video',
        alvo_titulo: video.titulo || '',
        alvo_url: video.stream_url || ''
      });
      openVideo(video.stream_url, video.titulo);
    };

    const thumb = buildVideoThumbHtml(video);

    card.innerHTML = `
      <div class="card-thumb">
        ${thumb}
      </div>
      <div class="card-info">
        <div class="card-title">
          ${video.titulo}
        </div>
        <div class="card-meta">
          ${new Date(video.created_at).toLocaleDateString('pt-BR')}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

function buildVideoThumbHtml(video) {
  if (video.thumb_url) {
    return `
      <img
        src="${escapeHtml(video.thumb_url)}"
        alt="${escapeHtml(video.titulo || 'Video')}"
        loading="lazy"
        style="width:100%; height:100%; object-fit:cover;"
      >
    `;
  }

  const previewUrl = getVideoPreviewUrl(video.stream_url);

  if (previewUrl) {
    return `
      <video
        src="${escapeHtml(previewUrl)}"
        muted
        playsinline
        preload="metadata"
        aria-label="${escapeHtml(video.titulo || 'Video')}"
      ></video>
    `;
  }

  return 'VIDEO';
}

function getVideoPreviewUrl(url) {
  if (!isDirectVideoUrl(url)) {
    return '';
  }

  try {
    const parsedUrl = new URL(url);

    if (!parsedUrl.hash) {
      parsedUrl.hash = 't=0.1';
    }

    return parsedUrl.toString();
  } catch (error) {
    return url;
  }
}

function openPreviewPhotoLock(foto) {
  const player = document.getElementById('modal-video');

  player.innerHTML = `
    <div class="vip-embed-placeholder">
      ${buildVipNoticeHtml('foto')}
    </div>
  `;

  openContentModal(foto.titulo || 'Liberar foto');
}

function renderFotos(fotos, options = {}) {
  const grid = document.getElementById('fotos-grid');
  const { previewMode = false } = options;
  grid.innerHTML = '';
  grid.classList.toggle('preview-photo-grid', previewMode);

  if (!fotos.length) {
    renderGridMessage(
      'fotos-grid',
      previewMode
        ? 'Nenhuma prévia disponível no momento.'
        : 'Nenhuma foto disponivel no momento.'
    );
    return;
  }

  fotos.forEach((foto) => {
    const card = document.createElement('div');
    card.className = previewMode ? 'card preview-photo-card' : 'card';
    const imageUrl = previewMode
      ? (foto.imagem_url || foto.stream_url || foto.url || '')
      : foto.stream_url;
    const fileId = getDriveFileId(imageUrl);
    const driveImageUrls = buildDriveImageUrls(imageUrl, previewMode ? 'w1000' : 'w700');
    const imageSources = previewMode
      ? driveImageUrls
      : [foto.thumb_url, ...driveImageUrls].filter(Boolean);
    const thumbUrl = imageSources[0] || '';
    const fallbackUrls = imageSources.slice(1);

    if (previewMode) {
      card.innerHTML = `
        <div class="card-thumb preview-photo-thumb">
          <img
            src="${escapeHtml(thumbUrl)}"
            data-fallbacks="${encodeImageFallbacks(fallbackUrls)}"
            alt="${escapeHtml(foto.titulo || 'Foto de prévia')}"
            loading="lazy"
            onerror="loadNextImageSource(this);"
          >
        </div>
        <button class="preview-unlock-button" type="button">
          Liberar
        </button>
      `;

      card.querySelector('.preview-unlock-button').addEventListener('click', () => {
        trackEvent('clicou_liberar_foto_previa', {
          alvo_tipo: 'foto_previa',
          alvo_titulo: foto.titulo || '',
          alvo_url: imageUrl || ''
        });
        openPreviewPhotoLock(foto);
      });

      grid.appendChild(card);
      return;
    }

    card.onclick = function () {
      trackEvent('clicou_foto', {
        alvo_tipo: 'foto',
        alvo_titulo: foto.titulo || '',
        alvo_url: imageUrl || ''
      });
      const player = document.getElementById('modal-video');

      if (fileId) {
        const embedImageUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        player.innerHTML = `
          <iframe src="${embedImageUrl}" class="drive-fullscreen-player" frameborder="0" style="border:none;"></iframe>
        `;
      } else {
        player.innerHTML = `
          <img src="${foto.stream_url}" class="modal-image">
        `;
      }

      openContentModal(foto.titulo);
    };

    card.innerHTML = `
      <div class="card-thumb">
        <img
          src="${escapeHtml(thumbUrl)}"
          data-fallbacks="${encodeImageFallbacks(fallbackUrls)}"
          style="width:100%; height:100%; object-fit:cover;"
          onerror="loadNextImageSource(this);"
        >
      </div>
      <div class="card-info">
        <div class="card-title">
          ${escapeHtml(foto.titulo || 'Foto')}
        </div>
        <div class="card-meta">
          ${foto.created_at ? new Date(foto.created_at).toLocaleDateString('pt-BR') : 'Previa'}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

function getDriveFileId(url) {
  if (typeof url !== 'string' || !url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    const isDriveHost =
      hostname === 'drive.google.com' ||
      hostname === 'drive.usercontent.google.com' ||
      hostname.endsWith('.googleusercontent.com');

    if (!isDriveHost) {
      return null;
    }

    const pathMatch = parsedUrl.pathname.match(/\/file\/d\/([^/]+)/);
    const fileId = pathMatch ? pathMatch[1] : parsedUrl.searchParams.get('id');

    return fileId && DRIVE_FILE_ID_PATTERN.test(fileId) ? fileId : null;
  } catch (error) {
    const match = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
    return match && DRIVE_FILE_ID_PATTERN.test(match[1]) ? match[1] : null;
  }
}

function getDriveResourceKey(url) {
  try {
    return new URL(url).searchParams.get('resourcekey') || '';
  } catch (error) {
    return '';
  }
}

function buildDriveImageUrls(url, size = 'w1000') {
  const fileId = getDriveFileId(url);

  if (!fileId) {
    return [url];
  }

  const resourceKey = getDriveResourceKey(url);
  const resourceParam = resourceKey ? `&resourcekey=${encodeURIComponent(resourceKey)}` : '';
  const downloadParams = new URLSearchParams({
    id: fileId,
    export: 'view'
  });

  if (resourceKey) {
    downloadParams.set('resourcekey', resourceKey);
  }

  return [
    `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=${encodeURIComponent(size)}${resourceParam}`,
    `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}${resourceParam}`,
    `https://drive.usercontent.google.com/download?${downloadParams.toString()}`,
    url
  ];
}

function buildDriveProxyUrl(url) {
  const fileId = getDriveFileId(url);

  if (!fileId) {
    return '';
  }

  const proxyUrl = new URL(`/drive-video/${encodeURIComponent(fileId)}`, window.location.origin);
  const resourceKey = getDriveResourceKey(url);

  if (resourceKey) {
    proxyUrl.searchParams.set('resourcekey', resourceKey);
  }

  return proxyUrl.toString();
}

function getPornhubViewKey(url) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, '');

    if (!hostname.endsWith('pornhub.com')) {
      return '';
    }

    const embedMatch = parsedUrl.pathname.match(/\/embed\/([^/?#]+)/);

    if (embedMatch) {
      return embedMatch[1];
    }

    return parsedUrl.searchParams.get('viewkey') || '';
  } catch (error) {
    return '';
  }
}

function buildPornhubEmbedUrl(url) {
  const viewKey = getPornhubViewKey(url);

  if (!/^[A-Za-z0-9_-]+$/.test(viewKey)) {
    return '';
  }

  return `https://www.pornhub.com/embed/${encodeURIComponent(viewKey)}`;
}

function getVideoStartTime(url) {
  try {
    const parsedUrl = new URL(url);
    const hash = parsedUrl.hash.replace(/^#/, '');
    const match = hash.match(/^t=(\d+(?:\.\d+)?)/);

    if (match) {
      return Math.max(0, Number(match[1]) || 0);
    }

    const hostname = parsedUrl.hostname.replace(/^www\./, '');
    const isCloudswitchesPorntrex =
      hostname === 'cdn.pcdn.cloudswitches.com' &&
      parsedUrl.pathname.includes('/porntrex/');

    return isCloudswitchesPorntrex ? 10 : 0;
  } catch (error) {
    return 0;
  }
}

function getQualityLabelFromUrl(url) {
  try {
    const decodedPath = decodeURIComponent(new URL(url).pathname);
    const match = decodedPath.match(/\/(\d{3,4})P(?:_\d+K)?_/i);

    return match ? `${match[1]}p` : 'Original';
  } catch (error) {
    return 'Original';
  }
}

function buildDirectVideoQualityOptions(url) {
  try {
    const parsedUrl = new URL(url);
    const filename = decodeURIComponent(parsedUrl.pathname.split('/').pop() || '');
    const match = filename.match(/^(\d{3,4})P_\d+K_(.+\.mp4)$/i);

    if (!match) {
      return [{ label: getQualityLabelFromUrl(url), url }];
    }

    const currentQuality = `${match[1]}p`;
    const currentQualityNumber = Number(match[1]);
    const fileTail = match[2];
    const variants = [
      { label: '1080p', prefix: '1080P_4000K_' },
      { label: '720p', prefix: '720P_4000K_' },
      { label: '480p', prefix: '480P_2000K_' },
      { label: '360p', prefix: '360P_1000K_' },
      { label: '240p', prefix: '240P_400K_' }
    ];
    const options = [{ label: currentQuality, url }];

    variants.forEach((variant) => {
      const variantQualityNumber = Number(variant.label.replace('p', ''));

      if (variant.label === currentQuality || variantQualityNumber > currentQualityNumber) {
        return;
      }

      const variantUrl = new URL(parsedUrl.toString());
      const variantFilename = `${variant.prefix}${fileTail}`;
      const pathParts = variantUrl.pathname.split('/');
      pathParts[pathParts.length - 1] = variantFilename;
      variantUrl.pathname = pathParts.join('/');
      options.push({ label: variant.label, url: variantUrl.toString() });
    });

    return options;
  } catch (error) {
    return [{ label: 'Original', url }];
  }
}

function buildQualityOptions(url) {
  if (getDriveFileId(url) || buildPornhubEmbedUrl(url) || !isDirectVideoUrl(url)) {
    return [];
  }

  const seen = new Set();

  return buildDirectVideoQualityOptions(url).filter((option) => {
    if (!option.url || seen.has(option.url)) {
      return false;
    }

    seen.add(option.url);
    return true;
  });
}

function applyVideoStartTime(videoElement, startTime) {
  if (!videoElement || !startTime) {
    return;
  }

  let applied = false;
  let attempts = 0;
  const maxAttempts = 12;

  function seekToStartTime() {
    if (applied) {
      return;
    }

    attempts += 1;

    try {
      const maxStart = Number.isFinite(videoElement.duration)
        ? Math.max(0, videoElement.duration - 0.25)
        : startTime;
      const targetTime = Math.min(startTime, maxStart);

      if (Math.abs(videoElement.currentTime - targetTime) <= 0.35) {
        applied = true;
        return;
      }

      videoElement.currentTime = targetTime;

      window.setTimeout(() => {
        if (Math.abs(videoElement.currentTime - targetTime) <= 0.35 || attempts >= maxAttempts) {
          applied = true;
          return;
        }

        seekToStartTime();
      }, 180);
    } catch (error) {
      console.warn('Não foi possível ajustar o início do vídeo:', error);

      if (attempts < maxAttempts) {
        window.setTimeout(seekToStartTime, 220);
      }
    }
  }

  videoElement.addEventListener('loadedmetadata', seekToStartTime);
  videoElement.addEventListener('durationchange', seekToStartTime);
  videoElement.addEventListener('canplay', seekToStartTime);
  videoElement.addEventListener('play', seekToStartTime);
  videoElement.addEventListener('playing', seekToStartTime);
  videoElement.addEventListener('timeupdate', seekToStartTime);
}

function setupModalQualitySelect(container, videoElement, qualityOptions, startTime) {
  const qualitySelect = container.querySelector('#modal-quality-select');

  if (!qualitySelect || !videoElement || qualityOptions.length < 2) {
    return;
  }

  let activeUrl = qualityOptions[0].url;

  qualitySelect.addEventListener('change', () => {
    const selectedOption = qualityOptions[Number(qualitySelect.value)];

    if (!selectedOption || selectedOption.url === activeUrl) {
      return;
    }

    const resumeTime = Number.isFinite(videoElement.currentTime)
      ? videoElement.currentTime
      : startTime;
    const shouldResume = !videoElement.paused && !videoElement.ended;

    activeUrl = selectedOption.url;
    videoElement.src = selectedOption.url;
    videoElement.load();
    applyVideoStartTime(videoElement, resumeTime);

    if (shouldResume) {
      videoElement.addEventListener('canplay', () => {
        videoElement.play().catch(() => {});
      }, { once: true });
    }
  });
}

function showDemoVideoLock() {
  const player = document.getElementById('modal-video');

  if (!player) {
    return;
  }

  const videos = player.querySelectorAll('video');
  videos.forEach((video) => video.pause());

  let overlay = player.querySelector('.vip-lock-overlay');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'vip-lock-overlay';
    overlay.innerHTML = buildVipNoticeHtml('video');
    player.appendChild(overlay);
  }

  overlay.hidden = false;

  trackEvent('bloqueio_video_teste', {
    alvo_tipo: 'video',
    alvo_titulo: document.getElementById('modal-title')?.textContent || '',
    limite_segundos: getPreviewSeconds()
  });
}

function setupDemoVideoLock(videoElement, startTime = 0) {
  if (!isDemoUser() || !videoElement) {
    return;
  }

  let watchedSeconds = 0;
  let lastWatchTick = null;
  let maxAllowedTime = Math.max(0, startTime || 0);
  let correctingSeek = false;
  let locked = false;

  videoElement.setAttribute('controlsList', 'nodownload noplaybackrate noremoteplayback');
  videoElement.setAttribute('disablepictureinpicture', '');
  videoElement.classList.add('demo-video-element');

  function preventVideoMenu(event) {
    event.preventDefault();
  }

  function pauseWatchCounter() {
    lastWatchTick = null;
  }

  function blockForwardSeek(event) {
    if (locked || correctingSeek || !Number.isFinite(videoElement.currentTime)) {
      return;
    }

    const allowedTime = Math.max(maxAllowedTime, startTime || 0);

    if (videoElement.currentTime > allowedTime + 0.35) {
      event?.preventDefault?.();
      correctingSeek = true;
      videoElement.currentTime = allowedTime;
      window.setTimeout(() => {
        correctingSeek = false;
      }, 120);
    }
  }

  function rememberAllowedTime() {
    if (correctingSeek || videoElement.seeking || !Number.isFinite(videoElement.currentTime)) {
      return;
    }

    maxAllowedTime = Math.max(maxAllowedTime, videoElement.currentTime);
  }

  function maybeLockVideo() {
    if (locked) {
      return;
    }

    blockForwardSeek();

    if (!videoElement.paused && !videoElement.ended) {
      const now = Date.now();

      if (lastWatchTick !== null) {
        watchedSeconds += (now - lastWatchTick) / 1000;
      }

      lastWatchTick = now;
    }

    rememberAllowedTime();

    if (watchedSeconds >= getPreviewSeconds()) {
      locked = true;
      showDemoVideoLock();
    }
  }

  videoElement.addEventListener('play', () => {
    lastWatchTick = Date.now();
  });
  videoElement.addEventListener('pause', pauseWatchCounter);
  videoElement.addEventListener('waiting', pauseWatchCounter);
  videoElement.addEventListener('timeupdate', maybeLockVideo);
  videoElement.addEventListener('seeking', blockForwardSeek);
  videoElement.addEventListener('seeked', blockForwardSeek);
  videoElement.addEventListener('contextmenu', preventVideoMenu);
  videoElement.addEventListener('dragstart', preventVideoMenu);
}

function syncModalViewportHeight() {
  document.documentElement.style.setProperty('--modal-app-height', `${window.innerHeight}px`);
}

function isMobilePlayerViewport() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function openStandaloneMobilePlayer(url, titulo) {
  const params = new URLSearchParams({
    url,
    titulo: titulo || ''
  });

  if (isDemoUser()) {
    params.set('demo', '1');
    params.set('limit', String(getPreviewSeconds()));
    params.set('vip_message', buildVipMessage('video'));
    params.set('contact_url', getContactUrl());
    params.set('contact_label', getContactButtonText());
  }

  window.location.href = `player.html?v=20260619-video-analytics&${params.toString()}`;
}

function isDirectVideoUrl(url) {
  return DIRECT_VIDEO_EXTENSION_PATTERN.test(url) || isCloudflareR2Url(url);
}

function isCloudflareR2Url(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname.endsWith('.r2.dev') || hostname.includes('.r2.cloudflarestorage.com');
  } catch (error) {
    return false;
  }
}

function setupVideoPlaybackAnalytics(videoElement, videoUrl, videoTitle, sourceType = 'video') {
  if (!videoElement) {
    return;
  }

  let playClickTracked = false;
  let playbackTracked = false;

  videoElement.addEventListener('play', () => {
    if (playClickTracked) {
      return;
    }

    playClickTracked = true;
    trackEvent('clicou_reproduzir_video', {
      alvo_tipo: sourceType,
      alvo_titulo: videoTitle || '',
      alvo_url: videoUrl || '',
      origem_player: 'modal'
    });
  });

  videoElement.addEventListener('playing', () => {
    if (playbackTracked) {
      return;
    }

    playbackTracked = true;
    trackEvent('reproduziu_video', {
      alvo_tipo: sourceType,
      alvo_titulo: videoTitle || '',
      alvo_url: videoUrl || '',
      origem_player: 'modal'
    });
  });
}

async function requestElementFullscreen(element) {
  const requestFullscreen =
    element.requestFullscreen ||
    element.webkitRequestFullscreen ||
    element.msRequestFullscreen;

  if (!requestFullscreen) {
    return;
  }

  try {
    await requestFullscreen.call(element);
  } catch (error) {
    console.warn('Não foi possível ativar fullscreen:', error);
  }
}

async function exitElementFullscreen() {
  const exitFullscreen =
    document.exitFullscreen ||
    document.webkitExitFullscreen ||
    document.msExitFullscreen;

  if (!document.fullscreenElement || !exitFullscreen) {
    return;
  }

  try {
    await exitFullscreen.call(document);
  } catch (error) {
    console.warn('Não foi possível sair do fullscreen:', error);
  }
}

async function openContentModal(title, options = {}) {
  const modal = document.getElementById('video-modal');
  const { compactMobilePlayer = false } = options;

  hideFloatingOfferPanel();
  document.getElementById('modal-title').textContent = title || '';
  modal.classList.toggle('mobile-player-mode', compactMobilePlayer);
  modal.classList.add('open');
  document.body.classList.add('modal-open');
  syncModalViewportHeight();

  if (compactMobilePlayer) {
    await requestElementFullscreen(modal);
  }
}

function openVideo(url, titulo) {
  if (isMobilePlayerViewport()) {
    hideFloatingOfferPanel();
    openStandaloneMobilePlayer(url, titulo);
    return;
  }

  const player = document.getElementById('modal-video');
  const modalBox = document.querySelector('#video-modal .modal-box');
  const pornhubEmbedUrl = buildPornhubEmbedUrl(url);
  const fileId = getDriveFileId(url);
  const startTime = getVideoStartTime(url);
  const qualityOptions = buildQualityOptions(url);
  const qualitySelectHtml = qualityOptions.length > 1
    ? `
      <select class="modal-quality-select" id="modal-quality-select" aria-label="Resolucao">
        ${qualityOptions.map((option, index) => `<option value="${index}">${option.label}</option>`).join('')}
      </select>
    `
    : '';

  modalBox.classList.add('video-fullscreen-box');

  if (pornhubEmbedUrl) {
    if (isDemoUser()) {
      player.innerHTML = `
        <div class="vip-embed-placeholder">
          ${buildVipNoticeHtml('video')}
        </div>
      `;
    } else {
      player.innerHTML = `
        <iframe
          src="${pornhubEmbedUrl}"
          class="drive-fullscreen-player"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
          referrerpolicy="strict-origin-when-cross-origin"
          frameborder="0">
        </iframe>
      `;
    }
  } else if (fileId) {
    const proxyUrl = buildDriveProxyUrl(url);
    player.innerHTML = `
      <video
        src="${proxyUrl}"
        class="drive-fullscreen-player"
        controls
        playsinline
        preload="metadata"
        style="background:#000;">
      </video>
    `;
    const modalVideo = player.querySelector('video');
    applyVideoStartTime(modalVideo, startTime);
    setupVideoPlaybackAnalytics(modalVideo, url, titulo, 'drive_video');
    setupDemoVideoLock(modalVideo, startTime);
  } else if (isDirectVideoUrl(url)) {
    player.innerHTML = `
      <div class="modal-player-shell">
        <video
          src="${url}"
          class="drive-fullscreen-player"
          controls
          playsinline
          preload="metadata"
          style="background:#000;">
        </video>
        ${qualitySelectHtml}
      </div>
    `;
    const modalVideo = player.querySelector('video');
    applyVideoStartTime(modalVideo, startTime);
    setupVideoPlaybackAnalytics(modalVideo, url, titulo, 'video');
    setupModalQualitySelect(player, modalVideo, qualityOptions, startTime);
    setupDemoVideoLock(modalVideo, startTime);
  } else {
    alert('Link do vídeo inválido');
    return;
  }

  openContentModal(titulo);
}

async function closeVideoModal() {
  const title = document.getElementById('modal-title')?.textContent || '';

  if (document.getElementById('video-modal')?.classList.contains('open')) {
    trackEvent('fechou_midia', {
      alvo_tipo: 'modal',
      alvo_titulo: title
    });
  }

  document.getElementById('modal-video').innerHTML = '';
  const modal = document.getElementById('video-modal');
  modal.classList.remove('open', 'mobile-player-mode');
  document.body.classList.remove('modal-open');
  const modalBox = document.querySelector('#video-modal .modal-box');
  if (modalBox) {
    modalBox.classList.remove('video-fullscreen-box');
  }
  await exitElementFullscreen();
  showFloatingOfferPanel();
}

function closeModal(event) {
  if (event.target.id === 'video-modal') {
    closeVideoModal();
  }
}

async function loadComments() {
  const { data, error } = await loadCommentsFromSupabase();
  const list = document.getElementById('comment-list');
  const counter = document.getElementById('count-comments');

  if (!list || !counter) {
    return;
  }

  if (error) {
    console.error('Erro ao carregar comentarios:', error);
    counter.textContent = '0';
    list.innerHTML = `
      <div class="comment-empty">
        Não consegui carregar os comentários agora.
      </div>
    `;
    return;
  }

  const comments = data || [];
  counter.textContent = String(comments.length);
  list.innerHTML = '';

  if (!comments.length) {
    list.innerHTML = `
      <div class="comment-empty">
        Ainda não tem comentários. Seja o primeiro a comentar.
      </div>
    `;
    return;
  }

  comments.forEach((comment) => {
    const item = document.createElement('div');
    item.className = 'comment-item';
    const username = comment.username || 'Anonimo';
    const dateHtml = comment.created_at
      ? `<div class="comment-date">${escapeHtml(formatCommentDate(comment.created_at))}</div>`
      : '';

    item.innerHTML = `
      <div class="comment-avatar">
        ${escapeHtml(username[0] || '?').toUpperCase()}
      </div>
      <div class="comment-body">
        <div class="comment-user">
          ${escapeHtml(username)}
        </div>
        <div class="comment-text">
          ${escapeHtml(comment.texto || '')}
        </div>
        ${dateHtml}
      </div>
    `;

    list.appendChild(item);
  });
}

async function loadCommentsFromSupabase() {
  const response = await _supa
    .from('comentarios')
    .select('username, texto, created_at')
    .order('created_at', { ascending: false });

  if (!response.error) {
    return response;
  }

  return _supa
    .from('comentarios')
    .select('username, texto');
}

function formatCommentDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

async function postComment() {
  const user = JSON.parse(sessionStorage.getItem('user')) || { username: 'Anonimo' };
  const texto = document.getElementById('comment-text').value.trim();

  if (!texto) {
    return;
  }

  const { error } = await _supa
    .from('comentarios')
    .insert({
      username: user.username,
      texto
    });

  if (error) {
    console.error('Erro ao enviar comentario:', error);
    alert('Não consegui enviar o comentário agora.');
    return;
  }

  trackEvent('enviou_comentario', {
    alvo_tipo: 'comentario',
    alvo_titulo: texto.slice(0, 80)
  });

  document.getElementById('comment-text').value = '';
  loadComments();
}

document.addEventListener('DOMContentLoaded', () => {
  setupVipCheckoutHandlers();
  setupCallHandlers();
  startAmandaPresencePolling();
  startPreviewIncomingCallWatcher();
  startPreviewUnreadWatcher();

  const commentText = document.getElementById('comment-text');

  if (!commentText) {
    return;
  }

  commentText.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      postComment();
    }
  });
});

syncModalViewportHeight();
window.addEventListener('resize', syncModalViewportHeight);
window.addEventListener('orientationchange', syncModalViewportHeight);
document.addEventListener('fullscreenchange', syncModalViewportHeight);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    finishPreviewCallOnBackgroundExit('saiu_da_aba');
  }
});
window.addEventListener('pagehide', () => {
  finishPreviewCallOnBackgroundExit('saiu_da_pagina');
  cleanupCompleteCallConnection();
});
window.addEventListener('beforeunload', () => {
  finishPreviewCallOnBackgroundExit('saiu_da_pagina');
  cleanupCompleteCallConnection();

  if (presencePollTimer) {
    window.clearInterval(presencePollTimer);
  }

  if (previewIncomingPollTimer) {
    window.clearInterval(previewIncomingPollTimer);
  }
});
loadContent();
