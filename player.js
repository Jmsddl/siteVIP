const DRIVE_FILE_ID_PATTERN = /^[A-Za-z0-9_-]{10,}$/;
const DIRECT_VIDEO_EXTENSION_PATTERN = /\.(mp4|webm|ogg|m4v|mov)(\?|#|$)/i;

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

function getUniqueItems(items) {
  return [...new Set(items.filter(Boolean))];
}

function isCloudflareR2Url(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname.endsWith('.r2.dev') || hostname.includes('.r2.cloudflarestorage.com');
  } catch (error) {
    return false;
  }
}

function isDirectVideoUrl(url) {
  return DIRECT_VIDEO_EXTENSION_PATTERN.test(url) || isCloudflareR2Url(url);
}

function buildDriveProxyUrl(fileId, resourceKey) {
  const proxyUrl = new URL(`/drive-video/${encodeURIComponent(fileId)}`, window.location.origin);

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
    const options = [];

    options.push({ label: currentQuality, url });

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
  if (getDriveFileId(url) || buildPornhubEmbedUrl(url)) {
    return [];
  }

  if (!isDirectVideoUrl(url)) {
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

function goBackToHome() {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  window.location.href = 'home.html';
}

function formatTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '0:00';
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function buildPlayerSources(url) {
  const fileId = getDriveFileId(url);
  const resourceKey = getDriveResourceKey(url);
  const directParams = new URLSearchParams();

  if (fileId) {
    directParams.set('id', fileId);
    directParams.set('export', 'download');
    directParams.set('confirm', 't');
  }

  if (resourceKey) {
    directParams.set('resourcekey', resourceKey);
  }

  if (!fileId) {
    return {
      sources: getUniqueItems([url]),
      fallbackUrl: url
    };
  }

  return {
    sources: getUniqueItems([
      buildDriveProxyUrl(fileId, resourceKey),
      url.includes('drive.usercontent.google.com') ? url : '',
      `https://drive.usercontent.google.com/download?${directParams.toString()}`,
      `https://drive.google.com/uc?${directParams.toString()}`,
      `https://drive.google.com/uc?id=${fileId}&export=download&confirm=t${resourceKey ? `&resourcekey=${encodeURIComponent(resourceKey)}` : ''}`,
      `https://drive.google.com/uc?id=${fileId}&export=download${resourceKey ? `&resourcekey=${encodeURIComponent(resourceKey)}` : ''}`,
      `https://drive.usercontent.google.com/u/0/uc?${directParams.toString()}`
    ]),
    fallbackUrl: url
  };
}

function requestStageFullscreen(stage) {
  const requestFullscreen =
    stage.requestFullscreen ||
    stage.webkitRequestFullscreen ||
    stage.msRequestFullscreen;

  if (!requestFullscreen || document.fullscreenElement || document.webkitFullscreenElement) {
    return Promise.resolve();
  }

  try {
    return Promise.resolve(requestFullscreen.call(stage)).catch(() => {});
  } catch (error) {
    return Promise.resolve();
  }
}

(function initPlayerPage() {
  const params = new URLSearchParams(window.location.search);
  const rawUrl = params.get('url') || '';
  const titleText = params.get('titulo') || 'Video';
  const demoMode = params.get('demo') === '1';
  const demoLimit = Math.min(5, Math.max(1, Number(params.get('limit') || 5)));
  const vipMessage = params.get('vip_message') || 'Entre em contato para assinar o VIP e continuar assistindo.';
  const contactUrl = params.get('contact_url') || params.get('telegram_url') || '';
  const contactLabel = params.get('contact_label') || 'Chamar no WhatsApp';
  const stage = document.getElementById('player-stage');
  const video = document.getElementById('standalone-video');
  const embedFrame = document.getElementById('standalone-embed');
  const loading = document.getElementById('player-loading');
  const errorBox = document.getElementById('player-error');
  const errorText = document.getElementById('player-error-text');
  const fallbackButton = document.getElementById('fallback-button');
  const title = document.getElementById('player-title');
  const ui = document.getElementById('player-ui');
  const playHint = document.getElementById('player-play-hint');
  const centerToggle = document.getElementById('center-toggle');
  const playToggle = document.getElementById('play-toggle');
  const muteToggle = document.getElementById('mute-toggle');
  const qualitySelect = document.getElementById('quality-select');
  const fullscreenToggle = document.getElementById('fullscreen-toggle');
  const lockBox = document.getElementById('player-lock');
  const lockText = document.getElementById('player-lock-text');
  const lockTelegram = document.getElementById('player-lock-telegram');
  const progress = document.getElementById('player-progress');
  const timeLabel = document.getElementById('player-time');
  const pornhubEmbedUrl = buildPornhubEmbedUrl(rawUrl);
  const driveFileId = getDriveFileId(rawUrl);
  const startTime = getVideoStartTime(rawUrl);
  const qualityOptions = buildQualityOptions(rawUrl);
  const sourceConfig = pornhubEmbedUrl
    ? { sources: [], fallbackUrl: rawUrl }
    : buildPlayerSources(rawUrl);

  let activeVideoUrl = rawUrl;
  let sourceIndex = 0;
  let activeSourceConfig = sourceConfig;
  let hideUiTimer = null;
  let dragInProgress = false;
  let startTimeApplied = false;
  let startTimeAttempts = 0;
  let pendingSeekTime = startTime;
  let demoWatchedSeconds = 0;
  let demoLastWatchTick = null;
  let demoMaxAllowedTime = Math.max(0, startTime || 0);
  let correctingDemoSeek = false;
  let demoLocked = false;
  let playHintDismissed = false;

  title.textContent = titleText;
  lockText.textContent = vipMessage;

  if (contactUrl) {
    lockTelegram.href = contactUrl;
    lockTelegram.textContent = contactLabel;
    lockTelegram.hidden = false;
  }

  fallbackButton.textContent = pornhubEmbedUrl || !driveFileId ? 'Abrir original' : 'Abrir no Drive';
  fallbackButton.hidden = demoMode;
  fallbackButton.addEventListener('click', () => {
    if (demoMode) {
      return;
    }

    if (activeSourceConfig.fallbackUrl) {
      window.location.href = activeSourceConfig.fallbackUrl;
    }
  });

  if (demoMode) {
    progress.disabled = true;
    video.setAttribute('controlsList', 'nodownload noplaybackrate noremoteplayback');
    video.setAttribute('disablepictureinpicture', '');
  }

  function clearHideUiTimer() {
    if (hideUiTimer) {
      window.clearTimeout(hideUiTimer);
      hideUiTimer = null;
    }
  }

  function showUi() {
    ui.classList.remove('is-hidden');
    clearHideUiTimer();

    if (!video.paused && !video.ended) {
      hideUiTimer = window.setTimeout(() => {
        ui.classList.add('is-hidden');
      }, 1800);
    }
  }

  function showError(message) {
    loading.hidden = true;
    errorText.textContent = message;
    errorBox.hidden = false;
    lockBox.hidden = true;
    embedFrame.hidden = true;
    embedFrame.removeAttribute('src');
    ui.classList.remove('is-embed-mode');
    ui.classList.add('is-hidden');
    video.hidden = true;
  }

  function showDemoLock() {
    if (demoLocked) {
      return;
    }

    demoLocked = true;
    clearHideUiTimer();
    video.pause();
    loading.hidden = true;
    errorBox.hidden = true;
    embedFrame.hidden = true;
    embedFrame.removeAttribute('src');
    ui.classList.add('is-hidden');
    ui.classList.remove('is-embed-mode');
    lockBox.hidden = false;
  }

  function pauseDemoCounter() {
    demoLastWatchTick = null;
  }

  function blockDemoForwardSeek(event) {
    if (!demoMode || demoLocked || correctingDemoSeek || !Number.isFinite(video.currentTime)) {
      return;
    }

    const allowedTime = Math.max(demoMaxAllowedTime, startTime || 0);

    if (video.currentTime > allowedTime + 0.35) {
      event?.preventDefault?.();
      correctingDemoSeek = true;
      video.currentTime = allowedTime;
      window.setTimeout(() => {
        correctingDemoSeek = false;
      }, 120);
    }
  }

  function rememberDemoAllowedTime() {
    if (!demoMode || correctingDemoSeek || video.seeking || !Number.isFinite(video.currentTime)) {
      return;
    }

    demoMaxAllowedTime = Math.max(demoMaxAllowedTime, video.currentTime);
  }

  function checkDemoLimit() {
    if (!demoMode || demoLocked) {
      return;
    }

    blockDemoForwardSeek();

    if (!video.paused && !video.ended) {
      const now = Date.now();

      if (demoLastWatchTick !== null) {
        demoWatchedSeconds += (now - demoLastWatchTick) / 1000;
      }

      demoLastWatchTick = now;
    }

    rememberDemoAllowedTime();

    if (demoWatchedSeconds >= demoLimit) {
      showDemoLock();
    }
  }

  function updateLoadingMessage(message) {
    loading.textContent = message;
  }

  function getPlaybackButtonHtml(isPaused) {
    if (isPaused) {
      return '<span class="player-button-icon" aria-hidden="true">&#9658;</span><span>Reproduzir</span>';
    }

    return '<span class="player-button-icon" aria-hidden="true">II</span><span>Pausar</span>';
  }

  function syncPlayHint() {
    if (!playHint || playHintDismissed || !video.paused || demoLocked || video.hidden) {
      if (playHint) {
        playHint.hidden = true;
      }
      return;
    }

    playHint.hidden = false;
  }

  function dismissPlayHint() {
    playHintDismissed = true;

    if (playHint) {
      playHint.hidden = true;
    }
  }

  function syncButtons() {
    const isPaused = video.paused || video.ended;
    const isMuted = video.muted || video.volume === 0;
    const fullscreenActive = Boolean(document.fullscreenElement || document.webkitFullscreenElement);

    playToggle.innerHTML = getPlaybackButtonHtml(isPaused);
    centerToggle.innerHTML = getPlaybackButtonHtml(isPaused);
    playToggle.setAttribute('aria-label', isPaused ? 'Reproduzir video' : 'Pausar video');
    centerToggle.setAttribute('aria-label', isPaused ? 'Reproduzir video' : 'Pausar video');
    muteToggle.textContent = isMuted ? 'Sem som' : 'Som';
    fullscreenToggle.textContent = fullscreenActive ? 'Sair da tela cheia' : 'Tela cheia';
    playToggle.classList.toggle('is-paused', isPaused);
    centerToggle.classList.toggle('is-paused', isPaused);
    syncPlayHint();
  }

  function syncProgress() {
    if (!Number.isFinite(video.duration) || dragInProgress) {
      timeLabel.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
      return;
    }

    const ratio = video.duration ? video.currentTime / video.duration : 0;
    progress.value = String(Math.round(ratio * 1000));
    timeLabel.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
  }

  function applyStartTime() {
    const targetStartTime = pendingSeekTime || startTime;

    if (!targetStartTime || startTimeApplied) {
      return;
    }

    startTimeAttempts += 1;

    try {
      const maxStart = Number.isFinite(video.duration)
        ? Math.max(0, video.duration - 0.25)
        : targetStartTime;
      const targetTime = Math.min(targetStartTime, maxStart);

      if (Math.abs(video.currentTime - targetTime) <= 0.35) {
        startTimeApplied = true;
        return;
      }

      video.currentTime = targetTime;

      window.setTimeout(() => {
        if (Math.abs(video.currentTime - targetTime) <= 0.35 || startTimeAttempts >= 12) {
          startTimeApplied = true;
          return;
        }

        applyStartTime();
      }, 180);
    } catch (error) {
      console.warn('Nao foi possivel ajustar o inicio do video:', error);

      if (startTimeAttempts < 12) {
        window.setTimeout(applyStartTime, 220);
      }
    }
  }

  function showEmbedPlayer(embedUrl) {
    if (demoMode) {
      showDemoLock();
      return;
    }

    clearHideUiTimer();
    loading.hidden = true;
    errorBox.hidden = true;
    lockBox.hidden = true;
    video.pause();
    video.hidden = true;
    video.removeAttribute('src');
    video.load();
    embedFrame.src = embedUrl;
    embedFrame.hidden = false;
    ui.classList.remove('is-hidden');
    ui.classList.add('is-embed-mode');
  }

  function tryNextSource() {
    if (!activeSourceConfig.sources.length) {
      showError('Link de video invalido.');
      return;
    }

    if (sourceIndex >= activeSourceConfig.sources.length) {
      showError('Nao consegui abrir esse video no player limpo.');
      return;
    }

    const sourceUrl = activeSourceConfig.sources[sourceIndex];
    embedFrame.hidden = true;
    embedFrame.removeAttribute('src');
    ui.classList.remove('is-embed-mode');
    loading.hidden = false;
    errorBox.hidden = true;
    lockBox.hidden = true;
    video.hidden = false;
    startTimeApplied = false;
    startTimeAttempts = 0;
    updateLoadingMessage('Carregando video...');
    video.src = sourceUrl;
    video.load();
  }

  async function togglePlayback() {
    if (demoLocked) {
      return;
    }

    if (video.paused || video.ended) {
      try {
        await video.play();
      } catch (error) {
        console.warn('Nao foi possivel iniciar o video:', error);
      }
      return;
    }

    video.pause();
  }

  video.addEventListener('loadstart', () => {
    updateLoadingMessage('Carregando video...');
  });

  video.addEventListener('loadedmetadata', () => {
    progress.value = '0';
    applyStartTime();
    syncProgress();
    syncButtons();
  });

  video.addEventListener('durationchange', applyStartTime);

  video.addEventListener('canplay', () => {
    applyStartTime();
    loading.hidden = true;
    errorBox.hidden = true;
    syncPlayHint();
    showUi();
  });

  video.addEventListener('waiting', () => {
    pauseDemoCounter();

    if (!loading.hidden) {
      updateLoadingMessage('Carregando video...');
    }
  });

  video.addEventListener('error', () => {
    console.warn('Falha ao carregar fonte de video:', activeSourceConfig.sources[sourceIndex]);
    sourceIndex += 1;
    tryNextSource();
  });

  video.addEventListener('play', () => {
    dismissPlayHint();
    applyStartTime();
    if (demoMode) {
      demoLastWatchTick = Date.now();
    }
    syncButtons();
    showUi();
  });

  video.addEventListener('playing', applyStartTime);

  video.addEventListener('pause', () => {
    pauseDemoCounter();
    syncButtons();
    showUi();
  });

  video.addEventListener('ended', () => {
    pauseDemoCounter();
    syncButtons();
    showUi();
  });

  video.addEventListener('timeupdate', () => {
    applyStartTime();
    checkDemoLimit();
    syncProgress();
  });
  video.addEventListener('seeking', blockDemoForwardSeek);
  video.addEventListener('seeked', blockDemoForwardSeek);
  video.addEventListener('volumechange', syncButtons);
  video.addEventListener('contextmenu', (event) => {
    if (demoMode) {
      event.preventDefault();
    }
  });
  stage.addEventListener('contextmenu', (event) => {
    if (demoMode) {
      event.preventDefault();
    }
  });
  document.addEventListener('fullscreenchange', syncButtons);

  centerToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    togglePlayback();
  });

  playToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    togglePlayback();
  });

  muteToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    video.muted = !video.muted;
    syncButtons();
    showUi();
  });

  fullscreenToggle.addEventListener('click', async (event) => {
    event.stopPropagation();

    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) {
        await Promise.resolve(document.exitFullscreen()).catch(() => {});
      } else if (document.webkitExitFullscreen) {
        await Promise.resolve(document.webkitExitFullscreen()).catch(() => {});
      }
    } else {
      await requestStageFullscreen(stage);
    }

    syncButtons();
    showUi();
  });

  function setupQualitySelect() {
    if (!qualitySelect || qualityOptions.length < 2) {
      return;
    }

    qualitySelect.hidden = false;
    qualitySelect.innerHTML = qualityOptions
      .map((option, index) => `<option value="${index}">${option.label}</option>`)
      .join('');

    qualitySelect.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    qualitySelect.addEventListener('change', async (event) => {
      event.stopPropagation();

      const selectedOption = qualityOptions[Number(qualitySelect.value)];

      if (!selectedOption || selectedOption.url === activeVideoUrl) {
        return;
      }

      const resumeTime = Number.isFinite(video.currentTime) ? video.currentTime : startTime;
      const shouldResume = !video.paused && !video.ended;
      activeVideoUrl = selectedOption.url;
      activeSourceConfig = buildPlayerSources(activeVideoUrl);
      sourceIndex = 0;
      pendingSeekTime = resumeTime;
      startTimeApplied = false;
      startTimeAttempts = 0;
      tryNextSource();

      if (shouldResume) {
        video.addEventListener('canplay', () => {
          video.play().catch(() => {});
        }, { once: true });
      }
    });
  }

  progress.addEventListener('pointerdown', () => {
    if (demoMode) {
      return;
    }

    dragInProgress = true;
    clearHideUiTimer();
  });

  progress.addEventListener('pointerup', () => {
    dragInProgress = false;
    showUi();
  });

  progress.addEventListener('input', () => {
    if (demoMode) {
      progress.value = String(Math.round((video.duration ? video.currentTime / video.duration : 0) * 1000));
      return;
    }

    if (!Number.isFinite(video.duration)) {
      return;
    }

    const targetTime = (Number(progress.value) / 1000) * video.duration;
    video.currentTime = targetTime;
    syncProgress();
  });

  stage.addEventListener('click', (event) => {
    if (event.target.closest('button, input')) {
      return;
    }

    if (ui.classList.contains('is-hidden')) {
      showUi();
      return;
    }

    togglePlayback();
  });

  stage.addEventListener('pointermove', () => {
    if (ui.classList.contains('is-hidden')) {
      showUi();
    }
  });

  if (!rawUrl) {
    showError('Link de video invalido.');
    return;
  }

  syncButtons();
  syncProgress();
  setupQualitySelect();

  if (pornhubEmbedUrl) {
    showEmbedPlayer(pornhubEmbedUrl);
    return;
  }

  tryNextSource();
})();
