import { useEffect, useState } from 'react'
import TextoFormatado from '../anotacoes/TextoFormatado'
import { criarAnotacao, listarAnotacoes } from './anotacoesApi'
import './AnotacoesDisciplina.css'

const LIMITE_TITULO = 120

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

export default function AnotacoesDisciplina({ disciplinaId }) {
  const [anotacoes, setAnotacoes] = useState(null)
  const [erroCarga, setErroCarga] = useState(null)
  const [tentativa, setTentativa] = useState(0)
  const [titulo, setTitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erroForm, setErroForm] = useState(null)

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

  async function enviar(evento) {
    evento.preventDefault()

    const tituloLimpo = titulo.trim()
    const textoLimpo = texto.trim()

    if (!tituloLimpo || !textoLimpo) {
      setErroForm('Preencha o título e o texto da anotação.')
      return
    }

    setErroForm(null)
    setEnviando(true)

    try {
      const criada = await criarAnotacao(disciplinaId, {
        titulo: tituloLimpo,
        texto: textoLimpo,
      })

      setAnotacoes((atuais) => [
        { criadaEm: new Date().toISOString(), ...criada },
        ...(atuais ?? []),
      ])
      setTitulo('')
      setTexto('')
    } catch (falha) {
      // Mantém o que foi digitado para o aluno tentar de novo sem perder o texto.
      setErroForm(`Não foi possível salvar a anotação: ${falha.message}`)
    } finally {
      setEnviando(false)
    }
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

      <form className="anotacoes-form" onSubmit={enviar} noValidate>
        <label>
          Título
          <input
            type="text"
            value={titulo}
            maxLength={LIMITE_TITULO}
            onChange={(evento) => setTitulo(evento.target.value)}
          />
        </label>
        <label>
          Texto
          <textarea
            rows="4"
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
          />
        </label>
        {erroForm && (
          <p className="disciplina-erro-acao" role="alert">
            {erroForm}
          </p>
        )}
        <button type="submit" className="anotacao-botao" disabled={enviando}>
          {enviando ? 'Salvando...' : 'Adicionar anotação'}
        </button>
      </form>

      {lista}
    </section>
  )
}
