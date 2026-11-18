// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import ConfiguracoesPage from './ConfiguracoesPage'

afterEach(() => {
  cleanup()
  localStorage.clear()
  document.documentElement.style.fontSize = ''
})

describe('Configurações', () => {
  it('muda o tamanho do texto de todo o site e marca a escolha', () => {
    render(<ConfiguracoesPage />)

    expect(screen.getByRole('button', { name: 'Normal' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Muito grande' }))

    expect(document.documentElement.style.fontSize).toBe('130%')
    expect(
      screen.getByRole('button', { name: 'Muito grande' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Em breve')).toBeInTheDocument()
  })
})
