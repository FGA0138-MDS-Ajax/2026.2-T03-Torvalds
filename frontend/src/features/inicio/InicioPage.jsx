import { Link } from 'react-router'
import { ehAtrasada } from '../agenda/agendaUtils'
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
  proximasEntregas,
  resumirEntregas,
} from './inicioUtils'
import ProgressoGeral from './ProgressoGeral'
import './InicioPage.css'

const CORES_DAS_MATERIAS = ['lilas', 'amarelo', 'verde', 'azul', 'rosa']

function CartaoResumo({ cor, titulo, valor, legenda, para, rotulo }) {
  return (
    <Link className={`resumo resumo-${cor}`} to={para} aria-label={rotulo}>
      <span className="resumo-titulo">{titulo}</span>
      <span className="resumo-valor">{valor}</span>
      <span className="resumo-legenda">{legenda}</span>
      <span className="resumo-seta" aria-hidden="true">
        →
      </span>
    </Link>
  )
}

function Progresso({ resumo }) {
  return (
    <section className="inicio-caixa inicio-progresso">
      <h2>Meu progresso</h2>
      <div className="inicio-progresso-corpo">
        <ProgressoGeral percentual={resumo.percentual} />
        <p className="inicio-progresso-contagem">
          <strong>
            {resumo.concluidas}/{resumo.total}
          </strong>
          <span>Atividades feitas</span>
        </p>
      </div>
      <p className="inicio-progresso-mensagem">
        <span aria-hidden="true">★ </span>
        {mensagemDeProgresso(resumo)}
      </p>
    </section>
  )
}

function Proximas({ entregas }) {
  const proximas = proximasEntregas(entregas)

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
              <span
                className={`ponto ponto-${corDoTipo(item.tipo)}`}
                aria-hidden="true"
              />
              <div className="inicio-proxima-texto">
                <strong>{item.titulo}</strong>
                <span>{item.disciplina}</span>
                <small className={ehAtrasada(item) ? 'atrasada' : undefined}>
                  {formatarPrazoCurto(item.prazo)}
                  {ehAtrasada(item) && ' (atrasada)'}
                </small>
              </div>
              {item.tipo && (
                <span className={`etiqueta etiqueta-${corDoTipo(item.tipo)}`}>
                  {item.tipo}
                </span>
              )}
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

  const { disciplinas, entregas } = dados
  const resumo = resumirEntregas(entregas)

  return (
    <div className="inicio-grade">
      <div className="inicio-principal">
        <div className="inicio-resumos">
          <CartaoResumo
            cor="lilas"
            titulo="Matérias"
            valor={disciplinas.length}
            legenda="Cursando"
            para="/materias"
            rotulo={`Matérias: ${disciplinas.length} cursando`}
          />
          <CartaoResumo
            cor="amarelo"
            titulo="Atividades"
            valor={resumo.pendentes}
            legenda="Pendentes"
            para="/agenda"
            rotulo={`Atividades: ${resumo.pendentes} pendentes`}
          />
          <CartaoResumo
            cor="verde"
            titulo="Anotações"
            valor="—"
            legenda="Em breve"
            para="/anotacoes"
            rotulo="Anotações: em breve"
          />
        </div>

        <section className="inicio-caixa inicio-tarde">
          <h2>Sua tarde de hoje</h2>
          <p>
            <span className="inicio-em-breve">Em breve</span> Aqui vão aparecer
            as suas aulas do dia.
          </p>
        </section>

        <MinhasMaterias disciplinas={disciplinas} entregas={entregas} />
      </div>

      <aside className="inicio-lateral">
        <Progresso resumo={resumo} />
        <Proximas entregas={entregas} />
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
