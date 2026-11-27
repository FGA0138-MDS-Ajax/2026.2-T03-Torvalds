import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import BarraProgresso from '../../shared/components/BarraProgresso'
import Icone from '../../shared/layout/Icone'
import { corDaDisciplina } from '../../shared/utils/coresDisciplina'
import AnotacoesDisciplina from './AnotacoesDisciplina'
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

// Depois de concluir (ou desfazer), a entrega fica no lugar por este tempo, com
// um destaque, antes de a lista se reorganizar. Sem isso a próxima entrega
// assumia o lugar na hora e o aluno não via o que tinha acontecido.
const TEMPO_NO_LUGAR = 1600

const listarVisiveis = (entregas, filtro, agora) =>
  ordenarPorUrgencia(
    entregas.filter(
      (entrega) => filtro === 'todas' || categoriaDaEntrega(entrega) === filtro,
    ),
    agora,
  )

const semMovimento = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
/** "24/11 às 23:59", com o ano só quando não é o ano corrente. */
const formatarData = (prazo, agora) => {
  const data = new Date(prazo)
  const mesmoAno = data.getFullYear() === agora.getFullYear()
  const dia = data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    ...(!mesmoAno && { year: 'numeric' }),
  })
  const hora = data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `${dia} às ${hora}`
}
// A data de publicação vem como "aaaa-mm-dd"; montar o texto direto evita
// que o fuso horário mude o dia.
const formatarDia = (data) => {
  const [ano, mes, dia] = String(data ?? '').split('-')
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : ''
}

function Entrega({
  entrega,
  agora,
  ordem,
  pendente,
  recente,
  registrar,
  onAlternar,
}) {
  const categoria = categoriaDaEntrega(entrega)
  const atrasada = estaAtrasada(entrega, agora)
  const situacao = SITUACAO[categoria]
  const feita = categoria === 'concluida'

  return (
    <li
      ref={(elemento) => registrar(entrega.id, elemento)}
      className={`entrega entrega-${situacao.classe}${
        atrasada ? ' entrega-atrasada' : ''
      }${recente ? ' entrega-recente' : ''}`}
      style={{ '--ordem': Math.min(ordem, 10) }}
    >
      <div className="entrega-conteudo">
        <div className="entrega-linha">
          <h3>{entrega.titulo}</h3>
          <span className={`entrega-status entrega-status-${situacao.classe}`}>
            {situacao.texto}
          </span>
          {atrasada && <span className="entrega-aviso">Atrasada</span>}
        </div>
        {entrega.descricao && <p>{entrega.descricao}</p>}
        <p className="entrega-meta">
          {entrega.tipo && <span>{entrega.tipo}</span>}
          <span>
            Prazo:{' '}
            <time dateTime={entrega.prazo}>
              {formatarData(entrega.prazo, agora)}
            </time>
          </span>
          {!feita && (
            <strong className="entrega-prazo-texto">
              {descreverPrazo(entrega.prazo, agora)}
            </strong>
          )}
        </p>
      </div>
      <button
        type="button"
        className="entrega-icone"
        disabled={pendente}
        onClick={() => onAlternar(entrega)}
        aria-label={
          feita
            ? `Desfazer conclusão de ${entrega.titulo}`
            : `Concluir ${entrega.titulo}`
        }
        title={feita ? 'Desfazer conclusão' : 'Concluir'}
      >
        <Icone nome={feita ? 'desfazer' : 'check'} tamanho={16} />
      </button>
    </li>
  )
}

/**
 * Lista de entregas. A animação de entrada vale só quando a lista aparece:
 * depois disso a classe "entrou" a desliga, para as entregas que mudam de
 * lugar não "entrarem" de novo.
 */
function ListaDeEntregas({ children }) {
  const lista = useRef(null)

  useEffect(() => {
    const espera = setTimeout(
      () => lista.current?.classList.add('entrou'),
      1300,
    )

    return () => clearTimeout(espera)
  }, [])

  return (
    <ul className="disciplina-entregas" ref={lista}>
      {children}
    </ul>
  )
}

function ConteudoDisciplina({ id }) {
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState(null)
  const [tentativa, setTentativa] = useState(0)
  const [filtro, setFiltro] = useState('todas')
  const [pendente, setPendente] = useState(null)
  const [erroAcao, setErroAcao] = useState(null)
  // Enquanto a entrega fica no lugar: a ordem de antes e quais acabaram de mudar.
  const [segurando, setSegurando] = useState(null)
  const itens = useRef(new Map())
  const posicoes = useRef(null)
  const espera = useRef(null)

  useEffect(() => () => clearTimeout(espera.current), [])

  // Quando a lista se reorganiza, cada entrega desliza do lugar antigo até o novo.
  useLayoutEffect(() => {
    const antes = posicoes.current

    if (segurando !== null || !antes) return
    posicoes.current = null
    if (semMovimento()) return

    for (const [entregaId, elemento] of itens.current) {
      const deslocamento =
        antes.get(entregaId) - elemento.getBoundingClientRect().top

      if (Math.abs(deslocamento) > 1 && elemento.animate) {
        elemento.animate(
          [
            { transform: `translateY(${deslocamento}px)` },
            { transform: 'none' },
          ],
          { duration: 500, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
        )
      }
    }
  }, [segurando])

  function registrar(entregaId, elemento) {
    if (elemento) itens.current.set(entregaId, elemento)
    else itens.current.delete(entregaId)
  }

  function soltar() {
    posicoes.current = new Map(
      [...itens.current].map(([entregaId, elemento]) => [
        entregaId,
        elemento.getBoundingClientRect().top,
      ]),
    )
    setSegurando(null)
  }

  function escolherFiltro(chave) {
    clearTimeout(espera.current)
    posicoes.current = null
    setSegurando(null)
    setFiltro(chave)
  }

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
    setSegurando((atual) => ({
      ordem:
        atual?.ordem ??
        listarVisiveis(dados.entregas, filtro, new Date()).map(
          (item) => item.id,
        ),
      recentes: new Set([...(atual?.recentes ?? []), entrega.id]),
      ultima: { titulo: entrega.titulo, feita: novo === 'CONCLUIDA' },
    }))
    clearTimeout(espera.current)
    espera.current = setTimeout(soltar, TEMPO_NO_LUGAR)
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
  // No intervalo depois de concluir, mantém a ordem (e as entregas que o filtro
  // esconderia) para a mudança ficar visível.
  const visiveis = segurando
    ? segurando.ordem
        .map((entregaId) => entregas.find((item) => item.id === entregaId))
        .filter(Boolean)
    : listarVisiveis(entregas, filtro, agora)

  const pendentes = contagem.afazer + contagem.andamento

  return (
    <>
      <div className={`disciplina-pagina materia-detalhe-${cor}`}>
        <header className="disciplina-topo">
          <div className="disciplina-topo-titulo">
            <h1>{disciplina.nome}</h1>
            <div className="disciplina-etiquetas">
              <span>Período letivo · {disciplina.periodoLetivo}</span>
            </div>
          </div>
          <dl className="disciplina-resumo">
            <div>
              <dt>Pendentes</dt>
              <dd>{pendentes}</dd>
            </div>
            <div>
              <dt>Concluídas</dt>
              <dd>{contagem.concluida}</dd>
            </div>
          </dl>
          <BarraProgresso
            concluidas={contagem.concluida}
            total={contagem.todas}
            rotulo={`Progresso em ${disciplina.nome}`}
          />
          {pendencias && <p className="disciplina-pendencias">{pendencias}</p>}
        </header>

        <div className="disciplina-grade">
          <section
            className="disciplina-painel"
            aria-labelledby="entregas-titulo"
          >
            <div className="disciplina-painel-topo">
              <h2 id="entregas-titulo">Entregas</h2>
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
                    onClick={() => escolherFiltro(opcao.chave)}
                  >
                    {opcao.titulo} ({contagem[opcao.chave]})
                  </button>
                ))}
              </div>
            </div>
            {erroAcao && (
              <p className="disciplina-erro-acao" role="alert">
                {erroAcao}
              </p>
            )}
            {segurando && (
              <p className="disciplina-so-leitor" role="status">
                {`“${segurando.ultima.titulo}” ${
                  segurando.ultima.feita ? 'concluída' : 'reaberta'
                }.`}
              </p>
            )}
            {visiveis.length === 0 ? (
              <p className="disciplina-vazio">
                {entregas.length === 0
                  ? 'Nenhuma entrega encontrada.'
                  : 'Nenhuma entrega neste filtro.'}
              </p>
            ) : (
              <ListaDeEntregas key={filtro}>
                {visiveis.map((entrega, posicao) => (
                  <Entrega
                    key={entrega.id}
                    entrega={entrega}
                    ordem={posicao}
                    agora={agora}
                    pendente={pendente === entrega.id}
                    recente={segurando?.recentes.has(entrega.id) ?? false}
                    registrar={registrar}
                    onAlternar={alternarConclusao}
                  />
                ))}
              </ListaDeEntregas>
            )}
          </section>

          <aside className="disciplina-lateral">
            <section
              className="disciplina-painel disciplina-materiais"
              aria-labelledby="materiais-titulo"
            >
              <div className="disciplina-painel-topo">
                <h2 id="materiais-titulo">Materiais</h2>
                {materiais && (
                  <span className="disciplina-dica">
                    {materiais.length}{' '}
                    {materiais.length === 1 ? 'material' : 'materiais'}
                  </span>
                )}
              </div>
              {materiais === null ? (
                <p className="disciplina-vazio">
                  Não foi possível carregar os materiais. Recarregue a página
                  para tentar de novo.
                </p>
              ) : materiais.length === 0 ? (
                <p className="disciplina-vazio">
                  Nenhum material publicado ainda.
                </p>
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
          </aside>
        </div>
      </div>
      <div className={`materia-detalhe-${cor}`}>
        <AnotacoesDisciplina disciplinaId={id} />
      </div>
    </>
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
