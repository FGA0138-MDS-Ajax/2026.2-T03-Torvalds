import { requisicao } from '../../shared/api/client'

const caminho = (disciplinaId) =>
  `/disciplinas/${encodeURIComponent(disciplinaId)}/anotacoes`

/** Anotações do aluno autenticado na disciplina (GET /disciplinas/{id}/anotacoes). */
export function listarAnotacoes(disciplinaId, signal) {
  return requisicao(caminho(disciplinaId), { signal })
}

/**
 * Cria uma anotação do aluno autenticado na disciplina
 * (POST /disciplinas/{id}/anotacoes). A API devolve a anotação criada.
 */
export function criarAnotacao(disciplinaId, { titulo, texto }) {
  return requisicao(caminho(disciplinaId), {
    method: 'POST',
    dados: { titulo, texto },
  })
}
