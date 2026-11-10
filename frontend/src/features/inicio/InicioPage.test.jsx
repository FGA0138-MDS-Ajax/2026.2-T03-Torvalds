// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router'
import { SessaoContext } from '../auth/SessaoContext'
import InicioPage from './InicioPage'

const disciplinas = [
  {
    id: 1,
    nome: 'Compiladores',
    periodoLetivo: '2026.2',
    progressoPercentual: 40,
  },
  {
    id: 2,
    nome: 'Projeto Integrador',
    periodoLetivo: '2026.2',
    progressoPercentual: 0,
  },
]

const entregasDaDisciplina1 = [
  {
    id: 1,
    titulo: 'Lista 2',
    tipo: 'Lista',
    prazo: '2099-11-10T18:00:00',
    status: 'A_FAZER',
  },
  {
    id: 2,
    titulo: 'Trabalho já entregue',
    tipo: 'Trabalho',
    prazo: '2099-11-05T18:00:00',
    status: 'CONCLUIDA',
  },
]

const proximas = [
  {
    id: 1,
    titulo: 'Lista 2',
    tipo: 'Lista',
    prazo: '2099-11-10T18:00:00',
    status: 'A_FAZER',
    disciplinaId: 1,
    disciplinaNome: 'Compiladores',
    atrasada: false,
  },
  {
    id: 9,
    titulo: 'Relatório parcial',
    tipo: 'Trabalho',
    prazo: '2020-01-01T10:00:00',
    status: 'A_FAZER',
    disciplinaId: 2,
    disciplinaNome: 'Projeto Integrador',
    atrasada: true,
  },
]

function responder({
  lista = disciplinas,
  statusLista = 200,
  proximasDoAluno = proximas,
} = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url) => {
      if (url.endsWith('/disciplinas')) {
        return new Response(JSON.stringify(lista), { status: statusLista })
      }
      if (url.endsWith('/atividades/proximas')) {
        return new Response(JSON.stringify(proximasDoAluno), { status: 200 })
      }
      if (url.endsWith('/disciplinas/1/atividades')) {
        return new Response(JSON.stringify(entregasDaDisciplina1), {
          status: 200,
        })
      }
      return new Response(JSON.stringify([]), { status: 200 })
    }),
  )
}

function abrir() {
  return render(
    <SessaoContext.Provider
      value={{ perfil: { nome: 'Maria' }, entrar: vi.fn(), sair: vi.fn() }}
    >
      <MemoryRouter>
        <InicioPage />
      </MemoryRouter>
    </SessaoContext.Provider>,
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

describe('Início', () => {
  it('mostra a saudação e os três cartões de resumo', async () => {
    abrir()

    expect(
      screen.getByRole('heading', { name: 'Olá, Maria!' }),
    ).toBeInTheDocument()

    const materias = await screen.findByRole('link', {
      name: 'Matérias: 2 cursando',
    })
    const atividades = screen.getByRole('link', {
      name: 'Atividades: 1 pendentes',
    })

    expect(materias).toHaveAttribute('href', '/materias')
    expect(atividades).toHaveAttribute('href', '/agenda')
    expect(
      screen.getByRole('link', { name: 'Anotações: em breve' }),
    ).toHaveAttribute('href', '/anotacoes')
  })

  it('mostra o progresso geral calculado pelas entregas', async () => {
    abrir()

    expect(await screen.findByText('1/2')).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: '50% do semestre concluído' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Você está indo muito bem!/)).toBeInTheDocument()
  })

  it('lista as próximas atividades vindas do backend e leva à matéria', async () => {
    abrir()

    const item = await screen.findByRole('link', { name: /Lista 2/ })

    expect(item).toHaveAttribute('href', '/disciplinas/1')
    expect(item).toHaveTextContent('Compiladores')
    expect(item).toHaveTextContent('10/11, 18:00')
    expect(screen.getByRole('link', { name: /Relatório parcial/ })).toHaveAttribute(
      'href',
      '/disciplinas/2',
    )
    expect(screen.getByText(/\(atrasada\)/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver tudo/ })).toHaveAttribute(
      'href',
      '/agenda',
    )
  })

  it('mostra as matérias com a contagem de atividades', async () => {
    abrir()

    const cartao = await screen.findByRole('link', {
      name: /1\/2 Atividades/,
    })

    expect(cartao).toHaveAttribute('href', '/disciplinas/1')
    expect(cartao).toHaveTextContent('1/2 Atividades')
    expect(cartao).toHaveTextContent('40%')
    expect(
      screen.getByRole('heading', { name: 'Sua tarde de hoje' }),
    ).toBeInTheDocument()
  })

  it('avisa quando o aluno não tem matérias', async () => {
    responder({ lista: [], proximasDoAluno: [] })
    abrir()

    expect(
      await screen.findByText('Você ainda não tem matérias.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Nenhuma entrega pendente. Bom trabalho!'),
    ).toBeInTheDocument()
  })

  it('mostra o erro e permite tentar novamente', async () => {
    responder({ statusLista: 500 })
    abrir()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar o painel',
    )

    responder()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(
      await screen.findByRole('link', { name: /1\/2 Atividades/ }),
    ).toBeInTheDocument()
  })
})
