import { afterEach, describe, expect, it, vi } from 'vitest'
import { requisicao } from '../../shared/api/client'
import { carregarAgenda } from './agendaApi'

vi.mock('../../shared/api/client', () => ({ requisicao: vi.fn() }))

afterEach(() => vi.clearAllMocks())

describe('carregarAgenda', () => {
  it('entrega uma lista mesmo quando o backend responde agrupado', async () => {
    requisicao.mockResolvedValue({
      A_FAZER: [{ id: 1, titulo: 'Lista 1', situacao: 'A_FAZER' }],
      EM_ANDAMENTO: [],
      CONCLUIDA: [{ id: 2, titulo: 'Prova 1', situacao: 'CONCLUIDA' }],
    })

    const itens = await carregarAgenda()

    expect(itens).toHaveLength(2)
    expect(itens[1]).toMatchObject({ id: 2, status: 'CONCLUIDA' })
  })
})
