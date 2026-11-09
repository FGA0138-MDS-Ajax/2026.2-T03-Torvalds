// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router'
import MateriasPage from './MateriasPage'

const disciplinas = [
  {
    id: 1,
    nome: 'Compiladores',
    periodoLetivo: '2026.2',
    progressoPercentual: 40,
  },
  {
    id: 2,
    nome: 'Projeto Integrador',
    periodoLetivo: '2026.2',
    progressoPercentual: 0,
  },
]

function responder(status = 200, corpo = disciplinas) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(corpo), { status })),
  )
}

function abrir() {
  return render(
    <MemoryRouter>
      <MateriasPage />
    </MemoryRouter>,
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

describe('Matérias', () => {
  it('lista as matérias com link para a disciplina', async () => {
    abrir()

    expect(screen.getByRole('status')).toHaveTextContent('Carregando')

    const link = await screen.findByRole('link', { name: /Compiladores/ })

    expect(link).toHaveAttribute('href', '/disciplinas/1')
    expect(screen.getByText('40% concluído')).toBeInTheDocument()
  })

  it('filtra pela busca e avisa quando nada é encontrado', async () => {
    abrir()
    await screen.findByRole('link', { name: /Compiladores/ })

    const busca = screen.getByLabelText(/Buscar matéria/)

    fireEvent.change(busca, { target: { value: 'projeto' } })

    expect(
      screen.queryByRole('link', { name: /Compiladores/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Projeto Integrador/ }),
    ).toBeInTheDocument()

    fireEvent.change(busca, { target: { value: 'xyz' } })

    expect(
      screen.getByText('Nenhuma matéria encontrada para essa busca.'),
    ).toBeInTheDocument()
  })

  it('mostra o estado vazio quando o aluno não tem matérias', async () => {
    responder(200, [])
    abrir()

    expect(
      await screen.findByText('Você ainda não tem matérias.'),
    ).toBeInTheDocument()
  })

  it('mostra o erro e permite tentar novamente', async () => {
    responder(503, { mensagem: 'Serviço indisponível' })
    abrir()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Serviço indisponível',
    )

    responder()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(
      await screen.findByRole('link', { name: /Compiladores/ }),
    ).toBeInTheDocument()
  })
})
