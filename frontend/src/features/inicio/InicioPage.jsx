import { Link } from 'react-router'
import { useSessao } from '../auth/useSessao'
import {
  Carregando,
  ErroCarregamento,
  EstadoVazio,
} from '../../shared/components/Estados'
import BarraProgresso from '../../shared/components/BarraProgresso'
import { useRequisicao } from '../../shared/hooks/useRequisicao'
import { carregarInicio } from './inicioApi'
import {
  corDoTipo,
  formatarPrazoCurto,
  mensagemDeProgresso,
  resumirEntregas,
} from './inicioUtils'
import { CartaoResumo, EntregasDaSemana, ProximaProva } from './CartoesDoInicio'
import ProgressoGeral from './ProgressoGeral'
import './InicioPage.css'

const CORES_DAS_MATERIAS = ['lilas', 'amarelo', 'verde', 'azul', 'rosa']

/**
 * Card do progresso no semestre. Os números vêm do GET /progresso, somados
 * pelo back-end em todas as disciplinas do aluno.
 */
function Progresso({ progresso }) {
  const { concluidas, total, percentual } = progresso

  return (
    <section className="inicio-caixa inicio-progresso">
      <h2>Meu progresso</h2>
      {total === 0 ? (
        <EstadoVazio mensagem="Você ainda não tem atividades no semestre." />
      ) : (
        <>
          <div className="inicio-progresso-corpo">
            <ProgressoGeral percentual={percentual} />
            <p className="inicio-progresso-contagem">
              <strong>
                {concluidas}/{total}
              </strong>
              <span>Atividades feitas</span>
            </p>
          </div>
          <p className="inicio-progresso-mensagem">
            <span aria-hidden="true">★ </span>
            {mensagemDeProgresso({ total, percentual })}
          </p>
        </>
      )}
    </section>
  )
}

function Proximas({ proximas }) {
  return (
    <section className="inicio-caixa inicio-proximas">
      <div className="inicio-caixa-topo">
        <h2>Próximas atividades</h2>
        <Link to="/agenda">Ver tudo →</Link>
      </div>

      {proximas.length === 0 ? (
        <EstadoVazio mensagem="Nenhuma entrega pendente. Bom trabalho!" />
      ) : (
        <ul>
          {proximas.map((item) => (
            <li key={`${item.disciplinaId}-${item.id}`}>
              <Link
                className="inicio-proxima"
                to={`/disciplinas/${item.disciplinaId}`}
              >
                <span
                  className={`ponto ponto-${corDoTipo(item.tipo)}`}
                  aria-hidden="true"
                />
                <span className="inicio-proxima-texto">
                  <strong>{item.titulo}</strong>
                  <span>{item.disciplinaNome}</span>
                  <small className={item.atrasada ? 'atrasada' : undefined}>
                    {formatarPrazoCurto(item.prazo)}
                    {item.atrasada && ' (atrasada)'}
                  </small>
                </span>
                {item.tipo && (
                  <span className={`etiqueta etiqueta-${corDoTipo(item.tipo)}`}>
                    {item.tipo}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function MinhasMaterias({ disciplinas, entregas }) {
  return (
    <section className="inicio-caixa">
      <h2>Minhas matérias</h2>

      {disciplinas.length === 0 ? (
        <EstadoVazio mensagem="Você ainda não tem matérias." />
      ) : (
        <ul className="inicio-materias">
          {disciplinas.map((disciplina, indice) => {
            const { total, concluidas } = resumirEntregas(
              entregas.filter((item) => item.disciplinaId === disciplina.id),
            )

            return (
              <li key={disciplina.id}>
                <Link
                  className={`materia materia-${
                    CORES_DAS_MATERIAS[indice % CORES_DAS_MATERIAS.length]
                  }`}
                  to={`/disciplinas/${disciplina.id}`}
                >
                  <strong>{disciplina.nome}</strong>
                  <span>
                    {concluidas}/{total} Atividades
                  </span>
                  <BarraProgresso
                    percentual={disciplina.progressoPercentual}
                    rotulo={`Progresso em ${disciplina.nome}`}
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function Conteudo() {
  const { dados, erro, carregando, tentarNovamente } =
    useRequisicao(carregarInicio)

  if (carregando) return <Carregando mensagem="Carregando seu painel…" />

  if (erro) {
    return (
      <ErroCarregamento
        titulo="Não foi possível carregar o painel"
        mensagem={erro.message}
        aoTentarNovamente={tentarNovamente}
      />
    )
  }

  const { disciplinas, entregas, proximas, progresso } = dados

  return (
    <div className="inicio-grade">
      <div className="inicio-principal">
        <div className="inicio-destaques">
          <EntregasDaSemana entregas={entregas} />
          <ProximaProva entregas={entregas} />
          <CartaoResumo
            cor="lilas"
            titulo="Matérias"
            valor={disciplinas.length}
            legenda="Em curso"
            para="/materias"
            rotulo={`Matérias: ${disciplinas.length} em curso`}
          />
        </div>

        <MinhasMaterias disciplinas={disciplinas} entregas={entregas} />
      </div>

      <aside className="inicio-lateral">
        <Progresso progresso={progresso} />
        <Proximas proximas={proximas} />
      </aside>
    </div>
  )
}

export default function InicioPage() {
  const { perfil } = useSessao()

  return (
    <section className="inicio">
      <h1>Olá, {perfil.nome}!</h1>
      <Conteudo />
    </section>
  )
}
