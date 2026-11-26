// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { EVENTO_TUTORIAL } from '../../shared/layout/tutorialPassos'
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

  it('o botão Rever o tutorial pede para abrir o tutorial', () => {
    const ouvinte = vi.fn()

    window.addEventListener(EVENTO_TUTORIAL, ouvinte)
    render(<ConfiguracoesPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Rever o tutorial' }))

    expect(ouvinte).toHaveBeenCalledTimes(1)
    window.removeEventListener(EVENTO_TUTORIAL, ouvinte)
  })
})
