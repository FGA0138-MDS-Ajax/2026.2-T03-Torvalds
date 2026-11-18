import { useEffect, useState } from 'react'
import { corDaDisciplina } from '../../shared/utils/coresDisciplina'
import { alterarSituacao, carregarAgenda } from './agendaApi'
import {
  agruparPorDia,
  categorizarEntrega,
  chaveDoDia,
  compararPrazo,
  descreverSemana,
  diasDaSemana,
  ehAtrasada,
  ehConcluida,
  formatarHora,
  formatarPrazoDdMm,
  inicioDaSemana,
  montarSemanas,
  nomeDoMes,
  rotuloDoStatus,
} from './agendaUtils'
import './AgendaPage.css'

const DIAS_DA_SEMANA = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']
const DIAS_POR_EXTENSO = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
]

// `chave` é a coluna em que o item aparece; `status` é o valor que a API recebe.
const COLUNAS = [
  { chave: 'A_FAZER', status: 'A_FAZER', titulo: 'A fazer' },
  { chave: 'EM_ANDAMENTO', status: 'EM_ANDAMENTO', titulo: 'Em andamento' },
  { chave: 'CONCLUIDAS', status: 'CONCLUIDA', titulo: 'Concluídas' },
]

function descreverStatus(item) {
  if (ehConcluida(item.status)) return 'concluída'
  if (ehAtrasada(item)) return 'atrasada'

  return 'a fazer'
}

function Chip({ item, cor }) {
  const classes = ['agenda-chip', `agenda-chip-${cor}`]

  if (ehConcluida(item.status)) classes.push('agenda-chip-concluida')
  if (ehAtrasada(item)) classes.push('agenda-chip-atrasada')

  return (
    <li
      className={classes.join(' ')}
      title={`${item.titulo} · ${item.disciplina ?? ''}`}
    >
      <span className="agenda-chip-tipo" aria-hidden="true">
        {item.tipo || 'Atividade'}
      </span>
      <span className="agenda-so-leitor">
        {item.titulo}, {item.disciplina}, {descreverStatus(item)}
      </span>
    </li>
  )
}

function Calendario({ ano, mes, porDia, corDe, hoje }) {
  const semanas = montarSemanas(ano, mes)
  const chaveDeHoje = chaveDoDia(hoje)

  return (
    <table className="agenda-tabela">
      <caption className="agenda-so-leitor">
        Calendário de {nomeDoMes(ano, mes)}
      </caption>
      <thead>
        <tr>
          {DIAS_DA_SEMANA.map((dia) => (
            <th key={dia} scope="col">
              {dia}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {semanas.map((semana) => (
          <tr key={semana[0].chave}>
            {semana.map((dia) => {
              // As atividades de outro mês aparecem só no calendário do mês delas.
              const itens = dia.foraDoMes ? [] : (porDia.get(dia.chave) ?? [])
              const classes = ['agenda-dia']

              if (dia.foraDoMes) classes.push('agenda-dia-fora')
              if (dia.chave === chaveDeHoje) classes.push('agenda-dia-hoje')

              return (
                <td key={dia.chave} className={classes.join(' ')}>
                  <span className="agenda-dia-numero">
                    {String(dia.data.getDate()).padStart(2, '0')}
                  </span>
                  {itens.length > 0 && (
                    <ul className="agenda-chips">
                      {itens.map((item) => (
                        <Chip
                          key={item.id}
                          item={item}
                          cor={corDe(item.disciplina)}
                        />
                      ))}
                    </ul>
                  )}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// Semana com mais detalhes: um dia por linha, com um cartão para cada entrega.
function SemanaDetalhada({ inicio, porDia, corDe, hoje }) {
  const chaveDeHoje = chaveDoDia(hoje)

  return (
    <div className="agenda-semana">
      {diasDaSemana(inicio).map((data, indice) => {
        const chave = chaveDoDia(data)
        const itens = porDia.get(chave) ?? []

        return (
          <section
            key={chave}
            className={`agenda-semana-dia${
              chave === chaveDeHoje ? ' agenda-dia-hoje' : ''
            }`}
            aria-label={`${DIAS_POR_EXTENSO[indice]}, ${formatarPrazoDdMm(data)}`}
          >
            <h3>
              {DIAS_POR_EXTENSO[indice]}
              <span>{formatarPrazoDdMm(data)}</span>
            </h3>
            {itens.length === 0 ? (
              <p className="agenda-semana-vazio">Sem atividades</p>
            ) : (
              <ul className="agenda-semana-cartoes">
                {itens.map((item) => (
                  <li
                    key={item.id}
                    className={`agenda-cartao agenda-chip-${corDe(
                      item.disciplina,
                    )}${ehConcluida(item.status) ? ' agenda-chip-concluida' : ''}${
                      ehAtrasada(item) ? ' agenda-chip-atrasada' : ''
                    }`}
                  >
                    <span className="agenda-cartao-hora">
                      {formatarHora(item.prazo)}
                    </span>
                    <strong>{item.titulo}</strong>
                    {item.descricao && <p>{item.descricao}</p>}
                    <span className="agenda-cartao-meta">
                      {item.disciplina} · {item.tipo}
                    </span>
                    <span className="agenda-cartao-status">
                      {rotuloDoStatus(item)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}

function ListaDoMes({ itens, corDe }) {
  if (itens.length === 0) {
    return <p className="agenda-vazio-mes">Nenhuma atividade neste mês.</p>
  }

  return (
    <ul className="agenda-lista">
      {itens.map((item) => (
        <li
          key={item.id}
          className={`agenda-lista-item agenda-chip-${corDe(item.disciplina)}${
            ehAtrasada(item) ? ' agenda-chip-atrasada' : ''
          }`}
        >
          <strong>{formatarPrazoDdMm(item.prazo)}</strong>
          <span className="agenda-lista-titulo">{item.titulo}</span>
          <span className="agenda-lista-meta">
            {item.disciplina} · {item.tipo} · {descreverStatus(item)}
          </span>
        </li>
      ))}
    </ul>
  )
}

function Filtro({ disciplinas, ocultas, corDe, aoAlternar }) {
  return (
    <section className="agenda-caixa">
      <h2>Filtrar por matéria</h2>
      {disciplinas.length === 0 ? (
        <p className="agenda-nota">Nenhuma matéria na agenda.</p>
      ) : (
        <ul className="agenda-filtro">
          {disciplinas.map((nome) => (
            <li key={nome}>
              <label>
                <input
                  type="checkbox"
                  checked={!ocultas.has(nome)}
                  onChange={() => aoAlternar(nome)}
                />
                <span
                  className={`agenda-ponto agenda-ponto-${corDe(nome)}`}
                  aria-hidden="true"
                />
                {nome}
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// Sem backend para criar atividades ainda: o formulário do protótipo aparece desativado.
function AdicionarTarefa() {
  return (
    <section className="agenda-caixa agenda-adicionar">
      <h2>Adicionar tarefas</h2>
      <p className="agenda-nota">
        <span className="agenda-em-breve">Em breve</span>
        Você poderá cadastrar suas próprias tarefas aqui.
      </p>
      <fieldset disabled>
        <label>
          Matéria
          <select>
            <option>Escolha a matéria</option>
          </select>
        </label>
        <label>
          Tipo
          <input type="text" placeholder="Entrega de trabalho" />
        </label>
        <label>
          Data de entrega
          <input type="text" placeholder="dd/mm/aaaa" />
        </label>
        <label>
          Observação
          <textarea rows="3" />
        </label>
        <button type="button">Adicionar</button>
      </fieldset>
    </section>
  )
}

// Quadro de três colunas: arrastar o cartão (ou o seletor "Mover para") muda a situação.
function Quadro({ itens, alvo, setAlvo, soltar, mover, erroAcao, corDe }) {
  return (
    <>
      <p className="agenda-dica">
        Arraste um cartão para outra coluna ou use o seletor “Mover para” para
        mudar a situação da entrega.
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
                <h2 id={`coluna-titulo-${coluna.chave}`}>{coluna.titulo}</h2>
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
                          atrasada ? 'agenda-card atrasada' : 'agenda-card'
                        }
                      >
                        <h3>{item.titulo}</h3>
                        {item.descricao && <p>{item.descricao}</p>}
                        <div className="agenda-card-meta">
                          {item.disciplina && (
                            <span
                              className={`agenda-badge-disciplina agenda-chip-${corDe(item.disciplina)}`}
                            >
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
                              <option key={opcao.status} value={opcao.status}>
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
  )
}

export default function AgendaPage() {
  const [itens, setItens] = useState(null)
  const [erro, setErro] = useState(null)
  const [erroAcao, setErroAcao] = useState(null)
  const [alvo, setAlvo] = useState(null)
  const [tentativa, setTentativa] = useState(0)
  const [vista, setVista] = useState('mes')
  const [mostrado, setMostrado] = useState(() => {
    const hoje = new Date()

    return { ano: hoje.getFullYear(), mes: hoje.getMonth() }
  })
  const [semana, setSemana] = useState(() => inicioDaSemana(new Date()))
  const [ocultas, setOcultas] = useState(() => new Set())

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

  function mudarMes(passo) {
    setMostrado(({ ano, mes }) => {
      const data = new Date(ano, mes + passo, 1)

      return { ano: data.getFullYear(), mes: data.getMonth() }
    })
  }

  function mudarSemana(passo) {
    setSemana(
      (inicio) =>
        new Date(
          inicio.getFullYear(),
          inicio.getMonth(),
          inicio.getDate() + passo * 7,
        ),
    )
  }

  function navegar(passo) {
    if (vista === 'semana') mudarSemana(passo)
    else mudarMes(passo)
  }

  // Ao trocar de vista, a nova começa no período que o aluno estava olhando.
  function escolherVista(nova) {
    if (nova === 'semana' && vista !== 'semana') {
      const hoje = new Date()
      const nesteMes =
        hoje.getFullYear() === mostrado.ano && hoje.getMonth() === mostrado.mes

      setSemana(
        inicioDaSemana(
          nesteMes ? hoje : new Date(mostrado.ano, mostrado.mes, 1),
        ),
      )
    } else if (nova !== 'semana' && vista === 'semana') {
      // Se a semana tem o dia de hoje, vale o mês de hoje; senão, o da quinta-feira.
      const dias = diasDaSemana(semana)
      const chaveDeHoje = chaveDoDia(new Date())
      const referencia =
        dias.find((dia) => chaveDoDia(dia) === chaveDeHoje) ?? dias[3]

      setMostrado({
        ano: referencia.getFullYear(),
        mes: referencia.getMonth(),
      })
    }
    setVista(nova)
  }

  function alternarMateria(nome) {
    setOcultas((anteriores) => {
      const novas = new Set(anteriores)

      if (novas.has(nome)) novas.delete(nome)
      else novas.add(nome)

      return novas
    })
  }

  let conteudo

  if (erro) {
    conteudo = (
      <section className="agenda-painel-estado" role="alert">
        <h2>Não foi possível carregar a agenda</h2>
        <p>{erro.message || 'Erro ao consultar a API.'}</p>
        <button type="button" onClick={tentarDeNovo}>
          Tentar de novo
        </button>
      </section>
    )
  } else if (!itens) {
    conteudo = (
      <div className="agenda-painel-estado">
        <p role="status">Carregando agenda...</p>
      </div>
    )
  } else if (itens.length === 0) {
    conteudo = (
      <div className="agenda-painel-estado">
        <p className="agenda-vazio">Nenhuma atividade na agenda.</p>
      </div>
    )
  } else {
    const disciplinas = [
      ...new Set(itens.map((item) => item.disciplina).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b, 'pt-BR'))
    const corDe = (nome) => corDaDisciplina(nome, disciplinas.indexOf(nome))
    const visiveis = itens.filter((item) => !ocultas.has(item.disciplina))
    const porDia = agruparPorDia(visiveis)
    const doMes = visiveis
      .filter((item) => {
        const data = new Date(item.prazo)

        return (
          data.getFullYear() === mostrado.ano &&
          data.getMonth() === mostrado.mes
        )
      })
      .sort((a, b) => new Date(a.prazo) - new Date(b.prazo))

    conteudo = (
      <div
        className={`agenda-grade${vista === 'quadro' ? ' agenda-grade-quadro' : ''}`}
      >
        <section className="agenda-calendario" aria-label="Calendário">
          <div className="agenda-barra">
            <div className="agenda-vistas" role="group" aria-label="Vista">
              <button
                type="button"
                aria-pressed={vista === 'mes'}
                onClick={() => escolherVista('mes')}
              >
                Mês
              </button>
              <button
                type="button"
                aria-pressed={vista === 'semana'}
                onClick={() => escolherVista('semana')}
              >
                Semana
              </button>
              <button
                type="button"
                aria-pressed={vista === 'lista'}
                onClick={() => escolherVista('lista')}
              >
                Lista
              </button>
              <button
                type="button"
                aria-pressed={vista === 'quadro'}
                onClick={() => escolherVista('quadro')}
              >
                Quadro
              </button>
            </div>
            {vista !== 'quadro' && (
              <div className="agenda-navegacao">
                <button
                  type="button"
                  aria-label={
                    vista === 'semana' ? 'Semana anterior' : 'Mês anterior'
                  }
                  onClick={() => navegar(-1)}
                >
                  ‹
                </button>
                <h2 aria-live="polite">
                  {vista === 'semana'
                    ? descreverSemana(semana)
                    : nomeDoMes(mostrado.ano, mostrado.mes)}
                </h2>
                <button
                  type="button"
                  aria-label={
                    vista === 'semana' ? 'Próxima semana' : 'Próximo mês'
                  }
                  onClick={() => navegar(1)}
                >
                  ›
                </button>
              </div>
            )}
          </div>
          {vista === 'quadro' ? (
            <Quadro
              itens={itens}
              alvo={alvo}
              setAlvo={setAlvo}
              soltar={soltar}
              mover={mover}
              erroAcao={erroAcao}
              corDe={corDe}
            />
          ) : vista === 'mes' ? (
            <Calendario
              ano={mostrado.ano}
              mes={mostrado.mes}
              porDia={porDia}
              corDe={corDe}
              hoje={new Date()}
            />
          ) : vista === 'semana' ? (
            <SemanaDetalhada
              inicio={semana}
              porDia={porDia}
              corDe={corDe}
              hoje={new Date()}
            />
          ) : (
            <ListaDoMes itens={doMes} corDe={corDe} />
          )}
        </section>
        {vista !== 'quadro' && (
          <aside className="agenda-lateral">
            <Filtro
              disciplinas={disciplinas}
              ocultas={ocultas}
              corDe={corDe}
              aoAlternar={alternarMateria}
            />
            <AdicionarTarefa />
          </aside>
        )}
      </div>
    )
  }

  return (
    <div className="agenda-pagina">
      <h1>Agenda</h1>
      <p className="agenda-subtitulo">
        Organize seus compromissos acadêmicos e nunca perca um prazo.
      </p>
      {conteudo}
    </div>
  )
}
