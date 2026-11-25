import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import BarraProgresso from '../../shared/components/BarraProgresso'
import { alterarSituacaoEntrega, carregarDisciplina } from './disciplinaApi'
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
// A data de publicação vem como "aaaa-mm-dd"; montar o texto direto evita
// que o fuso horário mude o dia.
const formatarDia = (data) => {
  const [ano, mes, dia] = String(data ?? '').split('-')
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : ''
}

function ConteudoDisciplina({ id }) {
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState(null)
  const [tentativa, setTentativa] = useState(0)
  const [filtro, setFiltro] = useState('Todas')
  const [pendente, setPendente] = useState(null)
  const [erroAcao, setErroAcao] = useState(null)
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

  // Muda a tela na hora e volta ao estado anterior se a API recusar.
  async function alternarConclusao(entrega) {
    const anterior = entrega.status
    const novo = concluida(entrega) ? 'A_FAZER' : 'CONCLUIDA'
    const trocar = (status) =>
      setDados((atual) => ({
        ...atual,
        entregas: atual.entregas.map((item) =>
          item.id === entrega.id ? { ...item, status } : item,
        ),
      }))

    setErroAcao(null)
    setPendente(entrega.id)
    trocar(novo)
    try {
      await alterarSituacaoEntrega(entrega.id, novo)
    } catch (falha) {
      trocar(anterior)
      const acao = novo === 'CONCLUIDA' ? 'concluir' : 'desfazer'
      setErroAcao(
        `Não foi possível ${acao} “${entrega.titulo}”: ${falha.message}`,
      )
    } finally {
      setPendente(null)
    }
  }

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
  const { disciplina, entregas, materiais } = dados
  const concluidas = entregas.filter(concluida).length
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
        <div className="disciplina-cabecalho-texto">
          <h1>{disciplina.nome}</h1>
          <p>Período letivo · {disciplina.periodoLetivo}</p>
          <div className="disciplina-progresso">
            <BarraProgresso
              concluidas={concluidas}
              total={entregas.length}
              rotulo={`Progresso em ${disciplina.nome}`}
            />
          </div>
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
        {erroAcao && (
          <p className="disciplina-erro-acao" role="alert">
            {erroAcao}
          </p>
        )}
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
                  <div className="entrega-acoes">
                    <span className="entrega-status">{status}</span>
                    <button
                      type="button"
                      className="entrega-botao"
                      disabled={pendente === entrega.id}
                      onClick={() => alternarConclusao(entrega)}
                      aria-label={
                        concluida(entrega)
                          ? `Desfazer conclusão de ${entrega.titulo}`
                          : `Concluir ${entrega.titulo}`
                      }
                    >
                      {concluida(entrega) ? 'Desfazer' : 'Concluir'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
      <section
        className="disciplina-painel disciplina-materiais"
        aria-labelledby="materiais-titulo"
      >
        <div className="disciplina-titulo">
          <h2 id="materiais-titulo">Materiais</h2>
          {materiais && (
            <span>
              {materiais.length}{' '}
              {materiais.length === 1 ? 'material' : 'materiais'}
            </span>
          )}
        </div>
        {materiais === null ? (
          <p className="disciplina-vazio">
            Não foi possível carregar os materiais. Recarregue a página para
            tentar de novo.
          </p>
        ) : materiais.length === 0 ? (
          <p className="disciplina-vazio">Nenhum material publicado ainda.</p>
        ) : (
          <ul className="disciplina-lista-materiais">
            {materiais.map((material) => (
              <li key={material.id} className="material">
                <a
                  href={material.urlOuArquivo}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${material.titulo} (abre em nova aba)`}
                >
                  {material.titulo}
                  <span aria-hidden="true"> ↗</span>
                </a>
                <div className="entrega-meta">
                  <span>{material.tipo}</span>
                  <span>
                    Publicado em{' '}
                    <time dateTime={material.dataPublicacao}>
                      {formatarDia(material.dataPublicacao)}
                    </time>
                  </span>
                </div>
              </li>
            ))}
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
      <div className="disciplina-main">
        <Link className="disciplina-voltar" to="/materias">
          ← Voltar para matérias
        </Link>
        <ConteudoDisciplina key={id} id={id} />
      </div>
    </div>
  )
}
