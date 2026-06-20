const ROOM_ADMIN_PLAN = 'admin';
const ROOM_TABLE = 'chamadas_previas';
const ROOM_MEET_URL = 'https://meet.google.com/xso-udcm-kgc';
const ROOM_REFRESH_MS = 4000;
const ROOM_ACTIVE_STATUSES = ['aguardando', 'liberado', 'em_chamada'];
const ROOM_PRESENCE_TABLE = 'sala_status';
const ROOM_PRESENCE_KEY = 'amanda';
const ROOM_PRESENCE_HEARTBEAT_MS = 15000;
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
  const { error } = await _supa
    .from(ROOM_PRESENCE_TABLE)
    .upsert({
      chave: ROOM_PRESENCE_KEY,
      online: Boolean(isOnline),
      heartbeat_em: now,
      updated_at: now
    }, { onConflict: 'chave' });

  if (error) {
    console.warn('Nao consegui atualizar presenca online:', error.message || error);
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

  sendRoomPresence(false);
}

function renderRoomRows() {
  const container = document.getElementById('room-list');

  if (!container) {
    return;
  }

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

function releasePreviewCall(id) {
  updatePreviewCall(id, {
    status: 'liberado',
    meet_url: ROOM_MEET_URL,
    liberado_em: new Date().toISOString()
  });
}

function finishPreviewCall(id) {
  updatePreviewCall(id, {
    status: 'finalizado',
    finalizado_em: new Date().toISOString()
  });
}

function cancelPreviewCall(id) {
  updatePreviewCall(id, {
    status: 'cancelado',
    finalizado_em: new Date().toISOString()
  });
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
