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

const NOMES_DOS_MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

/** "Outubro 2026", como no título do calendário. */
export function nomeDoMes(ano, mes) {
  return `${NOMES_DOS_MESES[mes]} ${ano}`
}

/** Chave "AAAA-MM-DD" do dia, no fuso do aluno. */
export function chaveDoDia(data) {
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')

  return `${data.getFullYear()}-${mes}-${dia}`
}

/**
 * Semanas (de segunda a domingo) que cobrem o mês. `mes` vai de 0 (janeiro) a 11. Os dias de
 * outros meses que completam a primeira e a última semana vêm com `foraDoMes`.
 */
export function montarSemanas(ano, mes) {
  const deslocamento = (new Date(ano, mes, 1).getDay() + 6) % 7
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()
  const quantidade = Math.ceil((deslocamento + diasNoMes) / 7)
  const semanas = []

  for (let s = 0; s < quantidade; s += 1) {
    const semana = []

    for (let d = 0; d < 7; d += 1) {
      const data = new Date(ano, mes, 1 - deslocamento + s * 7 + d)

      semana.push({
        data,
        chave: chaveDoDia(data),
        foraDoMes: data.getMonth() !== mes,
      })
    }
    semanas.push(semana)
  }

  return semanas
}

/** Entregas agrupadas por dia (chave "AAAA-MM-DD"), em ordem de prazo. */
export function agruparPorDia(itens) {
  const grupos = new Map()
  const ordenados = [...itens]
    .filter(
      (item) => item.prazo && !Number.isNaN(new Date(item.prazo).getTime()),
    )
    .sort((a, b) => new Date(a.prazo) - new Date(b.prazo))

  for (const item of ordenados) {
    const chave = chaveDoDia(new Date(item.prazo))

    grupos.set(chave, [...(grupos.get(chave) ?? []), item])
  }

  return grupos
}

/** Segunda-feira (à meia-noite) da semana que contém a data. */
export function inicioDaSemana(data) {
  const deslocamento = (data.getDay() + 6) % 7

  return new Date(
    data.getFullYear(),
    data.getMonth(),
    data.getDate() - deslocamento,
  )
}

/** Os 7 dias da semana, de segunda a domingo, a partir da segunda-feira dada. */
export function diasDaSemana(inicio) {
  return Array.from(
    { length: 7 },
    (_, i) =>
      new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i),
  )
}

/** "09/11 a 15/11 de 2026", como título da vista semanal. */
export function descreverSemana(inicio) {
  const fim = diasDaSemana(inicio)[6]

  return `${formatarPrazoDdMm(inicio)} a ${formatarPrazoDdMm(fim)} de ${fim.getFullYear()}`
}

/** Hora do prazo no formato 23:59. */
export function formatarHora(dataIso) {
  const data = new Date(dataIso)

  if (!dataIso || Number.isNaN(data.getTime())) return ''

  const hora = String(data.getHours()).padStart(2, '0')
  const minuto = String(data.getMinutes()).padStart(2, '0')

  return `${hora}:${minuto}`
}

/** Situação da entrega em texto: Concluída, Atrasada, Em andamento ou A fazer. */
export function rotuloDoStatus(item) {
  if (ehConcluida(item.status)) return 'Concluída'
  if (ehAtrasada(item)) return 'Atrasada'
  if (ehEmAndamento(item.status)) return 'Em andamento'

  return 'A fazer'
}
