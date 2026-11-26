import { useSearchParams } from 'react-router'
import { listarDisciplinas } from '../disciplinas/listarDisciplinas'
import {
  Carregando,
  ErroCarregamento,
  EstadoVazio,
} from '../../shared/components/Estados'
import { useRequisicao } from '../../shared/hooks/useRequisicao'
import { corDaDisciplina } from '../../shared/utils/coresDisciplina'
import CadernoDaDisciplina from './CadernoDaDisciplina'
import './AnotacoesPage.css'

/** Tela do menu Anotações: disciplinas à esquerda e o caderno da escolhida. */
export default function AnotacoesPage() {
  const { dados, erro, carregando, tentarNovamente } =
    useRequisicao(listarDisciplinas)
  const [parametros, setParametros] = useSearchParams()
  // A busca fica no cabeçalho desta tela e vai na URL (?busca=).
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
  const cor = corDaDisciplina(escolhida.nome, dados.indexOf(escolhida))

  function escolher(id) {
    setParametros({ disciplina: String(id) })
  }

  function digitar(evento) {
    const novos = new URLSearchParams(parametros)
    const termo = evento.target.value

    if (termo) novos.set('busca', termo)
    else novos.delete('busca')

    setParametros(novos, { replace: true })
  }

  return (
    <section className={`anot-pagina anot-cor-${cor}`}>
      <h1 className="anot-h1">Anotações</h1>
      <p className="anot-subtitulo">
        Escreva e organize as anotações de cada matéria.
      </p>

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
            {dados.map((disciplina, indice) => (
              <li key={disciplina.id}>
                <button
                  type="button"
                  className={`anot-cartao anot-cartao-${corDaDisciplina(disciplina.nome, indice)}`}
                  aria-pressed={disciplina.id === escolhida.id}
                  onClick={() => escolher(disciplina.id)}
                >
                  {disciplina.nome}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="anot-principal">
          <header className="anot-cabecalho">
            <h2 className="anot-nome">{escolhida.nome}</h2>
            <label className="anot-busca">
              <span className="anot-so-leitor">Buscar anotações</span>
              <input
                type="search"
                value={busca}
                onChange={digitar}
                placeholder="Buscar anotações…"
              />
            </label>
          </header>

          <CadernoDaDisciplina
            key={escolhida.id}
            disciplinaId={escolhida.id}
            busca={busca}
          />
        </div>
      </div>
    </section>
  )
}
