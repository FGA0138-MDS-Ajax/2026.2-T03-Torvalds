import { useLayoutEffect, useRef, useState } from 'react'
import { Carregando, ErroCarregamento } from '../../shared/components/Estados'
import { envolver, prefixarLinhas } from './formatacao'
import TextoFormatado from './TextoFormatado'
import { useAnotacoes } from './useAnotacoes'

const doisDigitos = (numero) => String(numero).padStart(2, '0')

// Montado à mão (e não com toLocaleString) para sair igual em qualquer navegador.
function formatarDataHora(valor) {
  const data = new Date(valor)

  if (!valor || Number.isNaN(data.getTime())) return ''

  const dia = `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}/${data.getFullYear()}`

  return `${dia} - ${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`
}

const contem = (anotacao, busca) =>
  `${anotacao.titulo} ${anotacao.texto}`
    .toLocaleLowerCase('pt-BR')
    .includes(busca.trim().toLocaleLowerCase('pt-BR'))

/**
 * Caderno da matéria no estilo Notion: cada anotação é uma linha com a setinha
 * e o título; clicar abre (▾) ou fecha (▸) o conteúdo, e várias podem ficar
 * abertas ao mesmo tempo.
 */
export default function CadernoDaDisciplina({ disciplinaId, busca }) {
  const { anotacoes, erro, carregando, tentarNovamente, criar } =
    useAnotacoes(disciplinaId)
  // null = ainda no padrão (só a primeira anotação aberta).
  const [abertasIds, setAbertasIds] = useState(null)
  const [criando, setCriando] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erroForm, setErroForm] = useState(null)
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

  if (carregando) return <Carregando mensagem="Carregando anotações…" />

  if (erro) {
    return (
      <ErroCarregamento
        titulo="Não foi possível carregar as anotações"
        mensagem={erro.message}
        aoTentarNovamente={tentarNovamente}
      />
    )
  }

  const visiveis = anotacoes.filter(
    (anotacao) => !busca.trim() || contem(anotacao, busca),
  )
  const abertas = abertasIds ?? new Set(visiveis.slice(0, 1).map((a) => a.id))

  function alternar(id) {
    const novas = new Set(abertas)

    if (novas.has(id)) novas.delete(id)
    else novas.add(id)

    setAbertasIds(novas)
  }

  function formatar(aplicar) {
    const campo = campoTexto.current
    const resultado = aplicar(texto, campo.selectionStart, campo.selectionEnd)

    selecaoPendente.current = { inicio: resultado.inicio, fim: resultado.fim }
    setTexto(resultado.texto)
  }

  function abrirFormulario() {
    setErroForm(null)
    setCriando(true)
  }

  function cancelar() {
    setErroForm(null)
    setCriando(false)
  }

  async function salvar(evento) {
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
      const nova = await criar({ titulo: tituloLimpo, texto: textoLimpo })

      setAbertasIds(new Set([...abertas, nova.id]))
      setTitulo('')
      setTexto('')
      setCriando(false)
    } catch (falha) {
      // Mantém o que foi digitado para o aluno tentar de novo.
      setErroForm(`Não foi possível salvar a anotação: ${falha.message}`)
    } finally {
      setEnviando(false)
    }
  }

  const formulario = criando && (
    <form className="anot-form" onSubmit={salvar} noValidate>
      <h2>Nova anotação</h2>
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
      {erroForm && (
        <p className="anot-erro" role="alert">
          {erroForm}
        </p>
      )}
      <div className="anot-form-acoes">
        <button type="submit" disabled={enviando}>
          {enviando ? 'Salvando…' : 'Salvar anotação'}
        </button>
        <button type="button" onClick={cancelar} disabled={enviando}>
          Cancelar
        </button>
      </div>
    </form>
  )

  return (
    <div className="anot-caderno">
      {criando ? (
        formulario
      ) : (
        <button type="button" className="anot-nova" onClick={abrirFormulario}>
          <span aria-hidden="true">+</span> Nova anotação
        </button>
      )}

      {visiveis.length === 0 ? (
        <p className="anot-vazio">
          {anotacoes.length === 0
            ? 'Nenhuma anotação ainda. Use o botão + Nova anotação para criar a primeira.'
            : 'Nenhuma anotação encontrada para essa busca.'}
        </p>
      ) : (
        <ul className="anot-lista">
          {visiveis.map((anotacao) => {
            const aberta = abertas.has(anotacao.id)
            const data = formatarDataHora(anotacao.criadaEm)

            return (
              <li
                key={anotacao.id}
                className={aberta ? 'anot-item anot-item-aberto' : 'anot-item'}
              >
                <h3 className="anot-item-titulo">
                  <button
                    type="button"
                    className="anot-alternar"
                    aria-expanded={aberta}
                    aria-controls={`anot-conteudo-${anotacao.id}`}
                    onClick={() => alternar(anotacao.id)}
                  >
                    <span className="anot-seta" aria-hidden="true">
                      ▸
                    </span>
                    <span className="anot-item-nome">{anotacao.titulo}</span>
                  </button>
                </h3>
                {aberta && (
                  <div
                    id={`anot-conteudo-${anotacao.id}`}
                    className="anot-conteudo"
                  >
                    {data && <time dateTime={anotacao.criadaEm}>{data}</time>}
                    <div className="anot-texto">
                      <TextoFormatado texto={anotacao.texto} />
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
