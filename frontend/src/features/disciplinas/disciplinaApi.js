import { requisicao, ApiError } from '../../shared/api/client'

export async function carregarDisciplina(id, signal) {
  const [disciplinas, entregas] = await Promise.all([
    requisicao('/disciplinas', { signal }),
    requisicao(`/disciplinas/${encodeURIComponent(id)}/atividades`, { signal }),
  ])
  const disciplina = disciplinas.find((item) => String(item.id) === id)
  if (!disciplina) throw new ApiError(404, 'Disciplina não encontrada.')
  return { disciplina, entregas }
}
