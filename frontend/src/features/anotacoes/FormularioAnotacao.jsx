import { useLayoutEffect, useRef, useState } from 'react'
import { envolver, prefixarLinhas } from './formatacao'

/**
 * Formulário de anotação, para criar ou editar: título, texto e a barra de
 * formatação. `aoSalvar` recebe `{ titulo, texto }` e devolve uma promessa; se
 * ela falhar, o que foi digitado fica para o aluno tentar de novo.
 */
export default function FormularioAnotacao({
  titulo: tituloInicial = '',
  texto: textoInicial = '',
  cabecalho,
  rotuloSalvar,
  aoSalvar,
  aoCancelar,
}) {
  const [titulo, setTitulo] = useState(tituloInicial)
  const [texto, setTexto] = useState(textoInicial)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const campoTexto = useRef(null)
  const selecaoPendente = useRef(null)

  // Depois de aplicar uma marcação, devolve o foco ao campo com o trecho selecionado.
  useLayoutEffect(() => {
    const selecao = selecaoPendente.current

    if (selecao && campoTexto.current) {
      campoTexto.current.focus()
      campoTexto.current.setSelectionRange(selecao.inicio, selecao.fim)
      selecaoPendente.current = null
    }
  }, [texto])

  function formatar(aplicar) {
    const campo = campoTexto.current
    const resultado = aplicar(texto, campo.selectionStart, campo.selectionEnd)

    selecaoPendente.current = { inicio: resultado.inicio, fim: resultado.fim }
    setTexto(resultado.texto)
  }

  async function salvar(evento) {
    evento.preventDefault()

    const tituloLimpo = titulo.trim()
    const textoLimpo = texto.trim()

    if (!tituloLimpo || !textoLimpo) {
      setErro('Preencha o título e o texto da anotação.')
      return
    }

    setErro(null)
    setEnviando(true)

    try {
      await aoSalvar({ titulo: tituloLimpo, texto: textoLimpo })
    } catch (falha) {
      setErro(`Não foi possível salvar a anotação: ${falha.message}`)
      setEnviando(false)
    }
  }

  return (
    <form className="anot-form" onSubmit={salvar} noValidate>
      <h2>{cabecalho}</h2>
      <label>
        Título
        <input
          type="text"
          value={titulo}
          maxLength={120}
          onChange={(evento) => setTitulo(evento.target.value)}
        />
      </label>
      <label>
        Texto
        <textarea
          ref={campoTexto}
          rows="10"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
        />
      </label>
      <div className="anot-barra" role="toolbar" aria-label="Formatação">
        <button
          type="button"
          aria-label="Negrito"
          title="Negrito"
          onClick={() => formatar((t, i, f) => envolver(t, i, f, '**'))}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          aria-label="Marca-texto"
          title="Marca-texto"
          onClick={() => formatar((t, i, f) => envolver(t, i, f, '=='))}
        >
          <mark>ab</mark>
        </button>
        <button
          type="button"
          aria-label="Transformar em título"
          title="Transformar em título"
          onClick={() => formatar((t, i, f) => prefixarLinhas(t, i, f, '# '))}
        >
          T
        </button>
        <button
          type="button"
          aria-label="Transformar em lista"
          title="Transformar em lista"
          onClick={() => formatar((t, i, f) => prefixarLinhas(t, i, f, '- '))}
        >
          •
        </button>
      </div>
      <p className="anot-dica">
        Dica: **negrito**, ==marca-texto==, # título e - lista.
      </p>
      {erro && (
        <p className="anot-erro" role="alert">
          {erro}
        </p>
      )}
      <div className="anot-form-acoes">
        <button type="submit" disabled={enviando}>
          {enviando ? 'Salvando…' : rotuloSalvar}
        </button>
        <button type="button" onClick={aoCancelar} disabled={enviando}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
