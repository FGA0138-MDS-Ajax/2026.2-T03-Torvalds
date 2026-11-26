import { useEffect, useState } from 'react'
import TextoFormatado from '../anotacoes/TextoFormatado'
import { listarAnotacoes } from './anotacoesApi'
import './AnotacoesDisciplina.css'

const formatarDataHora = (valor) => {
  const data = new Date(valor)

  return valor && !Number.isNaN(data.getTime())
    ? data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''
}

// A mais recente primeiro. Sem data na resposta, mantém a ordem da API.
const maisRecentePrimeiro = (a, b) =>
  new Date(b.criadaEm ?? 0).getTime() - new Date(a.criadaEm ?? 0).getTime()

// Aqui as anotações são só para ler; criar e organizar fica na tela Anotações.
export default function AnotacoesDisciplina({ disciplinaId }) {
  const [anotacoes, setAnotacoes] = useState(null)
  const [erroCarga, setErroCarga] = useState(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    listarAnotacoes(disciplinaId, controller.signal)
      .then((lista) => {
        if (!controller.signal.aborted)
          setAnotacoes([...lista].sort(maisRecentePrimeiro))
      })
      .catch((falha) => {
        if (!controller.signal.aborted) setErroCarga(falha)
      })

    return () => controller.abort()
  }, [disciplinaId, tentativa])

  function tentarDeNovo() {
    setErroCarga(null)
    setAnotacoes(null)
    setTentativa((atual) => atual + 1)
  }

  let lista

  if (erroCarga) {
    lista = (
      <div role="alert">
        <p className="disciplina-vazio">
          Não foi possível carregar as anotações: {erroCarga.message}
        </p>
        <button type="button" className="anotacao-botao" onClick={tentarDeNovo}>
          Tentar novamente
        </button>
      </div>
    )
  } else if (!anotacoes) {
    lista = <p role="status">Carregando anotações...</p>
  } else if (anotacoes.length === 0) {
    lista = <p className="disciplina-vazio">Nenhuma anotação ainda.</p>
  } else {
    lista = (
      <ul className="anotacoes-lista">
        {anotacoes.map((anotacao) => (
          <li key={anotacao.id} className="anotacao">
            <h3>{anotacao.titulo}</h3>
            <TextoFormatado texto={anotacao.texto} />
            {formatarDataHora(anotacao.criadaEm) && (
              <time className="anotacao-data" dateTime={anotacao.criadaEm}>
                {formatarDataHora(anotacao.criadaEm)}
              </time>
            )}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section
      className="disciplina-painel disciplina-anotacoes"
      aria-labelledby="anotacoes-titulo"
    >
      <div className="disciplina-titulo">
        <h2 id="anotacoes-titulo">Anotações</h2>
        {anotacoes && (
          <span>
            {anotacoes.length}{' '}
            {anotacoes.length === 1 ? 'anotação' : 'anotações'}
          </span>
        )}
      </div>

      {lista}
    </section>
  )
}
