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
import AnotacoesDisciplina from './AnotacoesDisciplina'

const anterior = {
  id: 1,
  titulo: 'Revisão da prova',
  texto: 'Estudar análise léxica.',
  criadaEm: '2026-11-10T10:00:00',
}
const recente = {
  id: 2,
  titulo: 'Dúvida para o monitor',
  texto: 'Como funciona o autômato?',
  criadaEm: '2026-11-12T15:30:00',
}

function json(dados, status = 200) {
  return new Response(JSON.stringify(dados), { status })
}

/** Simula a API: GET devolve a lista; POST devolve a anotação criada (201). */
function responder({ lista = [], post } = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, opcoes = {}) => {
      if (opcoes.method === 'POST') {
        return post
          ? post(url, opcoes)
          : json({ id: 99, ...JSON.parse(opcoes.body) }, 201)
      }
      if (lista === null) return json({ mensagem: 'Falha na lista' }, 500)
      return json(lista)
    }),
  )
}

function abrir() {
  return render(<AnotacoesDisciplina disciplinaId="7" />)
}

function preencher(titulo, texto) {
  fireEvent.change(screen.getByLabelText('Título'), {
    target: { value: titulo },
  })
  fireEvent.change(screen.getByLabelText('Texto'), {
    target: { value: texto },
  })
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

describe('Anotações da disciplina', () => {
  it('lista as anotações da disciplina, a mais recente primeiro', async () => {
    responder({ lista: [anterior, recente] })
    abrir()

    expect(screen.getByRole('status')).toHaveTextContent('Carregando')

    const titulos = await screen.findAllByRole('heading', { level: 3 })

    expect(titulos.map((titulo) => titulo.textContent)).toEqual([
      'Dúvida para o monitor',
      'Revisão da prova',
    ])
    expect(screen.getByText('Estudar análise léxica.')).toBeInTheDocument()
    expect(screen.getByText('2 anotações')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/disciplinas/7/anotacoes'),
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('mostra que não há anotações quando a lista vem vazia', async () => {
    responder({ lista: [] })
    abrir()

    expect(await screen.findByText('Nenhuma anotação ainda.')).toBeVisible()
  })

  it('avisa quando não consegue carregar e tenta de novo', async () => {
    responder({ lista: null })
    abrir()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar as anotações',
    )

    responder({ lista: [anterior] })
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(
      await screen.findByRole('heading', { name: 'Revisão da prova' }),
    ).toBeInTheDocument()
  })

  it('cria a anotação com título e texto e a mostra na lista', async () => {
    responder({ lista: [anterior] })
    abrir()
    await screen.findByRole('heading', { name: 'Revisão da prova' })

    preencher('  Ideia nova  ', 'Montar um resumo.')
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar anotação' }))

    expect(
      await screen.findByRole('heading', { name: 'Ideia nova' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Montar um resumo.')).toBeInTheDocument()
    expect(screen.getByText('2 anotações')).toBeInTheDocument()
    expect(posts()).toHaveLength(1)
    expect(posts()[0][0]).toContain('/disciplinas/7/anotacoes')
    expect(JSON.parse(posts()[0][1].body)).toEqual({
      titulo: 'Ideia nova',
      texto: 'Montar um resumo.',
    })
    // O formulário volta vazio e a nova anotação fica no topo da lista.
    expect(screen.getByLabelText('Título')).toHaveValue('')
    expect(screen.getByLabelText('Texto')).toHaveValue('')
    expect(screen.getAllByRole('heading', { level: 3 })[0]).toHaveTextContent(
      'Ideia nova',
    )
  })

  it('não envia e avisa quando falta título ou texto', async () => {
    responder({ lista: [] })
    abrir()
    await screen.findByText('Nenhuma anotação ainda.')

    preencher('Só o título', '   ')
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar anotação' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Preencha o título e o texto',
    )
    expect(posts()).toHaveLength(0)
  })

  it('mantém o que foi digitado e avisa quando a API recusa', async () => {
    responder({
      lista: [],
      post: () => json({ mensagem: 'Título muito longo' }, 400),
    })
    abrir()
    await screen.findByText('Nenhuma anotação ainda.')

    preencher('Minha anotação', 'Texto importante')
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar anotação' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível salvar a anotação: Título muito longo',
    )
    expect(screen.getByLabelText('Título')).toHaveValue('Minha anotação')
    expect(screen.getByLabelText('Texto')).toHaveValue('Texto importante')
    expect(screen.getByText('Nenhuma anotação ainda.')).toBeVisible()
  })

  it('desativa o botão enquanto salva, para não criar duas vezes', async () => {
    let concluir
    responder({
      lista: [],
      post: () =>
        new Promise((resolver) => {
          concluir = () =>
            resolver(json({ id: 5, titulo: 'A', texto: 'B' }, 201))
        }),
    })
    abrir()
    await screen.findByText('Nenhuma anotação ainda.')

    preencher('A', 'B')
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar anotação' }))

    const botao = await screen.findByRole('button', { name: 'Salvando...' })

    expect(botao).toBeDisabled()
    concluir()
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Adicionar anotação' }),
      ).toBeEnabled(),
    )
    expect(posts()).toHaveLength(1)
  })
})
