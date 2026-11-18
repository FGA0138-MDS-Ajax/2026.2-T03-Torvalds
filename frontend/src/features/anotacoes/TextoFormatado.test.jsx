// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import TextoFormatado from './TextoFormatado'

afterEach(cleanup)

describe('TextoFormatado', () => {
  it('mostra negrito e marca-texto', () => {
    render(<TextoFormatado texto="Um **termo** e ==um destaque==." />)

    expect(screen.getByText('termo').tagName).toBe('STRONG')
    expect(screen.getByText('um destaque').tagName).toBe('MARK')
  })

  it('mostra título e listas', () => {
    render(<TextoFormatado texto={'# Etapas\n- léxica\n- sintática\n1. um'} />)

    expect(
      screen.getByRole('heading', { name: 'Etapas', level: 3 }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getAllByRole('list')).toHaveLength(2)
  })

  it('mantém as quebras de linha dentro do parágrafo', () => {
    const { container } = render(<TextoFormatado texto={'linha 1\nlinha 2'} />)

    expect(container.querySelectorAll('p')).toHaveLength(1)
    expect(container.querySelectorAll('br')).toHaveLength(1)
  })

  it('mostra HTML digitado como texto, sem executar nada', () => {
    const { container } = render(
      <TextoFormatado texto={'<script>alert(1)</script> <b>oi</b>'} />,
    )

    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('b')).toBeNull()
    expect(
      screen.getByText('<script>alert(1)</script> <b>oi</b>'),
    ).toBeInTheDocument()
  })
})
