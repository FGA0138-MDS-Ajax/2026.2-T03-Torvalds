import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { carregarDisciplina } from './disciplinaApi'
import './PaginaDisciplina.css'

const concluida = (entrega) => entrega.status === 'CONCLUIDA'
const formatarData = (prazo) =>
  new Date(prazo).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

function ConteudoDisciplina({ id }) {
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState(null)
  const [tentativa, setTentativa] = useState(0)
  const [filtro, setFiltro] = useState('Todas')
  useEffect(() => {
    const controller = new AbortController()
    carregarDisciplina(id, controller.signal)
      .then((resultado) => {
        if (!controller.signal.aborted) setDados(resultado)
      })
      .catch((falha) => {
        if (!controller.signal.aborted) setErro(falha)
      })
    return () => controller.abort()
  }, [id, tentativa])

  if (erro)
    return (
      <section className="disciplina-painel" role="alert">
        <h1>Não foi possível carregar a disciplina</h1>
        <p>{erro.message}</p>
        <button
          onClick={() => {
            setErro(null)
            setTentativa(tentativa + 1)
          }}
        >
          Tentar novamente
        </button>
      </section>
    )
  if (!dados) return <p role="status">Carregando disciplina e entregas...</p>
  const { disciplina, entregas } = dados
  const visiveis = entregas.filter(
    (entrega) =>
      filtro === 'Todas' ||
      (filtro === 'Concluídas' ? concluida(entrega) : !concluida(entrega)),
  )
  return (
    <>
      <header className="disciplina-cabecalho">
        <span className="disciplina-icone" aria-hidden="true">
          ▤
        </span>
        <div>
          <h1>{disciplina.nome}</h1>
          <p>Período letivo · {disciplina.periodoLetivo}</p>
        </div>
      </header>
      <section className="disciplina-painel" aria-labelledby="entregas-titulo">
        <div className="disciplina-titulo">
          <h2 id="entregas-titulo">Entregas</h2>
          <span>{entregas.length} atividades</span>
        </div>
        <div
          className="disciplina-filtros"
          role="group"
          aria-label="Filtrar entregas"
        >
          {['Todas', 'A fazer', 'Concluídas'].map((opcao) => (
            <button
              key={opcao}
              aria-pressed={filtro === opcao}
              onClick={() => setFiltro(opcao)}
            >
              {opcao}
            </button>
          ))}
        </div>
        {visiveis.length === 0 ? (
          <p className="disciplina-vazio">
            {entregas.length === 0
              ? 'Nenhuma entrega encontrada.'
              : 'Nenhuma entrega neste filtro.'}
          </p>
        ) : (
          <ul className="disciplina-entregas">
            {visiveis.map((entrega, indice) => {
              const atrasada =
                !concluida(entrega) && new Date(entrega.prazo) < new Date()
              const status = concluida(entrega)
                ? 'Concluída'
                : atrasada
                  ? 'Atrasada'
                  : entrega.status === 'EM_ANDAMENTO'
                    ? 'Em andamento'
                    : 'A fazer'
              return (
                <li
                  key={entrega.id}
                  className={atrasada ? 'entrega atrasada' : 'entrega'}
                >
                  <span className="entrega-numero" aria-hidden="true">
                    {indice + 1}
                  </span>
                  <div className="entrega-conteudo">
                    <h3>{entrega.titulo}</h3>
                    <p>{entrega.descricao}</p>
                    <div className="entrega-meta">
                      <span>{entrega.tipo}</span>
                      <span>
                        Prazo:{' '}
                        <time dateTime={entrega.prazo}>
                          {formatarData(entrega.prazo)}
                        </time>
                      </span>
                    </div>
                  </div>
                  <span className="entrega-status">{status}</span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </>
  )
}

export default function PaginaDisciplina() {
  const { id } = useParams()
  return (
    <div className="disciplina-layout">
      <aside className="disciplina-sidebar">
        <div className="disciplina-marca">cAnCHA</div>
        <p>Seu caderno, agora digital!</p>
        <nav aria-label="Navegação principal">
          <Link to="/">⌂ Início</Link>
          <Link to="/materias">▤ Matérias</Link>
        </nav>
      </aside>
      <main className="disciplina-main">
        <Link className="disciplina-voltar" to="/materias">
          ← Voltar para matérias
        </Link>
        <ConteudoDisciplina key={id} id={id} />
      </main>
    </div>
  )
}
