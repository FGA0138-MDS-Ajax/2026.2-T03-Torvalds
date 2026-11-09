import { NavLink, Outlet } from 'react-router'
import { useSessao } from '../../features/auth/useSessao'
import './LayoutBase.css'

const itens = [
  { para: '/', rotulo: 'Início', fim: true },
  { para: '/materias', rotulo: 'Matérias', fim: false },
  { para: '/agenda', rotulo: 'Agenda', fim: false },
]

/**
 * Moldura das telas do aluno logado: menu lateral no computador e barra
 * inferior no celular. O conteúdo de cada tela entra no lugar do <Outlet />.
 */
export default function LayoutBase() {
  const { perfil, sair } = useSessao()

  return (
    <div className="layout">
      <nav className="layout-menu" aria-label="Menu principal">
        <p className="layout-marca">cAnCHA</p>

        <ul className="layout-links">
          {itens.map((item) => (
            <li key={item.para}>
              <NavLink to={item.para} end={item.fim}>
                {item.rotulo}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="layout-aluno">
          <p className="layout-nome">{perfil.nome}</p>
          <button type="button" onClick={sair}>
            Sair
          </button>
        </div>
      </nav>

      <main className="layout-conteudo">
        <Outlet />
      </main>
    </div>
  )
}
