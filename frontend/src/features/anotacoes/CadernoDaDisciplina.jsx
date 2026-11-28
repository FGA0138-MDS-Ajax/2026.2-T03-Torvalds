import { useState } from 'react'
import { Carregando, ErroCarregamento } from '../../shared/components/Estados'
import FormularioAnotacao from './FormularioAnotacao'
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
  const {
    anotacoes,
    erro,
    carregando,
    tentarNovamente,
    criar,
    atualizar,
    excluir,
  } = useAnotacoes(disciplinaId)
  // null = ainda no padrão (só a primeira anotação aberta).
  const [abertasIds, setAbertasIds] = useState(null)
  const [criando, setCriando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [confirmandoId, setConfirmandoId] = useState(null)
  const [excluindo, setExcluindo] = useState(false)
  const [erroExcluir, setErroExcluir] = useState(null)

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

  function abrirFormulario() {
    setEditandoId(null)
    setConfirmandoId(null)
    setCriando(true)
  }

  async function salvarNova(dados) {
    const nova = await criar(dados)

    setAbertasIds(new Set([...abertas, nova.id]))
    setCriando(false)
  }

  async function salvarEdicao(id, dados) {
    await atualizar(id, dados)
    setEditandoId(null)
  }

  function pedirConfirmacao(id) {
    setErroExcluir(null)
    setConfirmandoId(id)
  }

  async function confirmarExclusao(id) {
    setExcluindo(true)
    setErroExcluir(null)

    try {
      await excluir(id)
      setConfirmandoId(null)
    } catch (falha) {
      setErroExcluir(`Não foi possível excluir a anotação: ${falha.message}`)
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <div className="anot-caderno">
      {criando ? (
        <FormularioAnotacao
          cabecalho="Nova anotação"
          rotuloSalvar="Salvar anotação"
          aoSalvar={salvarNova}
          aoCancelar={() => setCriando(false)}
        />
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
                {aberta &&
                  (editandoId === anotacao.id ? (
                    <FormularioAnotacao
                      titulo={anotacao.titulo}
                      texto={anotacao.texto}
                      cabecalho="Editar anotação"
                      rotuloSalvar="Salvar alterações"
                      aoSalvar={(dados) => salvarEdicao(anotacao.id, dados)}
                      aoCancelar={() => setEditandoId(null)}
                    />
                  ) : (
                    <div
                      id={`anot-conteudo-${anotacao.id}`}
                      className="anot-conteudo"
                    >
                      {data && <time dateTime={anotacao.criadaEm}>{data}</time>}
                      <div className="anot-texto">
                        <TextoFormatado texto={anotacao.texto} />
                      </div>
                      {confirmandoId === anotacao.id ? (
                        <div
                          className="anot-confirmar"
                          role="group"
                          aria-label={`Excluir ${anotacao.titulo}`}
                        >
                          <p>
                            Excluir a anotação “{anotacao.titulo}”? Isso não
                            pode ser desfeito.
                          </p>
                          {erroExcluir && (
                            <p className="anot-erro" role="alert">
                              {erroExcluir}
                            </p>
                          )}
                          <div className="anot-form-acoes">
                            <button
                              type="button"
                              className="anot-perigo"
                              disabled={excluindo}
                              onClick={() => confirmarExclusao(anotacao.id)}
                            >
                              {excluindo ? 'Excluindo…' : 'Sim, excluir'}
                            </button>
                            <button
                              type="button"
                              disabled={excluindo}
                              onClick={() => setConfirmandoId(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="anot-acoes">
                          <button
                            type="button"
                            aria-label={`Editar ${anotacao.titulo}`}
                            onClick={() => {
                              setCriando(false)
                              setConfirmandoId(null)
                              setEditandoId(anotacao.id)
                            }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="anot-perigo"
                            aria-label={`Excluir ${anotacao.titulo}`}
                            onClick={() => pedirConfirmacao(anotacao.id)}
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
