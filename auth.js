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

async function doLogin() {
  try {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    clearAuthError();

    if (!username || !password) {
      showAuthError('Preencha todos os campos.');
      return;
    }

    const { data, error } = await _supa
      .from('usuarios')
      .select('*')
      .eq('username', username)
      .eq('senha', password)
      .maybeSingle();

    if (error) {
      console.error('Erro no login:', error);
      showAuthError('Nao consegui verificar o login. Tente novamente.');
      return;
    }

    if (!data) {
      showAuthError('Usuario ou senha incorretos.');
      return;
    }

    if (data.ativo === false) {
      showAuthError('Seu acesso esta desativado. Chame no WhatsApp para renovar.');
      return;
    }

    if (isUserExpired(data)) {
      showAuthError('Seu acesso expirou. Chame no WhatsApp para renovar.');
      return;
    }

    sessionStorage.setItem(
      AUTH_USER_KEY,
      JSON.stringify({
        username: data.username,
        plano: data.plano || '',
        expira_em: data.expira_em || null
      })
    );

    window.location.href = 'home.html';
  } catch (error) {
    console.error('Falha inesperada no login:', error);
    showAuthError('Erro ao entrar. Atualize a pagina e tente novamente.');
  }
}

function doLogout() {
  sessionStorage.removeItem(AUTH_USER_KEY);
  window.location.href = 'index.html';
}

function checkAuth() {
  const rawUser = sessionStorage.getItem(AUTH_USER_KEY);

  if (!rawUser && isHomePage()) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const user = JSON.parse(rawUser || '{}');

    if (isUserExpired(user) && isHomePage()) {
      redirectExpiredSession();
    }
  } catch (error) {
    sessionStorage.removeItem(AUTH_USER_KEY);

    if (isHomePage()) {
      window.location.href = 'index.html';
    }
  }
}

checkAuth();

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const pwField = document.getElementById('password');

  if (params.get('expired') === '1') {
    showAuthError('Seu acesso expirou. Chame no WhatsApp para renovar.');
  }

  if (pwField) {
    pwField.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        doLogin();
      }
    });
  }

  if (isHomePage()) {
    window.setInterval(checkAuth, 30000);
  }
});
