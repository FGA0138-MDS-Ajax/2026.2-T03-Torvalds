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
