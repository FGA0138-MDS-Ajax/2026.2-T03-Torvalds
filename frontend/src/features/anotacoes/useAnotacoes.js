import { useEffect, useState } from 'react'
import { criarAnotacao, listarAnotacoes } from '../disciplinas/anotacoesApi'

// Da mais antiga para a mais nova: o número do capítulo é a posição na lista,
// então uma anotação nova entra no fim e não muda o número das outras.
const maisAntigaPrimeiro = (a, b) =>
  new Date(a.criadaEm ?? 0).getTime() - new Date(b.criadaEm ?? 0).getTime()

/** Anotações de uma disciplina: carrega a lista e cria anotações novas. */
export function useAnotacoes(disciplinaId) {
  const [estado, setEstado] = useState({ anotacoes: null, erro: null })
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    listarAnotacoes(disciplinaId, controller.signal)
      .then((lista) => {
        if (!controller.signal.aborted) {
          setEstado({
            anotacoes: [...lista].sort(maisAntigaPrimeiro),
            erro: null,
          })
        }
      })
      .catch((erro) => {
        if (!controller.signal.aborted) setEstado({ anotacoes: null, erro })
      })

    return () => controller.abort()
  }, [disciplinaId, tentativa])

  function tentarNovamente() {
    setEstado({ anotacoes: null, erro: null })
    setTentativa((atual) => atual + 1)
  }

  /** Cria a anotação e a coloca no fim da lista. Recusada pela API, lança o erro. */
  async function criar(dados) {
    const criada = await criarAnotacao(disciplinaId, dados)
    const nova = { criadaEm: new Date().toISOString(), ...criada }

    setEstado((atual) => ({
      ...atual,
      anotacoes: [...(atual.anotacoes ?? []), nova],
    }))

    return nova
  }

  return {
    anotacoes: estado.anotacoes,
    erro: estado.erro,
    carregando: estado.anotacoes === null && estado.erro === null,
    tentarNovamente,
    criar,
  }
}
