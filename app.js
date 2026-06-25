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
    descricao: 'Em troca de um video meu',
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
const JAAS_APP_ID = 'vpaas-magic-cookie-40aa8f8eaa4b44919530d6a192485f88';
const JAAS_TOKEN_ENDPOINT = '/api/jaas-token';
const PREVIEW_CALL_VIDEO_DOMAIN = '8x8.vc';
const PREVIEW_CALL_VIDEO_BASE_URL = `https://${PREVIEW_CALL_VIDEO_DOMAIN}/${JAAS_APP_ID}`;
const PREVIEW_CALL_POLL_MS = 2000;
const PREVIEW_CHAT_POLL_MS = 3000;
const PREVIEW_CALL_RING_TIMEOUT_MS = 45000;
const PREVIEW_SIMULATED_RING_MS = 3600;
const PREVIEW_SIMULATED_CALL_DEFAULT_SECONDS = 18;
const PREVIEW_CALL_ACTIVE_STATUSES = ['aguardando', 'chamando', 'liberado', 'em_chamada'];
const PREVIEW_CHAT_VISIBLE_STATUSES = ['aguardando', 'chamando', 'liberado', 'em_chamada', 'finalizado'];
const PREVIEW_CALL_TEST_IPS = ['177.10.146.100'];
const PREVIEW_VISITOR_STORAGE_KEY = 'amanda_preview_visitor_name';
const PREVIEW_FINISHED_MESSAGE = 'Voce ja participou, agora pague a chamada completa.';
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

let vipConfig = { ...DEFAULT_VIP_CONFIG };
let floatingOfferInitialized = false;
let floatingOfferManuallyClosed = false;
let floatingOfferHintTimer = null;
let analyticsIpPromise = null;
let previewCallRecord = null;
let previewCallPollTimer = null;
let previewCallTimer = null;
let previewChatPollTimer = null;
let previewCallRingTimer = null;
let previewIncomingPollTimer = null;
let previewSimulatedFinishTimer = null;
let previewSimulatedProgressTimer = null;
let previewSimulatedMetadataTimer = null;
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
let presencePollTimer = null;
let previewChatLastRenderKey = '';
let amandaPresenceOnline = false;

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

function setPreviewChatStatus(message) {
  const messageEl = document.getElementById('preview-call-message');

  if (messageEl) {
    messageEl.textContent = message;
  }
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

  card.classList.toggle('is-ringing', mode === 'ringing');
  card.classList.toggle('is-in-call', mode === 'call');
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
}

function updateSimulatedCallControls(container = document) {
  const micButton = container.querySelector('[data-sim-toggle-mic]');
  const cameraButton = container.querySelector('[data-sim-toggle-camera]');
  const cameraBlocked = container.querySelector('[data-sim-camera-blocked]');

  if (micButton) {
    micButton.classList.toggle('is-muted', !previewMicEnabled);
    micButton.querySelector('span').textContent = previewMicEnabled ? 'Silenciar' : 'Ativar som';
  }

  if (cameraButton) {
    cameraButton.classList.toggle('is-muted', !previewCameraEnabled);
    cameraButton.querySelector('span').textContent = previewCameraEnabled ? 'Parar Video' : 'Ativar Video';
  }

  if (cameraBlocked) {
    cameraBlocked.hidden = previewCameraEnabled && Boolean(previewCameraStream?.getVideoTracks().length);
    cameraBlocked.textContent = previewCameraEnabled ? 'Camera nao liberada' : 'Camera desligada';
  }
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
    console.warn('Camera local nao liberada para chamada previa:', error.message || error);
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
      ? 'Visitante ligou a camera durante a chamada previa.'
      : 'Visitante desligou a camera durante a chamada previa.'
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
      <span>Previa sem audio em andamento</span>
    </div>
  `;
}

async function finishSimulatedPreviewCall(reason = 'tempo_esgotado') {
  if (!previewCallRecord?.id || previewCallRecord.status === 'finalizado') {
    return;
  }

  const now = new Date().toISOString();
  const details = {
    ...getPreviewCallDetails(previewCallRecord),
    simulated_call: true,
    simulated_finished_reason: reason,
    simulated_finished_at: now
  };

  clearPreviewSimulatedTimers();
  stopPreviewCameraStream();

  previewCallRecord = {
    ...previewCallRecord,
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
    .eq('id', previewCallRecord.id);

  await ensurePreviewFinishedMessage(previewCallRecord);

  await _supa
    .from(PREVIEW_CALL_MESSAGES_TABLE)
    .insert({
      chamada_id: previewCallRecord.id,
      autor_tipo: 'sistema',
      autor_nome: 'Sistema',
      texto: 'Chamada previa encerrada automaticamente.'
    });

  trackEvent('finalizou_chamada_previa_simulada', {
    alvo_tipo: 'chamada_previa',
    alvo_titulo: 'Previa simulada finalizada'
  });

  setPreviewChatStatus('Chamada previa finalizada');
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
    <div class="sim-call-screen">
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
      <div class="sim-call-top">
        <div class="sim-call-emojis" aria-hidden="true">😱 🍕 🐙 🇫🇷</div>
        <strong>Amanda Oliveira</strong>
        <span><i></i> <b data-sim-call-time>00:${String(initialDuration).padStart(2, '0')}</b></span>
        <em>Sinal de rede fraco</em>
      </div>
      <div class="sim-call-bottom">
        <button class="sim-call-control" type="button" data-sim-flip-camera>
          <b>↻</b>
          <span>Virar</span>
        </button>
        <button class="sim-call-control" type="button" data-sim-toggle-camera>
          <b>▮▶</b>
          <span>Parar Video</span>
        </button>
        <button class="sim-call-control" type="button" data-sim-toggle-mic>
          <b>🎙</b>
          <span>Ativar som</span>
        </button>
        <button class="sim-call-control is-end" type="button" data-sim-end-call>
          <b>☎</b>
          <span>Encerrar</span>
        </button>
      </div>
      <div class="sim-call-progress" aria-hidden="true">
        <span data-sim-progress></span>
      </div>
    </div>
  `;

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

  if (cameraStream && localVideo) {
    localVideo.srcObject = cameraStream;
    localVideo.play?.().catch(() => {});
    registerPreviewCameraState(
      'ligada',
      'Camera do visitante entrou ligada na chamada previa.'
    );
  } else if (blocked) {
    blocked.hidden = false;
    registerPreviewCameraState(
      'desligada_ou_bloqueada',
      'Camera do visitante entrou desligada ou nao foi permitida.'
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
      time.textContent = `00:${String(duration).padStart(2, '0')}`;
    }

    previewSimulatedProgressTimer = window.setInterval(() => {
      const elapsed = Math.min(duration, Math.floor((Date.now() - startedAt) / 1000));
      const remaining = Math.max(0, duration - elapsed);

      if (progress) {
        progress.style.width = `${Math.min(100, (elapsed / duration) * 100)}%`;
      }

      if (time) {
        const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
        const seconds = String(remaining % 60).padStart(2, '0');
        time.textContent = `${minutes}:${seconds}`;
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
    console.warn('Nao consegui fechar a chamada de video:', error);
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

  if (previewCallRingTimer) {
    window.clearTimeout(previewCallRingTimer);
    previewCallRingTimer = null;
  }
}

function startPreviewCallTimer(startedAt) {
  const timer = document.getElementById('preview-call-timer');

  previewCallStartedAt = startedAt || new Date().toISOString();

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

async function getPreviewConversationByIp(ip, includeFinished = true) {
  const statuses = includeFinished
    ? PREVIEW_CHAT_VISIBLE_STATUSES
    : PREVIEW_CALL_ACTIVE_STATUSES;
  const { data, error } = await _supa
    .from(PREVIEW_CALL_TABLE)
    .select('*')
    .eq('ip', ip)
    .in('status', statuses)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  return data?.[0] || null;
}

async function createPreviewCall(ip) {
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
      status: 'aguardando',
      meet_url: videoUrl,
      detalhes: {
        login_username: user.username || '',
        visitor_name: visitorName
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
    setPreviewChatStatus('Chamada de video conectada');
  });
  api.addListener('videoConferenceLeft', handlePreviewJitsiClosed);
  api.addListener('readyToClose', handlePreviewJitsiClosed);
  api.addListener('cameraError', () => {
    setPreviewChatStatus('Permita o acesso a camera e tente novamente');
  });
  api.addListener('micError', () => {
    setPreviewChatStatus('Permita o acesso ao microfone e tente novamente');
  });
  api.addListener('peerConnectionFailure', () => {
    setPreviewChatStatus('Conexao instavel. Feche e toque em atender novamente.');
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

function renderPreviewChatMessages(messages) {
  const container = document.getElementById('preview-chat-messages');

  if (!container) {
    return;
  }

  const renderKey = JSON.stringify(messages.map((message) => [
    message.id,
    message.texto,
    message.autor_tipo,
    message.created_at
  ]));

  if (renderKey === previewChatLastRenderKey) {
    return;
  }

  previewChatLastRenderKey = renderKey;

  if (!messages.length) {
    container.innerHTML = `
      <div class="telegram-empty">
        Mande uma mensagem para Amanda ou chame por chamada de video.
      </div>
    `;
    return;
  }

  container.innerHTML = messages.map((message) => {
    const mine = message.autor_tipo === 'usuario';
    const system = message.autor_tipo === 'sistema';
    const time = message.created_at
      ? new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
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
        <small>${escapeHtml(time)}</small>
      </div>
    `;
  }).join('');
  container.scrollTop = container.scrollHeight;
}

async function loadPreviewChatMessages() {
  if (!previewCallRecord?.id) {
    return;
  }

  const { data, error } = await _supa
    .from(PREVIEW_CALL_MESSAGES_TABLE)
    .select('*')
    .eq('chamada_id', previewCallRecord.id)
    .order('created_at', { ascending: true })
    .limit(200);

  if (error) {
    console.warn('Nao consegui carregar mensagens:', error.message || error);
    return;
  }

  renderPreviewChatMessages(data || []);
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
  setPreviewChatStatus('Amanda nao atendeu, tente mais tarde');
  setPreviewCallEnterEnabled(false, 'Chamada de video indisponivel');

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
        texto: 'Amanda nao atendeu a chamada de video. Tente novamente mais tarde.'
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
    setPreviewChatStatus('Chamada previa finalizada');
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
    'Aguarde alguns segundos. Amanda esta recebendo sua chamada previa.'
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
      texto: 'Usuario iniciou uma chamada previa.'
    });

  trackEvent('solicitou_videochamada_previa', {
    alvo_tipo: 'chat_chamada',
    alvo_titulo: 'Iniciou chamada previa simulada'
  });
  previewCallRingTimer = window.setTimeout(() => {
    previewCallRingTimer = null;
    enterPreviewCall();
  }, PREVIEW_SIMULATED_RING_MS);
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
      texto: `Conversa iniciada. Amanda esta ${amandaPresenceOnline ? 'online' : 'offline'}. Amanda foi notificada e respondera por aqui.`
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

  startPreviewCallTimer(record.created_at);
  showPreviewCompleteShortcut(false);

  if (record.status === 'liberado' || record.status === 'em_chamada') {
    const incomingAdminCall = isPreviewIncomingAdminCall(record);

    if (incomingAdminCall) {
      setPreviewRingingContent(
        'Amanda esta ligando para voce...',
        'Toque em Atender chamada para entrar direto na videochamada.'
      );
      setPreviewRingingActions({ answer: true, decline: true });
      setPreviewRingingVisible(true);
      notifyPreviewIncomingCall(record);
      setPreviewChatStatus('Amanda esta te chamando agora');
    } else {
      stopPreviewRinging();
      setPreviewChatStatus(record.status === 'em_chamada'
        ? 'Chamada de video em andamento'
        : 'Amanda atendeu. Toque para entrar na chamada.');
    }
    setPreviewCallEnterEnabled(false, 'Chamada de video liberada');
    if (requestButton) {
      requestButton.disabled = false;
      requestButton.textContent = incomingAdminCall ? 'Atender chamada' : 'Entrar na chamada de video';
      requestButton.classList.add('is-ready', 'is-call-action');
      requestButton.classList.toggle('is-answer-action', incomingAdminCall);
    }
    previewAutoJoinPending = false;
    return;
  }

  if (record.status === 'chamando') {
    const isSimulatedCall = Boolean(getPreviewCallDetails(record).simulated_call);

    previewIncomingCallKey = '';
    setPreviewRingingContent(
      'Chamando Amanda...',
      isSimulatedCall
        ? 'Aguarde alguns segundos. Amanda esta recebendo sua chamada previa.'
        : 'Aguarde ela atender sua chamada de video.'
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

    if (!isSimulatedCall) {
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

    setPreviewChatStatus('Chamada previa finalizada');
    setPreviewCallEnterEnabled(false, 'Chamada previa usada');
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
  setPreviewChatStatus(amandaPresenceOnline ? 'Amanda esta online' : 'Amanda esta offline');
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
    const activeCall = await getPreviewConversationByIp(ip, true);

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

async function openPreviewCallRoom() {
  const modal = document.getElementById('preview-call-modal');

  if (!modal) {
    return;
  }

  modal.hidden = false;
  hideFloatingOfferPanel();
  stopPreviewCallTimers();
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
    const includeFinished = !isPreviewCallTestIp(ip);
    let activeCall = await getPreviewConversationByIp(ip, includeFinished);

    if (!activeCall) {
      activeCall = await createPreviewCall(ip);
      trackEvent('entrou_fila_chamada_previa', {
        alvo_tipo: 'chamada_previa',
        alvo_titulo: 'Aguardando Amanda'
      });
    }

    await ensurePreviewWelcomeMessage(activeCall);

    if (activeCall.status === 'finalizado') {
      trackEvent('chamada_previa_repetida', {
        alvo_tipo: 'chamada_previa',
        alvo_titulo: 'IP ja participou'
      });
      await ensurePreviewFinishedMessage(activeCall);
    }

    applyPreviewCallStatus(activeCall);
    startPreviewCallPolling();
    startPreviewChatPolling();
  } catch (error) {
    console.error('Erro ao abrir chamada previa:', error);
    setPreviewChatStatus('Nao consegui abrir a conversa');
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
  stopPreviewRinging();
  disposePreviewJitsi();

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
      console.warn('Nao consegui finalizar previa simulada ao fechar:', error.message || error);
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
    alvo_titulo: 'Entrou na chamada previa simulada',
    alvo_url: videoUrl
  });

  stopPreviewRinging();
  previewIncomingCallKey = '';

  try {
    if (videoFrame) {
      setPreviewChatStatus('Amanda atendeu. Liberando sua camera...');
      await mountSimulatedPreviewCall(videoFrame, previewCallRecord);
    }
  } catch (error) {
    console.warn('Nao consegui abrir chamada previa simulada:', error.message || error);
    setPreviewChatStatus(error.message || 'Nao consegui abrir a chamada previa.');
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

  if (videoStage) {
    videoStage.hidden = false;
    videoStage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

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
    previewChatForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const text = previewChatInput.value.trim();

      if (!text) {
        return;
      }

      previewChatInput.value = '';
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
  text.textContent = amandaPresenceOnline ? 'Amanda esta online' : 'Amanda esta offline';
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
      renderGridMessage('videos-grid', 'Nao consegui carregar os videos agora.');
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
    renderGridMessage('videos-grid', 'Erro ao carregar videos.');
    renderGridMessage('fotos-grid', 'Erro ao carregar fotos.');
  } finally {
    loadComments();
  }
}

function renderVideos(videos) {
  const grid = document.getElementById('videos-grid');
  grid.innerHTML = '';

  if (!videos.length) {
    renderGridMessage('videos-grid', 'Nenhum video disponivel no momento.');
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
        ? 'Nenhuma previa disponivel no momento.'
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
            alt="${escapeHtml(foto.titulo || 'Foto de previa')}"
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
      console.warn('Nao foi possivel ajustar o inicio do video:', error);

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
    console.warn('Nao foi possivel ativar fullscreen:', error);
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
    console.warn('Nao foi possivel sair do fullscreen:', error);
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
    alert('Link do video invalido');
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
        Nao consegui carregar os comentarios agora.
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
        Ainda nao tem comentarios. Seja o primeiro a comentar.
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
    alert('Nao consegui enviar o comentario agora.');
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
window.addEventListener('beforeunload', () => {
  if (presencePollTimer) {
    window.clearInterval(presencePollTimer);
  }

  if (previewIncomingPollTimer) {
    window.clearInterval(previewIncomingPollTimer);
  }
});
loadContent();
