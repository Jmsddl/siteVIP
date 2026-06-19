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
const PREVIEW_CALL_MEET_URL = 'https://meet.google.com/xso-udcm-kgc';
const PREVIEW_CALL_POLL_MS = 5000;
const PREVIEW_CALL_ACTIVE_STATUSES = ['aguardando', 'liberado', 'em_chamada'];
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
let previewCallStartedAt = null;

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
  return {
    ...DEFAULT_VIP_CONFIG,
    ...(config || {}),
    preview_segundos: Math.min(
      DEMO_PREVIEW_MAX_SECONDS,
      Math.max(1, Number(config?.preview_segundos || DEFAULT_VIP_CONFIG.preview_segundos))
    )
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

function stopPreviewCallTimers() {
  if (previewCallPollTimer) {
    window.clearInterval(previewCallPollTimer);
    previewCallPollTimer = null;
  }

  if (previewCallTimer) {
    window.clearInterval(previewCallTimer);
    previewCallTimer = null;
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

async function getFinishedPreviewCallByIp(ip) {
  const { data, error } = await _supa
    .from(PREVIEW_CALL_TABLE)
    .select('id,status,created_at')
    .eq('ip', ip)
    .eq('status', 'finalizado')
    .limit(1);

  if (error) {
    throw error;
  }

  return data?.[0] || null;
}

async function getActivePreviewCallByIp(ip) {
  const { data, error } = await _supa
    .from(PREVIEW_CALL_TABLE)
    .select('*')
    .eq('ip', ip)
    .in('status', PREVIEW_CALL_ACTIVE_STATUSES)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  return data?.[0] || null;
}

async function createPreviewCall(ip) {
  const user = getStoredUser();
  const now = new Date().toISOString();
  const { data, error } = await _supa
    .from(PREVIEW_CALL_TABLE)
    .insert({
      username: user.username || 'Anonimo',
      plano: user.plano || '',
      sessao_id: getAnalyticsSessionId(),
      ip,
      status: 'aguardando',
      meet_url: PREVIEW_CALL_MEET_URL,
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

function applyPreviewCallStatus(record) {
  previewCallRecord = record;

  if (!record) {
    return;
  }

  startPreviewCallTimer(record.created_at);
  showPreviewCompleteShortcut(false);

  if (record.status === 'liberado' || record.status === 'em_chamada') {
    setPreviewCallMessage(
      'Sua chamada esta liberada',
      'Amanda liberou sua entrada. Toque no botao para entrar no Google Meet.'
    );
    setPreviewCallEnterEnabled(true);
    return;
  }

  if (record.status === 'finalizado') {
    setPreviewCallMessage(
      'Chamada previa finalizada',
      'Voce ja participou, agora pague a chamada completa.'
    );
    setPreviewCallEnterEnabled(false, 'Chamada previa usada');
    showPreviewCompleteShortcut(true);
    stopPreviewCallTimers();
    return;
  }

  if (record.status === 'cancelado') {
    setPreviewCallMessage(
      'Chamada indisponivel agora',
      'Nao foi possivel liberar sua chamada previa neste momento. Tente novamente mais tarde.'
    );
    setPreviewCallEnterEnabled(false, 'Aguardando');
    stopPreviewCallTimers();
    return;
  }

  setPreviewCallMessage(
    'Sala de espera',
    'Aguarde, estamos notificando Amanda para entrar.'
  );
  setPreviewCallEnterEnabled(false, 'Aguardando liberacao');
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

  applyPreviewCallStatus(data);
}

function startPreviewCallPolling() {
  if (previewCallPollTimer) {
    window.clearInterval(previewCallPollTimer);
  }

  previewCallPollTimer = window.setInterval(refreshPreviewCallStatus, PREVIEW_CALL_POLL_MS);
}

async function openPreviewCallRoom() {
  const modal = document.getElementById('preview-call-modal');

  if (!modal) {
    return;
  }

  modal.hidden = false;
  hideFloatingOfferPanel();
  stopPreviewCallTimers();
  setPreviewCallMessage('Sala de espera', 'Aguarde, estamos notificando Amanda para entrar.');
  setPreviewCallEnterEnabled(false, 'Preparando...');
  showPreviewCompleteShortcut(false);

  try {
    trackEvent('abriu_chamada_previa', {
      alvo_tipo: 'chamada_previa',
      alvo_titulo: 'Sala de espera'
    });

    const ip = getPreviewCallIpKey(await getClientIp());
    const finishedCall = await getFinishedPreviewCallByIp(ip);

    if (finishedCall) {
      trackEvent('chamada_previa_repetida', {
        alvo_tipo: 'chamada_previa',
        alvo_titulo: 'IP ja participou'
      });
      applyPreviewCallStatus({
        ...finishedCall,
        ip,
        status: 'finalizado'
      });
      return;
    }

    let activeCall = await getActivePreviewCallByIp(ip);

    if (!activeCall) {
      activeCall = await createPreviewCall(ip);
      trackEvent('entrou_fila_chamada_previa', {
        alvo_tipo: 'chamada_previa',
        alvo_titulo: 'Aguardando Amanda'
      });
    }

    applyPreviewCallStatus(activeCall);
    startPreviewCallPolling();
  } catch (error) {
    console.error('Erro ao abrir chamada previa:', error);
    setPreviewCallMessage(
      'Nao consegui abrir a sala',
      'Atualize a pagina e tente novamente em alguns segundos.'
    );
    setPreviewCallEnterEnabled(false, 'Indisponivel');
  }
}

function closePreviewCallRoom() {
  const modal = document.getElementById('preview-call-modal');

  stopPreviewCallTimers();

  if (modal) {
    modal.hidden = true;
  }

  showFloatingOfferPanel();
}

async function enterPreviewCall() {
  if (!previewCallRecord?.id) {
    return;
  }

  const meetUrl = previewCallRecord.meet_url || PREVIEW_CALL_MEET_URL;
  const analyticsPromise = trackEvent('clicou_entrar_chamada_previa', {
    alvo_tipo: 'chamada_previa',
    alvo_titulo: 'Entrar no Meet',
    alvo_url: meetUrl
  });

  _supa
    .from(PREVIEW_CALL_TABLE)
    .update({
      status: 'em_chamada',
      entrou_em: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', previewCallRecord.id)
    .then(({ error }) => {
      if (error) {
        console.warn('Nao consegui marcar entrada na chamada:', error);
      }
    });

  waitBrieflyForAnalytics(analyticsPromise).finally(() => {
    window.location.href = meetUrl;
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
  const fullSelect = document.getElementById('full-call-select');
  const fullCheckout = document.getElementById('full-call-checkout');

  if (previewEnter) {
    previewEnter.addEventListener('click', () => {
      if (!previewEnter.disabled) {
        enterPreviewCall();
      }
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
loadContent();
