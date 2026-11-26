import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router'
import { useSessao } from '../../features/auth/useSessao'
import Icone from './Icone'
import './LayoutBase.css'

const itens = [
  { para: '/', rotulo: 'Início', icone: 'inicio', fim: true },
  { para: '/materias', rotulo: 'Matérias', icone: 'livro', fim: false },
  { para: '/anotacoes', rotulo: 'Anotações', icone: 'notas', fim: false },
  { para: '/agenda', rotulo: 'Agenda', icone: 'calendario', fim: false },
]

/**
 * Moldura das telas do aluno logado, como no protótipo: menu de caderno na
 * lateral (barra inferior no celular) e uma barra no topo. O conteúdo de cada
 * tela entra no lugar do <Outlet />.
 */
export default function LayoutBase() {
  const { perfil, sair } = useSessao()
  const inicial = (perfil.nome ?? '?').trim().charAt(0).toUpperCase() || '?'
  const { pathname } = useLocation()
  const navegar = useNavigate()
  const [parametros] = useSearchParams()
  const naMaterias = pathname === '/materias'
  const busca = naMaterias ? (parametros.get('busca') ?? '') : ''

  // A busca do topo filtra as matérias: o termo vai na URL (?busca=...) e a
  // tela de Matérias lê de lá. Digitar em outra tela leva para Matérias.
  function aoDigitar(evento) {
    const termo = evento.target.value
    const destino = termo
      ? `/materias?busca=${encodeURIComponent(termo)}`
      : '/materias'

    navegar(destino, { replace: naMaterias })
  }

  return (
    <div className="layout">
      <nav className="layout-menu" aria-label="Menu principal">
        <div className="layout-marca-bloco">
          <p className="layout-marca">cAnCHA</p>
          <p className="layout-lema">Seu caderno, agora digital!</p>
        </div>

        <ul className="layout-links">
          {itens.map((item) => (
            <li key={item.para}>
              <NavLink to={item.para} end={item.fim}>
                <Icone nome={item.icone} />
                <span>{item.rotulo}</span>
              </NavLink>
            </li>
          ))}
          <li className="layout-so-celular">
            <NavLink to="/configuracoes">
              <Icone nome="engrenagem" />
              <span>Ajustes</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="layout-coluna">
        <header className="layout-topo">
          <label className="layout-busca">
            <Icone nome="lupa" />
            <input
              type="search"
              value={busca}
              onChange={aoDigitar}
              placeholder="Buscar matérias…"
              aria-label="Buscar matéria"
            />
          </label>

          <div className="layout-acoes">
            <button
              type="button"
              disabled
              title="Notificações: em breve"
              aria-label="Notificações (em breve)"
            >
              <Icone nome="sino" />
            </button>
            <Link
              className="layout-engrenagem"
              to="/configuracoes"
              title="Configurações"
              aria-label="Configurações"
            >
              <Icone nome="engrenagem" />
            </Link>
            <span
              className="layout-avatar"
              title={perfil.nome}
              aria-hidden="true"
            >
              {inicial}
            </span>
            <button type="button" className="layout-sair" onClick={sair}>
              Sair
            </button>
          </div>
        </header>

        <main className="layout-conteudo">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
