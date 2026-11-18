// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router'
import AnotacoesPage from './AnotacoesPage'

const disciplinas = [
  { id: 7, nome: 'Compiladores', periodoLetivo: '2026.2' },
  { id: 8, nome: 'Gestão de Projetos', periodoLetivo: '2026.2' },
]
const resumo = {
  id: 1,
  titulo: 'Resumo - CAP 01',
  texto: 'Um compilador traduz o código-fonte.',
  criadaEm: '2026-10-21T14:00:00',
}
const etapas = {
  id: 2,
  titulo: 'Etapas da compilação',
  texto: 'Análise léxica, sintática e semântica.',
  criadaEm: '2026-10-22T09:30:00',
}

function json(dados, status = 200) {
  return new Response(JSON.stringify(dados), { status })
}

/** Simula a API de disciplinas e de anotações. */
function responder({
  listaDeDisciplinas = disciplinas,
  anotacoes = [resumo, etapas],
  falhaNasAnotacoes = false,
  post,
} = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, opcoes = {}) => {
      if (opcoes.method === 'POST') {
        return post
          ? post(url, opcoes)
          : json({ id: 50, ...JSON.parse(opcoes.body) }, 201)
      }
      if (url.endsWith('/disciplinas')) {
        return listaDeDisciplinas === null
          ? json({ mensagem: 'Falha nas disciplinas' }, 500)
          : json(listaDeDisciplinas)
      }
      if (url.endsWith('/disciplinas/7/anotacoes')) {
        return falhaNasAnotacoes
          ? json({ mensagem: 'Falha nas anotações' }, 500)
          : json(anotacoes)
      }
      if (url.endsWith('/disciplinas/8/anotacoes')) {
        return json([
          {
            id: 3,
            titulo: 'Planejamento da sprint',
            texto: 'Definir o backlog.',
            criadaEm: '2026-10-25T08:00:00',
          },
        ])
      }
      return json([])
    }),
  )
}

function abrir(entrada = '/anotacoes') {
  return render(
    <MemoryRouter initialEntries={[entrada]}>
      <AnotacoesPage />
    </MemoryRouter>,
  )
}

const posts = () =>
  fetch.mock.calls.filter(([, opcoes]) => opcoes?.method === 'POST')

beforeEach(() => {
  localStorage.setItem('cancha.token', 'teste')
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('Tela de Anotações', () => {
  it('abre a primeira disciplina com a primeira anotação, data e abas', async () => {
    responder()
    abrir()

    expect(
      await screen.findByRole('heading', { name: 'Compiladores', level: 1 }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Resumo - CAP 01', level: 2 }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Um compilador traduz o código-fonte.'),
    ).toBeInTheDocument()
    expect(screen.getByText('21/10/2026 - 14:00')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Cap 01: Resumo - CAP 01' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', { name: 'Cap 02: Etapas da compilação' }),
    ).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('link', { name: 'Matérias' })).toHaveAttribute(
      'href',
      '/materias',
    )
  })

  it('abre outra anotação ao clicar na aba', async () => {
    responder()
    abrir()
    await screen.findByRole('heading', { name: 'Resumo - CAP 01', level: 2 })

    fireEvent.click(
      screen.getByRole('button', { name: 'Cap 02: Etapas da compilação' }),
    )

    expect(
      screen.getByRole('heading', { name: 'Etapas da compilação', level: 2 }),
    ).toBeInTheDocument()
    expect(screen.getByText('22/10/2026 - 09:30')).toBeInTheDocument()
  })

  it('troca de disciplina pela coluna da esquerda', async () => {
    responder()
    abrir()
    await screen.findByRole('heading', { name: 'Resumo - CAP 01', level: 2 })

    fireEvent.click(screen.getByRole('button', { name: 'Gestão de Projetos' }))

    expect(
      await screen.findByRole('heading', {
        name: 'Gestão de Projetos',
        level: 1,
      }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', {
        name: 'Planejamento da sprint',
        level: 2,
      }),
    ).toBeInTheDocument()
  })

  it('a cor da página segue a disciplina escolhida', async () => {
    responder()
    const { container } = abrir()
    await screen.findByRole('heading', { name: 'Resumo - CAP 01', level: 2 })

    expect(container.querySelector('.anot-pagina')).toHaveClass(
      'anot-cor-lilas',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Gestão de Projetos' }))
    await screen.findByRole('heading', {
      name: 'Planejamento da sprint',
      level: 2,
    })

    expect(container.querySelector('.anot-pagina')).toHaveClass(
      'anot-cor-amarelo',
    )
  })

  it('abre a disciplina pedida na URL', async () => {
    responder()
    abrir('/anotacoes?disciplina=8')

    expect(
      await screen.findByRole('heading', {
        name: 'Gestão de Projetos',
        level: 1,
      }),
    ).toBeInTheDocument()
  })

  it('a busca do topo (?busca=) filtra as abas por título e texto, sem mudar o número', async () => {
    responder()
    abrir('/anotacoes?busca=SEMÂNTICA')

    expect(
      await screen.findByRole('heading', {
        name: 'Etapas da compilação',
        level: 2,
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Cap 01/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Cap 02: Etapas da compilação' }),
    ).toBeInTheDocument()
  })

  it('avisa quando a busca não encontra nenhuma anotação', async () => {
    responder()
    abrir('/anotacoes?busca=nada+disso')

    expect(
      await screen.findByText('Nenhuma anotação encontrada para essa busca.'),
    ).toBeInTheDocument()
  })

  it('cria uma anotação pelo + e abre a nova aba', async () => {
    responder()
    abrir()
    await screen.findByRole('heading', { name: 'Resumo - CAP 01', level: 2 })

    fireEvent.click(screen.getByRole('button', { name: 'Nova anotação' }))
    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: '  Revisão  ' },
    })
    fireEvent.change(screen.getByLabelText('Texto'), {
      target: { value: 'Rever os autômatos.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar anotação' }))

    expect(
      await screen.findByRole('heading', { name: 'Revisão', level: 2 }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Cap 03: Revisão' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(posts()).toHaveLength(1)
    expect(posts()[0][0]).toContain('/disciplinas/7/anotacoes')
    expect(JSON.parse(posts()[0][1].body)).toEqual({
      titulo: 'Revisão',
      texto: 'Rever os autômatos.',
    })
  })

  it('a barra de formatação põe negrito, marca-texto e lista no texto', async () => {
    responder()
    abrir()
    await screen.findByRole('heading', { name: 'Resumo - CAP 01', level: 2 })

    fireEvent.click(screen.getByRole('button', { name: 'Nova anotação' }))

    const campo = screen.getByLabelText('Texto')

    fireEvent.change(campo, { target: { value: 'um termo importante' } })
    campo.setSelectionRange(3, 8)
    fireEvent.click(screen.getByRole('button', { name: 'Negrito' }))

    expect(campo).toHaveValue('um **termo** importante')

    campo.setSelectionRange(13, 23)
    fireEvent.click(screen.getByRole('button', { name: 'Marca-texto' }))

    expect(campo).toHaveValue('um **termo** ==importante==')

    campo.setSelectionRange(0, 0)
    fireEvent.click(
      screen.getByRole('button', { name: 'Transformar em lista' }),
    )

    expect(campo).toHaveValue('- um **termo** ==importante==')
  })

  it('mostra a anotação aberta com a formatação', async () => {
    responder({
      anotacoes: [
        {
          ...resumo,
          texto: '# Etapas\nA **análise léxica** vem ==primeiro==.',
        },
      ],
    })
    abrir()

    expect(
      await screen.findByRole('heading', { name: 'Etapas', level: 3 }),
    ).toBeInTheDocument()
    expect(screen.getByText('análise léxica').tagName).toBe('STRONG')
    expect(screen.getByText('primeiro').tagName).toBe('MARK')
  })

  it('não envia e avisa quando falta título ou texto', async () => {
    responder()
    abrir()
    await screen.findByRole('heading', { name: 'Resumo - CAP 01', level: 2 })

    fireEvent.click(screen.getByRole('button', { name: 'Nova anotação' }))
    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Só o título' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar anotação' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Preencha o título e o texto',
    )
    expect(posts()).toHaveLength(0)
  })

  it('mantém o que foi digitado quando a API recusa e deixa cancelar', async () => {
    responder({ post: () => json({ mensagem: 'Título muito longo' }, 400) })
    abrir()
    await screen.findByRole('heading', { name: 'Resumo - CAP 01', level: 2 })

    fireEvent.click(screen.getByRole('button', { name: 'Nova anotação' }))
    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Minha anotação' },
    })
    fireEvent.change(screen.getByLabelText('Texto'), {
      target: { value: 'Texto importante' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar anotação' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível salvar a anotação: Título muito longo',
    )
    expect(screen.getByLabelText('Título')).toHaveValue('Minha anotação')
    expect(screen.getByLabelText('Texto')).toHaveValue('Texto importante')

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(
      screen.getByRole('heading', { name: 'Resumo - CAP 01', level: 2 }),
    ).toBeInTheDocument()
  })

  it('convida a criar a primeira anotação quando não há nenhuma', async () => {
    responder({ anotacoes: [] })
    abrir()

    expect(
      await screen.findByText(/Nenhuma anotação ainda/),
    ).toBeInTheDocument()
  })

  it('avisa quando as anotações não carregam e tenta de novo', async () => {
    responder({ falhaNasAnotacoes: true })
    abrir()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha nas anotações',
    )

    responder()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(
      await screen.findByRole('heading', { name: 'Resumo - CAP 01', level: 2 }),
    ).toBeInTheDocument()
  })

  it('avisa quando não há disciplinas', async () => {
    responder({ listaDeDisciplinas: [] })
    abrir()

    expect(
      await screen.findByText('Você ainda não tem matérias.'),
    ).toBeInTheDocument()
  })

  it('avisa quando as disciplinas não carregam e tenta de novo', async () => {
    responder({ listaDeDisciplinas: null })
    abrir()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha nas disciplinas',
    )

    responder()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Compiladores', level: 1 }),
      ).toBeInTheDocument(),
    )
  })
})
