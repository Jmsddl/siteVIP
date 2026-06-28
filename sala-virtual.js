const ROOM_ADMIN_PLAN = 'admin';
const ROOM_TABLE = 'chamadas_previas';
const ROOM_MESSAGES_TABLE = 'chamada_mensagens';
const JAAS_APP_ID = 'vpaas-magic-cookie-40aa8f8eaa4b44919530d6a192485f88';
const JAAS_TOKEN_ENDPOINT = '/api/jaas-token';
const ROOM_VIDEO_DOMAIN = '8x8.vc';
const ROOM_VIDEO_BASE_URL = `https://${ROOM_VIDEO_DOMAIN}/${JAAS_APP_ID}`;
const ROOM_REFRESH_MS = 2500;
const ROOM_ACTIVE_STATUSES = ['aguardando', 'chamando', 'liberado', 'em_chamada', 'finalizado'];
const ROOM_FINISHED_MESSAGE = 'Voce ja participou, agora pague a chamada completa.';
const ROOM_PRESENCE_TABLE = 'sala_status';
const ROOM_PRESENCE_KEY = 'amanda';
const ROOM_PRESENCE_HEARTBEAT_MS = 10000;
const ROOM_MESSAGE_LIMIT = 1000;
const ROOM_ORIGINAL_TITLE = document.title;
const COMPLETE_CALL_TOKENS_TABLE = 'chamada_completa_tokens';
const COMPLETE_CALL_SESSIONS_TABLE = 'chamada_completa_sessoes';
const COMPLETE_CALL_SIGNALS_TABLE = 'chamada_completa_sinais';
const COMPLETE_CALL_REFRESH_MS = 2500;
const COMPLETE_CALL_SIGNAL_POLL_MS = 1500;
const COMPLETE_CALL_PRECONNECT_SECONDS = 4;
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

let roomRows = [];
let roomTimer = null;
let roomPresenceTimer = null;
let roomKnownWaitingIds = new Set();
let roomKnownCallingIds = new Set();
let roomCallsHydrated = false;
let roomAlertsEnabled = false;
let roomAudioContext = null;
let roomInitialLoad = true;
let roomAlertPopupTimer = null;
let roomTitleAlertTimer = null;
let roomRowsRenderKey = '';
let roomSidePanelRenderKey = '';
let roomKnownUserMessageIds = new Set();
let roomMessagesHydrated = false;
let roomIncomingCallId = null;
let roomJitsiApis = new Map();
let roomOpenChatId = '';
let roomMessagesById = new Map();
let roomMarkingReadIds = new Set();
let roomChatRenderKeys = new Map();
let roomChatMessageKeys = new Map();
let completeAdminCalls = [];
let completeAdminTimer = null;
let completeAdminPeer = null;
let completeAdminLocalStream = null;
let completeAdminRemoteStream = null;
let completeAdminSession = null;
let completeAdminSignalChannel = null;
let completeAdminSignalPollTimer = null;
let completeAdminLastSignalId = 0;
let completeAdminPendingIce = [];
let completeAdminEnding = false;
let completeAdminControlsTimer = null;
let completeAdminClockTimer = null;
let completeAdminAutoEndTimer = null;
let completeAdminPreconnectPromise = null;

function getRoomUser() {
  try {
    return JSON.parse(sessionStorage.getItem('user') || '{}');
  } catch (error) {
    return {};
  }
}

function isRoomAdmin() {
  return String(getRoomUser().plano || '').toLowerCase() === ROOM_ADMIN_PLAN;
}

function escapeRoom(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function createRoomVideoUrl() {
  const roomSlug = `AmandaVip-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

  return `${ROOM_VIDEO_BASE_URL}/${roomSlug}`;
}

function getRoomLoginUsername(row) {
  const details = row?.detalhes;

  if (!details || typeof details !== 'object') {
    return '';
  }

  return details.login_username || details.username || '';
}

function getRoomDetails(row) {
  return row?.detalhes && typeof row.detalhes === 'object'
    ? row.detalhes
    : {};
}

function getRoomDisplayName(row) {
  if (row?.username) {
    return row.username;
  }

  const phone = String(row?.telefone || getRoomDetails(row).telefone || '').replace(/\D/g, '');
  const session = String(row?.sessao_id || row?.id || '').replace(/[^a-zA-Z0-9]/g, '');
  const code = phone.slice(-4) || session.slice(-4) || '0000';

  return `Visitante ${code}`;
}

function getRoomAdminReadAtMs(row) {
  const readAt = getRoomDetails(row).admin_read_at;
  const time = readAt ? new Date(readAt).getTime() : 0;

  return Number.isNaN(time) ? 0 : time;
}

function countRoomUnreadMessages(row, messages = []) {
  const readAtMs = getRoomAdminReadAtMs(row);

  return messages.filter((message) => {
    if (message.autor_tipo !== 'usuario' || !message.created_at) {
      return false;
    }

    const createdAtMs = new Date(message.created_at).getTime();

    return !Number.isNaN(createdAtMs) && (!readAtMs || createdAtMs > readAtMs);
  }).length;
}

function updateRoomUnreadBadge(row, unreadCount) {
  const badge = document.getElementById(`room-unread-${row.id}`);

  if (!badge) {
    return;
  }

  badge.hidden = unreadCount <= 0;
  badge.textContent = unreadCount === 1
    ? '1 nova'
    : `${unreadCount} novas`;
}

function getRoomVideoUrl(rowOrId) {
  const existingUrl = typeof rowOrId === 'object' ? rowOrId?.meet_url : '';
  const id = typeof rowOrId === 'object' ? rowOrId?.id : rowOrId;

  if (existingUrl && /^https?:\/\//i.test(String(existingUrl))) {
    try {
      const parsed = new URL(existingUrl);
      const room = parsed.pathname.split('/').filter(Boolean).pop();

      if (parsed.hostname === 'meet.jit.si' && room) {
        return `${ROOM_VIDEO_BASE_URL}/${room}`;
      }

      if (parsed.hostname === ROOM_VIDEO_DOMAIN) {
        const parts = parsed.pathname.split('/').filter(Boolean);

        if (parts[0] === JAAS_APP_ID && parts[1]) {
          return parsed.toString();
        }

        if (parts[0]) {
          return `${ROOM_VIDEO_BASE_URL}/${parts[0]}`;
        }
      }
    } catch (error) {
      // Usa fallback abaixo quando a URL antiga estiver incompleta.
    }
  }

  return `${ROOM_VIDEO_BASE_URL}/AmandaVip-${String(id || Date.now()).replace(/[^a-zA-Z0-9]/g, '')}`;
}

function getRoomVideoDomain(rowOrId) {
  try {
    return new URL(getRoomVideoUrl(rowOrId)).hostname;
  } catch (error) {
    return ROOM_VIDEO_DOMAIN;
  }
}

function getRoomVideoRoomName(rowOrId) {
  const url = getRoomVideoUrl(rowOrId);

  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);

    if (parsed.hostname === ROOM_VIDEO_DOMAIN && parts[0] === JAAS_APP_ID && parts[1]) {
      return `${parts[0]}/${parts[1]}`;
    }

    const room = parts.pop();

    if (room) {
      return room;
    }
  } catch (error) {
    // Usa fallback abaixo quando vier um valor antigo.
  }

  const id = typeof rowOrId === 'object' ? rowOrId?.id : rowOrId;
  return `AmandaVip-${String(id || Date.now()).replace(/[^a-zA-Z0-9]/g, '')}`;
}

async function getRoomJaasToken(rowOrId, displayName = 'Amanda', moderator = true) {
  if (getRoomVideoDomain(rowOrId) !== ROOM_VIDEO_DOMAIN) {
    return getRoomDetails(typeof rowOrId === 'object' ? rowOrId : null).jaas_jwt || '';
  }

  const response = await fetch(JAAS_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      roomName: getRoomVideoRoomName(rowOrId),
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

function buildRoomVideoEmbedUrl(rowOrId, displayName = 'Amanda', jwt = '') {
  const encodedName = encodeURIComponent(displayName);
  const url = new URL(getRoomVideoUrl(rowOrId));

  if (jwt) {
    url.searchParams.set('jwt', jwt);
  }

  return `${url.toString()}#userInfo.displayName="${encodedName}"&config.prejoinPageEnabled=false&config.prejoinConfig.enabled=false&config.disableDeepLinking=true&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;
}

function getRoomJitsiConfig() {
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

function getRoomJitsiInterfaceConfig() {
  return {
    MOBILE_APP_PROMO: false,
    SHOW_JITSI_WATERMARK: false,
    SHOW_BRAND_WATERMARK: false,
    SHOW_POWERED_BY: false,
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
  };
}

function attachRoomJitsiListeners(id, api) {
  api.addListener('videoConferenceJoined', () => {
    setRoomStatus('Chamada aberta no painel.');
  });
  api.addListener('participantJoined', () => {
    setRoomStatus('Cliente entrou na chamada.');
  });
  api.addListener('peerConnectionFailure', () => {
    setRoomStatus('Conexao da chamada instavel. Feche e abra a chamada novamente.', true);
  });
  api.addListener('readyToClose', () => {
    disposeRoomJitsi(id);
  });
}

function disposeRoomJitsi(id) {
  const api = roomJitsiApis.get(id);

  if (!api) {
    return;
  }

  roomJitsiApis.delete(id);

  try {
    api.dispose();
  } catch (error) {
    console.warn('Nao consegui fechar chamada de video:', error);
  }
}

async function mountRoomJitsiMeeting(id, rowOrId, displayName = 'Amanda') {
  const stage = document.getElementById(`room-video-${id}`);
  const frame = stage?.querySelector('[data-room-video-frame]');
  const jwt = await getRoomJaasToken(rowOrId, displayName, true);

  if (!stage || !frame) {
    return;
  }

  disposeRoomJitsi(id);
  frame.innerHTML = '';

  if (window.JitsiMeetExternalAPI) {
    const api = new window.JitsiMeetExternalAPI(getRoomVideoDomain(rowOrId), {
      roomName: getRoomVideoRoomName(rowOrId),
      parentNode: frame,
      width: '100%',
      height: '100%',
      userInfo: { displayName },
      ...(jwt ? { jwt } : {}),
      configOverwrite: getRoomJitsiConfig(),
      interfaceConfigOverwrite: getRoomJitsiInterfaceConfig()
    });
    attachRoomJitsiListeners(id, api);
    roomJitsiApis.set(id, api);
  } else {
    const iframe = document.createElement('iframe');
    iframe.title = 'Chamada de video';
    iframe.allow = 'camera; microphone; fullscreen; display-capture; autoplay';
    iframe.allowFullscreen = true;
    iframe.src = buildRoomVideoEmbedUrl(rowOrId, displayName, jwt);
    frame.appendChild(iframe);
  }

  stage.hidden = false;
}

function setRoomStatus(message, isError = false) {
  const status = document.getElementById('room-status');

  if (!status) {
    return;
  }

  status.textContent = message;
  status.classList.toggle('is-error', isError);
}

function formatRoomDate(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatRoomWait(value) {
  const startedAt = value ? new Date(value).getTime() : Date.now();
  const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const minutes = Math.floor(elapsed / 60);
  const seconds = String(elapsed % 60).padStart(2, '0');

  return `${minutes}m ${seconds}s`;
}

function getRoomStatusLabel(status) {
  const labels = {
    aguardando: 'Aguardando',
    chamando: 'Chamando',
    liberado: 'Liberado',
    em_chamada: 'Em chamada',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado'
  };

  return labels[status] || status || '-';
}

function playRoomAlert() {
  if (!roomAlertsEnabled) {
    return;
  }

  try {
    roomAudioContext = roomAudioContext || new AudioContext();
    [0, 0.35, 0.7].forEach((offset) => {
      const oscillator = roomAudioContext.createOscillator();
      const gain = roomAudioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = 880;
      gain.gain.value = 0.1;
      oscillator.connect(gain);
      gain.connect(roomAudioContext.destination);
      oscillator.start(roomAudioContext.currentTime + offset);
      oscillator.stop(roomAudioContext.currentTime + offset + 0.22);
    });
  } catch (error) {
    console.warn('Nao consegui tocar alerta:', error);
  }
}

function showRoomAlertPopup(count, message = '') {
  const popup = document.getElementById('room-alert-popup');
  const text = document.getElementById('room-alert-popup-text');

  if (!popup) {
    return;
  }

  if (text) {
    text.textContent = message || `${count} pessoa(s) aguardando chamada previa agora.`;
  }

  popup.hidden = false;

  if (roomAlertPopupTimer) {
    window.clearTimeout(roomAlertPopupTimer);
  }

  roomAlertPopupTimer = window.setTimeout(hideRoomAlertPopup, 14000);
}

function hideRoomAlertPopup() {
  const popup = document.getElementById('room-alert-popup');

  if (popup) {
    popup.hidden = true;
  }

  if (roomTitleAlertTimer) {
    window.clearInterval(roomTitleAlertTimer);
    roomTitleAlertTimer = null;
    document.title = ROOM_ORIGINAL_TITLE;
  }
}

function flashRoomTitle(count) {
  let visible = false;

  if (roomTitleAlertTimer) {
    window.clearInterval(roomTitleAlertTimer);
  }

  roomTitleAlertTimer = window.setInterval(() => {
    visible = !visible;
    document.title = visible ? `(${count}) Nova chamada!` : ROOM_ORIGINAL_TITLE;
  }, 900);
}

function notifyRoomAlert(count, message = '') {
  showRoomAlertPopup(count, message);
  flashRoomTitle(count);
  playRoomAlert();

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Chamada previa', {
      body: message || `${count} pessoa(s) aguardando na sala virtual.`
    });
  }
}

function generateCompleteTokenCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(5);
  window.crypto.getRandomValues(bytes);
  const suffix = [...bytes].map((byte) => alphabet[byte % alphabet.length]).join('');

  return `VIP-${suffix}`;
}

function getCompleteTokenPlan() {
  const select = document.getElementById('complete-token-plan');
  const minutes = Number(select?.value || 5) || 5;

  return {
    plano: `${minutes}_minutos`,
    duracao_minutos: minutes
  };
}

function setCompleteGeneratedToken(code = '') {
  const wrapper = document.getElementById('complete-generated-token');
  const codeEl = document.getElementById('complete-generated-code');

  if (!wrapper || !codeEl) {
    return;
  }

  wrapper.hidden = !code;
  codeEl.textContent = code || '---';
}

async function generateCompleteCallToken() {
  if (typeof _supa === 'undefined' || !_supa) {
    setRoomStatus('Nao consegui conectar ao banco para gerar token.', true);
    return;
  }

  const button = document.getElementById('complete-token-generate');
  const plan = getCompleteTokenPlan();
  const user = getRoomUser();

  if (button) {
    button.disabled = true;
    button.textContent = 'Gerando...';
  }

  try {
    let lastError = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const codigo = generateCompleteTokenCode();
      const { error } = await _supa
        .from(COMPLETE_CALL_TOKENS_TABLE)
        .insert({
          codigo,
          plano: plan.plano,
          duracao_minutos: plan.duracao_minutos,
          status: 'novo',
          criado_por: user.username || 'admin',
          expira_em: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

      if (!error) {
        setCompleteGeneratedToken(codigo);
        setRoomStatus(`Token ${codigo} gerado. Ele vale por 24 horas e so funciona uma vez.`);
        return;
      }

      lastError = error;
    }

    throw lastError || new Error('Nao consegui gerar token unico.');
  } catch (error) {
    console.error('Erro ao gerar token:', error);
    setRoomStatus('Nao consegui gerar token. Confira se o SQL da chamada completa foi rodado.', true);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Gerar token de chamada';
    }
  }
}

async function copyCompleteToken() {
  const code = document.getElementById('complete-generated-code')?.textContent?.trim();

  if (!code || code === '---') {
    return;
  }

  try {
    await navigator.clipboard.writeText(code);
    setRoomStatus('Token copiado.');
  } catch (error) {
    setRoomStatus(`Copie manualmente: ${code}`);
  }
}

function getCompleteCallStatusLabel(status) {
  const labels = {
    aguardando: 'Aguardando',
    chamando: 'Chamando',
    em_chamada: 'Em chamada',
    finalizada: 'Finalizada',
    cancelada: 'Cancelada'
  };

  return labels[status] || status || '-';
}

function renderCompleteAdminCalls() {
  const container = document.getElementById('complete-admin-calls');

  if (!container) {
    return;
  }

  if (!completeAdminCalls.length) {
    container.innerHTML = '<span class="room-chat-empty">Nenhuma chamada completa aguardando agora.</span>';
    return;
  }

  container.innerHTML = completeAdminCalls.map((call) => {
    const statusClass = String(call.status || 'aguardando').replace(/[^a-z0-9_-]/gi, '');
    const canAnswer = call.status === 'chamando' || call.status === 'aguardando' || call.status === 'em_chamada';

    return `
      <article class="complete-admin-call-row">
        <div>
          <strong>${escapeRoom(call.username || 'Cliente')} - ${escapeRoom(call.codigo || '')}</strong>
          <span>
            ${escapeRoom(getCompleteCallStatusLabel(call.status))}
            · ${escapeRoom(call.duracao_minutos || 5)} min
            · IP ${escapeRoom(call.ip || 'sem IP')}
            · ${escapeRoom(formatRoomDate(call.criado_em))}
          </span>
        </div>
        <button
          class="btn-primary"
          type="button"
          onclick="answerCompleteAdminCall('${escapeRoom(call.id)}')"
          ${canAnswer ? '' : 'disabled'}
        >
          ${call.status === 'em_chamada' ? 'Abrir chamada' : 'Atender chamada'}
        </button>
      </article>
    `;
  }).join('');
}

async function loadCompleteAdminCalls() {
  if (typeof _supa === 'undefined' || !_supa) {
    return;
  }

  const { data, error } = await _supa
    .from(COMPLETE_CALL_SESSIONS_TABLE)
    .select('*')
    .in('status', ['aguardando', 'chamando', 'em_chamada'])
    .order('criado_em', { ascending: false })
    .limit(20);

  if (error) {
    console.warn('Nao consegui carregar chamadas completas:', error.message || error);
    return;
  }

  const previousCalling = new Set(
    completeAdminCalls
      .filter((call) => call.status === 'chamando')
      .map((call) => call.id)
  );
  completeAdminCalls = data || [];
  const newCalling = completeAdminCalls
    .filter((call) => call.status === 'chamando' && !previousCalling.has(call.id));

  if (newCalling.length) {
    notifyRoomAlert(newCalling.length, 'Chamada completa recebida. Atenda no painel.');
  }

  renderCompleteAdminCalls();
}

function setCompleteAdminCallStatus(message) {
  const status = document.getElementById('complete-admin-call-status');

  if (status) {
    status.textContent = message || '';
  }
}

function waitCompleteAdminDelay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function runCompleteAdminPreconnect() {
  const overlay = document.getElementById('complete-admin-preconnect');
  const count = document.getElementById('complete-admin-preconnect-count');

  if (!overlay) {
    return;
  }

  overlay.hidden = false;

  for (let value = COMPLETE_CALL_PRECONNECT_SECONDS; value >= 1; value -= 1) {
    if (count) {
      count.textContent = String(value);
    }

    await waitCompleteAdminDelay(1000);
  }

  overlay.hidden = true;
}

function ensureCompleteAdminPreconnect() {
  if (!completeAdminPreconnectPromise) {
    setCompleteAdminCallStatus('Trocando chaves criptograficas...');
    completeAdminPreconnectPromise = runCompleteAdminPreconnect().finally(() => {
      completeAdminPreconnectPromise = null;
    });
  }

  return completeAdminPreconnectPromise;
}

function formatCompleteAdminClock(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
  const rest = String(safeSeconds % 60).padStart(2, '0');

  return `${minutes}:${rest}`;
}

function getCompleteAdminVideoConstraints() {
  return {
    width: { ideal: 540, max: 720 },
    height: { ideal: 960, max: 1280 },
    frameRate: { ideal: 24, max: 30 }
  };
}

function setCompleteAdminStartedState(started) {
  const screen = document.querySelector('[data-complete-admin-screen]');

  if (!screen) {
    return;
  }

  screen.classList.toggle('is-call-started', Boolean(started));

  if (!started) {
    screen.classList.remove('is-controls-hidden');
  }
}

function setCompleteAdminControlsVisible(visible) {
  const screen = document.querySelector('[data-complete-admin-screen]');

  if (!screen) {
    return;
  }

  screen.classList.toggle('is-controls-hidden', !visible);
}

function scheduleCompleteAdminControlsHide() {
  if (completeAdminControlsTimer) {
    window.clearTimeout(completeAdminControlsTimer);
  }

  completeAdminControlsTimer = window.setTimeout(() => {
    completeAdminControlsTimer = null;
    setCompleteAdminControlsVisible(false);
  }, COMPLETE_CALL_CONTROLS_HIDE_MS);
}

function showCompleteAdminControlsTemporarily() {
  setCompleteAdminControlsVisible(true);
  scheduleCompleteAdminControlsHide();
}

function bindCompleteAdminControlReveal() {
  const screen = document.querySelector('[data-complete-admin-screen]');

  if (!screen || screen.dataset.controlsBound === 'true') {
    return;
  }

  screen.dataset.controlsBound = 'true';
  screen.addEventListener('pointerdown', showCompleteAdminControlsTemporarily, { passive: true });
  screen.addEventListener('mousemove', showCompleteAdminControlsTemporarily, { passive: true });
  screen.addEventListener('contextmenu', (event) => event.preventDefault());
}

function resetCompleteAdminClock() {
  if (completeAdminClockTimer) {
    window.clearInterval(completeAdminClockTimer);
    completeAdminClockTimer = null;
  }

  if (completeAdminAutoEndTimer) {
    window.clearTimeout(completeAdminAutoEndTimer);
    completeAdminAutoEndTimer = null;
  }

  const clock = document.getElementById('complete-admin-call-time');

  if (clock) {
    clock.textContent = '00:00';
  }
}

function startCompleteAdminClock() {
  if (completeAdminClockTimer) {
    return;
  }

  const clock = document.getElementById('complete-admin-call-time');
  const startedAt = Date.now();
  const maxMs = Math.max(1, Number(completeAdminSession?.duracao_minutos) || 5) * 60 * 1000;

  completeAdminClockTimer = window.setInterval(() => {
    const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));

    if (clock) {
      clock.textContent = formatCompleteAdminClock(elapsed);
    }
  }, 500);

  completeAdminAutoEndTimer = window.setTimeout(() => {
    endAdminCompleteCall('tempo_esgotado');
  }, maxMs);
}

function stopCompleteAdminStreams() {
  [completeAdminLocalStream, completeAdminRemoteStream].forEach((stream) => {
    stream?.getTracks?.().forEach((track) => track.stop());
  });

  completeAdminLocalStream = null;
  completeAdminRemoteStream = null;

  ['complete-admin-local-video', 'complete-admin-remote-video'].forEach((id) => {
    const video = document.getElementById(id);

    if (video) {
      video.srcObject = null;
    }
  });
}

function cleanupCompleteAdminCall() {
  const preconnect = document.getElementById('complete-admin-preconnect');

  if (preconnect) {
    preconnect.hidden = true;
  }

  completeAdminPreconnectPromise = null;

  if (completeAdminSignalPollTimer) {
    window.clearInterval(completeAdminSignalPollTimer);
    completeAdminSignalPollTimer = null;
  }

  if (completeAdminSignalChannel && typeof _supa !== 'undefined' && _supa) {
    try {
      _supa.removeChannel(completeAdminSignalChannel);
    } catch (error) {
      console.warn('Nao consegui remover canal admin:', error);
    }
  }

  completeAdminSignalChannel = null;

  if (completeAdminPeer) {
    completeAdminPeer.onicecandidate = null;
    completeAdminPeer.ontrack = null;
    completeAdminPeer.onconnectionstatechange = null;
    completeAdminPeer.close();
  }

  completeAdminPeer = null;
  resetCompleteAdminClock();
  setCompleteAdminStartedState(false);
  stopCompleteAdminStreams();
}

async function sendCompleteAdminSignal(tipo, payload = {}) {
  if (!completeAdminSession?.id || typeof _supa === 'undefined' || !_supa) {
    return;
  }

  const { error } = await _supa
    .from(COMPLETE_CALL_SIGNALS_TABLE)
    .insert({
      sessao_id: completeAdminSession.id,
      autor: 'admin',
      tipo,
      payload
    });

  if (error) {
    console.warn('Nao consegui enviar sinal admin:', error.message || error);
  }
}

async function flushCompleteAdminPendingIce() {
  if (!completeAdminPeer?.remoteDescription || !completeAdminPendingIce.length) {
    return;
  }

  const pending = [...completeAdminPendingIce];
  completeAdminPendingIce = [];

  for (const candidate of pending) {
    try {
      await completeAdminPeer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.warn('Nao consegui aplicar ICE admin:', error);
    }
  }
}

async function acceptCompleteAdminOffer(offer) {
  if (!completeAdminPeer || !completeAdminSession?.id || !offer || completeAdminPeer.remoteDescription) {
    return;
  }

  await ensureCompleteAdminPreconnect();
  await completeAdminPeer.setRemoteDescription(new RTCSessionDescription(offer));
  await flushCompleteAdminPendingIce();
  const answer = await completeAdminPeer.createAnswer();
  await completeAdminPeer.setLocalDescription(answer);
  await sendCompleteAdminSignal('answer', answer);
  setCompleteAdminStartedState(true);
  showCompleteAdminControlsTemporarily();

  await _supa
    .from(COMPLETE_CALL_SESSIONS_TABLE)
    .update({
      status: 'em_chamada',
      admin_online: true,
      iniciada_em: completeAdminSession.iniciada_em || new Date().toISOString(),
      atualizado_em: new Date().toISOString()
    })
    .eq('id', completeAdminSession.id);

  setCompleteAdminCallStatus('Resposta enviada. Conectando videos...');
  loadCompleteAdminCalls();
}

async function handleCompleteAdminSignal(signal) {
  if (!signal || signal.autor === 'admin' || signal.id <= completeAdminLastSignalId) {
    return;
  }

  completeAdminLastSignalId = signal.id;

  if (signal.tipo === 'offer' && signal.payload) {
    try {
      await acceptCompleteAdminOffer(signal.payload);
    } catch (error) {
      console.warn('Nao consegui responder oferta do cliente:', error);
      setCompleteAdminCallStatus('Nao consegui responder a chamada. Tente novamente.');
    }
    return;
  }

  if (signal.tipo === 'preconnect') {
    await ensureCompleteAdminPreconnect();
    return;
  }

  if (signal.tipo === 'ice' && signal.payload) {
    if (!completeAdminPeer?.remoteDescription) {
      completeAdminPendingIce.push(signal.payload);
      return;
    }

    try {
      await completeAdminPeer.addIceCandidate(new RTCIceCandidate(signal.payload));
    } catch (error) {
      console.warn('Nao consegui adicionar ICE do cliente:', error);
    }
    return;
  }

  if (signal.tipo === 'end') {
    endAdminCompleteCall('remoto');
  }
}

async function pollCompleteAdminSignals() {
  if (!completeAdminSession?.id || typeof _supa === 'undefined' || !_supa) {
    return;
  }

  const { data, error } = await _supa
    .from(COMPLETE_CALL_SIGNALS_TABLE)
    .select('id, autor, tipo, payload')
    .eq('sessao_id', completeAdminSession.id)
    .gt('id', completeAdminLastSignalId)
    .order('id', { ascending: true });

  if (error) {
    console.warn('Nao consegui buscar sinais admin:', error.message || error);
    return;
  }

  for (const signal of data || []) {
    await handleCompleteAdminSignal(signal);
  }
}

function subscribeCompleteAdminSignals() {
  if (!completeAdminSession?.id || typeof _supa === 'undefined' || !_supa) {
    return;
  }

  if (completeAdminSignalChannel) {
    _supa.removeChannel(completeAdminSignalChannel);
  }

  completeAdminSignalChannel = _supa
    .channel(`complete-call-admin-${completeAdminSession.id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: COMPLETE_CALL_SIGNALS_TABLE,
        filter: `sessao_id=eq.${completeAdminSession.id}`
      },
      (payload) => {
        handleCompleteAdminSignal(payload.new);
      }
    )
    .subscribe();

  pollCompleteAdminSignals();

  if (completeAdminSignalPollTimer) {
    window.clearInterval(completeAdminSignalPollTimer);
  }

  completeAdminSignalPollTimer = window.setInterval(
    pollCompleteAdminSignals,
    COMPLETE_CALL_SIGNAL_POLL_MS
  );
}

async function waitForCompleteOffer(sessionId) {
  for (let attempt = 0; attempt < 18; attempt += 1) {
    const { data, error } = await _supa
      .from(COMPLETE_CALL_SIGNALS_TABLE)
      .select('id, payload')
      .eq('sessao_id', sessionId)
      .eq('autor', 'cliente')
      .eq('tipo', 'offer')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data?.payload) {
      completeAdminLastSignalId = Math.max(completeAdminLastSignalId, data.id);
      return data.payload;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 1000));
  }

  return null;
}

async function answerCompleteAdminCall(sessionId) {
  const session = completeAdminCalls.find((call) => call.id === sessionId) || { id: sessionId };
  const modal = document.getElementById('complete-admin-call-modal');
  const title = document.getElementById('complete-admin-call-title');
  const localVideo = document.getElementById('complete-admin-local-video');
  const remoteVideo = document.getElementById('complete-admin-remote-video');

  if (typeof _supa === 'undefined' || !_supa) {
    setRoomStatus('Nao consegui conectar ao banco para atender chamada.', true);
    return;
  }

  cleanupCompleteAdminCall();
  completeAdminSession = session;
  completeAdminLastSignalId = 0;
  completeAdminPendingIce = [];
  completeAdminEnding = false;
  completeAdminPreconnectPromise = null;

  if (modal) {
    modal.hidden = false;
  }

  resetCompleteAdminClock();
  setCompleteAdminStartedState(true);
  bindCompleteAdminControlReveal();
  showCompleteAdminControlsTemporarily();

  if (title) {
    title.textContent = `${session.username || 'Cliente'} - ${session.codigo || ''}`;
  }

  try {
    setCompleteAdminCallStatus('Abrindo camera de Amanda sem audio...');
    completeAdminLocalStream = await navigator.mediaDevices.getUserMedia({
      video: getCompleteAdminVideoConstraints(),
      audio: false
    });

    if (localVideo) {
      localVideo.srcObject = completeAdminLocalStream;
    }

    completeAdminRemoteStream = new MediaStream();

    if (remoteVideo) {
      remoteVideo.srcObject = completeAdminRemoteStream;
    }

    completeAdminPeer = new RTCPeerConnection(COMPLETE_CALL_RTC_CONFIG);
    completeAdminLocalStream.getVideoTracks().forEach((track) => {
      completeAdminPeer.addTrack(track, completeAdminLocalStream);
    });

    completeAdminPeer.ontrack = (event) => {
      event.streams?.[0]?.getTracks?.().forEach((track) => {
        completeAdminRemoteStream.addTrack(track);
      });
    };

    completeAdminPeer.onicecandidate = (event) => {
      if (event.candidate) {
        sendCompleteAdminSignal('ice', event.candidate.toJSON());
      }
    };

    completeAdminPeer.onconnectionstatechange = () => {
      const state = completeAdminPeer?.connectionState;

      if (state === 'connected') {
        setCompleteAdminCallStatus('Chamada conectada. Video ao vivo ativo.');
        startCompleteAdminClock();
        showCompleteAdminControlsTemporarily();
      }

      if (state === 'failed' || state === 'disconnected') {
        setCompleteAdminCallStatus('Conexao instavel. Tentando estabilizar...');
        try {
          completeAdminPeer?.restartIce?.();
        } catch (error) {
          console.warn('Nao consegui reiniciar ICE admin:', error);
        }
      }
    };

    subscribeCompleteAdminSignals();
    setCompleteAdminCallStatus('Aguardando o cliente clicar em chamar...');
    const offer = await waitForCompleteOffer(session.id);

    if (!offer) {
      setCompleteAdminCallStatus('O cliente ainda nao apertou ligar. Tente atender novamente quando ele chamar.');
      return;
    }

    await acceptCompleteAdminOffer(offer);
  } catch (error) {
    console.error('Erro ao atender chamada completa:', error);
    setCompleteAdminCallStatus('Nao consegui atender. Confira permissao da camera e tente novamente.');
  }
}

async function endAdminCompleteCall(origin = 'admin') {
  if (completeAdminEnding) {
    return;
  }

  completeAdminEnding = true;
  const session = completeAdminSession;

  if (origin !== 'remoto' && session?.id) {
    await sendCompleteAdminSignal('end', { encerrado_por: 'admin' });
  }

  if (session?.id && typeof _supa !== 'undefined' && _supa) {
    await _supa
      .from(COMPLETE_CALL_SESSIONS_TABLE)
      .update({
        status: 'finalizada',
        admin_online: false,
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

  cleanupCompleteAdminCall();
  completeAdminSession = null;
  completeAdminPendingIce = [];
  completeAdminEnding = false;

  const modal = document.getElementById('complete-admin-call-modal');

  if (modal) {
    modal.hidden = true;
  }

  loadCompleteAdminCalls();
}

function showIncomingCallPopup(row) {
  const popup = document.getElementById('room-incoming-call');
  const title = document.getElementById('room-incoming-title');
  const meta = document.getElementById('room-incoming-meta');

  if (!popup || !row?.id) {
    return;
  }

  roomIncomingCallId = row.id;

  if (title) {
    title.textContent = `${row.username || 'Anonimo'} esta chamando`;
  }

  if (meta) {
    meta.textContent = `IP ${row.ip || 'sem IP'} - ${formatRoomWait(row.updated_at || row.created_at)} chamando`;
  }

  popup.hidden = false;
}

function hideIncomingCallPopup() {
  const popup = document.getElementById('room-incoming-call');

  if (popup) {
    popup.hidden = true;
  }

  roomIncomingCallId = null;
}

function updateIncomingCallPopup(rows) {
  const callingRows = rows.filter((row) => row.status === 'chamando');
  const current = roomIncomingCallId
    ? callingRows.find((row) => row.id === roomIncomingCallId)
    : callingRows[0];

  if (!current) {
    hideIncomingCallPopup();
    return;
  }

  showIncomingCallPopup(current);
}

async function enableRoomAlerts() {
  roomAlertsEnabled = true;

  if ('Notification' in window && Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch (error) {
      console.warn('Notificacao nao liberada:', error);
    }
  }

  playRoomAlert();
  const button = document.getElementById('room-alerts');

  if (button) {
    button.textContent = 'Alerta ativo';
  }
}

function watchNewWaitingRows(rows) {
  const waitingIds = new Set(
    rows
      .filter((row) => row.status === 'aguardando' || row.status === 'chamando')
      .map((row) => row.id)
      .filter(Boolean)
  );

  if (!roomInitialLoad) {
    const newIds = [...waitingIds].filter((id) => !roomKnownWaitingIds.has(id));

    if (newIds.length) {
      notifyRoomAlert(newIds.length, `${newIds.length} pessoa(s) aguardando atendimento agora.`);
    }
  }

  roomKnownWaitingIds = waitingIds;
  roomInitialLoad = false;
}

function watchIncomingCalls(rows) {
  const callingIds = new Set(
    rows
      .filter((row) => row.status === 'chamando')
      .map((row) => row.id)
      .filter(Boolean)
  );
  const newCallingIds = [...callingIds].filter((id) => !roomKnownCallingIds.has(id));

  if (roomCallsHydrated && newCallingIds.length) {
    notifyRoomAlert(newCallingIds.length, 'Chamada de video recebida. Atenda na sala virtual.');
  }

  roomKnownCallingIds = callingIds;
  roomCallsHydrated = true;
}

async function sendRoomPresence(isOnline = true) {
  if (typeof _supa === 'undefined' || !_supa) {
    return;
  }

  const now = new Date().toISOString();
  const payload = {
    chave: ROOM_PRESENCE_KEY,
    online: Boolean(isOnline),
    heartbeat_em: now,
    updated_at: now
  };
  const { data, error } = await _supa
    .from(ROOM_PRESENCE_TABLE)
    .update(payload)
    .eq('chave', ROOM_PRESENCE_KEY)
    .select('chave');

  if (error) {
    console.warn('Nao consegui atualizar presenca online:', error.message || error);
    return;
  }

  if (!data?.length) {
    const { error: insertError } = await _supa
      .from(ROOM_PRESENCE_TABLE)
      .insert(payload);

    if (insertError) {
      console.warn('Nao consegui criar presenca online:', insertError.message || insertError);
    }
  }
}

function startRoomPresence() {
  sendRoomPresence(true);

  if (roomPresenceTimer) {
    window.clearInterval(roomPresenceTimer);
  }

  roomPresenceTimer = window.setInterval(() => sendRoomPresence(true), ROOM_PRESENCE_HEARTBEAT_MS);
}

function stopRoomPresence() {
  if (roomPresenceTimer) {
    window.clearInterval(roomPresenceTimer);
    roomPresenceTimer = null;
  }
}

function refreshRoomPresenceNow() {
  if (isRoomAdmin()) {
    sendRoomPresence(true);
  }
}

function renderRoomRows() {
  const container = document.getElementById('room-list');

  if (!container) {
    return;
  }

  const renderKey = JSON.stringify(roomRows.map((row) => [
    row.id,
    row.username,
    row.plano,
    getRoomLoginUsername(row),
    row.status,
    row.telefone,
    row.ip,
    row.sessao_id,
    row.created_at,
    row.meet_url,
    roomOpenChatId === row.id
  ]));

  if (renderKey === roomRowsRenderKey) {
    loadRoomMessagesForRows();
    return;
  }

  roomRowsRenderKey = renderKey;

  if (!roomRows.length) {
    roomOpenChatId = '';
    container.innerHTML = `
      <div class="virtual-room-empty">
        Ninguem aguardando chamada previa agora.
      </div>
    `;
    renderRoomSidePanel();
    return;
  }

  container.innerHTML = roomRows.map((row) => {
    const loginUsername = getRoomLoginUsername(row);
    const details = getRoomDetails(row);
    const phone = row.telefone || details.telefone || '';
    const rowId = escapeRoom(row.id);
    const planLine = loginUsername
      ? `${row.plano || '-'} - login ${loginUsername}`
      : (row.plano || '-');
    const messages = roomMessagesById.get(row.id) || [];
    const unreadCount = countRoomUnreadMessages(row, messages);
    const isOpen = roomOpenChatId === row.id;
    const statusClass = String(row.status || 'aguardando').replace(/[^a-z0-9_-]/gi, '');

    return `
      <article class="virtual-room-card ${isOpen ? 'is-open' : ''}">
        <button
          class="room-conversation-summary"
          type="button"
          onclick="toggleRoomChat('${rowId}')"
          aria-expanded="${isOpen ? 'true' : 'false'}"
        >
          <div class="room-conversation-top">
            <div class="room-conversation-main">
              <strong>${escapeRoom(getRoomDisplayName(row))}</strong>
              <span>${escapeRoom(planLine)}</span>
            </div>
            <div class="room-conversation-side">
              <b class="room-status-pill is-${escapeRoom(statusClass)}">
                ${escapeRoom(getRoomStatusLabel(row.status))}
              </b>
              <span
                class="room-unread-badge"
                id="room-unread-${rowId}"
                ${unreadCount > 0 ? '' : 'hidden'}
              >
                ${unreadCount === 1 ? '1 nova' : `${unreadCount} novas`}
              </span>
            </div>
          </div>
          <div class="room-conversation-meta">
            <span>Telefone: ${escapeRoom(phone || '-')}</span>
            <span>IP: ${escapeRoom(row.ip || 'sem IP')}</span>
            <span>Sessao: ${escapeRoom(String(row.sessao_id || '').slice(0, 8) || '-')}</span>
            <span>Entrou: ${escapeRoom(formatRoomDate(row.created_at))}</span>
          </div>
        </button>
      </article>
    `;
  }).join('');

  renderRoomSidePanel();
  loadRoomMessagesForRows();
}

function toggleRoomChat(id) {
  roomOpenChatId = id;
  roomRowsRenderKey = '';
  renderRoomRows();

  if (roomOpenChatId) {
    markRoomChatRead(roomOpenChatId);
  }
}

function closeRoomChatPanel() {
  roomOpenChatId = '';
  roomRowsRenderKey = '';
  renderRoomRows();
}

function renderRoomSidePanel() {
  const panel = document.getElementById('room-side-panel');
  const workspace = document.getElementById('room-workspace');

  if (!panel) {
    return;
  }

  const row = roomRows.find((item) => item.id === roomOpenChatId);

  if (!row) {
    panel.hidden = true;
    panel.innerHTML = '';
    workspace?.classList.remove('has-open-chat');
    roomOpenChatId = '';
    roomSidePanelRenderKey = '';
    return;
  }

  const isWaiting = row.status === 'aguardando';
  const isCalling = row.status === 'chamando';
  const isReleased = row.status === 'liberado';
  const isInCall = row.status === 'em_chamada';
  const canOpenVideo = isReleased || isInCall;
  const canStartAdminCall = isWaiting || row.status === 'finalizado';
  const loginUsername = getRoomLoginUsername(row);
  const rowId = escapeRoom(row.id);
  const planLine = loginUsername
    ? `${row.plano || '-'} - login ${loginUsername}`
    : (row.plano || '-');
  const panelKey = JSON.stringify([
    row.id,
    row.username,
    row.plano,
    loginUsername,
    row.status,
    row.meet_url,
    canOpenVideo,
    canStartAdminCall,
    isWaiting,
    isCalling,
    isReleased,
    isInCall
  ]);

  workspace?.classList.add('has-open-chat');
  panel.hidden = false;

  if (roomSidePanelRenderKey === panelKey && document.getElementById(`room-chat-${row.id}`)) {
    return;
  }

  roomSidePanelRenderKey = panelKey;
  panel.innerHTML = `
    <div class="room-side-head">
      <button class="room-side-back" type="button" onclick="closeRoomChatPanel()">
        Voltar
      </button>
      <div>
        <strong>${escapeRoom(getRoomDisplayName(row))}</strong>
        <span>${escapeRoom(planLine)}</span>
      </div>
      <b class="room-status-pill is-${escapeRoom(String(row.status || 'aguardando').replace(/[^a-z0-9_-]/gi, ''))}">
        ${escapeRoom(getRoomStatusLabel(row.status))}
      </b>
    </div>
    <div class="room-side-body">
      <div class="virtual-room-actions">
        <button
          class="btn-primary"
          type="button"
          onclick="acceptIncomingCall('${rowId}')"
          ${isCalling ? '' : 'disabled'}
        >
          Atender agora
        </button>
        <button
          class="btn-secondary"
          type="button"
          onclick="startAdminVideoCall('${rowId}')"
          ${canStartAdminCall ? '' : 'disabled'}
        >
          Ligar para usuario
        </button>
        <button
          class="btn-secondary"
          type="button"
          onclick="openAdminVideoCall('${rowId}')"
          ${canOpenVideo ? '' : 'disabled'}
        >
          Abrir chamada de video
        </button>
        <button
          class="btn-secondary"
          type="button"
          onclick="finishPreviewCall('${rowId}')"
          ${isReleased || isInCall ? '' : 'disabled'}
        >
          Finalizar
        </button>
        <button
          class="btn-secondary"
          type="button"
          onclick="${isCalling ? 'declineIncomingCall' : 'cancelPreviewCall'}('${rowId}')"
          ${isWaiting || isCalling ? '' : 'disabled'}
        >
          Cancelar
        </button>
      </div>
      <div class="room-chat-box">
        <div class="room-chat-messages" id="room-chat-${rowId}">
          Carregando conversa...
        </div>
        <form class="room-chat-form" onsubmit="sendRoomMessage(event, '${rowId}')">
          <input
            type="text"
            maxlength="500"
            autocomplete="off"
            placeholder="Responder mensagem..."
          />
          <button type="submit">Enviar</button>
        </form>
      </div>
      <div class="room-video-stage" id="room-video-${rowId}" hidden>
        <div
          class="room-video-frame"
          data-room-video-frame
          aria-label="Chamada de video com ${escapeRoom(getRoomDisplayName(row))}"
        ></div>
      </div>
    </div>
  `;

  renderRoomChatMessages(row.id, roomMessagesById.get(row.id) || []);
}

async function markRoomChatRead(id) {
  if (!id || roomMarkingReadIds.has(id)) {
    return;
  }

  const row = roomRows.find((item) => item.id === id);

  if (!row) {
    return;
  }

  const messages = roomMessagesById.get(id) || [];

  if (!countRoomUnreadMessages(row, messages)) {
    return;
  }

  const now = new Date().toISOString();
  const details = {
    ...getRoomDetails(row),
    admin_read_at: now
  };

  row.detalhes = details;
  updateRoomUnreadBadge(row, 0);
  roomMarkingReadIds.add(id);

  const { error } = await _supa
    .from(ROOM_TABLE)
    .update({ detalhes: details })
    .eq('id', id);

  roomMarkingReadIds.delete(id);

  if (error) {
    console.warn('Nao consegui marcar conversa como lida:', error.message || error);
  }
}

function renderRoomChatMessages(chamadaId, messages) {
  const container = document.getElementById(`room-chat-${chamadaId}`);

  if (!container) {
    return;
  }

  const renderKey = JSON.stringify(messages.map((message) => [
    message.id,
    message.autor_tipo,
    message.texto,
    message.created_at
  ]));
  const messageKey = JSON.stringify(messages.map((message) => message.id || message.created_at || message.texto));
  const shouldScrollToLatest = messageKey !== roomChatMessageKeys.get(chamadaId);
  const isPlaceholder = container.textContent.trim().includes('Carregando conversa');

  if (roomChatRenderKeys.get(chamadaId) === renderKey && !isPlaceholder) {
    return;
  }

  roomChatRenderKeys.set(chamadaId, renderKey);
  roomChatMessageKeys.set(chamadaId, messageKey);

  if (!messages.length) {
    container.innerHTML = '<span class="room-chat-empty">Nenhuma mensagem ainda.</span>';
    return;
  }

  container.innerHTML = messages.map((message) => {
    const mine = message.autor_tipo === 'admin';
    const system = message.autor_tipo === 'sistema';
    const time = message.created_at
      ? new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : '';

    if (system) {
      return `
        <div class="room-chat-system">
          ${escapeRoom(message.texto || '')}
        </div>
      `;
    }

    return `
      <div class="room-chat-message ${mine ? 'is-admin' : 'is-user'}">
        <span>${escapeRoom(message.texto || '')}</span>
        <small>${escapeRoom(time)}</small>
      </div>
    `;
  }).join('');

  if (shouldScrollToLatest) {
    container.scrollTop = container.scrollHeight;
  }
}

async function loadRoomMessagesForRows() {
  if (!roomRows.length) {
    loadRoomMessageStats();
    return;
  }

  const newUserMessages = [];

  await Promise.all(roomRows.map(async (row) => {
    const { data, error } = await _supa
      .from(ROOM_MESSAGES_TABLE)
      .select('*')
      .eq('chamada_id', row.id)
      .order('created_at', { ascending: true })
      .limit(200);

    if (error) {
      console.warn('Nao consegui carregar mensagens:', error.message || error);
      return;
    }

    const messages = data || [];
    roomMessagesById.set(row.id, messages);

    messages.forEach((message) => {
      if (message.autor_tipo !== 'usuario' || !message.id) {
        return;
      }

      if (!roomKnownUserMessageIds.has(message.id)) {
        newUserMessages.push(message.id);
      }

      roomKnownUserMessageIds.add(message.id);
    });

    const unreadCount = countRoomUnreadMessages(row, messages);
    updateRoomUnreadBadge(row, unreadCount);
    renderRoomChatMessages(row.id, messages);

    if (row.id === roomOpenChatId && unreadCount > 0) {
      markRoomChatRead(row.id);
    }
  }));

  if (roomMessagesHydrated && newUserMessages.length) {
    notifyRoomAlert(newUserMessages.length, `${newUserMessages.length} nova(s) mensagem(ns) no chat.`);
  }

  roomMessagesHydrated = true;
  loadRoomMessageStats();
}

async function loadRoomMessageStats() {
  const countEl = document.getElementById('room-message-count');
  const fillEl = document.getElementById('room-message-progress-fill');
  const button = document.getElementById('room-clear-messages');

  if (!countEl || !fillEl) {
    return;
  }

  const { count, error } = await _supa
    .from(ROOM_MESSAGES_TABLE)
    .select('id', { count: 'exact', head: true });

  if (error) {
    console.warn('Nao consegui contar mensagens:', error.message || error);
    countEl.textContent = 'Nao carregou';
    return;
  }

  const total = count || 0;
  const percent = Math.min(100, Math.round((total / ROOM_MESSAGE_LIMIT) * 100));

  countEl.textContent = `${total} / ${ROOM_MESSAGE_LIMIT}`;
  fillEl.style.width = `${percent}%`;
  fillEl.classList.toggle('is-warning', percent >= 70);
  fillEl.classList.toggle('is-full', percent >= 100);

  if (button) {
    button.disabled = total <= 0;
  }
}

async function clearRoomMessages() {
  if (!window.confirm('Apagar todas as mensagens salvas dos chats?')) {
    return;
  }

  const { error } = await _supa
    .from(ROOM_MESSAGES_TABLE)
    .delete()
    .not('id', 'is', null);

  if (error) {
    console.error('Erro ao apagar mensagens:', error);
    alert('Nao consegui apagar as mensagens agora.');
    return;
  }

  roomKnownUserMessageIds = new Set();
  roomMessagesHydrated = false;
  await loadRoomMessagesForRows();
  await loadRoomMessageStats();
}

async function loadRoomRows() {
  setRoomStatus('Atualizando fila...');

  const { data, error } = await _supa
    .from(ROOM_TABLE)
    .select('*')
    .in('status', ROOM_ACTIVE_STATUSES)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao carregar sala virtual:', error);
    setRoomStatus('Nao consegui carregar a fila. Confira se o SQL da sala virtual foi rodado.', true);
    return;
  }

  roomRows = data || [];
  watchNewWaitingRows(roomRows);
  watchIncomingCalls(roomRows);
  renderRoomRows();
  updateIncomingCallPopup(roomRows);
  loadRoomMessageStats();
  setRoomStatus(`Atualizado agora. ${roomRows.length} pessoa(s) na fila.`);
}

async function updatePreviewCall(id, fields) {
  const { error } = await _supa
    .from(ROOM_TABLE)
    .update({
      ...fields,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar chamada:', error);
    alert('Nao consegui atualizar essa chamada agora.');
    return false;
  }

  await loadRoomRows();
  return true;
}

async function insertRoomSystemMessage(chamadaId, text) {
  const { error } = await _supa
    .from(ROOM_MESSAGES_TABLE)
    .insert({
      chamada_id: chamadaId,
      autor_tipo: 'sistema',
      autor_nome: 'Sistema',
      texto: text
    });

  if (error) {
    console.warn('Nao consegui inserir mensagem do sistema:', error.message || error);
  }
}

async function sendRoomMessage(event, chamadaId) {
  event.preventDefault();

  const input = event.target.querySelector('input');
  const text = input?.value.trim();

  if (!text) {
    return;
  }

  if (input) {
    input.value = '';
  }

  const { error } = await _supa
    .from(ROOM_MESSAGES_TABLE)
    .insert({
      chamada_id: chamadaId,
      autor_tipo: 'admin',
      autor_nome: 'Amanda',
      texto: text
    });

  if (error) {
    console.error('Erro ao enviar resposta:', error);
    alert('Nao consegui enviar a mensagem agora.');
    return;
  }

  await markRoomChatRead(chamadaId);
  loadRoomMessagesForRows();
}

async function openAdminVideoCall(id) {
  const row = roomRows.find((item) => item.id === id);

  if (!row) {
    return;
  }

  roomOpenChatId = id;
  roomRowsRenderKey = '';
  renderRoomRows();

  try {
    await mountRoomJitsiMeeting(id, row, 'Amanda');
  } catch (error) {
    console.warn('Nao consegui abrir chamada JaaS:', error.message || error);
    setRoomStatus(error.message || 'Nao consegui abrir a chamada segura.', true);
  }
}

async function acceptIncomingCall(id) {
  const row = roomRows.find((item) => item.id === id);
  const videoUrl = getRoomVideoUrl(row || id);
  const now = new Date().toISOString();
  const updatedRow = {
    ...(row || {}),
    id,
    status: 'liberado',
    meet_url: videoUrl,
    liberado_em: now,
    updated_at: now
  };

  const updated = await updatePreviewCall(id, {
    status: 'liberado',
    meet_url: videoUrl,
    liberado_em: now,
    finalizado_em: null,
    detalhes: {
      ...getRoomDetails(row),
      call_direction: 'usuario',
      admin_accepted_at: now
    }
  });

  if (!updated) {
    return;
  }

  roomOpenChatId = id;
  roomRowsRenderKey = '';
  renderRoomRows();

  await insertRoomSystemMessage(
    id,
    'Amanda atendeu a chamada de video.'
  );
  hideIncomingCallPopup();
  try {
    await mountRoomJitsiMeeting(id, updatedRow, 'Amanda');
  } catch (error) {
    console.warn('Nao consegui abrir chamada JaaS:', error.message || error);
    setRoomStatus(error.message || 'Nao consegui abrir a chamada segura.', true);
  }
  loadRoomMessagesForRows();
}

async function releasePreviewCall(id) {
  return acceptIncomingCall(id);
}

async function declineIncomingCall(id) {
  const updated = await updatePreviewCall(id, {
    status: 'aguardando'
  });

  if (!updated) {
    return;
  }

  await insertRoomSystemMessage(
    id,
    'Amanda nao atendeu a chamada de video. Tente novamente mais tarde.'
  );
  hideIncomingCallPopup();
  loadRoomMessagesForRows();
}

async function startAdminVideoCall(id) {
  const row = roomRows.find((item) => item.id === id);
  const videoUrl = createRoomVideoUrl();
  const now = new Date().toISOString();
  const updatedRow = {
    ...(row || {}),
    id,
    status: 'liberado',
    meet_url: videoUrl,
    liberado_em: now,
    entrou_em: null,
    finalizado_em: null,
    updated_at: now
  };

  const updated = await updatePreviewCall(id, {
    status: 'liberado',
    meet_url: videoUrl,
    liberado_em: now,
    entrou_em: null,
    finalizado_em: null,
    detalhes: {
      ...getRoomDetails(row),
      call_direction: 'admin',
      admin_started_at: now
    }
  });

  if (!updated) {
    return;
  }

  roomOpenChatId = id;
  roomRowsRenderKey = '';
  renderRoomRows();

  await insertRoomSystemMessage(
    id,
    'Amanda esta ligando para voce. Toque em Atender chamada.'
  );
  hideIncomingCallPopup();
  try {
    await mountRoomJitsiMeeting(id, updatedRow, 'Amanda');
  } catch (error) {
    console.warn('Nao consegui abrir chamada JaaS:', error.message || error);
    setRoomStatus(error.message || 'Nao consegui abrir a chamada segura.', true);
  }
  loadRoomMessagesForRows();
}

async function finishPreviewCall(id) {
  const updated = await updatePreviewCall(id, {
    status: 'finalizado',
    finalizado_em: new Date().toISOString()
  });

  if (!updated) {
    return;
  }

  await insertRoomSystemMessage(id, 'Chamada finalizada por Amanda.');
  await insertRoomSystemMessage(id, ROOM_FINISHED_MESSAGE);
  disposeRoomJitsi(id);
  loadRoomMessagesForRows();
}

async function cancelPreviewCall(id) {
  const updated = await updatePreviewCall(id, {
    status: 'cancelado',
    finalizado_em: new Date().toISOString()
  });

  if (!updated) {
    return;
  }

  await insertRoomSystemMessage(id, 'Amanda encerrou esta solicitacao de chamada.');
  loadRoomMessagesForRows();
}

function setupVirtualRoom() {
  const denied = document.getElementById('room-denied');
  const user = getRoomUser();

  if (!user.username) {
    window.location.href = 'index.html';
    return;
  }

  if (!isRoomAdmin()) {
    if (denied) {
      denied.hidden = false;
    }

    document.querySelectorAll('.analytics-hero, .virtual-room-workspace, .analytics-status, .room-presence-card, .room-message-usage, .complete-admin-panel')
      .forEach((element) => {
        element.style.display = 'none';
      });
    return;
  }

  document.getElementById('room-refresh')?.addEventListener('click', loadRoomRows);
  document.getElementById('room-alerts')?.addEventListener('click', enableRoomAlerts);
  document.getElementById('room-clear-messages')?.addEventListener('click', clearRoomMessages);
  document.getElementById('complete-token-generate')?.addEventListener('click', generateCompleteCallToken);
  document.getElementById('complete-copy-token')?.addEventListener('click', copyCompleteToken);
  document.getElementById('room-answer-incoming')?.addEventListener('click', () => {
    if (roomIncomingCallId) {
      acceptIncomingCall(roomIncomingCallId);
    }
  });
  document.getElementById('room-decline-incoming')?.addEventListener('click', () => {
    if (roomIncomingCallId) {
      declineIncomingCall(roomIncomingCallId);
    }
  });
  window.addEventListener('focus', refreshRoomPresenceNow);
  window.addEventListener('pageshow', refreshRoomPresenceNow);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      refreshRoomPresenceNow();
    }
  });

  startRoomPresence();
  loadRoomRows();
  loadCompleteAdminCalls();
  roomTimer = window.setInterval(loadRoomRows, ROOM_REFRESH_MS);
  completeAdminTimer = window.setInterval(loadCompleteAdminCalls, COMPLETE_CALL_REFRESH_MS);
}

window.addEventListener('beforeunload', () => {
  if (roomTimer) {
    window.clearInterval(roomTimer);
  }

  if (completeAdminTimer) {
    window.clearInterval(completeAdminTimer);
  }

  if (roomAlertPopupTimer) {
    window.clearTimeout(roomAlertPopupTimer);
  }

  if (roomTitleAlertTimer) {
    window.clearInterval(roomTitleAlertTimer);
  }

  stopRoomPresence();
  roomJitsiApis.forEach((api) => {
    try {
      api.dispose();
    } catch (error) {
      console.warn('Nao consegui fechar chamada de video:', error);
    }
  });
  roomJitsiApis = new Map();
  cleanupCompleteAdminCall();
});

document.addEventListener('DOMContentLoaded', setupVirtualRoom);
