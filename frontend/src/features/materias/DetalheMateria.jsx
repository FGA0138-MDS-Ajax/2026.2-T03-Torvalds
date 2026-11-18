import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { formatarPrazoCurto } from '../inicio/inicioUtils'
import { ErroCarregamento, Carregando } from '../../shared/components/Estados'
import { useRequisicao } from '../../shared/hooks/useRequisicao'
import { atualizarStatus, carregarDetalhe } from './materiasApi'
import { agruparPorStatus, percentualConcluido } from './materiasUtils'

const CAPITULOS = ['01', '02', '03', '04', '05']

const COLUNAS = [
  { chave: 'aFazer', status: 'A_FAZER', titulo: 'A fazer', classe: 'rosa' },
  {
    chave: 'emAndamento',
    status: 'EM_ANDAMENTO',
    titulo: 'Em andamento',
    classe: 'amarelo',
  },
  {
    chave: 'concluidas',
    status: 'CONCLUIDA',
    titulo: 'Concluído',
    classe: 'verde',
  },
]

function AulasEExercicios({ conteudos }) {
  return (
    <section className="materia-caixa" aria-labelledby="aulas-titulo">
      <h3 id="aulas-titulo">Aulas e Exercícios</h3>
      {conteudos.length === 0 ? (
        <p className="materia-vazio">Nenhum conteúdo publicado ainda.</p>
      ) : (
        <ul className="materia-aulas">
          {conteudos.map((conteudo) => (
            <li key={conteudo.id}>
              <a
                href={conteudo.urlOuArquivo}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Abrir ${conteudo.titulo}`}
              >
                <strong>{conteudo.titulo}</strong>
                <span>{conteudo.tipo}</span>
                <span className="materia-aula-seta" aria-hidden="true">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function Quadro({ atividades, disciplinaId, aoMudarProgresso }) {
  const [lista, setLista] = useState(atividades)
  const [erro, setErro] = useState(null)
  const [alvo, setAlvo] = useState(null)
  const quadro = useRef(null)
  const focoDepois = useRef(null)
  const grupos = agruparPorStatus(lista)
  const agora = new Date()

  // Ao mover pelo teclado o cartão vai para outra coluna e perde o foco: devolve o foco a ele.
  useEffect(() => {
    if (focoDepois.current === null) return

    quadro.current
      ?.querySelector(`[data-atividade="${focoDepois.current}"]`)
      ?.focus()
    focoDepois.current = null
  })

  async function mover(id, status) {
    const atual = lista.find((atividade) => atividade.id === id)

    if (!atual || atual.status === status) return

    const nova = lista.map((atividade) =>
      atividade.id === id ? { ...atividade, status } : atividade,
    )

    setErro(null)
    setLista(nova)

    try {
      await atualizarStatus(id, status)
      aoMudarProgresso?.(percentualConcluido(nova))
    } catch (falha) {
      setLista((anterior) =>
        anterior.map((atividade) =>
          atividade.id === id
            ? { ...atividade, status: atual.status }
            : atividade,
        ),
      )
      setErro(falha.message)
    }
  }

  // Setas ← e → movem o cartão focado para a coluna do lado, para quem não usa o mouse.
  function aoTeclar(evento, atividade) {
    const passo = { ArrowLeft: -1, ArrowRight: 1 }[evento.key]
    const indice = COLUNAS.findIndex(
      (coluna) => coluna.status === atividade.status,
    )
    const destino = COLUNAS[indice + passo]

    if (!passo || !destino) return

    evento.preventDefault()
    focoDepois.current = atividade.id
    mover(atividade.id, destino.status)
  }

  function soltar(evento, status) {
    evento.preventDefault()
    setAlvo(null)
    mover(Number(evento.dataTransfer.getData('text/plain')), status)
  }

  return (
    <section className="materia-caixa" aria-labelledby="quadro-titulo">
      <div className="materia-quadro-topo">
        <h3 id="quadro-titulo">Minhas atividades</h3>
        <Link to={`/disciplinas/${disciplinaId}`}>Ver todas as entregas →</Link>
      </div>
      <p className="materia-dica">
        Arraste uma atividade para outra coluna. No teclado, foque o cartão e
        use as setas ← e →.
      </p>
      {erro && (
        <p className="materia-erro" role="alert">
          Não foi possível mudar o status: {erro}
        </p>
      )}
      <div className="materia-quadro" ref={quadro}>
        {COLUNAS.map((coluna) => (
          <div
            key={coluna.chave}
            className={`materia-coluna${
              alvo === coluna.status ? ' materia-coluna-alvo' : ''
            }`}
            onDragOver={(evento) => {
              evento.preventDefault()
              setAlvo(coluna.status)
            }}
            onDragLeave={() => setAlvo(null)}
            onDrop={(evento) => soltar(evento, coluna.status)}
          >
            <h4 className="materia-coluna-titulo">
              {coluna.titulo} ({grupos[coluna.chave].length})
            </h4>
            <ul>
              {grupos[coluna.chave].map((atividade) => {
                const atrasada =
                  coluna.chave !== 'concluidas' &&
                  new Date(atividade.prazo) < agora

                return (
                  <li
                    key={atividade.id}
                    data-atividade={atividade.id}
                    tabIndex={0}
                    onKeyDown={(evento) => aoTeclar(evento, atividade)}
                    draggable
                    onDragStart={(evento) => {
                      evento.dataTransfer.setData(
                        'text/plain',
                        String(atividade.id),
                      )
                      evento.dataTransfer.effectAllowed = 'move'
                    }}
                    onDragEnd={() => setAlvo(null)}
                    className={`materia-item materia-item-${coluna.classe}${
                      atrasada ? ' materia-item-atrasada' : ''
                    }`}
                  >
                    <span>{atividade.titulo}</span>
                    <small>
                      {atrasada ? 'Atrasada · ' : ''}
                      {formatarPrazoCurto(atividade.prazo)}
                    </small>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function DetalheMateria({
  disciplina,
  cor = 'lilas',
  aoMudarProgresso,
}) {
  const carregar = useCallback(
    (signal) => carregarDetalhe(disciplina.id, signal),
    [disciplina.id],
  )
  const { dados, erro, carregando, tentarNovamente } = useRequisicao(carregar)

  return (
    <div className={`materia-detalhe materia-detalhe-${cor}`}>
      <div className="materia-detalhe-topo">
        <h2>Tópicos do conteúdo</h2>
        <div className="materia-capitulos">
          {CAPITULOS.map((numero) => (
            <span key={numero} className="materia-capitulo" aria-hidden="true">
              Cap {numero}
            </span>
          ))}
          <span className="materia-em-breve">Capítulos: em breve</span>
        </div>
      </div>
      <p className="materia-nome-selecionada">{disciplina.nome}</p>
      {carregando && <Carregando mensagem="Carregando a matéria…" />}
      {erro && (
        <ErroCarregamento
          titulo="Não foi possível carregar a matéria"
          mensagem={erro.message}
          aoTentarNovamente={tentarNovamente}
        />
      )}
      {dados && (
        <>
          <AulasEExercicios conteudos={dados.conteudos} />
          <Quadro
            atividades={dados.atividades}
            disciplinaId={disciplina.id}
            aoMudarProgresso={aoMudarProgresso}
          />
        </>
      )}
    </div>
  )
}
