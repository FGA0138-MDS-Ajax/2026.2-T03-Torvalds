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
import { MemoryRouter, Route, Routes } from 'react-router'
import PaginaDisciplina from './PaginaDisciplina'

const entrega = {
  id: 1,
  titulo: 'Análise léxica',
  descricao: 'Identifique os tokens.',
  tipo: 'Exercício',
  prazo: '2099-11-10T18:00:00',
  status: 'A fazer',
}
function abrir(id = '7') {
  return render(
    <MemoryRouter initialEntries={[`/disciplinas/${id}`]}>
      <Routes>
        <Route path="/disciplinas/:id" element={<PaginaDisciplina />} />
      </Routes>
    </MemoryRouter>,
  )
}
const material = {
  id: 9,
  titulo: 'Scrum Guide',
  tipo: 'Leitura',
  urlOuArquivo: 'https://scrumguides.org/',
  dataPublicacao: '2026-11-07',
}
function json(dados, status = 200) {
  return new Response(JSON.stringify(dados), { status })
}
function responder(
  entregas = [entrega],
  { materiais = [], patch = () => new Response(null, { status: 204 }) } = {},
) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, opcoes = {}) => {
      if (opcoes.method === 'PATCH') return patch(url, opcoes)
      if (url.endsWith('/disciplinas'))
        return json([{ id: 7, nome: 'Compiladores', periodoLetivo: '2026.2' }])
      if (url.endsWith('/conteudos'))
        return materiais === null
          ? json({ mensagem: 'Falha nos materiais' }, 500)
          : json(materiais)
      return json(entregas)
    }),
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

describe('Página de disciplina com API HTTP', () => {
  it('carrega o cabeçalho e uma entrega no prazo usando o ID da rota', async () => {
    abrir()
    expect(screen.getByRole('status')).toHaveTextContent('Carregando')
    expect(
      await screen.findByRole('heading', { name: 'Compiladores' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Análise léxica' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Atrasada')).not.toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/disciplinas/7/atividades'),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })
  it('destaca uma entrega vencida e mantém concluídas fora do atraso', async () => {
    responder([
      { ...entrega, prazo: '2000-01-01T12:00:00' },
      {
        ...entrega,
        id: 2,
        titulo: 'Já entregue',
        prazo: '2000-01-01T12:00:00',
        status: 'CONCLUIDA',
      },
    ])
    abrir()
    expect(await screen.findByText('Atrasada')).toBeInTheDocument()
    expect(screen.getByText('Concluída')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Concluídas' }))
    expect(screen.queryByText('Atrasada')).not.toBeInTheDocument()
    expect(screen.getByText('Já entregue')).toBeInTheDocument()
  })
  it('preserva o cabeçalho quando não há entregas', async () => {
    responder([])
    abrir()
    expect(
      await screen.findByText('Nenhuma entrega encontrada.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Compiladores' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('progressbar', { name: 'Progresso em Compiladores' }),
    ).toHaveAttribute('aria-valuetext', 'Sem entregas')
  })
  it('permite tentar novamente após falha da API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ mensagem: 'Serviço indisponível' }), {
            status: 503,
          }),
      ),
    )
    abrir()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Serviço indisponível',
    )
    responder()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(
      await screen.findByRole('heading', { name: 'Compiladores' }),
    ).toBeInTheDocument()
  })

  it('mostra o progresso da disciplina no cabeçalho', async () => {
    responder([
      entrega,
      { ...entrega, id: 2, titulo: 'Já entregue', status: 'CONCLUIDA' },
    ])
    abrir()
    expect(
      await screen.findByRole('progressbar', {
        name: 'Progresso em Compiladores',
      }),
    ).toHaveAttribute('aria-valuetext', '1 de 2 · 50%')
  })
})

describe('Materiais da disciplina', () => {
  it('lista os materiais com tipo, data e link que abre em nova aba', async () => {
    responder([entrega], { materiais: [material] })
    abrir()
    const link = await screen.findByRole('link', {
      name: 'Scrum Guide (abre em nova aba)',
    })
    expect(link).toHaveAttribute('href', 'https://scrumguides.org/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByText('Leitura')).toBeInTheDocument()
    expect(screen.getByText('07/11/2026')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/disciplinas/7/conteudos'),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })
  it('avisa quando a disciplina não tem materiais', async () => {
    abrir()
    expect(
      await screen.findByText('Nenhum material publicado ainda.'),
    ).toBeInTheDocument()
  })
  it('mantém as entregas na tela quando os materiais falham', async () => {
    responder([entrega], { materiais: null })
    abrir()
    expect(
      await screen.findByText(/Não foi possível carregar os materiais/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Análise léxica' }),
    ).toBeInTheDocument()
  })
})

describe('Concluir e desfazer uma entrega', () => {
  it('conclui na hora, chama o PATCH e atualiza a barra', async () => {
    abrir()
    fireEvent.click(
      await screen.findByRole('button', { name: 'Concluir Análise léxica' }),
    )
    expect(screen.getByText('Concluída')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuetext',
      '1 de 1 · 100%',
    )
    await waitFor(() =>
      expect(
        screen.getByRole('button', {
          name: 'Desfazer conclusão de Análise léxica',
        }),
      ).toBeEnabled(),
    )
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/atividades/1/status'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'CONCLUIDA' }),
      }),
    )
  })
  it('desfaz a conclusão enviando A_FAZER', async () => {
    responder([{ ...entrega, status: 'CONCLUIDA' }])
    abrir()
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Desfazer conclusão de Análise léxica',
      }),
    )
    expect(
      screen.getByText('A fazer', { selector: '.entrega-status' }),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/atividades/1/status'),
        expect.objectContaining({
          body: JSON.stringify({ status: 'A_FAZER' }),
        }),
      ),
    )
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Concluir Análise léxica' }),
      ).toBeEnabled(),
    )
  })
  it('volta ao estado anterior e avisa quando a API recusa', async () => {
    responder([entrega], {
      patch: () => json({ mensagem: 'Entrega não encontrada.' }, 404),
    })
    abrir()
    fireEvent.click(
      await screen.findByRole('button', { name: 'Concluir Análise léxica' }),
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível concluir “Análise léxica”: Entrega não encontrada.',
    )
    expect(
      screen.getByText('A fazer', { selector: '.entrega-status' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuetext',
      '0 de 1 · 0%',
    )
  })
})
