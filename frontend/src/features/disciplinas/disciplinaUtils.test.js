import { describe, expect, it } from 'vitest'
import {
  categoriaDaEntrega,
  contarPorCategoria,
  descreverPrazo,
  estaAtrasada,
  ordenarPorUrgencia,
  resumirPendencias,
} from './disciplinaUtils'

// Quarta-feira, 15/04/2026, 10h.
const agora = new Date(2026, 3, 15, 10, 0, 0)

function entrega(id, status, prazo) {
  return { id, status, prazo }
}

describe('categoriaDaEntrega e estaAtrasada', () => {
  it('separa concluída, em andamento e a fazer', () => {
    expect(categoriaDaEntrega({ status: 'CONCLUIDA' })).toBe('concluida')
    expect(categoriaDaEntrega({ status: 'EM_ANDAMENTO' })).toBe('andamento')
    expect(categoriaDaEntrega({ status: 'A_FAZER' })).toBe('afazer')
    expect(categoriaDaEntrega({ status: 'qualquer outro' })).toBe('afazer')
  })

  it('só considera atrasada a entrega vencida e não concluída', () => {
    const vencida = '2026-04-01T12:00:00'

    expect(estaAtrasada(entrega(1, 'A_FAZER', vencida), agora)).toBe(true)
    expect(estaAtrasada(entrega(2, 'EM_ANDAMENTO', vencida), agora)).toBe(true)
    expect(estaAtrasada(entrega(3, 'CONCLUIDA', vencida), agora)).toBe(false)
    expect(
      estaAtrasada(entrega(4, 'A_FAZER', '2026-05-01T12:00:00'), agora),
    ).toBe(false)
  })
})

describe('ordenarPorUrgencia', () => {
  it('põe as atrasadas, depois as próximas e por último as concluídas', () => {
    const lista = [
      entrega(1, 'CONCLUIDA', '2026-03-01T12:00:00'),
      entrega(2, 'A_FAZER', '2026-06-01T12:00:00'),
      entrega(3, 'A_FAZER', '2026-04-20T12:00:00'),
      entrega(4, 'EM_ANDAMENTO', '2026-04-10T12:00:00'),
      entrega(5, 'A_FAZER', '2026-04-01T12:00:00'),
    ]

    expect(ordenarPorUrgencia(lista, agora).map((item) => item.id)).toEqual([
      5, 4, 3, 2, 1,
    ])
  })

  it('não altera a lista recebida', () => {
    const lista = [
      entrega(1, 'A_FAZER', '2026-06-01T12:00:00'),
      entrega(2, 'A_FAZER', '2026-05-01T12:00:00'),
    ]

    ordenarPorUrgencia(lista, agora)

    expect(lista.map((item) => item.id)).toEqual([1, 2])
  })
})

describe('contarPorCategoria', () => {
  it('conta o total e cada situação', () => {
    const lista = [
      entrega(1, 'A_FAZER', '2026-06-01T12:00:00'),
      entrega(2, 'EM_ANDAMENTO', '2026-06-01T12:00:00'),
      entrega(3, 'CONCLUIDA', '2026-06-01T12:00:00'),
      entrega(4, 'CONCLUIDA', '2026-06-01T12:00:00'),
    ]

    expect(contarPorCategoria(lista)).toEqual({
      todas: 4,
      afazer: 1,
      andamento: 1,
      concluida: 2,
    })
  })
})

describe('descreverPrazo', () => {
  it.each([
    ['2026-04-15T23:59:00', 'vence hoje'],
    ['2026-04-15T08:00:00', 'venceu hoje'],
    ['2026-04-14T23:59:00', 'venceu ontem'],
    ['2026-04-13T12:00:00', 'venceu há 2 dias'],
    ['2026-03-24T12:00:00', 'venceu há 22 dias'],
    ['2026-04-16T00:30:00', 'vence amanhã'],
    ['2026-04-17T12:00:00', 'faltam 2 dias'],
    ['2026-05-15T12:00:00', 'faltam 30 dias'],
  ])('o prazo %s vira "%s"', (prazo, texto) => {
    expect(descreverPrazo(prazo, agora)).toBe(texto)
  })

  it('devolve vazio para uma data inválida', () => {
    expect(descreverPrazo('não é data', agora)).toBe('')
  })
})

describe('resumirPendencias', () => {
  it('resume as atrasadas e as em andamento, no singular e no plural', () => {
    const vencida = '2026-04-01T12:00:00'

    expect(resumirPendencias([entrega(1, 'A_FAZER', vencida)], agora)).toBe(
      '1 atrasada',
    )
    expect(
      resumirPendencias(
        [
          entrega(1, 'A_FAZER', vencida),
          entrega(2, 'A_FAZER', vencida),
          entrega(3, 'EM_ANDAMENTO', '2026-06-01T12:00:00'),
        ],
        agora,
      ),
    ).toBe('2 atrasadas · 1 em andamento')
  })

  it('fica vazio quando não há pendências a destacar', () => {
    expect(
      resumirPendencias(
        [
          entrega(1, 'A_FAZER', '2026-06-01T12:00:00'),
          entrega(2, 'CONCLUIDA', '2026-04-01T12:00:00'),
        ],
        agora,
      ),
    ).toBe('')
  })
})
