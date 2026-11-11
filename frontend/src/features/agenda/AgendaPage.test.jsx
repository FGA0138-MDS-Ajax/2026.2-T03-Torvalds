// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import AgendaPage from './AgendaPage'
import {
  formatarPrazoDdMm,
  ehAtrasada,
  categorizarEntrega,
  achatarAgenda,
} from './agendaUtils'

const itensExemplo = [
  {
    id: 1,
    titulo: 'Lista 2: análise léxica',
    disciplina: 'Compiladores',
    tipo: 'Lista',
    prazo: '2099-11-10T18:00:00',
    status: 'A fazer',
  },
  {
    id: 2,
    titulo: 'Trabalho de PI',
    disciplina: 'Projeto Integrador',
    tipo: 'Trabalho',
    prazo: '2099-11-20T23:59:00',
    status: 'EM_ANDAMENTO',
  },
  {
    id: 3,
    titulo: 'Estudo de caso ISO',
    disciplina: 'Qualidade',
    tipo: 'Trabalho',
    prazo: '2000-01-01T12:00:00',
    status: 'CONCLUIDA',
  },
  {
    id: 4,
    titulo: 'Relatório atrasado',
    disciplina: 'MDS',
    tipo: 'Relatório',
    prazo: '2000-01-01T12:00:00',
    status: 'A fazer',
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

  it('achata a resposta agrupada do GET /agenda usando o campo situacao', () => {
    const lista = achatarAgenda({
      A_FAZER: [{ id: 1, titulo: 'Lista 1', situacao: 'A_FAZER' }],
      EM_ANDAMENTO: [],
      CONCLUIDA: [{ id: 2, titulo: 'Quiz', situacao: 'CONCLUIDA' }],
    })

    expect(lista).toEqual([
      { id: 1, titulo: 'Lista 1', situacao: 'A_FAZER', status: 'A_FAZER' },
      { id: 2, titulo: 'Quiz', situacao: 'CONCLUIDA', status: 'CONCLUIDA' },
    ])
    expect(achatarAgenda(itensExemplo)).toBe(itensExemplo)
    expect(achatarAgenda(null)).toEqual([])
  })
})

describe('Página Agenda com integração GET /agenda', () => {
  it('mostra as entregas quando o GET /agenda responde agrupado por situação', async () => {
    responderSucesso({
      A_FAZER: [
        {
          id: 10,
          titulo: 'Lista de exercícios 1',
          disciplina: 'Cálculo 1',
          tipo: 'Lista',
          prazo: '2099-11-10T18:00:00',
          situacao: 'A_FAZER',
        },
      ],
      EM_ANDAMENTO: [],
      CONCLUIDA: [
        {
          id: 11,
          titulo: 'Quiz semanal',
          disciplina: 'MDS',
          tipo: 'Quiz',
          prazo: '2000-01-01T12:00:00',
          situacao: 'CONCLUIDA',
        },
      ],
    })

    abrir()

    expect(await screen.findByText('Lista de exercícios 1')).toBeInTheDocument()
    expect(screen.getByText('Quiz semanal')).toBeInTheDocument()
    expect(screen.getByLabelText('1 atividades em A fazer')).toBeInTheDocument()
    expect(
      screen.getByLabelText('0 atividades em Em andamento'),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('1 atividades em Concluídas'),
    ).toBeInTheDocument()
  })

  it('exibe estado de carregando e depois as três colunas com título, disciplina, tipo e prazo dd/mm', async () => {
    abrir()

    // Estado carregando
    expect(screen.getByRole('status')).toHaveTextContent('Carregando agenda...')

    // Título e colunas
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Agenda' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'A fazer' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Em andamento' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Concluídas' }),
    ).toBeInTheDocument()

    // Itens exibidos com título, disciplina, tipo e prazo dd/mm
    expect(screen.getByText('Lista 2: análise léxica')).toBeInTheDocument()
    expect(screen.getByText('Compiladores')).toBeInTheDocument()
    expect(screen.getByText('Lista')).toBeInTheDocument()
    expect(screen.getByText(/Prazo:\s*10\/11/)).toBeInTheDocument()
  })

  it('destaca atividades atrasadas', async () => {
    abrir()

    const itemAtrasado = await screen.findByText('Relatório atrasado')
    expect(itemAtrasado).toBeInTheDocument()

    // Alerta de atraso presente
    expect(screen.getByText('(Atrasada)')).toBeInTheDocument()

    // Card possui a classe css atrasada
    const card = itemAtrasado.closest('.agenda-card')
    expect(card).toHaveClass('atrasada')

    // Atividade concluída passada não deve ter destaque de atrasada
    const itemConcluido = screen.getByText('Estudo de caso ISO')
    const cardConcluido = itemConcluido.closest('.agenda-card')
    expect(cardConcluido).not.toHaveClass('atrasada')
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
    expect(botaoTentar).toBeInTheDocument()

    // Ao clicar em Tentar de novo com o serviço recuperado
    responderSucesso()
    fireEvent.click(botaoTentar)

    expect(
      await screen.findByText('Lista 2: análise léxica'),
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
                prazo: '2099-12-01T23:59:00',
                status: 'A fazer',
              },
            ]),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }
        return new Response('', { status: 404 })
      }),
    )

    abrir()

    expect(await screen.findByText('Parser LR')).toBeInTheDocument()
    expect(screen.getByText('Compiladores')).toBeInTheDocument()
    expect(screen.getByText(/Prazo:\s*01\/12/)).toBeInTheDocument()
  })
})
