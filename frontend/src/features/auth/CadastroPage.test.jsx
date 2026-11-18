import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CadastroPage from './CadastroPage'
import { validarCadastro } from './validacaoCadastro'

function abrir() {
  return render(
    <MemoryRouter initialEntries={['/cadastro']}>
      <Routes>
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/login" element={<p>Tela de login</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function preencher(
  user,
  { senha = 'senha1234', confirmacao = senha } = {},
) {
  await user.type(screen.getByLabelText('Nome completo'), 'Ana Souza')
  await user.type(screen.getByLabelText('E-mail'), 'ana@exemplo.com')
  await user.type(screen.getByLabelText('Senha'), senha)
  await user.type(screen.getByLabelText('Confirmar senha'), confirmacao)
}

describe('validarCadastro', () => {
  const ok = {
    nome: 'Ana',
    email: 'a@a.com',
    senha: 'senha1234',
    confirmacao: 'senha1234',
  }

  it('aceita dados válidos', () => {
    expect(validarCadastro(ok)).toBe('')
  })

  it('recusa campos vazios, senha curta e senhas diferentes', () => {
    expect(validarCadastro({ ...ok, nome: ' ' })).toMatch(/Preencha/)
    expect(
      validarCadastro({ ...ok, senha: '123', confirmacao: '123' }),
    ).toMatch(/pelo menos 8/)
    expect(validarCadastro({ ...ok, confirmacao: 'outra1234' })).toMatch(
      /não conferem/,
    )
  })
})

describe('CadastroPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('mostra o formulário, o painel informativo e o link para entrar', () => {
    abrir()
    expect(
      screen.getByRole('heading', { name: 'Criar conta' }),
    ).toBeInTheDocument()
    expect(screen.getByText('O que é cAnCHA?')).toBeInTheDocument()
    expect(screen.getByText('Avisos de prazo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('não envia quando as senhas não conferem', async () => {
    const user = userEvent.setup()
    abrir()
    await preencher(user, { senha: 'senha1234', confirmacao: 'diferente1' })
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'As senhas não conferem.',
    )
    expect(fetch).not.toHaveBeenCalled()
  })

  it('envia o cadastro e vai para o login', async () => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const user = userEvent.setup()
    abrir()
    await preencher(user)
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    await waitFor(() =>
      expect(screen.getByText('Tela de login')).toBeInTheDocument(),
    )
    const [url, opcoes] = fetch.mock.calls[0]
    expect(String(url)).toMatch(/\/auth\/cadastro$/)
    expect(JSON.parse(opcoes.body)).toEqual({
      nome: 'Ana Souza',
      email: 'ana@exemplo.com',
      senha: 'senha1234',
    })
  })

  it('avisa quando o servidor ainda não tem o cadastro', async () => {
    fetch.mockResolvedValue(new Response('', { status: 404 }))
    const user = userEvent.setup()
    abrir()
    await preencher(user)
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'ainda não está disponível',
    )
  })

  it('avisa e-mail já cadastrado', async () => {
    fetch.mockResolvedValue(new Response('', { status: 409 }))
    const user = userEvent.setup()
    abrir()
    await preencher(user)
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Já existe uma conta',
    )
  })
})
