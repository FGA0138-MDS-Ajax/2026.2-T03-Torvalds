// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

const notificacoes = [
  {
    id: 1,
    titulo: 'Lista 1: indução',
    tipo: 'Lista',
    prazo: '2020-01-01T23:59:00',
    status: 'A_FAZER',
    disciplinaId: 7,
    disciplinaNome: 'Teoria dos Números',
    atrasada: true,
  },
  {
    id: 2,
    titulo: 'Prova 2 de Compiladores',
    tipo: 'Prova',
    prazo: '2099-01-01T10:00:00',
    status: 'A_FAZER',
    disciplinaId: 3,
    disciplinaNome: 'Compiladores',
    atrasada: false,
  },
]

function responder(status = 200, corpo = notificacoes) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(corpo), { status })),
  )
}

beforeEach(() => responder())

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  localStorage.clear()
  document.documentElement.style.fontSize = ''
})

function abrir(entrada = '/') {
  const sair = vi.fn()

  render(
    <SessaoContext.Provider
      value={{
        perfil: { nome: 'Maria', email: 'maria@exemplo.test' },
        entrar: vi.fn(),
        sair,
      }}
    >
      <MemoryRouter initialEntries={[entrada]}>
        <Routes>
          <Route element={<LayoutBase />}>
            <Route index element={<p>Conteúdo do início</p>} />
            <Route path="materias" element={<p>Tela de matérias</p>} />
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

  it('não mostra mais a barra de busca no topo', () => {
    abrir()

    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
  })

  it('na tela de Anotações a busca do topo busca anotações e fica na tela', () => {
    abrir('/anotacoes?disciplina=7')

    const busca = screen.getByRole('searchbox', { name: 'Buscar anotações' })

    fireEvent.change(busca, { target: { value: 'léxica' } })

    expect(
      screen.getByRole('heading', { name: 'Anotações' }),
    ).toBeInTheDocument()
    expect(busca).toHaveValue('léxica')

    fireEvent.change(busca, { target: { value: '' } })

    expect(busca).toHaveValue('')
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

  it('mostra no sino quantas entregas pedem atenção', async () => {
    abrir()

    expect(
      await screen.findByRole('button', {
        name: 'Notificações, 1 com prazo urgente',
      }),
    ).toBeInTheDocument()
  })

  it('abre as notificações com as próximas entregas e fecha ao escolher uma', async () => {
    abrir()

    fireEvent.click(await screen.findByRole('button', { name: /Notificações/ }))

    const painel = screen.getByRole('region', { name: 'Notificações' })

    expect(within(painel).getByText('Lista 1: indução')).toBeInTheDocument()
    expect(
      within(painel).getByText('Atrasada · 01/01, 23:59'),
    ).toBeInTheDocument()
    expect(
      within(painel).getByRole('link', { name: /Prova 2 de Compiladores/ }),
    ).toHaveAttribute('href', '/materias?materia=3')
    expect(
      within(painel).getByRole('link', { name: 'Ver agenda' }),
    ).toHaveAttribute('href', '/agenda')

    fireEvent.click(
      within(painel).getByRole('link', { name: /Lista 1: indução/ }),
    )

    expect(screen.getByText('Tela de matérias')).toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: 'Notificações' }),
    ).not.toBeInTheDocument()
  })

  it('avisa quando não há atividades pendentes', async () => {
    responder(200, [])
    abrir()

    fireEvent.click(await screen.findByRole('button', { name: 'Notificações' }))

    expect(
      await screen.findByText(
        'Tudo em dia! Você não tem atividades pendentes.',
      ),
    ).toBeInTheDocument()
  })

  it('mostra o erro das notificações e deixa tentar de novo', async () => {
    responder(503, { mensagem: 'Fora do ar' })
    abrir()

    fireEvent.click(await screen.findByRole('button', { name: 'Notificações' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar as notificações.',
    )

    responder()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(await screen.findByText('Lista 1: indução')).toBeInTheDocument()
  })

  it('fecha o painel com Esc e devolve o foco ao botão', async () => {
    abrir()
    const sino = await screen.findByRole('button', { name: /Notificações/ })

    fireEvent.click(sino)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(
      screen.queryByRole('region', { name: 'Notificações' }),
    ).not.toBeInTheDocument()
    expect(sino).toHaveFocus()
  })

  it('fecha o painel ao clicar fora e abre só um por vez', async () => {
    abrir()

    fireEvent.click(await screen.findByRole('button', { name: /Notificações/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Configurações' }))

    expect(
      screen.queryByRole('region', { name: 'Notificações' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Configurações' }),
    ).toBeInTheDocument()

    fireEvent.mouseDown(document.body)

    expect(
      screen.queryByRole('region', { name: 'Configurações' }),
    ).not.toBeInTheDocument()
  })

  it('muda o tamanho do texto pelas configurações e lembra da escolha', () => {
    abrir()

    fireEvent.click(screen.getByRole('button', { name: 'Configurações' }))
    fireEvent.click(screen.getByRole('button', { name: 'Grande' }))

    expect(document.documentElement.style.fontSize).toBe('115%')
    expect(screen.getByRole('button', { name: 'Grande' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(localStorage.getItem('cancha.tamanhoTexto')).toBe('grande')
    expect(
      screen.getByRole('link', { name: 'Todas as configurações' }),
    ).toHaveAttribute('href', '/configuracoes')
  })

  it('abre o menu do perfil com nome, e-mail e as opções', () => {
    abrir()

    fireEvent.click(
      screen.getByRole('button', { name: 'Menu do perfil de Maria' }),
    )

    const painel = screen.getByRole('region', { name: 'Perfil' })

    expect(within(painel).getByText('Maria')).toBeInTheDocument()
    expect(within(painel).getByText('maria@exemplo.test')).toBeInTheDocument()
    expect(
      within(painel).getByRole('link', { name: 'Meu perfil' }),
    ).toHaveAttribute('href', '/perfil')
    expect(
      within(painel).getByRole('link', { name: 'Configurações' }),
    ).toHaveAttribute('href', '/configuracoes')
  })

  it('encerra a sessão ao clicar em Sair no menu do perfil', () => {
    const { sair } = abrir()

    fireEvent.click(
      screen.getByRole('button', { name: 'Menu do perfil de Maria' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Sair' }))

    expect(sair).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByRole('region', { name: 'Perfil' }),
    ).not.toBeInTheDocument()
  })
})
