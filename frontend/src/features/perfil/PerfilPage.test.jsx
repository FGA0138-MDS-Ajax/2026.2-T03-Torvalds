// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { SessaoContext } from '../auth/SessaoContext'
import PerfilPage from './PerfilPage'

afterEach(cleanup)

function abrir(perfil) {
  const sair = vi.fn()

  render(
    <SessaoContext.Provider value={{ perfil, entrar: vi.fn(), sair }}>
      <PerfilPage />
    </SessaoContext.Provider>,
  )

  return { sair }
}

describe('Meu perfil', () => {
  it('mostra nome, e-mail e matrícula do aluno', () => {
    abrir({
      nome: 'Maria Souza',
      email: 'maria@exemplo.test',
      matriculaUnB: '260000001',
    })

    expect(
      screen.getByRole('heading', { name: 'Meu perfil' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Maria Souza')).toBeInTheDocument()
    expect(screen.getByText('maria@exemplo.test')).toBeInTheDocument()
    expect(screen.getByText('260000001')).toBeInTheDocument()
  })

  it('não mostra a matrícula quando ela não existe e permite sair', () => {
    const { sair } = abrir({ nome: 'Maria', email: 'maria@exemplo.test' })

    expect(screen.queryByText('Matrícula UnB')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Sair da conta' }))

    expect(sair).toHaveBeenCalledTimes(1)
  })
})
