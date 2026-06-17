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
