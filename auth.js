// Login simples com usuário/senha via Supabase
async function doLogin() {
  const username = document.getElementById('username').value.trim()
  const password = document.getElementById('password').value.trim()
  const errorEl = document.getElementById('error-msg')

  if (!username || !password) {
    errorEl.style.display = 'block'
    errorEl.textContent = 'Preencha todos os campos.'
    return
  }

  const { data, error } = await _supa
    .from('usuarios')
    .select('*')
    .eq('username', username)
    .eq('senha', password)
    .single()

  console.log('DATA:', data)
  console.log('ERROR:', error)

  if (error || !data) {
    errorEl.style.display = 'block'
    errorEl.textContent = error
      ? error.message
      : 'Usuário ou senha incorretos.'
    return
  }

  sessionStorage.setItem(
    'user',
    JSON.stringify({ username: data.username })
  )

  window.location.href = 'home.html'
}

function doLogout() {
  sessionStorage.removeItem('user')
  window.location.href = 'index.html'
}

function checkAuth() {
  const user = sessionStorage.getItem('user')

  if (!user && window.location.pathname.includes('home')) {
    window.location.href = 'index.html'
  }
}

checkAuth()

document.addEventListener('DOMContentLoaded', () => {
  const pwField = document.getElementById('password')

  if (pwField) {
    pwField.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        doLogin()
      }
    })
  }
})