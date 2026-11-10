const CORES = ['lilas', 'amarelo', 'verde', 'rosa', 'azul']

/** Cor do cartão da matéria, na ordem do protótipo (lilás, amarelo, verde, rosa, azul). */
export function corDaMateria(indice) {
  return CORES[indice % CORES.length]
}

/** Separa as atividades nas três colunas do quadro. */
export function agruparPorStatus(atividades) {
  return {
    aFazer: atividades.filter((a) => a.status === 'A_FAZER'),
    emAndamento: atividades.filter((a) => a.status === 'EM_ANDAMENTO'),
    concluidas: atividades.filter((a) => a.status === 'CONCLUIDA'),
  }
}
