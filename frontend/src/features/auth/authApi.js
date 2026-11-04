import { ApiError, requisicao } from '../../shared/api/client'

export async function entrar(email, senha) {
  const resposta = await requisicao('/auth/login', {
    method: 'POST',
    dados: { email, senha },
    autenticada: false,
  })

  if (typeof resposta?.token !== 'string' || !resposta.token.trim()) {
    throw new ApiError(200, 'O servidor não retornou um token válido.')
  }

  return resposta.token
}

export function consultarPerfil(signal) {
  return requisicao('/me', { signal })
}
