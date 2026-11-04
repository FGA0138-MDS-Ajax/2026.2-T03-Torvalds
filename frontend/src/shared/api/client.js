import { obterToken } from '../auth/tokenStorage'

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8080'
).replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(status, mensagem) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function requisicao(
  caminho,
  { method = 'GET', dados, autenticada = true, signal } = {},
) {
  const headers = new Headers({
    Accept: 'application/json',
  })

  if (dados !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (autenticada) {
    const token = obterToken()

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  let resposta

  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method,
      headers,
      body: dados === undefined ? undefined : JSON.stringify(dados),
      signal,
    })
  } catch (erro) {
    if (erro.name === 'AbortError') {
      throw erro
    }

    throw new ApiError(
      0,
      'Não foi possível conectar ao servidor. Tente novamente.',
    )
  }

  const texto = await resposta.text()
  let corpo = null

  if (texto) {
    try {
      corpo = JSON.parse(texto)
    } catch {
      throw new ApiError(
        resposta.status,
        'O servidor retornou uma resposta inesperada.',
      )
    }
  }

  if (!resposta.ok) {
    throw new ApiError(
      resposta.status,
      corpo?.mensagem || 'Não foi possível concluir a solicitação.',
    )
  }

  return corpo
}
