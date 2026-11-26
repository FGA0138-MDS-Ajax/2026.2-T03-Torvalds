import { corDaDisciplina } from '../../shared/utils/coresDisciplina'
import {
  chaveDoDia,
  diasDaSemana,
  ehConcluida,
  inicioDaSemana,
} from '../agenda/agendaUtils'

/** Conta as entregas e calcula o percentual concluído (0 a 100). */
export function resumirEntregas(entregas) {
  const total = entregas.length
  const concluidas = entregas.filter((item) => ehConcluida(item.status)).length
  const percentual = total === 0 ? 0 : Math.round((concluidas / total) * 100)

  return { total, concluidas, pendentes: total - concluidas, percentual }
}

function inicioDoDia(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate())
}

/** "Hoje, 23:59", "Amanhã, 18:00" ou "22/10, 23:59". */
export function formatarPrazoCurto(prazo, agora = new Date()) {
  const data = new Date(prazo)

  if (!prazo || Number.isNaN(data.getTime())) return ''

  const hora = String(data.getHours()).padStart(2, '0')
  const minuto = String(data.getMinutes()).padStart(2, '0')
  const dias = Math.round((inicioDoDia(data) - inicioDoDia(agora)) / 86400000)

  if (dias === 0) return `Hoje, ${hora}:${minuto}`
  if (dias === 1) return `Amanhã, ${hora}:${minuto}`

  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')

  return `${dia}/${mes}, ${hora}:${minuto}`
}

/** Cor da bolinha e da etiqueta de cada tipo de entrega, como no protótipo. */
export function corDoTipo(tipo) {
  const normalizado = (tipo ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

  if (normalizado.startsWith('lista') || normalizado.startsWith('prova')) {
    return 'azul'
  }
  if (normalizado.startsWith('projeto')) return 'verde'
  if (normalizado.startsWith('exerc')) return 'amarelo'

  return 'lilas'
}

const ROTULOS_DA_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function semAcento(texto) {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/**
 * A prova ainda por vir que está mais perto: entre as entregas do tipo
 * "Prova" que não foram concluídas e cujo prazo não passou, a de prazo menor.
 * Devolve `null` quando não há nenhuma.
 */
export function proximaProva(entregas, agora = new Date()) {
  const futuras = entregas.filter((item) => {
    if (!semAcento(item.tipo).startsWith('prova')) return false
    if (ehConcluida(item.status) || !item.prazo) return false

    const prazo = new Date(item.prazo)

    return !Number.isNaN(prazo.getTime()) && prazo >= agora
  })

  futuras.sort((a, b) => new Date(a.prazo) - new Date(b.prazo))

  return futuras[0] ?? null
}

/** "hoje", "amanhã" ou "em 14 dias", contando dias de calendário. */
export function descreverDiasAte(prazo, agora = new Date()) {
  const dias = Math.round(
    (inicioDoDia(new Date(prazo)) - inicioDoDia(agora)) / 86400000,
  )

  if (dias <= 0) return 'hoje'
  if (dias === 1) return 'amanhã'

  return `em ${dias} dias`
}

/**
 * Entregas da semana atual (de segunda a domingo), um item por dia, com
 * quantas estão concluídas e quantas ainda pendentes.
 */
export function entregasDaSemana(entregas, agora = new Date()) {
  const dias = diasDaSemana(inicioDaSemana(agora))
  const chaveDeHoje = chaveDoDia(agora)

  return dias.map((dia, indice) => {
    const chave = chaveDoDia(dia)
    const doDia = entregas.filter((item) => {
      if (!item.prazo) return false

      const prazo = new Date(item.prazo)

      return !Number.isNaN(prazo.getTime()) && chaveDoDia(prazo) === chave
    })
    const pendentes = doDia.filter((item) => !ehConcluida(item.status))
    const porMateria = new Map()

    for (const item of pendentes) {
      porMateria.set(
        item.disciplinaId,
        (porMateria.get(item.disciplinaId) ?? 0) + 1,
      )
    }

    return {
      chave,
      rotulo: ROTULOS_DA_SEMANA[indice],
      ehHoje: chave === chaveDeHoje,
      pendentes: pendentes.length,
      porMateria,
    }
  })
}

const MESES = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
]

/**
 * "Bom dia, Maria!", "Boa tarde, Maria!" ou "Boa noite, Maria!", pela hora de
 * quem abre a tela e com o primeiro nome. Sem nome, fica só "Bom dia!".
 */
export function saudacao(agora = new Date(), nome = '') {
  const hora = agora.getHours()
  const primeiroNome = (nome ?? '').trim().split(/\s+/)[0]
  let texto = 'Boa noite'

  if (hora < 12) texto = 'Bom dia'
  else if (hora < 18) texto = 'Boa tarde'

  return primeiroNome ? `${texto}, ${primeiroNome}!` : `${texto}!`
}

/** "Quinta-feira, 26 de novembro". */
export function descreverDataLonga(agora = new Date()) {
  const texto = agora.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** Quantas entregas ainda não concluídas vencem hoje. */
export function contarEntregasDeHoje(entregas, agora = new Date()) {
  const chaveDeHoje = chaveDoDia(agora)

  return entregas.filter((item) => {
    if (ehConcluida(item.status) || !item.prazo) return false

    const prazo = new Date(item.prazo)

    return !Number.isNaN(prazo.getTime()) && chaveDoDia(prazo) === chaveDeHoje
  }).length
}

/** Quantas entregas passaram do prazo sem serem concluídas. */
export function contarAtrasadas(entregas, agora = new Date()) {
  return entregas.filter((item) => {
    if (ehConcluida(item.status) || !item.prazo) return false

    const prazo = new Date(item.prazo)

    return !Number.isNaN(prazo.getTime()) && prazo < agora
  }).length
}

/** Dia e mês do selo de data: `{ dia: '26', mes: 'NOV' }`. */
export function seloDoPrazo(prazo) {
  const data = new Date(prazo)

  if (!prazo || Number.isNaN(data.getTime())) return { dia: '–', mes: '' }

  return { dia: String(data.getDate()), mes: MESES[data.getMonth()] }
}

/** "23:59", ou vazio quando não há prazo. */
export function formatarHora(prazo) {
  const data = new Date(prazo)

  if (!prazo || Number.isNaN(data.getTime())) return ''

  const hora = String(data.getHours()).padStart(2, '0')
  const minuto = String(data.getMinutes()).padStart(2, '0')

  return `${hora}:${minuto}`
}

/**
 * Entregas de um mês (`mes` de 0 a 11), um item por dia, cada dia dividido por
 * matéria, mais a lista das matérias que têm entrega no mês. A cor de cada
 * matéria vem de `cores` (veja `coresDasDisciplinas`), a mesma de Matérias e
 * da Agenda, e por isso não muda ao trocar de mês.
 */
export function entregasDoMes(entregas, ano, mes, cores = new Map()) {
  const ordem = []

  for (const item of entregas) {
    if (!ordem.some((materia) => materia.id === item.disciplinaId)) {
      ordem.push({ id: item.disciplinaId, nome: item.disciplina })
    }
  }

  const diasNoMes = new Date(ano, mes + 1, 0).getDate()
  const dias = Array.from({ length: diasNoMes }, (_, indice) => ({
    dia: indice + 1,
    chave: chaveDoDia(new Date(ano, mes, indice + 1)),
    total: 0,
    porMateria: new Map(),
  }))
  const totais = new Map()
  let pendentes = 0

  for (const item of entregas) {
    if (!item.prazo) continue

    const prazo = new Date(item.prazo)

    if (
      Number.isNaN(prazo.getTime()) ||
      prazo.getFullYear() !== ano ||
      prazo.getMonth() !== mes
    ) {
      continue
    }

    // Como no Wolf Study, o mês mostra só o que ainda está pendente.
    if (ehConcluida(item.status)) continue

    const dia = dias[prazo.getDate() - 1]

    dia.total += 1
    dia.porMateria.set(
      item.disciplinaId,
      (dia.porMateria.get(item.disciplinaId) ?? 0) + 1,
    )
    totais.set(item.disciplinaId, (totais.get(item.disciplinaId) ?? 0) + 1)
    pendentes += 1
  }

  const materias = ordem
    .map((materia) => ({
      ...materia,
      cor: cores.get(materia.id) ?? 'lilas',
      total: totais.get(materia.id) ?? 0,
    }))
    .filter((materia) => materia.total > 0)

  const total = dias.reduce((soma, dia) => soma + dia.total, 0)

  return { dias, materias, total, pendentes }
}

/**
 * Cor fixa de cada matéria (lilas, amarelo, verde, rosa ou azul), pelo id.
 * É a mesma regra de Matérias e da Agenda, então a matéria tem a mesma cor em
 * todas as telas.
 */
export function coresDasDisciplinas(disciplinas) {
  return new Map(
    disciplinas.map((disciplina, indice) => [
      disciplina.id,
      corDaDisciplina(disciplina.nome, indice),
    ]),
  )
}
