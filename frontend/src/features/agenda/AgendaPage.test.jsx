// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import AgendaPage from './AgendaPage'
import {
  agruparPorDia,
  categorizarEntrega,
  ehAtrasada,
  formatarPrazoDdMm,
  montarSemanas,
  nomeDoMes,
} from './agendaUtils'

const hoje = new Date()
const NOME_DO_MES_ATUAL = nomeDoMes(hoje.getFullYear(), hoje.getMonth())

function iso(data, hora = '18:00:00') {
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')

  return `${data.getFullYear()}-${mes}-${dia}T${hora}`
}

const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 15)

// Dois itens de hoje (mês atual) e um do mês seguinte.
const itensExemplo = [
  {
    id: 1,
    titulo: 'Lista 2: análise léxica',
    disciplina: 'Compiladores',
    tipo: 'Lista',
    prazo: iso(hoje, '23:59:00'),
    status: 'A_FAZER',
  },
  {
    id: 2,
    titulo: 'Trabalho de PI',
    disciplina: 'Projeto Integrador em Engenharia',
    tipo: 'Trabalho',
    prazo: iso(hoje, '23:59:00'),
    status: 'EM_ANDAMENTO',
  },
  {
    id: 3,
    titulo: 'Prova do mês seguinte',
    disciplina: 'Compiladores',
    tipo: 'Prova',
    prazo: iso(proximoMes),
    status: 'A_FAZER',
  },
  {
    id: 4,
    titulo: 'Relatório atrasado',
    disciplina: 'Teoria dos Números',
    tipo: 'Trabalho',
    prazo: iso(hoje, '00:00:00'),
    status: 'A_FAZER',
  },
]

function abrir() {
  return render(
    <MemoryRouter initialEntries={['/agenda']}>
      <Routes>
        <Route path="/agenda" element={<AgendaPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

function responderSucesso(dados = itensExemplo) {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(JSON.stringify(dados), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    ),
  )
}

beforeEach(() => {
  localStorage.setItem('cancha.token', 'teste')
  responderSucesso()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('Funções utilitárias da Agenda', () => {
  it('formata prazo no formato dd/mm', () => {
    expect(formatarPrazoDdMm('2026-10-27T14:30:00')).toBe('27/10')
    expect(formatarPrazoDdMm('2026-05-04T00:00:00')).toBe('04/05')
    expect(formatarPrazoDdMm(null)).toBe('')
    expect(formatarPrazoDdMm('data-invalida')).toBe('')
  })

  it('identifica corretamente entregas atrasadas', () => {
    // Prazo no passado e não concluída -> atrasada
    expect(
      ehAtrasada({ prazo: '2000-01-01T00:00:00', status: 'A fazer' }),
    ).toBe(true)
    expect(
      ehAtrasada({ prazo: '2000-01-01T00:00:00', status: 'EM_ANDAMENTO' }),
    ).toBe(true)

    // Concluída no passado -> não atrasada
    expect(
      ehAtrasada({ prazo: '2000-01-01T00:00:00', status: 'CONCLUIDA' }),
    ).toBe(false)
    expect(
      ehAtrasada({ prazo: '2000-01-01T00:00:00', status: 'Concluída' }),
    ).toBe(false)

    // No futuro -> não atrasada
    expect(
      ehAtrasada({ prazo: '2099-01-01T00:00:00', status: 'A fazer' }),
    ).toBe(false)
  })

  it('categoriza as entregas para as 3 colunas', () => {
    expect(categorizarEntrega({ status: 'A fazer' })).toBe('A_FAZER')
    expect(categorizarEntrega({ status: 'EM_ANDAMENTO' })).toBe('EM_ANDAMENTO')
    expect(categorizarEntrega({ status: 'CONCLUIDA' })).toBe('CONCLUIDAS')
    expect(categorizarEntrega({ status: 'Concluída' })).toBe('CONCLUIDAS')
  })

  it('monta as semanas do mês de segunda a domingo', () => {
    // Outubro de 2026 começa numa quinta-feira e tem 31 dias: 5 semanas.
    const semanas = montarSemanas(2026, 9)

    expect(semanas).toHaveLength(5)
    expect(semanas.every((semana) => semana.length === 7)).toBe(true)
    expect(semanas[0][0].chave).toBe('2026-09-28')
    expect(semanas[0][0].foraDoMes).toBe(true)
    expect(semanas[0][3].chave).toBe('2026-10-01')
    expect(semanas[0][3].foraDoMes).toBe(false)
    expect(semanas[4][6].chave).toBe('2026-11-01')
    expect(semanas[4][6].foraDoMes).toBe(true)
  })

  it('agrupa as entregas por dia em ordem de prazo e ignora datas inválidas', () => {
    const grupos = agruparPorDia([
      { id: 1, prazo: '2026-10-07T20:00:00' },
      { id: 2, prazo: '2026-10-07T09:00:00' },
      { id: 3, prazo: '2026-10-08T10:00:00' },
      { id: 4, prazo: 'invalida' },
      { id: 5 },
    ])

    expect(grupos.get('2026-10-07').map((i) => i.id)).toEqual([2, 1])
    expect(grupos.get('2026-10-08').map((i) => i.id)).toEqual([3])
    expect(grupos.size).toBe(2)
  })

  it('escreve o nome do mês como no protótipo', () => {
    expect(nomeDoMes(2026, 9)).toBe('Outubro 2026')
    expect(nomeDoMes(2027, 0)).toBe('Janeiro 2027')
  })
})

describe('Página Agenda (calendário)', () => {
  it('mostra o carregamento e depois o calendário do mês atual com as entregas', async () => {
    abrir()

    expect(screen.getByRole('status')).toHaveTextContent('Carregando')
    expect(
      await screen.findByRole('heading', { name: NOME_DO_MES_ATUAL }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'SEG' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Lista 2: análise léxica, Compiladores, a fazer/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Trabalho de PI, Projeto Integrador/),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Prova do mês seguinte/)).not.toBeInTheDocument()
  })

  it('navega entre os meses', async () => {
    abrir()
    await screen.findByRole('heading', { name: NOME_DO_MES_ATUAL })

    fireEvent.click(screen.getByRole('button', { name: 'Próximo mês' }))

    expect(
      screen.getByRole('heading', {
        name: nomeDoMes(proximoMes.getFullYear(), proximoMes.getMonth()),
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Prova do mês seguinte/)).toBeInTheDocument()
    expect(screen.queryByText(/Trabalho de PI/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Mês anterior' }))

    expect(screen.getByText(/Trabalho de PI/)).toBeInTheDocument()
  })

  it('destaca as atividades atrasadas e marca as concluídas', async () => {
    responderSucesso([
      ...itensExemplo,
      {
        id: 9,
        titulo: 'Já entregue',
        disciplina: 'Compiladores',
        tipo: 'Lista',
        prazo: iso(hoje, '00:00:00'),
        status: 'CONCLUIDA',
      },
    ])
    abrir()

    const atrasada = (await screen.findByText(/Relatório atrasado/)).closest(
      'li',
    )
    const concluida = screen.getByText(/Já entregue/).closest('li')

    expect(atrasada).toHaveClass('agenda-chip-atrasada')
    expect(concluida).toHaveClass('agenda-chip-concluida')
    expect(concluida).not.toHaveClass('agenda-chip-atrasada')
    expect(
      screen.getByText(/Já entregue, Compiladores, concluída/),
    ).toBeInTheDocument()
  })

  it('usa a mesma cor da matéria no calendário e no filtro', async () => {
    abrir()

    const chip = (await screen.findByText(/Lista 2: análise léxica/)).closest(
      'li',
    )

    expect(chip).toHaveClass('agenda-chip-lilas')
    expect(screen.getByText(/Trabalho de PI/).closest('li')).toHaveClass(
      'agenda-chip-verde',
    )
  })

  it('filtra as entregas pelas matérias marcadas', async () => {
    abrir()
    await screen.findByText(/Lista 2: análise léxica/)

    fireEvent.click(screen.getByRole('checkbox', { name: 'Compiladores' }))

    expect(
      screen.queryByText(/Lista 2: análise léxica/),
    ).not.toBeInTheDocument()
    expect(screen.getByText(/Trabalho de PI/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('checkbox', { name: 'Compiladores' }))

    expect(screen.getByText(/Lista 2: análise léxica/)).toBeInTheDocument()
  })

  it('mostra as atividades do mês em lista com a data dd/mm', async () => {
    abrir()
    await screen.findByText(/Lista 2: análise léxica/)

    fireEvent.click(screen.getByRole('button', { name: 'Lista' }))

    expect(screen.getByText('Lista 2: análise léxica')).toBeInTheDocument()
    expect(screen.getAllByText(formatarPrazoDdMm(iso(hoje))).length).toBe(3)
    expect(screen.queryByText('Prova do mês seguinte')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Próximo mês' }))

    expect(screen.getByText('Prova do mês seguinte')).toBeInTheDocument()
  })

  it('mostra o formulário de adicionar tarefa desativado e como Em breve', async () => {
    abrir()
    await screen.findByText(/Lista 2: análise léxica/)

    expect(screen.getByText('Em breve')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeDisabled()
  })

  it('exibe estado vazio quando não há atividades', async () => {
    responderSucesso([])
    abrir()

    expect(
      await screen.findByText('Nenhuma atividade na agenda.'),
    ).toBeInTheDocument()
  })

  it('exibe estado de erro e permite "Tentar de novo"', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ mensagem: 'Falha ao buscar agenda' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }),
      ),
    )

    abrir()

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Falha ao buscar agenda')).toBeInTheDocument()

    const botaoTentar = screen.getByRole('button', { name: /Tentar de novo/i })

    responderSucesso()
    fireEvent.click(botaoTentar)

    expect(
      await screen.findByText(/Lista 2: análise léxica/),
    ).toBeInTheDocument()
  })

  it('realiza fallback consultando /disciplinas caso /agenda retorne 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url) => {
        if (url.endsWith('/agenda')) {
          return new Response(JSON.stringify({ mensagem: 'Not Found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        if (url.endsWith('/disciplinas')) {
          return new Response(
            JSON.stringify([
              { id: 1, nome: 'Compiladores', periodoLetivo: '2026.2' },
            ]),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }
        if (url.includes('/disciplinas/1/atividades')) {
          return new Response(
            JSON.stringify([
              {
                id: 10,
                titulo: 'Parser LR',
                tipo: 'Trabalho',
                prazo: iso(hoje, '23:59:00'),
                status: 'A_FAZER',
              },
            ]),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }
        return new Response('', { status: 404 })
      }),
    )

    abrir()

    expect(
      await screen.findByText(/Parser LR, Compiladores, a fazer/),
    ).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Compiladores' })).toBeChecked()
  })
})
