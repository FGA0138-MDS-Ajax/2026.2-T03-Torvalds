import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import BarraProgresso from '../../shared/components/BarraProgresso'
import { corDaDisciplina } from '../../shared/utils/coresDisciplina'
import { alterarSituacaoEntrega, carregarDisciplina } from './disciplinaApi'
import {
  categoriaDaEntrega,
  contarPorCategoria,
  descreverPrazo,
  estaAtrasada,
  ordenarPorUrgencia,
  resumirPendencias,
} from './disciplinaUtils'
import '../materias/MateriasPage.css'
import './PaginaDisciplina.css'

const FILTROS = [
  { chave: 'todas', titulo: 'Todas' },
  { chave: 'afazer', titulo: 'A fazer' },
  { chave: 'andamento', titulo: 'Em andamento' },
  { chave: 'concluida', titulo: 'Concluídas' },
]

const SITUACAO = {
  afazer: { texto: 'A fazer', classe: 'rosa' },
  andamento: { texto: 'Em andamento', classe: 'amarelo' },
  concluida: { texto: 'Concluída', classe: 'verde' },
}

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

function Entrega({ entrega, numero, agora, pendente, onAlternar }) {
  const categoria = categoriaDaEntrega(entrega)
  const atrasada = estaAtrasada(entrega, agora)
  const situacao = SITUACAO[categoria]
  const feita = categoria === 'concluida'

  return (
    <li
      className={`entrega entrega-${situacao.classe}${
        atrasada ? ' entrega-atrasada' : ''
      }`}
    >
      <span className="entrega-numero" aria-hidden="true">
        {numero}
      </span>
      <div className="entrega-conteudo">
        <h3>{entrega.titulo}</h3>
        <p>{entrega.descricao}</p>
        <div className="entrega-meta">
          <span>{entrega.tipo}</span>
          <span>
            Prazo:{' '}
            <time dateTime={entrega.prazo}>{formatarData(entrega.prazo)}</time>
          </span>
          {!feita && (
            <strong className="entrega-prazo-texto">
              {descreverPrazo(entrega.prazo, agora)}
            </strong>
          )}
        </div>
      </div>
      <div className="entrega-selos">
        <span className={`entrega-status entrega-status-${situacao.classe}`}>
          {situacao.texto}
        </span>
        {atrasada && <span className="entrega-aviso">Atrasada</span>}
        <button
          type="button"
          className="entrega-botao"
          disabled={pendente}
          onClick={() => onAlternar(entrega)}
          aria-label={
            feita
              ? `Desfazer conclusão de ${entrega.titulo}`
              : `Concluir ${entrega.titulo}`
          }
        >
          {feita ? 'Desfazer' : 'Concluir'}
        </button>
      </div>
    </li>
  )
}

function ConteudoDisciplina({ id }) {
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState(null)
  const [tentativa, setTentativa] = useState(0)
  const [filtro, setFiltro] = useState('todas')
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
  const { disciplina, entregas, materiais, indice } = dados
  const agora = new Date()
  const cor = corDaDisciplina(disciplina.nome, indice)
  const contagem = contarPorCategoria(entregas)
  const pendencias = resumirPendencias(entregas, agora)
  const visiveis = ordenarPorUrgencia(
    entregas.filter(
      (entrega) => filtro === 'todas' || categoriaDaEntrega(entrega) === filtro,
    ),
    agora,
  )

  return (
    <div className={`disciplina-pagina materia-detalhe-${cor}`}>
      <header className="disciplina-cabecalho">
        <span className="disciplina-icone" aria-hidden="true">
          ▤
        </span>
        <div className="disciplina-cabecalho-texto">
          <h1>{disciplina.nome}</h1>
          <p>Período letivo · {disciplina.periodoLetivo}</p>
          <BarraProgresso
            concluidas={contagem.concluida}
            total={contagem.todas}
            rotulo={`Progresso em ${disciplina.nome}`}
          />
          {pendencias && <p className="disciplina-pendencias">{pendencias}</p>}
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
          {FILTROS.map((opcao) => (
            <button
              key={opcao.chave}
              type="button"
              aria-pressed={filtro === opcao.chave}
              onClick={() => setFiltro(opcao.chave)}
            >
              {opcao.titulo} ({contagem[opcao.chave]})
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
            {visiveis.map((entrega, posicao) => (
              <Entrega
                key={entrega.id}
                entrega={entrega}
                numero={posicao + 1}
                agora={agora}
                pendente={pendente === entrega.id}
                onAlternar={alternarConclusao}
              />
            ))}
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
    </div>
  )
}

export default function PaginaDisciplina() {
  const { id } = useParams()
  return (
    <div className="disciplina-layout">
      <div className="disciplina-main">
        <Link className="disciplina-voltar" to={`/materias?materia=${id}`}>
          ← Voltar para a matéria
        </Link>
        <ConteudoDisciplina key={id} id={id} />
      </div>
    </div>
  )
}
