// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import LoginPage from './LoginPage'
import { consultarPerfil, entrar } from './authApi'

vi.mock('./authApi', () => ({
  entrar: vi.fn(),
  consultarPerfil: vi.fn(),
}))

function abrir(entrada = '/login') {
  return render(
    <MemoryRouter initialEntries={[entrada]}>
      <LoginPage onEntrar={() => {}} />
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  afterEach(cleanup)

  it('leva para o cadastro e mantém só o aviso da recuperação de senha', () => {
    abrir()

    expect(screen.getByRole('link', { name: /Cadastre-se/ })).toHaveAttribute(
      'href',
      '/cadastro',
    )
    expect(
      screen.getByText('Recuperação de senha indisponível no momento.'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Cadastro e recuperação/)).not.toBeInTheDocument()
  })

  it('mostra "Conta criada!" depois do cadastro', () => {
    abrir({ pathname: '/login', state: { cadastrado: true } })

    expect(screen.getByRole('status')).toHaveTextContent('Conta criada!')
  })

  it('mostra os campos com rótulo visível e sem botão de senha desativado', () => {
    abrir()

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Esqueceu a senha?' }),
    ).not.toBeInTheDocument()
  })

  it('preenche o e-mail cadastrado e leva o foco para a senha', () => {
    abrir({
      pathname: '/login',
      state: { cadastrado: true, email: 'ana@exemplo.com' },
    })

    expect(screen.getByLabelText('E-mail')).toHaveValue('ana@exemplo.com')
    expect(screen.getByLabelText('Senha')).toHaveFocus()
  })

  it('não mostra "Conta criada!" num acesso comum ao login', () => {
    abrir()

    expect(screen.queryByText(/Conta criada!/)).not.toBeInTheDocument()
  })

  it('aceita o e-mail com maiúsculas e entra com ele em minúsculas', async () => {
    entrar.mockResolvedValue('token')
    consultarPerfil.mockResolvedValue({ nome: 'Jefferson' })
    abrir()

    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: ' Jefferson@Exemplo.com ' },
    })
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'segredo123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Entrar/ }))

    await waitFor(() =>
      expect(entrar).toHaveBeenCalledWith(
        'jefferson@exemplo.com',
        'segredo123',
      ),
    )
  })
})
