// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { criarAnotacao, listarAnotacoes } from './anotacoesApi'

const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), { status })

// Formato que o back devolve (AnotacaoResponse)
const doBack = {
  id: 3,
  disciplinaId: 7,
  disciplinaNome: 'Compiladores',
  titulo: 'Resumo',
  texto: 'Texto',
  dataCriacao: '2026-11-28T09:30:00',
}

beforeEach(() => {
  localStorage.setItem('cancha.token', 'teste')
})
afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('anotacoesApi com o formato do back', () => {
  it('lista usando a data do back como criadaEm', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json([doBack])),
    )

    const [anotacao] = await listarAnotacoes('7')

    expect(anotacao.criadaEm).toBe('2026-11-28T09:30:00')
    expect(anotacao.titulo).toBe('Resumo')
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/disciplinas/7/anotacoes'),
      expect.anything(),
    )
  })

  it('cria enviando só título e texto, e devolve a data como criadaEm', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json(doBack, 201)),
    )

    const criada = await criarAnotacao('7', {
      titulo: 'Resumo',
      texto: 'Texto',
    })

    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      titulo: 'Resumo',
      texto: 'Texto',
    })
    expect(fetch.mock.calls[0][1].method).toBe('POST')
    expect(criada.criadaEm).toBe('2026-11-28T09:30:00')
  })

  it('mantém criadaEm quando ela já vem pronta', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        json([{ ...doBack, dataCriacao: undefined, criadaEm: 'x' }]),
      ),
    )

    expect((await listarAnotacoes('7'))[0].criadaEm).toBe('x')
  })
})
