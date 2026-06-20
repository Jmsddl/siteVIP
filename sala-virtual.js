const ROOM_ADMIN_PLAN = 'admin';
const ROOM_TABLE = 'chamadas_previas';
const ROOM_MESSAGES_TABLE = 'chamada_mensagens';
const ROOM_VIDEO_BASE_URL = 'https://meet.jit.si';
const ROOM_REFRESH_MS = 4000;
const ROOM_ACTIVE_STATUSES = ['aguardando', 'liberado', 'em_chamada'];
const ROOM_PRESENCE_TABLE = 'sala_status';
const ROOM_PRESENCE_KEY = 'amanda';
const ROOM_PRESENCE_HEARTBEAT_MS = 10000;
const ROOM_ORIGINAL_TITLE = document.title;

let roomRows = [];
let roomTimer = null;
let roomPresenceTimer = null;
let roomKnownWaitingIds = new Set();
let roomAlertsEnabled = false;
let roomAudioContext = null;
let roomInitialLoad = true;
let roomAlertPopupTimer = null;
let roomTitleAlertTimer = null;
let roomRowsRenderKey = '';
let roomKnownUserMessageIds = new Set();
let roomMessagesHydrated = false;

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

function getRoomVideoUrl(rowOrId) {
  const existingUrl = typeof rowOrId === 'object' ? rowOrId?.meet_url : '';
  const id = typeof rowOrId === 'object' ? rowOrId?.id : rowOrId;

  if (existingUrl && String(existingUrl).includes('meet.jit.si')) {
    return existingUrl;
  }

  return `${ROOM_VIDEO_BASE_URL}/AmandaVip-${String(id || Date.now()).replace(/[^a-zA-Z0-9]/g, '')}`;
}

function buildRoomVideoEmbedUrl(rowOrId, displayName = 'Amanda') {
  const encodedName = encodeURIComponent(displayName);

  return `${getRoomVideoUrl(rowOrId)}#userInfo.displayName="${encodedName}"&config.prejoinPageEnabled=false&config.disableDeepLinking=true`;
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

function showRoomAlertPopup(count) {
  const popup = document.getElementById('room-alert-popup');
  const text = document.getElementById('room-alert-popup-text');

  if (!popup) {
    return;
  }

  if (text) {
    text.textContent = `${count} pessoa(s) aguardando chamada previa agora.`;
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

function notifyRoomAlert(count) {
  showRoomAlertPopup(count);
  flashRoomTitle(count);
  playRoomAlert();

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Chamada previa', {
      body: `${count} pessoa(s) aguardando na sala virtual.`
    });
  }
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
      .filter((row) => row.status === 'aguardando')
      .map((row) => row.id)
      .filter(Boolean)
  );

  if (!roomInitialLoad) {
    const newIds = [...waitingIds].filter((id) => !roomKnownWaitingIds.has(id));

    if (newIds.length) {
      notifyRoomAlert(newIds.length);
    }
  }

  roomKnownWaitingIds = waitingIds;
  roomInitialLoad = false;
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
    const isReleased = row.status === 'liberado';
    const isInCall = row.status === 'em_chamada';
    const canOpenVideo = isReleased || isInCall;

    return `
      <article class="virtual-room-card">
        <div class="virtual-room-card-head">
          <div>
            <strong>${escapeRoom(row.username || 'Anonimo')}</strong>
            <span>${escapeRoom(row.plano || '-')}</span>
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
          <iframe
            title="Videochamada com ${escapeRoom(row.username || 'usuario')}"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            allowfullscreen
          ></iframe>
        </div>
        <div class="virtual-room-actions">
          <button
            class="btn-primary"
            type="button"
            onclick="releasePreviewCall('${escapeRoom(row.id)}')"
            ${isWaiting ? '' : 'disabled'}
          >
            Habilitar
          </button>
          <button
            class="btn-secondary"
            type="button"
            onclick="openAdminVideoCall('${escapeRoom(row.id)}')"
            ${canOpenVideo ? '' : 'disabled'}
          >
            Abrir video aqui
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
            onclick="cancelPreviewCall('${escapeRoom(row.id)}')"
            ${isWaiting ? '' : 'disabled'}
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
    notifyRoomAlert(newUserMessages.length);
  }

  roomMessagesHydrated = true;
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
  renderRoomRows();
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
    return;
  }

  loadRoomRows();
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

function openAdminVideoCall(id) {
  const row = roomRows.find((item) => item.id === id);
  const stage = document.getElementById(`room-video-${id}`);
  const frame = stage?.querySelector('iframe');

  if (!stage || !frame) {
    return;
  }

  frame.src = buildRoomVideoEmbedUrl(row || id, 'Amanda');
  stage.hidden = false;
  stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function releasePreviewCall(id) {
  const videoUrl = getRoomVideoUrl(id);

  await updatePreviewCall(id, {
    status: 'liberado',
    meet_url: videoUrl,
    liberado_em: new Date().toISOString()
  });

  await insertRoomSystemMessage(
    id,
    'Amanda liberou a videochamada. Toque em Entrar na videochamada.'
  );
  loadRoomMessagesForRows();
}

async function finishPreviewCall(id) {
  await updatePreviewCall(id, {
    status: 'finalizado',
    finalizado_em: new Date().toISOString()
  });

  await insertRoomSystemMessage(id, 'Chamada finalizada por Amanda.');
  loadRoomMessagesForRows();
}

async function cancelPreviewCall(id) {
  await updatePreviewCall(id, {
    status: 'cancelado',
    finalizado_em: new Date().toISOString()
  });

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
});

document.addEventListener('DOMContentLoaded', setupVirtualRoom);
