// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router'
import Cartao from './Cartao'
import { Carregando, ErroCarregamento, EstadoVazio } from './Estados'

afterEach(cleanup)

describe('estados da tela', () => {
  it('mostra a mensagem de carregamento', () => {
    render(<Carregando mensagem="Carregando suas matérias…" />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Carregando suas matérias…',
    )
  })

  it('mostra o erro e chama a função ao tentar novamente', () => {
    const aoTentarNovamente = vi.fn()

    render(
      <ErroCarregamento
        titulo="Falhou"
        mensagem="Serviço indisponível"
        aoTentarNovamente={aoTentarNovamente}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Serviço indisponível')

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(aoTentarNovamente).toHaveBeenCalledTimes(1)
  })

  it('não mostra o botão quando não há como tentar de novo', () => {
    render(<ErroCarregamento mensagem="Erro" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('mostra a mensagem de vazio', () => {
    render(<EstadoVazio mensagem="Nada por aqui." />)

    expect(screen.getByText('Nada por aqui.')).toBeInTheDocument()
  })
})

describe('Cartao', () => {
  it('vira um link quando recebe o destino', () => {
    render(
      <MemoryRouter>
        <Cartao
          titulo="Compiladores"
          subtitulo="Período 2026.2"
          para="/disciplinas/3"
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /Compiladores/ })).toHaveAttribute(
      'href',
      '/disciplinas/3',
    )
  })

  it('é só um bloco quando não recebe destino', () => {
    render(
      <MemoryRouter>
        <Cartao titulo="Aviso" />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Aviso' })).toBeInTheDocument()
  })
})
