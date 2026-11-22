// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import LoginPage from './LoginPage'

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

  it('não mostra "Conta criada!" num acesso comum ao login', () => {
    abrir()

    expect(screen.queryByText(/Conta criada!/)).not.toBeInTheDocument()
  })
})
