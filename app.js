const DEMO_USERNAME = 'teste';
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

function isDemoUser() {
  return String(getStoredUser().username || '').toLowerCase() === DEMO_USERNAME;
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

function buildVipNoticeHtml(type, extraClass = '') {
  const contactUrl = getContactUrl();
  const contactButton = contactUrl
    ? `
      <a class="vip-lock-button" href="${escapeHtml(contactUrl)}" target="_blank" rel="noopener">
        ${escapeHtml(getContactButtonText())}
      </a>
    `
    : '';

  return `
    <div class="vip-lock-card ${extraClass}">
      <span class="vip-lock-kicker">Acesso VIP</span>
      <h3>Conteudo bloqueado</h3>
      <p>${escapeHtml(buildVipMessage(type))}</p>
      ${contactButton}
    </div>
  `;
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
    reopen: document.getElementById('floating-offer-reopen')
  };
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

  window.requestAnimationFrame(() => clampFloatingOfferPanel(panel));
}

function renderFloatingOfferPanel(offers) {
  const { panel, list, telegram, close, reopen } = getFloatingOfferElements();

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
      floatingOfferManuallyClosed = true;
      hideFloatingOfferPanel();
      reopen.hidden = false;
    });

    reopen.addEventListener('click', () => {
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

async function loadContent() {
  const demoMode = isDemoUser();

  vipConfig = await loadVipConfig();
  renderFloatingOfferPanel(await loadVipOffers());

  const { data, error } = await _supa
    .from('conteudo')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao carregar:', error);
    return;
  }

  const videos = data.filter((item) => item.tipo === 'video');
  let fotos = data.filter((item) => item.tipo === 'foto');

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

  document.getElementById('count-videos').textContent = videos.length;
  document.getElementById('count-fotos').textContent = fotos.length;

  renderVideos(videos);
  renderFotos(fotos, { previewMode: demoMode });
  loadComments();
}

function renderVideos(videos) {
  const grid = document.getElementById('videos-grid');
  grid.innerHTML = '';

  videos.forEach((video) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = function () {
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
        openPreviewPhotoLock(foto);
      });

      grid.appendChild(card);
      return;
    }

    card.onclick = function () {
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

  window.location.href = `player.html?${params.toString()}`;
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
    setupModalQualitySelect(player, modalVideo, qualityOptions, startTime);
    setupDemoVideoLock(modalVideo, startTime);
  } else {
    alert('Link do video invalido');
    return;
  }

  openContentModal(titulo);
}

async function closeVideoModal() {
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

  document.getElementById('comment-text').value = '';
  loadComments();
}

document.addEventListener('DOMContentLoaded', () => {
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
