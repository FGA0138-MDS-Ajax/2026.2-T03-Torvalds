import { useEffect, useState } from 'react'
import { carregarAgenda } from './agendaApi'
import {
  categorizarEntrega,
  ehAtrasada,
  formatarPrazoDdMm,
} from './agendaUtils'
import './AgendaPage.css'

const COLUNAS = [
  { chave: 'A_FAZER', titulo: 'A fazer' },
  { chave: 'EM_ANDAMENTO', titulo: 'Em andamento' },
  { chave: 'CONCLUIDAS', titulo: 'Concluídas' },
]

export default function AgendaPage() {
  const [itens, setItens] = useState(null)
  const [erro, setErro] = useState(null)
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
          <div className="agenda-kanban">
            {COLUNAS.map((coluna) => {
              const atividadesDaColuna = itens.filter(
                (item) => categorizarEntrega(item) === coluna.chave,
              )

              return (
                <section
                  key={coluna.chave}
                  className="agenda-coluna"
                  aria-labelledby={`coluna-titulo-${coluna.chave}`}
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
                            className={
                              atrasada ? 'agenda-card atrasada' : 'agenda-card'
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
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
