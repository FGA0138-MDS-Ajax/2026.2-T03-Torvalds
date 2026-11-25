const CHAVE = 'cancha.tamanhoTexto'

/** Tamanhos do texto do site. O percentual é aplicado na fonte base, e o resto acompanha. */
export const TAMANHOS = [
  { id: 'normal', rotulo: 'Normal', percentual: 100 },
  { id: 'grande', rotulo: 'Grande', percentual: 115 },
  { id: 'muito-grande', rotulo: 'Muito grande', percentual: 130 },
]

const PADRAO = TAMANHOS[0].id

/** Tamanho escolhido pelo aluno neste navegador (o normal, se não houver). */
export function lerTamanho() {
  try {
    const id = localStorage.getItem(CHAVE)

    return TAMANHOS.some((tamanho) => tamanho.id === id) ? id : PADRAO
  } catch {
    return PADRAO
  }
}

/** Aplica o tamanho na página, sem guardar. */
export function aplicarTamanho(id) {
  const tamanho = TAMANHOS.find((item) => item.id === id) ?? TAMANHOS[0]

  document.documentElement.style.fontSize = `${tamanho.percentual}%`
}

/** Aplica o tamanho e lembra dele para as próximas visitas. */
export function salvarTamanho(id) {
  try {
    localStorage.setItem(CHAVE, id)
  } catch {
    // Sem armazenamento (janela privada, por exemplo): vale só nesta visita.
  }

  aplicarTamanho(id)
}
