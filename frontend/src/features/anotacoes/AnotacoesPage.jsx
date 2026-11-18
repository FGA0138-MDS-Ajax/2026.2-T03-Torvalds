import { Link, useSearchParams } from 'react-router'
import { listarDisciplinas } from '../disciplinas/listarDisciplinas'
import {
  Carregando,
  ErroCarregamento,
  EstadoVazio,
} from '../../shared/components/Estados'
import { useRequisicao } from '../../shared/hooks/useRequisicao'
import { corDaMateria } from '../materias/materiasUtils'
import CadernoDaDisciplina from './CadernoDaDisciplina'
import './AnotacoesPage.css'

/** Tela do menu Anotações: disciplinas à esquerda e o caderno da escolhida. */
export default function AnotacoesPage() {
  const { dados, erro, carregando, tentarNovamente } =
    useRequisicao(listarDisciplinas)
  const [parametros, setParametros] = useSearchParams()
  // A busca fica na barra do topo (LayoutBase) e chega aqui pela URL.
  const busca = parametros.get('busca') ?? ''
  const pedida = parametros.get('disciplina')

  if (carregando) {
    return <Carregando mensagem="Carregando suas matérias…" />
  }

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

  // Sem escolha (ou com um id que não existe), abre a primeira disciplina.
  const escolhida =
    dados.find((disciplina) => String(disciplina.id) === pedida) ?? dados[0]

  // A cor segue a disciplina escolhida, a mesma do cartão dela em Matérias.
  const cor = corDaMateria(dados.indexOf(escolhida))

  function escolher(id) {
    setParametros({ disciplina: String(id) })
  }

  return (
    <section className={`anot-pagina anot-cor-${cor}`}>
      <header className="anot-cabecalho">
        <span className="anot-icone" aria-hidden="true">
          ▤
        </span>
        <div className="anot-titulo">
          <h1>{escolhida.nome}</h1>
          <nav className="anot-trilha" aria-label="Você está em">
            <Link to="/materias">Matérias</Link> / Anotações / {escolhida.nome}
          </nav>
        </div>
      </header>

      <div className="anot-corpo">
        <aside className="anot-disciplinas" aria-label="Disciplinas">
          <label className="anot-escolha-celular">
            Disciplina
            <select
              value={escolhida.id}
              onChange={(evento) => escolher(evento.target.value)}
            >
              {dados.map((disciplina) => (
                <option key={disciplina.id} value={disciplina.id}>
                  {disciplina.nome}
                </option>
              ))}
            </select>
          </label>
          <ul>
            {dados.map((disciplina) => (
              <li key={disciplina.id}>
                <button
                  type="button"
                  aria-pressed={disciplina.id === escolhida.id}
                  onClick={() => escolher(disciplina.id)}
                >
                  {disciplina.nome}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <CadernoDaDisciplina
          key={escolhida.id}
          disciplinaId={escolhida.id}
          busca={busca}
        />
      </div>
    </section>
  )
}
