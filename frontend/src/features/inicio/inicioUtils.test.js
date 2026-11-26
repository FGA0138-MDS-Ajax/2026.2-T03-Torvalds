import { describe, expect, it } from 'vitest'
import {
  corDoTipo,
  contarAtrasadas,
  coresDasDisciplinas,
  contarEntregasDeHoje,
  descreverDataLonga,
  descreverDiasAte,
  entregasDoMes,
  entregasDaSemana,
  formatarHora,
  formatarPrazoCurto,
  proximaProva,
  resumirEntregas,
  saudacao,
  seloDoPrazo,
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

describe('formatarPrazoCurto', () => {
  const agora = new Date(2026, 9, 22, 8, 0)

  it('diz "Hoje" e "Amanhã"', () => {
    expect(formatarPrazoCurto('2026-10-22T23:59:00', agora)).toBe('Hoje, 23:59')
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

// Quinta-feira, 26/11/2026, 10:00
const agora = new Date(2026, 10, 26, 10, 0)

describe('proximaProva', () => {
  const provas = [
    { id: 1, tipo: 'Prova', prazo: '2026-12-10T23:59:00', status: 'A_FAZER' },
    { id: 2, tipo: 'prova', prazo: '2026-12-01T09:00:00', status: 'A_FAZER' },
    { id: 3, tipo: 'Prova', prazo: '2026-11-27T09:00:00', status: 'CONCLUIDA' },
    { id: 4, tipo: 'Prova', prazo: '2026-11-20T09:00:00', status: 'A_FAZER' },
    { id: 5, tipo: 'Lista', prazo: '2026-11-27T09:00:00', status: 'A_FAZER' },
  ]

  it('escolhe a prova mais próxima que ainda não passou nem foi concluída', () => {
    expect(proximaProva(provas, agora).id).toBe(2)
  })

  it('devolve null quando não há prova futura', () => {
    expect(proximaProva(provas.slice(2), agora)).toBeNull()
    expect(proximaProva([], agora)).toBeNull()
  })
})

describe('descreverDiasAte', () => {
  it('conta dias de calendário', () => {
    expect(descreverDiasAte('2026-11-26T23:59:00', agora)).toBe('hoje')
    expect(descreverDiasAte('2026-11-27T08:00:00', agora)).toBe('amanhã')
    expect(descreverDiasAte('2026-12-10T23:59:00', agora)).toBe('em 14 dias')
  })
})

describe('entregasDaSemana', () => {
  const doDia = [
    { id: 1, prazo: '2026-11-25T23:59:00', status: 'A_FAZER' },
    { id: 2, prazo: '2026-11-26T12:00:00', status: 'A_FAZER' },
    { id: 3, prazo: '2026-11-26T18:00:00', status: 'CONCLUIDA' },
    { id: 4, prazo: '2026-12-07T10:00:00', status: 'A_FAZER' },
    { id: 5, status: 'A_FAZER' },
  ]

  it('monta de segunda a domingo e marca o dia de hoje', () => {
    const semana = entregasDaSemana(doDia, agora)

    expect(semana.map((dia) => dia.rotulo)).toEqual([
      'Seg',
      'Ter',
      'Qua',
      'Qui',
      'Sex',
      'Sáb',
      'Dom',
    ])
    expect(semana.filter((dia) => dia.ehHoje).map((dia) => dia.rotulo)).toEqual(
      ['Qui'],
    )
  })

  it('conta pendentes e concluídas em cada dia e ignora outras semanas', () => {
    const [seg, , qua, qui] = entregasDaSemana(doDia, agora)

    expect(seg).toMatchObject({ concluidas: 0, pendentes: 0 })
    expect(qua).toMatchObject({ concluidas: 0, pendentes: 1 })
    expect(qui).toMatchObject({ concluidas: 1, pendentes: 1 })
  })
})

describe('saudacao', () => {
  it('muda conforme a hora do dia', () => {
    expect(saudacao(new Date(2026, 10, 26, 8))).toBe('Bom dia!')
    expect(saudacao(new Date(2026, 10, 26, 15))).toBe('Boa tarde!')
    expect(saudacao(new Date(2026, 10, 26, 21))).toBe('Boa noite!')
  })

  it('usa só o primeiro nome', () => {
    expect(
      saudacao(new Date(2026, 10, 26, 8), '  Jefferson de Souza Reis '),
    ).toBe('Bom dia, Jefferson!')
    expect(saudacao(new Date(2026, 10, 26, 15), 'Ana')).toBe('Boa tarde, Ana!')
  })
})

describe('descreverDataLonga', () => {
  it('escreve o dia da semana, o dia e o mês', () => {
    expect(descreverDataLonga(agora)).toMatch(/^Quinta-feira, 26 de novembro/)
  })
})

describe('contagens do painel', () => {
  const lista = [
    { id: 1, prazo: '2026-11-26T23:59:00', status: 'A_FAZER' },
    { id: 2, prazo: '2026-11-26T08:00:00', status: 'CONCLUIDA' },
    { id: 3, prazo: '2026-11-25T23:59:00', status: 'A_FAZER' },
    { id: 4, prazo: '2026-12-01T10:00:00', status: 'A_FAZER' },
    { id: 5, status: 'A_FAZER' },
  ]

  it('conta as entregas pendentes que vencem hoje', () => {
    expect(contarEntregasDeHoje(lista, agora)).toBe(1)
  })

  it('conta as atrasadas e ignora as concluídas', () => {
    expect(contarAtrasadas(lista, agora)).toBe(1)
  })
})

describe('seloDoPrazo e formatarHora', () => {
  it('separa dia e mês e escreve a hora', () => {
    expect(seloDoPrazo('2026-11-26T23:59:00')).toEqual({
      dia: '26',
      mes: 'NOV',
    })
    expect(formatarHora('2026-11-26T09:05:00')).toBe('09:05')
    expect(formatarHora(undefined)).toBe('')
  })
})

describe('entregasDoMes', () => {
  const lista = [
    {
      id: 1,
      disciplinaId: 1,
      disciplina: 'Cálculo',
      prazo: '2026-11-26T10:00:00',
      status: 'A_FAZER',
    },
    {
      id: 2,
      disciplinaId: 2,
      disciplina: 'Física',
      prazo: '2026-11-26T12:00:00',
      status: 'CONCLUIDA',
    },
    {
      id: 3,
      disciplinaId: 2,
      disciplina: 'Física',
      prazo: '2026-11-30T12:00:00',
      status: 'A_FAZER',
    },
    {
      id: 4,
      disciplinaId: 1,
      disciplina: 'Cálculo',
      prazo: '2026-12-02T12:00:00',
      status: 'A_FAZER',
    },
    { id: 5, disciplinaId: 3, disciplina: 'Química', status: 'A_FAZER' },
  ]

  it('divide o mês em dias, cada um com as entregas por matéria', () => {
    const { dias, total, pendentes } = entregasDoMes(lista, 2026, 10)

    expect(dias).toHaveLength(30)
    expect(dias[25]).toMatchObject({ dia: 26, total: 2 })
    expect([...dias[25].porMateria]).toEqual([
      [1, 1],
      [2, 1],
    ])
    expect(dias[29].total).toBe(1)
    expect(total).toBe(3)
    expect(pendentes).toBe(2)
  })

  it('lista só as matérias com entrega no mês, com a cor recebida', () => {
    const cores = new Map([
      [1, 'verde'],
      [2, 'azul'],
    ])
    const novembro = entregasDoMes(lista, 2026, 10, cores).materias
    const dezembro = entregasDoMes(lista, 2026, 11, cores).materias

    expect(novembro.map((m) => [m.nome, m.total, m.cor])).toEqual([
      ['Cálculo', 1, 'verde'],
      ['Física', 2, 'azul'],
    ])
    expect(dezembro).toHaveLength(1)
    expect(dezembro[0].cor).toBe('verde')
  })
})

describe('coresDasDisciplinas', () => {
  it('usa a cor fixa das matérias conhecidas, igual a Matérias e Agenda', () => {
    const cores = coresDasDisciplinas([
      { id: 5, nome: 'Compiladores 1' },
      { id: 6, nome: 'Teoria dos Números 1' },
      { id: 7, nome: 'Métodos de Desenvolvimento de Software' },
    ])

    expect(cores.get(5)).toBe('lilas')
    expect(cores.get(6)).toBe('azul')
    expect(cores.get(7)).toBe('rosa')
  })
})
