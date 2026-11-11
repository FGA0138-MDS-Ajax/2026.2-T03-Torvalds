import { ehConcluida } from '../agenda/agendaUtils'

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

/** Mensagem de incentivo abaixo do donut de progresso. */
export function mensagemDeProgresso({ total, percentual }) {
  if (total === 0) return 'Nenhuma atividade por aqui ainda.'
  if (percentual >= 50) return 'Você está indo muito bem!'
  if (percentual > 0) return 'Bom começo, continue assim!'

  return 'Vamos começar? A primeira entrega espera por você.'
}
