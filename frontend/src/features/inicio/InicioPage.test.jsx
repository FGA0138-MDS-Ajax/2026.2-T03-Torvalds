// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
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

// O GET /progresso devolve o resumo do semestre já somado pelo back-end.
const progresso = { concluidas: 1, total: 2, percentual: 50 }

// Hoje às 23:59, no fuso de quem roda o teste.
function prazoDeHoje() {
  const hoje = new Date()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')

  return `${hoje.getFullYear()}-${mes}-${dia}T23:59:00`
}

function responder({
  lista = disciplinas,
  statusLista = 200,
  proximasDoAluno = proximas,
  progressoDoAluno = progresso,
  entregasDa1 = entregasDaDisciplina1,
} = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url) => {
      if (url.endsWith('/disciplinas')) {
        return new Response(JSON.stringify(lista), { status: statusLista })
      }
      if (url.endsWith('/progresso')) {
        return new Response(JSON.stringify(progressoDoAluno), { status: 200 })
      }
      if (url.endsWith('/atividades/proximas')) {
        return new Response(JSON.stringify(proximasDoAluno), { status: 200 })
      }
      if (url.endsWith('/disciplinas/1/atividades')) {
        return new Response(JSON.stringify(entregasDa1), {
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
  it('mostra a saudação e os três cartões de destaque', async () => {
    abrir()

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /^(Bom dia|Boa tarde|Boa noite)!$/,
      }),
    ).toBeInTheDocument()

    const materias = await screen.findByRole('link', {
      name: 'Matérias: 2 em curso',
    })

    expect(materias).toHaveAttribute('href', '/materias')
    expect(
      screen.getByRole('heading', { name: 'Entregas da semana' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Próxima prova: nenhuma marcada' }),
    ).toHaveAttribute('href', '/agenda')
    expect(
      screen.queryByRole('link', { name: /Anotações/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Sua tarde de hoje' }),
    ).not.toBeInTheDocument()
  })

  it('mostra a próxima prova e leva à matéria dela', async () => {
    responder({
      entregasDa1: [
        ...entregasDaDisciplina1,
        {
          id: 3,
          titulo: 'Prova 03',
          tipo: 'Prova',
          prazo: '2099-12-10T23:59:00',
          status: 'A_FAZER',
        },
      ],
    })
    abrir()

    const cartao = await screen.findByRole('link', {
      name: /Próxima prova: Prova 03, Compiladores, em \d+ dias/,
    })

    expect(cartao).toHaveAttribute('href', '/disciplinas/1')
    expect(cartao).toHaveTextContent('10/12, 23:59')
  })

  it('avisa quantas entregas vencem hoje', async () => {
    responder({
      entregasDa1: [
        {
          id: 7,
          titulo: 'Revisão',
          tipo: 'Lista',
          prazo: prazoDeHoje(),
          status: 'A_FAZER',
        },
      ],
    })
    abrir()

    expect(await screen.findByText('1 entrega para hoje')).toBeInTheDocument()
  })

  describe('entregas do mês inteiro', () => {
    beforeEach(() => {
      responder({
        entregasDa1: [
          {
            id: 7,
            titulo: 'Revisão',
            tipo: 'Lista',
            prazo: prazoDeHoje(),
            status: 'A_FAZER',
          },
        ],
      })
    })

    it('abre pelo botão do card, lista as entregas e fecha com Esc', async () => {
      abrir()

      const botao = await screen.findByRole('button', {
        name: 'Ver as entregas do mês',
      })

      fireEvent.click(botao)

      const janela = screen.getByRole('dialog', { name: /^Entregas de / })

      expect(within(janela).getByRole('status')).toHaveTextContent('1 pendente')
      expect(within(janela).getByText('Compiladores')).toBeInTheDocument()
      expect(
        screen.queryByRole('link', { name: /Ver agenda/ }),
      ).not.toBeInTheDocument()

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(botao).toHaveFocus()
    })

    it('abre ao clicar no card e fecha pelo botão Fechar', async () => {
      abrir()

      fireEvent.click(
        await screen.findByRole('heading', { name: 'Entregas da semana' }),
      )

      const janela = screen.getByRole('dialog')

      fireEvent.click(within(janela).getByRole('button', { name: 'Fechar' }))

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('troca de mês pelos botões de navegação', async () => {
      abrir()

      fireEvent.click(
        await screen.findByRole('button', { name: 'Ver as entregas do mês' }),
      )

      const titulo = screen.getByRole('heading', { name: /^Entregas de / })
      const antes = titulo.textContent

      fireEvent.click(screen.getByRole('button', { name: 'Próximo mês' }))

      expect(titulo.textContent).not.toBe(antes)
      expect(
        within(screen.getByRole('dialog')).getByRole('status'),
      ).toHaveTextContent('Nenhuma entrega neste mês.')
    })
  })

  it('mostra o progresso do semestre vindo do GET /progresso', async () => {
    abrir()

    const feitas = (await screen.findByText('Feitas')).closest('div')

    expect(feitas).toHaveTextContent('1 de 2')
    expect(screen.getByText('Pendentes').closest('div')).toHaveTextContent('1')
    expect(screen.getByText('Atrasadas').closest('div')).toHaveTextContent('0')
    expect(
      screen.getByRole('img', { name: '50% do semestre concluído' }),
    ).toBeInTheDocument()
  })

  it('usa o valor do back-end, e não a soma das entregas da tela', async () => {
    // O back-end soma todas as disciplinas do aluno; a tela baixa as entregas
    // de algumas. Quando os dois divergem, quem manda é o back-end.
    responder({
      progressoDoAluno: { concluidas: 9, total: 12, percentual: 75 },
    })
    abrir()

    const feitas = (await screen.findByText('Feitas')).closest('div')

    expect(feitas).toHaveTextContent('9 de 12')
    expect(screen.getByText('Pendentes').closest('div')).toHaveTextContent('3')
    expect(
      screen.getByRole('img', { name: '75% do semestre concluído' }),
    ).toBeInTheDocument()
  })

  it('mostra o estado vazio quando o aluno não tem atividades', async () => {
    responder({ progressoDoAluno: { concluidas: 0, total: 0, percentual: 0 } })
    abrir()

    expect(
      await screen.findByText('Você ainda não tem atividades no semestre.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Feitas')).not.toBeInTheDocument()
  })

  it('lista as próximas atividades vindas do backend e leva à matéria', async () => {
    abrir()

    const item = await screen.findByRole('link', { name: /Lista 2/ })

    expect(item).toHaveAttribute('href', '/disciplinas/1')
    expect(item).toHaveTextContent('Compiladores')
    expect(item).toHaveTextContent('18:00')
    expect(item).toHaveTextContent('NOV')
    expect(
      screen.getByRole('link', { name: /Relatório parcial/ }),
    ).toHaveAttribute('href', '/disciplinas/2')
    expect(screen.getByText(/\(atrasada\)/)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('1 tarefa atrasada')
    expect(screen.getByRole('link', { name: /Ver tudo/ })).toHaveAttribute(
      'href',
      '/agenda',
    )
  })

  it('mostra as matérias com a contagem de atividades', async () => {
    abrir()

    const cartao = await screen.findByRole('link', {
      name: /Compiladores\s+1 pendente/,
    })

    expect(cartao).toHaveAttribute('href', '/disciplinas/1')
    expect(cartao).toHaveTextContent('1 de 2 · 40%')
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
      await screen.findByRole('link', { name: /Compiladores\s+1 pendente/ }),
    ).toBeInTheDocument()
  })
})
