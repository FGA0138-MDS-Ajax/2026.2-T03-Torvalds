import { describe, expect, it } from 'vitest'
import {
  agruparPorStatus,
  corDaMateria,
  percentualConcluido,
} from './materiasUtils'

describe('materiasUtils', () => {
  it('repete as cores do protótipo na ordem', () => {
    expect([0, 1, 2, 3, 4, 5].map(corDaMateria)).toEqual([
      'lilas',
      'amarelo',
      'verde',
      'rosa',
      'azul',
      'lilas',
    ])
  })

  it('separa as atividades por status', () => {
    const grupos = agruparPorStatus([
      { id: 1, status: 'A_FAZER' },
      { id: 2, status: 'EM_ANDAMENTO' },
      { id: 3, status: 'CONCLUIDA' },
      { id: 4, status: 'A_FAZER' },
    ])

    expect(grupos.aFazer.map((a) => a.id)).toEqual([1, 4])
    expect(grupos.emAndamento.map((a) => a.id)).toEqual([2])
    expect(grupos.concluidas.map((a) => a.id)).toEqual([3])
  })

  it('calcula o percentual de atividades concluídas', () => {
    expect(percentualConcluido([])).toBe(0)
    expect(
      percentualConcluido([
        { status: 'CONCLUIDA' },
        { status: 'A_FAZER' },
        { status: 'EM_ANDAMENTO' },
        { status: 'CONCLUIDA' },
      ]),
    ).toBe(50)
  })
})
