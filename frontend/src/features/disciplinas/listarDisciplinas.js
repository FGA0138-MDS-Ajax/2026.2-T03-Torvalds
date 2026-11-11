import { requisicao } from '../../shared/api/client'

/** Disciplinas do aluno logado, com o progresso dele em cada uma (0 a 100). */
export function listarDisciplinas(signal) {
  return requisicao('/disciplinas', { signal })
}
