// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router'
import MateriasPage from './MateriasPage'

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

const conteudos = [
  {
    id: 7,
    titulo: 'Introdução aos compiladores',
    tipo: 'Livro',
    urlOuArquivo: 'https://exemplo.test/livro',
    dataPublicacao: '2026-11-01',
  },
]

const atividades = [
  {
    id: 11,
    titulo: 'Lista 2: análise léxica',
    tipo: 'Lista',
    prazo: '2020-01-01T23:59:00',
    status: 'CONCLUIDA',
  },
  {
    id: 12,
    titulo: 'Trabalho: parser',
    tipo: 'Trabalho',
    prazo: '2020-01-02T23:59:00',
    status: 'EM_ANDAMENTO',
  },
  {
    id: 13,
    titulo: 'Prova 2',
    tipo: 'Prova',
    prazo: '2099-01-01T23:59:00',
    status: 'A_FAZER',
  },
]

function responder(status = 200, corpo = disciplinas) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url) => {
      const caminho = String(url)
      let resposta = corpo

      if (status === 200 && caminho.endsWith('/conteudos')) {
        resposta = conteudos
      } else if (status === 200 && caminho.endsWith('/atividades')) {
        resposta = atividades
      }

      return new Response(JSON.stringify(resposta), { status })
    }),
  )
}

function abrir(url = '/materias') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <MateriasPage />
    </MemoryRouter>,
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

describe('Matérias', () => {
  it('lista as matérias com o progresso e abre a primeira no painel', async () => {
    abrir()

    expect(screen.getByRole('status')).toHaveTextContent('Carregando')

    expect(
      await screen.findByRole('button', { name: /Compiladores/ }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(
      await screen.findByRole('link', {
        name: 'Abrir Introdução aos compiladores',
      }),
    ).toHaveAttribute('href', 'https://exemplo.test/livro')
  })

  it('mostra as atividades nas colunas do quadro', async () => {
    abrir()

    expect(
      await screen.findByText('Lista 2: análise léxica'),
    ).toBeInTheDocument()
    expect(screen.getByText('A fazer (1)')).toBeInTheDocument()
    expect(screen.getByText('Em andamento (1)')).toBeInTheDocument()
    expect(screen.getByText('Concluído (1)')).toBeInTheDocument()
    expect(screen.getByText(/Atrasada/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Ver todas as entregas/ }),
    ).toHaveAttribute('href', '/disciplinas/1')
  })

  it('troca o painel ao escolher outra matéria', async () => {
    abrir()

    fireEvent.click(
      await screen.findByRole('button', { name: /Projeto Integrador/ }),
    )

    expect(
      await screen.findByRole('link', { name: /Ver todas as entregas/ }),
    ).toHaveAttribute('href', '/disciplinas/2')
  })

  it('filtra pelo termo da busca (?busca=) e avisa quando nada é encontrado', async () => {
    abrir('/materias?busca=projeto')

    expect(
      await screen.findByRole('button', { name: /Projeto Integrador/ }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Compiladores/ }),
    ).not.toBeInTheDocument()

    cleanup()
    abrir('/materias?busca=xyz')

    expect(
      await screen.findByText('Nenhuma matéria encontrada para essa busca.'),
    ).toBeInTheDocument()
  })

  it('mostra o estado vazio quando o aluno não tem matérias', async () => {
    responder(200, [])
    abrir()

    expect(
      await screen.findByText('Você ainda não tem matérias.'),
    ).toBeInTheDocument()
  })

  it('mostra o erro e permite tentar novamente', async () => {
    responder(503, { mensagem: 'Serviço indisponível' })
    abrir()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Serviço indisponível',
    )

    responder()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(
      await screen.findByRole('button', { name: /Compiladores/ }),
    ).toBeInTheDocument()
  })
})
