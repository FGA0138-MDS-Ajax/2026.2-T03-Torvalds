import { requisicao } from '../../shared/api/client'

/** Conteúdos e atividades de uma disciplina, para o painel da tela Matérias. */
export async function carregarDetalhe(id, signal) {
  const base = `/disciplinas/${encodeURIComponent(id)}`
  const [conteudos, atividades] = await Promise.all([
    requisicao(`${base}/conteudos`, { signal }),
    requisicao(`${base}/atividades`, { signal }),
  ])

  return { conteudos: conteudos ?? [], atividades: atividades ?? [] }
}
