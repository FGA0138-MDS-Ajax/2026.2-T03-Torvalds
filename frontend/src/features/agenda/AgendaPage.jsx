import { useEffect, useState } from 'react'
import { alterarSituacao, carregarAgenda } from './agendaApi'
import {
  categorizarEntrega,
  compararPrazo,
  ehAtrasada,
  formatarPrazoDdMm,
} from './agendaUtils'
import './AgendaPage.css'

// `chave` é a coluna em que o item aparece; `status` é o valor que a API recebe.
const COLUNAS = [
  { chave: 'A_FAZER', status: 'A_FAZER', titulo: 'A fazer' },
  { chave: 'EM_ANDAMENTO', status: 'EM_ANDAMENTO', titulo: 'Em andamento' },
  { chave: 'CONCLUIDAS', status: 'CONCLUIDA', titulo: 'Concluídas' },
]

export default function AgendaPage() {
  const [itens, setItens] = useState(null)
  const [erro, setErro] = useState(null)
  const [erroAcao, setErroAcao] = useState(null)
  const [alvo, setAlvo] = useState(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    carregarAgenda(controller.signal)
      .then((resultado) => {
        if (!controller.signal.aborted) {
          setItens(resultado || [])
        }
      })
      .catch((falha) => {
        if (!controller.signal.aborted) {
          setErro(falha)
        }
      })

    return () => controller.abort()
  }, [tentativa])

  function tentarDeNovo() {
    setErro(null)
    setItens(null)
    setTentativa((v) => v + 1)
  }

  function trocarStatus(id, status) {
    setItens((anteriores) =>
      anteriores.map((item) => (item.id === id ? { ...item, status } : item)),
    )
  }

  // Muda a situação na hora e desfaz com aviso se a API recusar (mesma regra da US05a).
  async function mover(id, status) {
    const atual = itens.find((item) => item.id === id)

    if (
      !atual ||
      categorizarEntrega(atual) === categorizarEntrega({ status })
    ) {
      return
    }

    setErroAcao(null)
    trocarStatus(id, status)

    try {
      await alterarSituacao(id, status)
    } catch (falha) {
      trocarStatus(id, atual.status)
      setErroAcao(
        `Não foi possível mover “${atual.titulo}”: ${
          falha.message || 'erro ao consultar a API.'
        }`,
      )
    }
  }

  function soltar(evento, status) {
    evento.preventDefault()
    setAlvo(null)

    const id = Number(evento.dataTransfer.getData('text/plain'))

    if (!Number.isNaN(id)) {
      mover(id, status)
    }
  }

  return (
    <div className="agenda-layout">
      <div className="agenda-main">
        <header className="agenda-cabecalho">
          <span className="agenda-icone" aria-hidden="true">
            📅
          </span>
          <div>
            <h1>Agenda</h1>
            <p>Organize seus compromissos acadêmicos e nunca perca um prazo.</p>
          </div>
        </header>

        {erro ? (
          <section className="agenda-painel-estado" role="alert">
            <h2>Não foi possível carregar a agenda</h2>
            <p>{erro.message || 'Erro ao consultar a API.'}</p>
            <button type="button" onClick={tentarDeNovo}>
              Tentar de novo
            </button>
          </section>
        ) : !itens ? (
          <div className="agenda-painel-estado">
            <p role="status">Carregando agenda...</p>
          </div>
        ) : itens.length === 0 ? (
          <div className="agenda-painel-estado">
            <p className="agenda-vazio">Nenhuma atividade na agenda.</p>
          </div>
        ) : (
          <>
            <p className="agenda-dica">
              Arraste um cartão para outra coluna ou use o seletor “Mover para”
              para mudar a situação da entrega.
            </p>
            {erroAcao && (
              <p className="agenda-erro-acao" role="alert">
                {erroAcao}
              </p>
            )}
            <div className="agenda-kanban">
              {COLUNAS.map((coluna) => {
                const atividadesDaColuna = itens
                  .filter((item) => categorizarEntrega(item) === coluna.chave)
                  .sort(compararPrazo)

                return (
                  <section
                    key={coluna.chave}
                    className={
                      alvo === coluna.chave
                        ? 'agenda-coluna agenda-coluna-alvo'
                        : 'agenda-coluna'
                    }
                    aria-labelledby={`coluna-titulo-${coluna.chave}`}
                    onDragOver={(evento) => {
                      evento.preventDefault()
                      setAlvo(coluna.chave)
                    }}
                    onDragLeave={() => setAlvo(null)}
                    onDrop={(evento) => soltar(evento, coluna.status)}
                  >
                    <div className="agenda-coluna-topo">
                      <h2 id={`coluna-titulo-${coluna.chave}`}>
                        {coluna.titulo}
                      </h2>
                      <span
                        className="agenda-coluna-contagem"
                        aria-label={`${atividadesDaColuna.length} atividades em ${coluna.titulo}`}
                      >
                        {atividadesDaColuna.length}
                      </span>
                    </div>

                    {atividadesDaColuna.length === 0 ? (
                      <p className="agenda-coluna-vazio">
                        Nenhuma atividade nesta coluna.
                      </p>
                    ) : (
                      <ul className="agenda-coluna-lista">
                        {atividadesDaColuna.map((item) => {
                          const atrasada = ehAtrasada(item)
                          return (
                            <li
                              key={item.id}
                              draggable
                              onDragStart={(evento) => {
                                evento.dataTransfer.setData(
                                  'text/plain',
                                  String(item.id),
                                )
                                evento.dataTransfer.effectAllowed = 'move'
                              }}
                              onDragEnd={() => setAlvo(null)}
                              className={
                                atrasada
                                  ? 'agenda-card atrasada'
                                  : 'agenda-card'
                              }
                            >
                              <h3>{item.titulo}</h3>
                              {item.descricao && <p>{item.descricao}</p>}
                              <div className="agenda-card-meta">
                                {item.disciplina && (
                                  <span className="agenda-badge-disciplina">
                                    {item.disciplina}
                                  </span>
                                )}
                                {item.tipo && (
                                  <span className="agenda-badge-tipo">
                                    {item.tipo}
                                  </span>
                                )}
                                {item.prazo && (
                                  <span className="agenda-prazo">
                                    Prazo: {formatarPrazoDdMm(item.prazo)}
                                    {atrasada && (
                                      <span
                                        className="agenda-alerta-atraso"
                                        role="status"
                                        aria-label="Atividade atrasada"
                                      >
                                        (Atrasada)
                                      </span>
                                    )}
                                  </span>
                                )}
                              </div>
                              <label className="agenda-mover">
                                <span aria-hidden="true">Mover para</span>
                                <select
                                  aria-label={`Mover ${item.titulo} para`}
                                  value={coluna.status}
                                  onChange={(evento) =>
                                    mover(item.id, evento.target.value)
                                  }
                                >
                                  {COLUNAS.map((opcao) => (
                                    <option
                                      key={opcao.status}
                                      value={opcao.status}
                                    >
                                      {opcao.titulo}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </section>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
