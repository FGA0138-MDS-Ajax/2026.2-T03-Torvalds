import { requisicao } from '../api/client'

/** Próximas entregas ainda não concluídas do aluno (as mesmas do Início), as mais urgentes primeiro. */
export function carregarNotificacoes(signal) {
  return requisicao('/atividades/proximas', { signal })
}
