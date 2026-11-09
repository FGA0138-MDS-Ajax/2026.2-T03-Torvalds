import { Link } from 'react-router'
import { carregarAgenda } from '../agenda/agendaApi'
import {
  ehAtrasada,
  ehConcluida,
  formatarPrazoDdMm,
} from '../agenda/agendaUtils'
import { useSessao } from '../auth/useSessao'
import CartaoDisciplina from '../disciplinas/CartaoDisciplina'
import { listarDisciplinas } from '../disciplinas/listarDisciplinas'
import {
  Carregando,
  ErroCarregamento,
  EstadoVazio,
} from '../../shared/components/Estados'
import { useRequisicao } from '../../shared/hooks/useRequisicao'
import '../disciplinas/CartaoDisciplina.css'
import './InicioPage.css'

const LIMITE_PRAZOS = 5

function proximasEntregas(itens) {
  return itens
    .filter((item) => !ehConcluida(item.status))
    .sort((a, b) => new Date(a.prazo) - new Date(b.prazo))
    .slice(0, LIMITE_PRAZOS)
}

function SecaoDisciplinas() {
  const { dados, erro, carregando, tentarNovamente } =
    useRequisicao(listarDisciplinas)

  if (carregando) return <Carregando mensagem="Carregando suas matérias…" />

  if (erro) {
    return (
      <ErroCarregamento
        titulo="Não foi possível carregar as matérias"
        mensagem={erro.message}
        aoTentarNovamente={tentarNovamente}
      />
    )
  }

  if (dados.length === 0) {
    return <EstadoVazio mensagem="Você ainda não tem matérias." />
  }

  return (
    <ul className="lista-cartoes">
      {dados.map((disciplina) => (
        <li key={disciplina.id}>
          <CartaoDisciplina disciplina={disciplina} />
        </li>
      ))}
    </ul>
  )
}

function SecaoPrazos() {
  const { dados, erro, carregando, tentarNovamente } =
    useRequisicao(carregarAgenda)

  if (carregando) return <Carregando mensagem="Carregando seus prazos…" />

  if (erro) {
    return (
      <ErroCarregamento
        titulo="Não foi possível carregar os prazos"
        mensagem={erro.message}
        aoTentarNovamente={tentarNovamente}
      />
    )
  }

  const proximas = proximasEntregas(dados)

  if (proximas.length === 0) {
    return <EstadoVazio mensagem="Nenhuma entrega pendente. Bom trabalho!" />
  }

  return (
    <ul className="inicio-prazos">
      {proximas.map((item) => (
        <li key={item.id}>
          <strong>{item.titulo}</strong>
          <span>{item.disciplina}</span>
          <span>
            Prazo: {formatarPrazoDdMm(item.prazo)}
            {ehAtrasada(item) && ' (atrasada)'}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function InicioPage() {
  const { perfil } = useSessao()

  return (
    <section>
      <h1>Olá, {perfil.nome}!</h1>

      <h2>Suas matérias</h2>
      <SecaoDisciplinas />

      <h2>Próximos prazos</h2>
      <SecaoPrazos />
      <p>
        <Link to="/agenda">Ver agenda completa</Link>
      </p>
    </section>
  )
}
