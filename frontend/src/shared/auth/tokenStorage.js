const TOKEN_KEY = 'cancha.token'

export function obterToken() {
  return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY)
}

export function removerToken() {
  sessionStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_KEY)
}

export function guardarToken(token, lembrar = false) {
  removerToken()

  const armazenamento = lembrar ? localStorage : sessionStorage
  armazenamento.setItem(TOKEN_KEY, token)
}
