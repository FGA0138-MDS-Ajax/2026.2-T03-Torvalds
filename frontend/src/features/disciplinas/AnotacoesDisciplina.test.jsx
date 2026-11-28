// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import AnotacoesDisciplina from './AnotacoesDisciplina'

const anterior = {
  id: 1,
  titulo: 'Revisão da prova',
  texto: 'Estudar análise léxica.',
  criadaEm: '2026-11-10T10:00:00',
}
const recente = {
  id: 2,
  titulo: 'Dúvida para o monitor',
  texto: 'Como funciona o autômato?',
  criadaEm: '2026-11-12T15:30:00',
}

function json(dados, status = 200) {
  return new Response(JSON.stringify(dados), { status })
}

/** Simula a API: GET devolve a lista de anotações. */
function responder({ lista = [] } = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      if (lista === null) return json({ mensagem: 'Falha na lista' }, 500)
      return json(lista)
    }),
  )
}

function abrir() {
  return render(<AnotacoesDisciplina disciplinaId="7" />)
}

beforeEach(() => {
  localStorage.setItem('cancha.token', 'teste')
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('Anotações da disciplina', () => {
  it('lista as anotações da disciplina, a mais recente primeiro', async () => {
    responder({ lista: [anterior, recente] })
    abrir()

    expect(screen.getByRole('status')).toHaveTextContent('Carregando')

    const titulos = await screen.findAllByRole('heading', { level: 3 })

    expect(titulos.map((titulo) => titulo.textContent)).toEqual([
      'Dúvida para o monitor',
      'Revisão da prova',
    ])
    expect(screen.getByText('Estudar análise léxica.')).toBeInTheDocument()
    expect(screen.getByText('2 anotações')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/disciplinas/7/anotacoes'),
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('mostra que não há anotações quando a lista vem vazia', async () => {
    responder({ lista: [] })
    abrir()

    expect(await screen.findByText('Nenhuma anotação ainda.')).toBeVisible()
  })

  it('avisa quando não consegue carregar e tenta de novo', async () => {
    responder({ lista: null })
    abrir()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar as anotações',
    )

    responder({ lista: [anterior] })
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(
      await screen.findByRole('heading', { name: 'Revisão da prova' }),
    ).toBeInTheDocument()
  })

  it('é só para ler: não tem formulário nem botão para adicionar', async () => {
    responder({ lista: [anterior] })
    abrir()
    await screen.findByRole('heading', { name: 'Revisão da prova' })

    expect(screen.queryByLabelText('Título')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Texto')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Adicionar anotação' }),
    ).not.toBeInTheDocument()
  })
})
