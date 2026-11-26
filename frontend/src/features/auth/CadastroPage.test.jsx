// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CadastroPage from './CadastroPage'
import {
  mensagemDeCadastroDuplicado,
  validarCadastro,
} from './validacaoCadastro'

function abrir(entrada = '/cadastro') {
  return render(
    <MemoryRouter initialEntries={[entrada]}>
      <Routes>
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/login" element={<p>Tela de login</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

function digitar(rotulo, valor) {
  fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } })
}

function preencher({
  senha = 'senha1234',
  confirmacao = senha,
  matricula,
} = {}) {
  digitar('Nome completo', 'Ana Souza')
  digitar('E-mail', 'ana@exemplo.com')
  if (matricula !== undefined) digitar('Matrícula UnB (opcional)', matricula)
  digitar('Senha', senha)
  digitar('Confirmar senha', confirmacao)
}

function cadastrar() {
  fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
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

  it('aceita matrícula vazia ou com 9 dígitos e recusa o resto', () => {
    expect(validarCadastro({ ...ok, matricula: '' })).toBe('')
    expect(validarCadastro({ ...ok, matricula: '123456789' })).toBe('')
    expect(validarCadastro({ ...ok, matricula: '12345678' })).toMatch(
      /9 dígitos/,
    )
    expect(validarCadastro({ ...ok, matricula: '12345678a' })).toMatch(
      /9 dígitos/,
    )
  })
})

describe('mensagemDeCadastroDuplicado', () => {
  it('separa e-mail e matrícula pela mensagem do servidor', () => {
    expect(mensagemDeCadastroDuplicado('E-mail já cadastrado.')).toBe(
      'Este e-mail já está cadastrado.',
    )
    expect(mensagemDeCadastroDuplicado('Matrícula UnB já cadastrada.')).toBe(
      'Esta matrícula UnB já está em uso.',
    )
  })

  it('usa o aviso dos dois quando a mensagem cita os dois ou não ajuda', () => {
    const geral = 'Este e-mail ou esta matrícula UnB já está cadastrado.'
    expect(
      mensagemDeCadastroDuplicado('E-mail ou matrícula UnB já cadastrados.'),
    ).toBe(geral)
    expect(mensagemDeCadastroDuplicado('Não foi possível concluir.')).toBe(
      geral,
    )
    expect(mensagemDeCadastroDuplicado()).toBe(geral)
  })
})

describe('CadastroPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('vem com o e-mail preenchido quando a pessoa chega do login', () => {
    abrir({ pathname: '/cadastro', state: { email: 'ana@exemplo.com' } })

    expect(screen.getByLabelText('E-mail')).toHaveValue('ana@exemplo.com')
  })

  it('mostra e esconde as senhas com o botão do olho', () => {
    abrir()

    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar senhas' }))

    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText('Confirmar senha')).toHaveAttribute(
      'type',
      'text',
    )
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
    abrir()
    preencher({ senha: 'senha1234', confirmacao: 'diferente1' })
    cadastrar()

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
    abrir()
    preencher()
    cadastrar()

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
    abrir()
    preencher()
    cadastrar()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'ainda não está disponível',
    )
  })

  function responder409(mensagem) {
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ mensagem }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  }

  it('avisa que o e-mail já está cadastrado', async () => {
    responder409('E-mail já cadastrado.')
    abrir()
    preencher()
    cadastrar()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Este e-mail já está cadastrado.',
    )
  })

  it('avisa que a matrícula já está em uso', async () => {
    responder409('Matrícula UnB já cadastrada.')
    abrir()
    preencher({ matricula: '123456789' })
    cadastrar()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Esta matrícula UnB já está em uso.',
    )
  })

  it('avisa os dois dados quando o servidor não diz qual repetiu', async () => {
    fetch.mockResolvedValue(new Response('', { status: 409 }))
    abrir()
    preencher()
    cadastrar()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Este e-mail ou esta matrícula UnB já está cadastrado.',
    )
  })

  it('não envia com matrícula de menos de 9 dígitos', async () => {
    abrir()
    preencher({ matricula: '12345' })
    cadastrar()

    expect(await screen.findByRole('alert')).toHaveTextContent('9 dígitos')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('envia a matrícula quando preenchida', async () => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    abrir()
    preencher({ matricula: '123456789' })
    cadastrar()

    await waitFor(() =>
      expect(screen.getByText('Tela de login')).toBeInTheDocument(),
    )
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      nome: 'Ana Souza',
      email: 'ana@exemplo.com',
      senha: 'senha1234',
      matriculaUnB: '123456789',
    })
  })
})
