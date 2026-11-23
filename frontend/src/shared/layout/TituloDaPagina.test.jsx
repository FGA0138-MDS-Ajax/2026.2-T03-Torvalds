// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { Link, MemoryRouter } from 'react-router'
import TituloDaPagina from './TituloDaPagina'
import { tituloDaRota } from './titulos'

afterEach(() => {
  cleanup()
  document.title = ''
})

describe('Título da página (#158)', () => {
  it.each([
    ['/login', 'Entrar · cAnCHA'],
    ['/cadastro', 'Criar conta · cAnCHA'],
    ['/', 'Início · cAnCHA'],
    ['/materias', 'Matérias · cAnCHA'],
    ['/disciplinas/7', 'Matéria · cAnCHA'],
    ['/agenda', 'Agenda · cAnCHA'],
    ['/anotacoes', 'Anotações · cAnCHA'],
    ['/configuracoes', 'Configurações · cAnCHA'],
    ['/perfil', 'Perfil · cAnCHA'],
    ['/nao-existe', 'Página não encontrada · cAnCHA'],
  ])('a rota %s tem o título "%s"', (caminho, titulo) => {
    expect(tituloDaRota(caminho)).toBe(titulo)
  })

  it('atualiza o título da aba ao navegar entre as telas', () => {
    const { getByRole } = render(
      <MemoryRouter initialEntries={['/']}>
        <TituloDaPagina />
        <Link to="/agenda">Agenda</Link>
      </MemoryRouter>,
    )

    expect(document.title).toBe('Início · cAnCHA')

    fireEvent.click(getByRole('link', { name: 'Agenda' }))

    expect(document.title).toBe('Agenda · cAnCHA')
  })
})
