import { requisicao } from '../../shared/api/client'

/**
 * Carrega o que a tela Início precisa: as matérias do aluno, todas as
 * entregas delas (GET /disciplinas e GET /disciplinas/{id}/atividades), as
 * próximas entregas (GET /atividades/proximas), que o backend já filtra e
 * ordena, e o progresso no semestre (GET /progresso).
 *
 * O progresso vem pronto do backend, que soma todas as disciplinas em que o
 * aluno está matriculado. A tela não recalcula esse número a partir das
 * entregas: a API é a fonte única, então o card do semestre e o back-end
 * nunca divergem.
 *
 * Cada entrega volta com `disciplinaId` e `disciplina` (o nome), para a tela
 * poder agrupar e mostrar de qual matéria ela é. Se uma matéria falhar, a
 * tela inteira mostra o erro, em vez de exibir números incompletos.
 */
export async function carregarInicio(signal) {
  const [disciplinas, proximas, progresso] = await Promise.all([
    requisicao('/disciplinas', { signal }),
    requisicao('/atividades/proximas', { signal }),
    requisicao('/progresso', { signal }),
  ])

  const entregasPorDisciplina = await Promise.all(
    disciplinas.map(async (disciplina) => {
      const entregas = await requisicao(
        `/disciplinas/${encodeURIComponent(disciplina.id)}/atividades`,
        { signal },
      )

      return entregas.map((entrega) => ({
        ...entrega,
        disciplinaId: disciplina.id,
        disciplina: disciplina.nome,
      }))
    }),
  )

  return {
    disciplinas,
    entregas: entregasPorDisciplina.flat(),
    proximas,
    progresso,
  }
}
