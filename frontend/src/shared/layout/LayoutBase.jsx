import { NavLink, Outlet } from 'react-router'
import AcoesDoTopo from './AcoesDoTopo'
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
 * lateral (barra inferior no celular) e uma barra de ações no topo. O conteúdo de cada
 * tela entra no lugar do <Outlet />.
 */
export default function LayoutBase() {
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
          <AcoesDoTopo />
        </header>

        <main className="layout-conteudo">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
