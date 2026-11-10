import { useEffect, useState } from 'react'
import { corDaDisciplina } from '../../shared/utils/coresDisciplina'
import { carregarAgenda } from './agendaApi'
import {
  agruparPorDia,
  chaveDoDia,
  ehAtrasada,
  ehConcluida,
  formatarPrazoDdMm,
  montarSemanas,
  nomeDoMes,
} from './agendaUtils'
import './AgendaPage.css'

const DIAS_DA_SEMANA = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']

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

export default function AgendaPage() {
  const [itens, setItens] = useState(null)
  const [erro, setErro] = useState(null)
  const [tentativa, setTentativa] = useState(0)
  const [vista, setVista] = useState('mes')
  const [mostrado, setMostrado] = useState(() => {
    const hoje = new Date()

    return { ano: hoje.getFullYear(), mes: hoje.getMonth() }
  })
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

  function mudarMes(passo) {
    setMostrado(({ ano, mes }) => {
      const data = new Date(ano, mes + passo, 1)

      return { ano: data.getFullYear(), mes: data.getMonth() }
    })
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
      <div className="agenda-grade">
        <section className="agenda-calendario" aria-label="Calendário">
          <div className="agenda-barra">
            <div className="agenda-vistas" role="group" aria-label="Vista">
              <button
                type="button"
                aria-pressed={vista === 'mes'}
                onClick={() => setVista('mes')}
              >
                Mês
              </button>
              <button type="button" disabled title="Em breve">
                Semana
              </button>
              <button
                type="button"
                aria-pressed={vista === 'lista'}
                onClick={() => setVista('lista')}
              >
                Lista
              </button>
            </div>
            <div className="agenda-navegacao">
              <button
                type="button"
                aria-label="Mês anterior"
                onClick={() => mudarMes(-1)}
              >
                ‹
              </button>
              <h2 aria-live="polite">
                {nomeDoMes(mostrado.ano, mostrado.mes)}
              </h2>
              <button
                type="button"
                aria-label="Próximo mês"
                onClick={() => mudarMes(1)}
              >
                ›
              </button>
            </div>
          </div>
          {vista === 'mes' ? (
            <Calendario
              ano={mostrado.ano}
              mes={mostrado.mes}
              porDia={porDia}
              corDe={corDe}
              hoje={new Date()}
            />
          ) : (
            <ListaDoMes itens={doMes} corDe={corDe} />
          )}
        </section>
        <aside className="agenda-lateral">
          <Filtro
            disciplinas={disciplinas}
            ocultas={ocultas}
            corDe={corDe}
            aoAlternar={alternarMateria}
          />
          <AdicionarTarefa />
        </aside>
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
