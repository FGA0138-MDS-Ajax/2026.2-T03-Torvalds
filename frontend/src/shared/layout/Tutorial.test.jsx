// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import Tutorial from './Tutorial'
import {
  CHAVE_TUTORIAL,
  EVENTO_TUTORIAL,
  marcarTutorialPendente,
} from './tutorialPassos'

function abrir() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Tutorial />} />
        <Route path="/materias" element={<p>Tela de matérias</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Tutorial', () => {
  beforeEach(() => localStorage.clear())
  afterEach(cleanup)

  it('não abre sozinho para quem não acabou de se cadastrar', () => {
    abrir()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('abre depois do cadastro, nas boas-vindas', () => {
    marcarTutorialPendente()
    abrir()

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Bem-vindo ao cAnCHA!' }),
    ).toBeInTheDocument()
  })

  it('pular encerra e não abre de novo', () => {
    marcarTutorialPendente()
    abrir()

    fireEvent.click(screen.getByRole('button', { name: /Pular tutorial/ }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(localStorage.getItem(CHAVE_TUTORIAL)).toBe('visto')
  })

  it('o Esc também encerra', () => {
    marcarTutorialPendente()
    abrir()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('chega ao final e leva para as matérias', () => {
    marcarTutorialPendente()
    abrir()

    // Sem o menu na tela, os passos com destaque são pulados
    fireEvent.click(screen.getByRole('button', { name: 'Começar' }))

    expect(
      screen.getByRole('heading', { name: 'Tudo pronto!' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Ver minhas matérias' }))

    expect(screen.getByText('Tela de matérias')).toBeInTheDocument()
    expect(localStorage.getItem(CHAVE_TUTORIAL)).toBe('visto')
  })

  it('as Configurações abrem o tutorial de novo', () => {
    localStorage.setItem(CHAVE_TUTORIAL, 'visto')
    abrir()

    act(() => {
      window.dispatchEvent(new Event(EVENTO_TUTORIAL))
    })

    expect(
      screen.getByRole('heading', { name: 'Bem-vindo ao cAnCHA!' }),
    ).toBeInTheDocument()
  })
})
