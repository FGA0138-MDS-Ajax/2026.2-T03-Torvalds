import { requisicao, ApiError } from '../../shared/api/client'

export async function carregarDisciplina(id, signal) {
  const caminho = `/disciplinas/${encodeURIComponent(id)}`
  const [disciplinas, entregas, materiais] = await Promise.all([
    requisicao('/disciplinas', { signal }),
    requisicao(`${caminho}/atividades`, { signal }),
    // Os materiais não impedem a página de abrir: se a chamada falhar, a seção
    // Materiais avisa e o resto da página continua funcionando.
    requisicao(`${caminho}/conteudos`, { signal }).catch((falha) => {
      if (signal?.aborted) throw falha
      return null
    }),
  ])
  const disciplina = disciplinas.find((item) => String(item.id) === id)
  if (!disciplina) throw new ApiError(404, 'Disciplina não encontrada.')
  return { disciplina, entregas, materiais }
}

/**
 * Conclui (`CONCLUIDA`) ou desfaz a conclusão (`A_FAZER`) de uma entrega do
 * aluno autenticado, pelo PATCH /atividades/{id}/status.
 */
export function alterarSituacaoEntrega(entregaId, status) {
  return requisicao(`/atividades/${encodeURIComponent(entregaId)}/status`, {
    method: 'PATCH',
    dados: { status },
  })
}
