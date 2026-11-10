import { useCallback } from 'react'
import { Link } from 'react-router'
import { formatarPrazoCurto } from '../inicio/inicioUtils'
import { ErroCarregamento, Carregando } from '../../shared/components/Estados'
import { useRequisicao } from '../../shared/hooks/useRequisicao'
import { carregarDetalhe } from './materiasApi'
import { agruparPorStatus } from './materiasUtils'

const CAPITULOS = ['01', '02', '03', '04', '05']

const COLUNAS = [
  { chave: 'aFazer', titulo: 'A fazer', classe: 'rosa' },
  { chave: 'emAndamento', titulo: 'Em andamento', classe: 'amarelo' },
  { chave: 'concluidas', titulo: 'Concluído', classe: 'verde' },
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

function Quadro({ atividades, disciplinaId }) {
  const grupos = agruparPorStatus(atividades)
  const agora = new Date()

  return (
    <section className="materia-caixa" aria-labelledby="quadro-titulo">
      <div className="materia-quadro-topo">
        <h3 id="quadro-titulo">Minhas atividades</h3>
        <Link to={`/disciplinas/${disciplinaId}`}>Ver todas as entregas →</Link>
      </div>
      <div className="materia-quadro">
        {COLUNAS.map((coluna) => (
          <div key={coluna.chave} className="materia-coluna">
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

export default function DetalheMateria({ disciplina }) {
  const carregar = useCallback(
    (signal) => carregarDetalhe(disciplina.id, signal),
    [disciplina.id],
  )
  const { dados, erro, carregando, tentarNovamente } = useRequisicao(carregar)

  return (
    <div className="materia-detalhe">
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
          <Quadro atividades={dados.atividades} disciplinaId={disciplina.id} />
        </>
      )}
    </div>
  )
}
