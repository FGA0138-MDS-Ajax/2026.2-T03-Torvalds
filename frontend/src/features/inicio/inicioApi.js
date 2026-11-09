import { requisicao } from '../../shared/api/client'

/**
 * Carrega o que a tela Início precisa: as matérias do aluno e todas as
 * entregas delas (GET /disciplinas e GET /disciplinas/{id}/atividades).
 *
 * Cada entrega volta com `disciplinaId` e `disciplina` (o nome), para a tela
 * poder agrupar e mostrar de qual matéria ela é. Se uma matéria falhar, a
 * tela inteira mostra o erro, em vez de exibir números incompletos.
 */
export async function carregarInicio(signal) {
  const disciplinas = await requisicao('/disciplinas', { signal })

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

  return { disciplinas, entregas: entregasPorDisciplina.flat() }
}
