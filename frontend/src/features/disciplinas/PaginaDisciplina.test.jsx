// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import PaginaDisciplina from './PaginaDisciplina'

const entrega = {
  id: 1,
  titulo: 'Análise léxica',
  descricao: 'Identifique os tokens.',
  tipo: 'Exercício',
  prazo: '2099-11-10T18:00:00',
  status: 'A fazer',
}
function abrir(id = '7') {
  return render(
    <MemoryRouter initialEntries={[`/disciplinas/${id}`]}>
      <Routes>
        <Route path="/disciplinas/:id" element={<PaginaDisciplina />} />
      </Routes>
    </MemoryRouter>,
  )
}
function responder(entregas = [entrega]) {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async (url) =>
        new Response(
          JSON.stringify(
            url.endsWith('/disciplinas')
              ? [{ id: 7, nome: 'Compiladores', periodoLetivo: '2026.2' }]
              : entregas,
          ),
          { status: 200 },
        ),
    ),
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

describe('Página de disciplina com API HTTP', () => {
  it('carrega o cabeçalho e uma entrega no prazo usando o ID da rota', async () => {
    abrir()
    expect(screen.getByRole('status')).toHaveTextContent('Carregando')
    expect(
      await screen.findByRole('heading', { name: 'Compiladores' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Análise léxica' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Atrasada')).not.toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/disciplinas/7/atividades'),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })
  it('destaca uma entrega vencida e mantém concluídas fora do atraso', async () => {
    responder([
      { ...entrega, prazo: '2000-01-01T12:00:00' },
      {
        ...entrega,
        id: 2,
        titulo: 'Já entregue',
        prazo: '2000-01-01T12:00:00',
        status: 'CONCLUIDA',
      },
    ])
    abrir()
    expect(await screen.findByText('Atrasada')).toBeInTheDocument()
    expect(screen.getByText('Concluída')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Concluídas' }))
    expect(screen.queryByText('Atrasada')).not.toBeInTheDocument()
    expect(screen.getByText('Já entregue')).toBeInTheDocument()
  })
  it('preserva o cabeçalho quando não há entregas', async () => {
    responder([])
    abrir()
    expect(
      await screen.findByText('Nenhuma entrega encontrada.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Compiladores' }),
    ).toBeInTheDocument()
  })
  it('permite tentar novamente após falha da API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ mensagem: 'Serviço indisponível' }), {
            status: 503,
          }),
      ),
    )
    abrir()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Serviço indisponível',
    )
    responder()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(
      await screen.findByRole('heading', { name: 'Compiladores' }),
    ).toBeInTheDocument()
  })
})
