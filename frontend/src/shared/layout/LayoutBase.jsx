import { useLayoutEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import AcoesDoTopo from './AcoesDoTopo'
import Icone from './Icone'
import Tutorial from './Tutorial'
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
  const linksRef = useRef(null)
  const { pathname } = useLocation()

  // O destaque do menu corre até a tela escolhida: posicionado direto no
  // elemento, medindo o link ativo (como as vistas da Agenda)
  useLayoutEffect(() => {
    const lista = linksRef.current

    if (!lista) return undefined

    function posicionar() {
      const marcador = lista.querySelector('.layout-links-marcador')
      const ativo = lista.querySelector('a.active')

      if (!marcador) return
      if (!ativo) {
        marcador.style.opacity = '0'
        return
      }

      const base = lista.getBoundingClientRect()
      const caixa = ativo.getBoundingClientRect()

      marcador.style.opacity = '1'
      marcador.style.transform = `translate(${caixa.left - base.left}px, ${
        caixa.top - base.top
      }px)`
      marcador.style.width = `${caixa.width}px`
      marcador.style.height = `${caixa.height}px`
      // Só anima depois de já estar no lugar (não corre ao abrir o site)
      requestAnimationFrame(() => lista.classList.add('pronto'))
    }

    posicionar()

    if (typeof ResizeObserver === 'undefined') return undefined

    const observador = new ResizeObserver(posicionar)

    observador.observe(lista)

    return () => observador.disconnect()
  }, [pathname])

  return (
    <div className="layout">
      <nav className="layout-menu" aria-label="Menu principal">
        <div className="layout-marca-bloco">
          <p className="layout-marca">cAnCHA</p>
          <p className="layout-lema">Seu caderno, agora digital!</p>
        </div>

        <ul className="layout-links" ref={linksRef}>
          <li className="layout-links-marcador" aria-hidden="true" />
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

      <Tutorial />

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
