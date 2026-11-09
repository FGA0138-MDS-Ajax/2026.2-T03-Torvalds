import { describe, expect, it } from 'vitest'
import {
  corDoTipo,
  formatarPrazoCurto,
  mensagemDeProgresso,
  proximasEntregas,
  resumirEntregas,
} from './inicioUtils'

const entregas = [
  { id: 1, titulo: 'C', prazo: '2026-11-12T10:00:00', status: 'A_FAZER' },
  { id: 2, titulo: 'A', prazo: '2026-11-10T10:00:00', status: 'EM_ANDAMENTO' },
  { id: 3, titulo: 'B', prazo: '2026-11-11T10:00:00', status: 'CONCLUIDA' },
  { id: 4, titulo: 'D', prazo: '2026-11-13T10:00:00', status: 'A_FAZER' },
]

describe('resumirEntregas', () => {
  it('conta concluídas e pendentes e arredonda o percentual', () => {
    expect(resumirEntregas(entregas)).toEqual({
      total: 4,
      concluidas: 1,
      pendentes: 3,
      percentual: 25,
    })
  })

  it('não divide por zero quando não há entregas', () => {
    expect(resumirEntregas([])).toEqual({
      total: 0,
      concluidas: 0,
      pendentes: 0,
      percentual: 0,
    })
  })
})

describe('proximasEntregas', () => {
  it('tira as concluídas, ordena por prazo e respeita o limite', () => {
    const ids = proximasEntregas(entregas, 2).map((item) => item.id)

    expect(ids).toEqual([2, 1])
  })
})

describe('formatarPrazoCurto', () => {
  const agora = new Date(2026, 9, 22, 8, 0)

  it('diz "Hoje" e "Amanhã"', () => {
    expect(formatarPrazoCurto('2026-10-22T23:59:00', agora)).toBe(
      'Hoje, 23:59',
    )
    expect(formatarPrazoCurto('2026-10-23T09:05:00', agora)).toBe(
      'Amanhã, 09:05',
    )
  })

  it('usa dia/mês nas outras datas e ignora data inválida', () => {
    expect(formatarPrazoCurto('2026-10-29T23:59:00', agora)).toBe(
      '29/10, 23:59',
    )
    expect(formatarPrazoCurto(undefined, agora)).toBe('')
    expect(formatarPrazoCurto('abc', agora)).toBe('')
  })
})

describe('corDoTipo', () => {
  it('escolhe a cor pelo tipo, sem depender de acento ou maiúscula', () => {
    expect(corDoTipo('Lista')).toBe('azul')
    expect(corDoTipo('Prova')).toBe('azul')
    expect(corDoTipo('Projeto')).toBe('verde')
    expect(corDoTipo('Exercício')).toBe('amarelo')
    expect(corDoTipo('Trabalho')).toBe('lilas')
    expect(corDoTipo(undefined)).toBe('lilas')
  })
})

describe('mensagemDeProgresso', () => {
  it('muda o incentivo conforme o progresso', () => {
    expect(mensagemDeProgresso({ total: 0, percentual: 0 })).toMatch(/Nenhuma/)
    expect(mensagemDeProgresso({ total: 4, percentual: 0 })).toMatch(/começar/)
    expect(mensagemDeProgresso({ total: 4, percentual: 25 })).toMatch(/começo/)
    expect(mensagemDeProgresso({ total: 4, percentual: 68 })).toBe(
      'Você está indo muito bem!',
    )
  })
})
