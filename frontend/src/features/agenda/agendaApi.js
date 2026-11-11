import { requisicao } from '../../shared/api/client'
import { achatarAgenda } from './agendaUtils'

/**
 * Carrega a agenda unificada do aluno autenticado.
 * Consulta GET /agenda. Caso o backend ainda não exponha /agenda,
 * faz fallback consultando as disciplinas do aluno e agregando
 * as atividades de cada disciplina via GET /disciplinas/{id}/atividades.
 */
export async function carregarAgenda(signal) {
  try {
    return achatarAgenda(await requisicao('/agenda', { signal }))
  } catch (erro) {
    if (signal?.aborted) throw erro
    if (erro.status !== 404) {
      throw erro
    }

    // Fallback: agrega as atividades de todas as disciplinas do aluno
    const disciplinas = await requisicao('/disciplinas', { signal })
    const entregasPorDisciplina = await Promise.all(
      disciplinas.map(async (disciplina) => {
        try {
          const entregas = await requisicao(
            `/disciplinas/${encodeURIComponent(disciplina.id)}/atividades`,
            { signal },
          )
          return entregas.map((entrega) => ({
            ...entrega,
            disciplina: entrega.disciplina || disciplina.nome,
          }))
        } catch (falha) {
          if (signal?.aborted) throw falha
          return []
        }
      }),
    )

    return entregasPorDisciplina.flat()
  }
}

/**
 * Muda a situação de uma entrega do aluno autenticado
 * (A_FAZER, EM_ANDAMENTO ou CONCLUIDA) em PATCH /atividades/{id}/status.
 */
export function alterarSituacao(entregaId, status) {
  return requisicao(`/atividades/${encodeURIComponent(entregaId)}/status`, {
    method: 'PATCH',
    dados: { status },
  })
}
