let ouvinte = null

/** Registra quem deve ser avisado quando a API recusar o token (401). */
export function aoExpirarSessao(funcao) {
  ouvinte = funcao

  return () => {
    if (ouvinte === funcao) ouvinte = null
  }
}

export function notificarSessaoExpirada() {
  if (ouvinte) ouvinte()
}
