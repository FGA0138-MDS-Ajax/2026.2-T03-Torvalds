// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { aplicarTamanho, lerTamanho, salvarTamanho } from './tamanhoTexto'

afterEach(() => {
  localStorage.clear()
  document.documentElement.style.fontSize = ''
})

describe('tamanho do texto', () => {
  it('começa no tamanho normal', () => {
    expect(lerTamanho()).toBe('normal')
  })

  it('guarda a escolha e aplica na fonte base da página', () => {
    salvarTamanho('grande')

    expect(lerTamanho()).toBe('grande')
    expect(document.documentElement.style.fontSize).toBe('115%')

    salvarTamanho('muito-grande')

    expect(document.documentElement.style.fontSize).toBe('130%')
  })

  it('ignora um valor guardado que não existe mais', () => {
    localStorage.setItem('cancha.tamanhoTexto', 'gigante')

    expect(lerTamanho()).toBe('normal')
  })

  it('volta ao normal quando o tamanho é desconhecido', () => {
    aplicarTamanho('gigante')

    expect(document.documentElement.style.fontSize).toBe('100%')
  })
})
