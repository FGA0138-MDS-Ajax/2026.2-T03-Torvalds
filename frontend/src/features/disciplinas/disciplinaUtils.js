const UM_DIA = 24 * 60 * 60 * 1000

/** Situação de uma entrega para a lista: 'concluida', 'andamento' ou 'afazer'. */
export function categoriaDaEntrega(entrega) {
  if (entrega.status === 'CONCLUIDA') return 'concluida'
  if (entrega.status === 'EM_ANDAMENTO') return 'andamento'
  return 'afazer'
}

/** Atrasada é a entrega com prazo vencido que ainda não foi concluída. */
export function estaAtrasada(entrega, agora = new Date()) {
  return (
    categoriaDaEntrega(entrega) !== 'concluida' &&
    new Date(entrega.prazo) < agora
  )
}

/**
 * Ordem da lista: atrasadas primeiro (a mais antiga no topo), depois as que
 * ainda vão vencer (a mais próxima no topo) e, por último, as concluídas.
 */
export function ordenarPorUrgencia(entregas, agora = new Date()) {
  const peso = (entrega) => {
    if (categoriaDaEntrega(entrega) === 'concluida') return 2

    return estaAtrasada(entrega, agora) ? 0 : 1
  }

  return [...entregas].sort(
    (a, b) =>
      peso(a) - peso(b) || new Date(a.prazo) - new Date(b.prazo) || a.id - b.id,
  )
}

/** Quantas entregas há em cada situação, para os filtros. */
export function contarPorCategoria(entregas) {
  const contagem = {
    todas: entregas.length,
    afazer: 0,
    andamento: 0,
    concluida: 0,
  }

  for (const entrega of entregas) {
    contagem[categoriaDaEntrega(entrega)] += 1
  }

  return contagem
}

function inicioDoDia(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate())
}

function dias(quantidade) {
  return quantidade === 1 ? '1 dia' : `${quantidade} dias`
}

/** O prazo em palavras: "venceu há 22 dias", "vence hoje", "faltam 3 dias"... */
export function descreverPrazo(prazo, agora = new Date()) {
  const data = new Date(prazo)

  if (Number.isNaN(data.getTime())) return ''

  const diferenca = Math.round(
    (inicioDoDia(data) - inicioDoDia(agora)) / UM_DIA,
  )

  if (diferenca === 0) return data < agora ? 'venceu hoje' : 'vence hoje'
  if (diferenca === -1) return 'venceu ontem'
  if (diferenca < 0) return `venceu há ${dias(-diferenca)}`
  if (diferenca === 1) return 'vence amanhã'

  return `faltam ${dias(diferenca)}`
}

/** Resumo curto das pendências, como "2 atrasadas · 1 em andamento". Vazio se não houver. */
export function resumirPendencias(entregas, agora = new Date()) {
  const atrasadas = entregas.filter((entrega) =>
    estaAtrasada(entrega, agora),
  ).length
  const emAndamento = entregas.filter(
    (entrega) => categoriaDaEntrega(entrega) === 'andamento',
  ).length
  const partes = []

  if (atrasadas > 0) {
    partes.push(`${atrasadas} ${atrasadas === 1 ? 'atrasada' : 'atrasadas'}`)
  }
  if (emAndamento > 0) partes.push(`${emAndamento} em andamento`)

  return partes.join(' · ')
}
