const AUTH_USER_KEY = 'user';

function getAuthErrorElement() {
  return document.getElementById('error-msg');
}

function showAuthError(message) {
  const errorEl = getAuthErrorElement();

  if (!errorEl) {
    return;
  }

  errorEl.style.display = 'block';
  errorEl.textContent = message;
}

function clearAuthError() {
  const errorEl = getAuthErrorElement();

  if (errorEl) {
    errorEl.style.display = 'none';
  }
}

function parseExpirationDate(value) {
  if (!value) {
    return null;
  }

  const expiresAt = new Date(value);

  return Number.isNaN(expiresAt.getTime()) ? null : expiresAt;
}

function isUserExpired(user) {
  const expiresAt = parseExpirationDate(user?.expira_em);

  return Boolean(expiresAt && expiresAt.getTime() <= Date.now());
}

function isHomePage() {
  return window.location.pathname.includes('home');
}

function redirectExpiredSession() {
  sessionStorage.removeItem(AUTH_USER_KEY);
  window.location.href = 'index.html?expired=1';
}

async function deactivateExpiredUsers() {
  try {
    await _supa.rpc('bloquear_usuarios_expirados');
  } catch (error) {
    console.warn('Nao foi possivel sincronizar usuarios expirados:', error);
  }
}

async function doLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  clearAuthError();

  if (!username || !password) {
    showAuthError('Preencha todos os campos.');
    return;
  }

  await deactivateExpiredUsers();

  const { data, error } = await _supa
    .from('usuarios')
    .select('*')
    .eq('username', username)
    .eq('senha', password)
    .single();

  if (error || !data) {
    showAuthError('Usuario ou senha incorretos.');
    return;
  }

  if (data.ativo === false) {
    showAuthError('Seu acesso esta desativado. Chame no WhatsApp para renovar.');
    return;
  }

  if (isUserExpired(data)) {
    await deactivateExpiredUsers();
    showAuthError('Seu acesso expirou. Chame no WhatsApp para renovar.');
    return;
  }

  sessionStorage.setItem(
    AUTH_USER_KEY,
    JSON.stringify({
      username: data.username,
      plano: data.plano || '',
      expira_em: data.expira_em || null
