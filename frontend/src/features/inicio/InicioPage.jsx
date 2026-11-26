import { Link } from 'react-router'
import {
  Carregando,
  ErroCarregamento,
  EstadoVazio,
} from '../../shared/components/Estados'
import BarraProgresso from '../../shared/components/BarraProgresso'
import { useRequisicao } from '../../shared/hooks/useRequisicao'
import { carregarInicio } from './inicioApi'
import {
  contarAtrasadas,
  contarEntregasDeHoje,
  corDoTipo,
  descreverDataLonga,
  descreverDiasAte,
  formatarHora,
  resumirEntregas,
  saudacao,
  seloDoPrazo,
} from './inicioUtils'
import { CartaoResumo, EntregasDaSemana, ProximaProva } from './CartoesDoInicio'
import ProgressoGeral from './ProgressoGeral'
import './InicioPage.css'

const CORES_DAS_MATERIAS = ['verde', 'amarelo', 'azul', 'rosa', 'lilas']

function Cabecalho({ disciplinas, entregas }) {
  const agora = new Date()
  const hoje = contarEntregasDeHoje(entregas, agora)
  const semestre = disciplinas[0]?.periodoLetivo

  let aviso = 'Nenhuma entrega para hoje'
  if (hoje === 1) aviso = '1 entrega para hoje'
  if (hoje > 1) aviso = `${hoje} entregas para hoje`

  return (
    <header className="inicio-cabecalho">
      <h1>
        <span>{saudacao(agora)}</span>
      </h1>
      <p>
        {descreverDataLonga(agora)}
        {semestre && ` · Semestre ${semestre}`}
        <span className="inicio-aviso-hoje">{aviso}</span>
      </p>
    </header>
  )
}

/**
 * Card do progresso no semestre. Os números vêm do GET /progresso, somados
 * pelo back-end em todas as disciplinas do aluno; só as atrasadas são
 * contadas aqui, a partir das entregas que a tela já baixou.
 */
function Progresso({ progresso, atrasadas }) {
  const { concluidas, total, percentual } = progresso

  return (
    <section className="inicio-caixa inicio-progresso">
      <h2>Meu progresso</h2>
      {total === 0 ? (
        <EstadoVazio mensagem="Você ainda não tem atividades no semestre." />
      ) : (
        <div className="inicio-progresso-corpo">
          <ProgressoGeral percentual={percentual} />
          <dl className="inicio-numeros">
            <div>
              <dt>Feitas</dt>
              <dd>
                <strong>{concluidas}</strong> de {total}
              </dd>
            </div>
            <div>
              <dt>Pendentes</dt>
              <dd>
                <strong>{total - concluidas}</strong>
              </dd>
            </div>
            <div className="inicio-numero-atrasadas">
              <dt>Atrasadas</dt>
              <dd>
                <strong>{atrasadas}</strong>
              </dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  )
}

function Proximas({ proximas }) {
  const atrasadas = proximas.filter((item) => item.atrasada).length

  return (
    <section className="inicio-caixa inicio-proximas">
      <div className="inicio-caixa-topo">
        <h2>Próximas tarefas</h2>
        <Link to="/agenda">Ver tudo →</Link>
      </div>

      {atrasadas > 0 && (
        <p className="inicio-alerta-atrasadas" role="status">
          <span aria-hidden="true">⚠ </span>
          {atrasadas === 1
            ? '1 tarefa atrasada'
            : `${atrasadas} tarefas atrasadas`}
        </p>
      )}

      {proximas.length === 0 ? (
        <EstadoVazio mensagem="Nenhuma entrega pendente. Bom trabalho!" />
      ) : (
        <ul>
          {proximas.map((item) => {
            const selo = seloDoPrazo(item.prazo)
            const quando = item.atrasada
              ? '(atrasada)'
              : descreverDiasAte(item.prazo)

            return (
              <li key={`${item.disciplinaId}-${item.id}`}>
                <Link
                  className="inicio-proxima"
                  to={`/disciplinas/${item.disciplinaId}`}
                >
                  <span
                    className={
                      item.atrasada
                        ? 'selo-data selo-data-atrasada'
                        : `selo-data selo-data-${corDoTipo(item.tipo)}`
                    }
                    aria-hidden="true"
                  >
                    <strong>{selo.dia}</strong>
                    <small>{selo.mes}</small>
                  </span>
                  <span className="inicio-proxima-texto">
                    <strong>{item.titulo}</strong>
                    <span>{item.disciplinaNome}</span>
                    <small className={item.atrasada ? 'atrasada' : undefined}>
                      {formatarHora(item.prazo)} · {quando}
                      {item.tipo && (
                        <>
                          {' · '}
                          <span
                            className={`tipo-entrega tipo-${corDoTipo(item.tipo)}`}
                          >
                            {item.tipo}
                          </span>
                        </>
                      )}
                    </small>
                  </span>
                </Link>
              </li>
            )
          })}
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
            const { total, concluidas, pendentes } = resumirEntregas(
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
                    {pendentes === 0
                      ? 'Tudo em dia'
                      : `${pendentes} ${pendentes === 1 ? 'pendente' : 'pendentes'}`}
                  </span>
                  <BarraProgresso
                    percentual={disciplina.progressoPercentual}
                    concluidas={concluidas}
                    total={total}
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
    <>
      <Cabecalho disciplinas={disciplinas} entregas={entregas} />

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
          <Progresso
            progresso={progresso}
            atrasadas={contarAtrasadas(entregas)}
          />
          <Proximas proximas={proximas} />
        </aside>
      </div>
    </>
  )
}

export default function InicioPage() {
  return (
    <section className="inicio">
      <Conteudo />
    </section>
  )
}
