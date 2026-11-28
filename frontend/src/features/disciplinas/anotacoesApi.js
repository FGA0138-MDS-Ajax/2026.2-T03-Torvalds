import { requisicao } from '../../shared/api/client'

// O back devolve a data como `dataCriacao`; as telas leem `criadaEm`.
const daApi = (anotacao) => ({
  ...anotacao,
  criadaEm: anotacao.criadaEm ?? anotacao.dataCriacao,
})

const caminho = (disciplinaId) =>
  `/disciplinas/${encodeURIComponent(disciplinaId)}/anotacoes`

/** Anotações do aluno autenticado na disciplina (GET /disciplinas/{id}/anotacoes). */
export function listarAnotacoes(disciplinaId, signal) {
  return requisicao(caminho(disciplinaId), { signal }).then((lista) =>
    (lista ?? []).map(daApi),
  )
}

/**
 * Cria uma anotação do aluno autenticado na disciplina
 * (POST /disciplinas/{id}/anotacoes). A API devolve a anotação criada.
 */
export function criarAnotacao(disciplinaId, { titulo, texto }) {
  return requisicao(caminho(disciplinaId), {
    method: 'POST',
    dados: { titulo, texto },
  }).then(daApi)
}
