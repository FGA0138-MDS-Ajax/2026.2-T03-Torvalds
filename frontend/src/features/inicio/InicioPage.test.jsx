// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router'
import { SessaoContext } from '../auth/SessaoContext'
import InicioPage from './InicioPage'

const disciplinas = [
  {
    id: 1,
    nome: 'Compiladores',
    periodoLetivo: '2026.2',
    progressoPercentual: 40,
  },
]

const entregas = [
  {
    id: 1,
    titulo: 'Lista 2',
    disciplina: 'Compiladores',
    tipo: 'Lista',
    prazo: '2099-11-10T18:00:00',
    status: 'A fazer',
  },
  {
    id: 2,
    titulo: 'Trabalho já entregue',
    disciplina: 'Compiladores',
    tipo: 'Trabalho',
    prazo: '2099-11-05T18:00:00',
    status: 'CONCLUIDA',
  },
]

function responder({ agenda = entregas, statusAgenda = 200 } = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url) =>
      url.endsWith('/agenda')
        ? new Response(JSON.stringify(agenda), { status: statusAgenda })
        : new Response(JSON.stringify(disciplinas), { status: 200 }),
    ),
  )
}

function abrir() {
  return render(
    <SessaoContext.Provider
      value={{ perfil: { nome: 'Maria' }, entrar: vi.fn(), sair: vi.fn() }}
    >
      <MemoryRouter>
        <InicioPage />
      </MemoryRouter>
    </SessaoContext.Provider>,
  )
}

beforeEach(() => {
  localStorage.setItem('cancha.token', 'teste')
  responder()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('Início', () => {
  it('mostra a saudação, as matérias e os próximos prazos', async () => {
    abrir()

    expect(
      screen.getByRole('heading', { name: 'Olá, Maria!' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('link', { name: /Compiladores/ }),
    ).toHaveAttribute('href', '/disciplinas/1')
    expect(await screen.findByText('Lista 2')).toBeInTheDocument()
    expect(screen.getByText(/Prazo: 10\/11/)).toBeInTheDocument()
    expect(screen.queryByText('Trabalho já entregue')).not.toBeInTheDocument()
  })

  it('avisa quando não há entregas pendentes', async () => {
    responder({ agenda: [] })
    abrir()

    expect(
      await screen.findByText('Nenhuma entrega pendente. Bom trabalho!'),
    ).toBeInTheDocument()
  })

  it('mostra o erro dos prazos sem derrubar as matérias', async () => {
    responder({ agenda: { mensagem: 'Falha nos prazos' }, statusAgenda: 500 })
    abrir()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha nos prazos',
    )
    expect(
      await screen.findByRole('link', { name: /Compiladores/ }),
    ).toBeInTheDocument()
  })
})
