// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import BarraProgresso from './BarraProgresso'
import { descreverProgresso } from './descreverProgresso'

afterEach(() => {
  cleanup()
})

function preenchimento() {
  return screen
    .getByRole('progressbar')
    .querySelector('.barra-progresso-preenchimento')
}

describe('BarraProgresso', () => {
  it('mostra 0% quando nada foi concluído', () => {
    render(<BarraProgresso percentual={0} concluidas={0} total={4} />)

    expect(screen.getByText('0 de 4 · 0%')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0',
    )
    expect(preenchimento()).toHaveStyle({ width: '0%' })
  })

  it('mostra a contagem e o percentual ao lado da barra', () => {
    render(<BarraProgresso percentual={75} concluidas={3} total={4} />)

    expect(screen.getByText('3 de 4 · 75%')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '75',
    )
    expect(preenchimento()).toHaveStyle({ width: '75%' })
  })

  it('mostra 100% quando tudo foi concluído', () => {
    render(<BarraProgresso percentual={100} concluidas={4} total={4} />)

    expect(screen.getByText('4 de 4 · 100%')).toBeInTheDocument()
    expect(preenchimento()).toHaveStyle({ width: '100%' })
  })

  it('mostra "Sem entregas" quando o percentual é nulo', () => {
    render(<BarraProgresso percentual={null} />)

    expect(screen.getByText('Sem entregas')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow')
    expect(preenchimento()).toHaveStyle({ width: '0%' })
  })

  it('mostra só o percentual, arredondado, quando não há contagem', () => {
    render(<BarraProgresso percentual={33.3333} />)

    expect(screen.getByText('33%')).toBeInTheDocument()
  })

  it('usa o rótulo para leitores de tela', () => {
    render(
      <BarraProgresso percentual={50} rotulo="Progresso em Compiladores" />,
    )

    expect(
      screen.getByRole('progressbar', { name: 'Progresso em Compiladores' }),
    ).toHaveAttribute('aria-valuetext', '50%')
  })
})

describe('descreverProgresso', () => {
  it('calcula o percentual pela contagem quando a API não mandou', () => {
    expect(descreverProgresso({ concluidas: 1, total: 3 })).toEqual({
      semEntregas: false,
      valor: 33,
      texto: '1 de 3 · 33%',
    })
  })

  it('trata total 0 como sem entregas', () => {
    expect(
      descreverProgresso({ percentual: 0, concluidas: 0, total: 0 }),
    ).toEqual({ semEntregas: true, valor: 0, texto: 'Sem entregas' })
  })

  it('limita o valor entre 0 e 100', () => {
    expect(descreverProgresso({ percentual: 130 }).valor).toBe(100)
    expect(descreverProgresso({ percentual: -5 }).valor).toBe(0)
  })

  it('trata a ausência de dados como sem entregas', () => {
    expect(descreverProgresso()).toEqual({
      semEntregas: true,
      valor: 0,
      texto: 'Sem entregas',
    })
  })
})
