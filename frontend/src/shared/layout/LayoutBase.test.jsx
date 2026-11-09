// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { SessaoContext } from '../../features/auth/SessaoContext'
import EmBreve from '../components/EmBreve'
import LayoutBase from './LayoutBase'

afterEach(cleanup)

function abrir() {
  const sair = vi.fn()

  render(
    <SessaoContext.Provider
      value={{ perfil: { nome: 'Maria' }, entrar: vi.fn(), sair }}
    >
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<LayoutBase />}>
            <Route index element={<p>Conteúdo do início</p>} />
            <Route path="anotacoes" element={<EmBreve titulo="Anotações" />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </SessaoContext.Provider>,
  )

  return { sair }
}

describe('Layout base', () => {
  it('mostra o menu, destaca a página atual e o conteúdo da rota', () => {
    abrir()

    const menu = screen.getByRole('navigation', { name: 'Menu principal' })

    expect(within(menu).getByRole('link', { name: 'Início' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(
      within(menu).getByRole('link', { name: 'Matérias' }),
    ).toBeInTheDocument()
    expect(
      within(menu).getByRole('link', { name: 'Anotações' }),
    ).toBeInTheDocument()
    expect(
      within(menu).getByRole('link', { name: 'Agenda' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Conteúdo do início')).toBeInTheDocument()
  })

  it('deixa a busca e as notificações como "em breve"', () => {
    abrir()

    expect(screen.getByRole('searchbox', { name: /Buscar/ })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: /Notificações/ }),
    ).toBeDisabled()
  })

  it('abre a tela "Em breve" das anotações', () => {
    abrir()

    const menu = screen.getByRole('navigation', { name: 'Menu principal' })

    fireEvent.click(within(menu).getByRole('link', { name: 'Anotações' }))

    expect(
      screen.getByRole('heading', { name: 'Anotações' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Em breve')).toBeInTheDocument()
  })

  it('encerra a sessão ao clicar em Sair', () => {
    const { sair } = abrir()

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }))

    expect(sair).toHaveBeenCalledTimes(1)
  })
})
