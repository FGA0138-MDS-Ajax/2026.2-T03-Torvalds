import { useEffect, useState } from 'react'

/**
 * Executa uma consulta à API e devolve o estado dela: `carregando`, `erro`
 * ou `dados`. `tentarNovamente` refaz a consulta.
 *
 * `carregar` recebe um AbortSignal e precisa ser uma função estável (declarada
 * fora do componente, ou dentro de um useCallback).
 */
export function useRequisicao(carregar) {
  const [estado, setEstado] = useState({ dados: null, erro: null })
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    carregar(controller.signal)
      .then((dados) => {
        if (!controller.signal.aborted) {
          setEstado({ dados: dados ?? [], erro: null })
        }
      })
      .catch((erro) => {
        if (!controller.signal.aborted) {
          setEstado({ dados: null, erro })
        }
      })

    return () => controller.abort()
  }, [carregar, tentativa])

  function tentarNovamente() {
    setEstado({ dados: null, erro: null })
    setTentativa((valor) => valor + 1)
  }

  return {
    dados: estado.dados,
    erro: estado.erro,
    carregando: estado.dados === null && estado.erro === null,
    tentarNovamente,
  }
}
