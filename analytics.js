const ANALYTICS_ADMIN_PLAN = 'admin';
const ANALYTICS_REFRESH_MS = 10000;

let analyticsRows = [];
let analyticsTimer = null;

function getAnalyticsUser() {
  try {
    return JSON.parse(sessionStorage.getItem('user') || '{}');
  } catch (error) {
    return {};
  }
}

function isAnalyticsAdmin() {
  return String(getAnalyticsUser().plano || '').toLowerCase() === ANALYTICS_ADMIN_PLAN;
}

function setAnalyticsStatus(message, isError = false) {
  const status = document.getElementById('analytics-status');

  if (!status) {
    return;
  }

  status.textContent = message;
  status.classList.toggle('is-error', isError);
}

function shortSession(value) {
  return value ? String(value).slice(0, 8) : 'sem-sessao';
}

function formatDateTime(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function normalizePlan(row) {
  return String(row.plano || '').trim().toLowerCase();
}

function isTestRow(row) {
  const plan = normalizePlan(row);
  const username = String(row.username || '').trim().toLowerCase();

  return plan === 'teste' || username === 'teste' || username === '123';
}

function getFilteredRows() {
  const filter = document.getElementById('analytics-filter')?.value || 'all';

  if (filter === 'teste') {
    return analyticsRows.filter(isTestRow);
  }

  if (filter === 'vip') {
    return analyticsRows.filter((row) => !isTestRow(row) && normalizePlan(row) !== ANALYTICS_ADMIN_PLAN);
  }

  return analyticsRows;
}

function eventLabel(evento) {
  const labels = {
    acessou_home: 'Acessou o site',
    clicou_aba: 'Clicou em aba',
    clicou_video: 'Clicou em video',
    clicou_reproduzir_video: 'Tentou reproduzir video',
    reproduziu_video: 'Video reproduzido',
    bloqueio_video_teste: 'Bateu no bloqueio',
    clicou_foto: 'Clicou em foto',
    clicou_liberar_foto_previa: 'Tentou liberar foto',
    enviou_comentario: 'Enviou comentario',
    fechou_janela_valores: 'Fechou janelinha',
    reabriu_janela_valores: 'Reabriu janelinha',
    fechou_midia: 'Fechou midia',
    selecionou_plano_vip: 'Escolheu plano VIP',
    clicou_liberar_vip: 'Clicou em Liberar VIP',
    abriu_chamada_previa: 'Abriu chamada previa',
    entrou_fila_chamada_previa: 'Entrou na fila da previa',
    chamada_previa_repetida: 'Tentou repetir previa',
    clicou_entrar_chamada_previa: 'Entrou no Meet da previa',
    abriu_chamada_completa: 'Abriu chamada completa',
    selecionou_chamada_completa: 'Escolheu chamada completa',
    clicou_pagar_chamada_completa: 'Clicou para pagar chamada'
  };

  return labels[evento] || evento || 'Evento';
}

function setStat(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = String(value);
  }
}

function uniqueCount(rows, key) {
  return new Set(rows.map((row) => row[key]).filter(Boolean)).size;
}

function renderStats(rows) {
  const testRows = rows.filter(isTestRow);
  const testAccesses = testRows.filter((row) => row.evento === 'acessou_home').length;
  const testSessions = uniqueCount(testRows, 'sessao_id');
  const videoClicks = rows.filter((row) => row.evento === 'clicou_video').length;
  const videoPlayClicks = rows.filter((row) => row.evento === 'clicou_reproduzir_video').length;
  const videosStarted = rows.filter((row) => row.evento === 'reproduziu_video').length;
  const photoClicks = rows.filter((row) => (
    row.evento === 'clicou_foto' ||
    row.evento === 'clicou_liberar_foto_previa'
  )).length;
  const planSelected = rows.filter((row) => row.evento === 'selecionou_plano_vip').length;
  const vipUnlocks = rows.filter((row) => row.evento === 'clicou_liberar_vip').length;
  const offerCloses = rows.filter((row) => row.evento === 'fechou_janela_valores').length;
  const commentsTab = rows.filter((row) => (
    row.evento === 'clicou_aba' &&
    String(row.alvo_titulo || '').toLowerCase() === 'comentarios'
  )).length;

  setStat('stat-total', rows.length);
  setStat('stat-test-access', testAccesses);
  setStat('stat-test-sessions', testSessions);
  setStat('stat-videos', videoClicks);
  setStat('stat-video-play-clicks', videoPlayClicks);
  setStat('stat-video-started', videosStarted);
  setStat('stat-photos', photoClicks);
  setStat('stat-plan-selected', planSelected);
  setStat('stat-vip-unlocks', vipUnlocks);
  setStat('stat-offer-close', offerCloses);
  setStat('stat-comments-tab', commentsTab);
}

function renderEvents(rows) {
  const body = document.getElementById('analytics-events');

  if (!body) {
    return;
  }

  if (!rows.length) {
    body.innerHTML = `
      <tr>
        <td colspan="6" class="analytics-empty">Nenhum evento encontrado.</td>
      </tr>
    `;
    return;
  }

  body.innerHTML = rows.slice(0, 250).map((row) => `
    <tr>
      <td>${formatDateTime(row.created_at)}</td>
      <td>${escapeAnalytics(row.username || 'Anonimo')}</td>
      <td>${escapeAnalytics(row.plano || '-')}</td>
      <td>
        <span class="analytics-ip">${escapeAnalytics(row.ip || 'sem IP')}</span>
        <small>${escapeAnalytics(shortSession(row.sessao_id))}</small>
      </td>
      <td>${escapeAnalytics(eventLabel(row.evento))}</td>
      <td>${escapeAnalytics(row.alvo_titulo || row.alvo_tipo || '-')}</td>
    </tr>
  `).join('');
}

function groupJourneys(rows) {
  const groups = new Map();

  rows.forEach((row) => {
    const key = `${row.ip || 'sem-ip'}|${row.sessao_id || 'sem-sessao'}`;

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(row);
  });

  return [...groups.values()]
    .map((items) => items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)))
    .sort((a, b) => new Date(b[b.length - 1].created_at) - new Date(a[a.length - 1].created_at));
}

function renderJourneys(rows) {
  const container = document.getElementById('analytics-journeys');

  if (!container) {
    return;
  }

  const journeys = groupJourneys(rows).slice(0, 30);

  if (!journeys.length) {
    container.innerHTML = '<div class="analytics-empty">Nenhuma jornada encontrada.</div>';
    return;
  }

  container.innerHTML = journeys.map((items) => {
    const first = items[0];
    const last = items[items.length - 1];
    const sequence = items.slice(-12).map((item) => `
      <span title="${escapeAnalytics(item.alvo_titulo || item.alvo_tipo || '')}">
        ${escapeAnalytics(eventLabel(item.evento))}
      </span>
    `).join('');

    return `
      <article class="analytics-journey">
        <div class="analytics-journey-head">
          <strong>${escapeAnalytics(first.username || 'Anonimo')}</strong>
          <span>${escapeAnalytics(first.plano || '-')}</span>
        </div>
        <div class="analytics-journey-meta">
          <span>IP: ${escapeAnalytics(first.ip || 'sem IP')}</span>
          <span>Sessao: ${escapeAnalytics(shortSession(first.sessao_id))}</span>
          <span>Ultimo: ${formatDateTime(last.created_at)}</span>
        </div>
        <div class="analytics-sequence">${sequence}</div>
      </article>
    `;
  }).join('');
}

function renderAnalytics() {
  const rows = getFilteredRows();

  renderStats(rows);
  renderJourneys(rows);
  renderEvents(rows);
}

function escapeAnalytics(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

async function loadAnalytics() {
  setAnalyticsStatus('Atualizando analise...');

  const { data, error } = await _supa
    .from('analytics_eventos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('Erro ao carregar analytics:', error);
    setAnalyticsStatus('Nao consegui carregar a analise. Confira se o SQL foi rodado no Supabase.', true);
    return;
  }

  analyticsRows = data || [];
  renderAnalytics();
  setAnalyticsStatus(`Atualizado agora. ${analyticsRows.length} eventos carregados.`);
}

function exportAnalyticsCsv() {
  const rows = getFilteredRows();
  const columns = [
    ['horario', (row) => row.created_at],
    ['username', (row) => row.username],
    ['plano', (row) => row.plano],
    ['ip', (row) => row.ip],
    ['sessao_id', (row) => row.sessao_id],
    ['evento', (row) => row.evento],
    ['evento_legivel', (row) => eventLabel(row.evento)],
    ['alvo_tipo', (row) => row.alvo_tipo],
    ['alvo_titulo', (row) => row.alvo_titulo],
    ['pagina', (row) => row.pagina]
  ];
  const csvRows = rows.map((row) => columns.map(([, getter]) => csvCell(getter(row))).join(';'));
  const csv = ['\ufeff' + columns.map(([label]) => label).join(';'), ...csvRows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `analise-acessos-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = String(value ?? '').replace(/"/g, '""');
  return `"${text}"`;
}

function setupAnalyticsPage() {
  const denied = document.getElementById('analytics-denied');
  const user = getAnalyticsUser();

  if (!user.username) {
    window.location.href = 'index.html';
    return;
  }

  if (!isAnalyticsAdmin()) {
    if (denied) {
      denied.hidden = false;
    }

    document.querySelectorAll('.analytics-hero, .analytics-grid, .analytics-panel, .analytics-status')
      .forEach((element) => {
        element.style.display = 'none';
      });
    return;
  }

  document.getElementById('analytics-refresh')?.addEventListener('click', loadAnalytics);
  document.getElementById('analytics-export')?.addEventListener('click', exportAnalyticsCsv);
  document.getElementById('analytics-filter')?.addEventListener('change', renderAnalytics);

  loadAnalytics();
  analyticsTimer = window.setInterval(loadAnalytics, ANALYTICS_REFRESH_MS);
}

window.addEventListener('beforeunload', () => {
  if (analyticsTimer) {
    window.clearInterval(analyticsTimer);
  }
});

document.addEventListener('DOMContentLoaded', setupAnalyticsPage);
