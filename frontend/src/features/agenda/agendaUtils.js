export function formatarPrazoDdMm(dataIso) {
  if (!dataIso) return ''
  const data = new Date(dataIso)
  if (Number.isNaN(data.getTime())) return ''
  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  return `${dia}/${mes}`
}

export function ehConcluida(status) {
  if (!status) return false
  const normalizado = status.trim().toUpperCase()
  return (
    normalizado === 'CONCLUIDA' ||
    normalizado === 'CONCLUÍDA' ||
    normalizado === 'CONCLUIDO' ||
    normalizado === 'CONCLUÍDO'
  )
}

export function ehEmAndamento(status) {
  if (!status) return false
  const normalizado = status.trim().toUpperCase()
  return normalizado === 'EM_ANDAMENTO' || normalizado === 'EM ANDAMENTO'
}

export function ehAtrasada(item) {
  if (!item?.prazo) return false
  if (ehConcluida(item.status)) return false
  return new Date(item.prazo) < new Date()
}

export function categorizarEntrega(item) {
  if (ehConcluida(item.status)) return 'CONCLUIDAS'
  if (ehEmAndamento(item.status)) return 'EM_ANDAMENTO'
  return 'A_FAZER'
}

/** Ordena por prazo, do mais próximo ao mais distante; sem prazo vai para o fim. */
export function compararPrazo(a, b) {
  const prazoA = a?.prazo ? new Date(a.prazo).getTime() : Number.NaN
  const prazoB = b?.prazo ? new Date(b.prazo).getTime() : Number.NaN

  if (Number.isNaN(prazoA) && Number.isNaN(prazoB)) return 0
  if (Number.isNaN(prazoA)) return 1
  if (Number.isNaN(prazoB)) return -1
  return prazoA - prazoB
}

const GRUPOS_DA_AGENDA = ['A_FAZER', 'EM_ANDAMENTO', 'CONCLUIDA']

/**
 * O GET /agenda devolve as entregas agrupadas pela situação
 * ({ A_FAZER: [...], EM_ANDAMENTO: [...], CONCLUIDA: [...] }) e cada item traz
 * o campo `situacao`. A tela trabalha com uma lista única em que cada item tem
 * `status`, então a resposta é achatada aqui. Uma lista continua sendo aceita.
 */
export function achatarAgenda(resposta) {
  if (Array.isArray(resposta)) return resposta
  if (!resposta || typeof resposta !== 'object') return []

  return GRUPOS_DA_AGENDA.flatMap((grupo) =>
    (resposta[grupo] ?? []).map((item) => ({
      ...item,
      status: item.status ?? item.situacao ?? grupo,
    })),
  )
}
