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
let roomKnownUserMessageIds = new Set();
let roomMessagesHydrated = false;
let roomIncomingCallId = null;
let roomJitsiApis = new Map();

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
  stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    row.status,
    row.updated_at,
    row.meet_url
  ]));

  if (renderKey === roomRowsRenderKey) {
    loadRoomMessagesForRows();
    return;
  }

  roomRowsRenderKey = renderKey;

  if (!roomRows.length) {
    container.innerHTML = `
      <div class="virtual-room-empty">
        Ninguem aguardando chamada previa agora.
      </div>
    `;
    return;
  }

  container.innerHTML = roomRows.map((row) => {
    const isWaiting = row.status === 'aguardando';
    const isCalling = row.status === 'chamando';
    const isReleased = row.status === 'liberado';
    const isInCall = row.status === 'em_chamada';
    const isFinished = row.status === 'finalizado';
    const canOpenVideo = isReleased || isInCall;
    const canStartAdminCall = isWaiting || isFinished;
    const loginUsername = getRoomLoginUsername(row);
    const planLine = loginUsername
      ? `${row.plano || '-'} - login ${loginUsername}`
      : (row.plano || '-');

    return `
      <article class="virtual-room-card">
        <div class="virtual-room-card-head">
          <div>
            <strong>${escapeRoom(row.username || 'Anonimo')}</strong>
            <span>${escapeRoom(planLine)}</span>
          </div>
          <b class="room-status-pill is-${escapeRoom(row.status || 'aguardando')}">
            ${escapeRoom(getRoomStatusLabel(row.status))}
          </b>
        </div>
        <div class="virtual-room-meta">
          <span>IP: ${escapeRoom(row.ip || 'sem IP')}</span>
          <span>Sessao: ${escapeRoom(String(row.sessao_id || '').slice(0, 8) || '-')}</span>
          <span>Entrou: ${escapeRoom(formatRoomDate(row.created_at))}</span>
          <span>Espera: ${escapeRoom(formatRoomWait(row.created_at))}</span>
        </div>
        <div class="room-chat-box">
          <div class="room-chat-messages" id="room-chat-${escapeRoom(row.id)}">
            Carregando conversa...
          </div>
          <form class="room-chat-form" onsubmit="sendRoomMessage(event, '${escapeRoom(row.id)}')">
            <input
              type="text"
              maxlength="500"
              autocomplete="off"
              placeholder="Responder mensagem..."
            />
            <button type="submit">Enviar</button>
          </form>
        </div>
        <div class="room-video-stage" id="room-video-${escapeRoom(row.id)}" hidden>
          <div
            class="room-video-frame"
            data-room-video-frame
            aria-label="Chamada de video com ${escapeRoom(row.username || 'usuario')}"
          ></div>
        </div>
        <div class="virtual-room-actions">
          <button
            class="btn-primary"
            type="button"
            onclick="acceptIncomingCall('${escapeRoom(row.id)}')"
            ${isCalling ? '' : 'disabled'}
          >
            Atender agora
          </button>
          <button
            class="btn-secondary"
            type="button"
            onclick="startAdminVideoCall('${escapeRoom(row.id)}')"
            ${canStartAdminCall ? '' : 'disabled'}
          >
            Ligar para usuario
          </button>
          <button
            class="btn-secondary"
            type="button"
            onclick="openAdminVideoCall('${escapeRoom(row.id)}')"
            ${canOpenVideo ? '' : 'disabled'}
          >
            Abrir chamada de video
          </button>
          <button
            class="btn-secondary"
            type="button"
            onclick="finishPreviewCall('${escapeRoom(row.id)}')"
            ${isReleased || isInCall ? '' : 'disabled'}
          >
            Finalizar
          </button>
          <button
            class="btn-secondary"
            type="button"
            onclick="${isCalling ? 'declineIncomingCall' : 'cancelPreviewCall'}('${escapeRoom(row.id)}')"
            ${isWaiting || isCalling ? '' : 'disabled'}
          >
            Cancelar
          </button>
        </div>
      </article>
    `;
  }).join('');

  loadRoomMessagesForRows();
}

function renderRoomChatMessages(chamadaId, messages) {
  const container = document.getElementById(`room-chat-${chamadaId}`);

  if (!container) {
    return;
  }

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
  container.scrollTop = container.scrollHeight;
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

    messages.forEach((message) => {
      if (message.autor_tipo !== 'usuario' || !message.id) {
        return;
      }

      if (!roomKnownUserMessageIds.has(message.id)) {
        newUserMessages.push(message.id);
      }

      roomKnownUserMessageIds.add(message.id);
    });

    renderRoomChatMessages(row.id, messages);
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

  loadRoomMessagesForRows();
}

async function openAdminVideoCall(id) {
  const row = roomRows.find((item) => item.id === id);

  if (!row) {
    return;
  }

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

    document.querySelectorAll('.analytics-hero, .virtual-room-grid, .analytics-status')
      .forEach((element) => {
        element.style.display = 'none';
      });
    return;
  }

  document.getElementById('room-refresh')?.addEventListener('click', loadRoomRows);
  document.getElementById('room-alerts')?.addEventListener('click', enableRoomAlerts);
  document.getElementById('room-clear-messages')?.addEventListener('click', clearRoomMessages);
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
  roomTimer = window.setInterval(loadRoomRows, ROOM_REFRESH_MS);
}

window.addEventListener('beforeunload', () => {
  if (roomTimer) {
    window.clearInterval(roomTimer);
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
});

document.addEventListener('DOMContentLoaded', setupVirtualRoom);
