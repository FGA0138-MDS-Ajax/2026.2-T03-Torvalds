import { describe, expect, it } from 'vitest'
import { corDaDisciplina } from './coresDisciplina'

describe('corDaDisciplina', () => {
  it('usa as cores do protótipo para as disciplinas do semestre', () => {
    expect(corDaDisciplina('Compiladores')).toBe('lilas')
    expect(corDaDisciplina('Gestão da Produção e Qualidade')).toBe('amarelo')
    expect(corDaDisciplina('Projeto Integrador em Engenharia')).toBe('verde')
    expect(corDaDisciplina('Métodos de Desenvolvimento de Software')).toBe(
      'rosa',
    )
    expect(corDaDisciplina('Teoria dos Números')).toBe('azul')
  })

  it('repete as cores pela posição quando a disciplina é desconhecida', () => {
    expect(corDaDisciplina('Cálculo 1', 0)).toBe('lilas')
    expect(corDaDisciplina('Cálculo 1', 2)).toBe('verde')
    expect(corDaDisciplina('Cálculo 1', 5)).toBe('lilas')
  })
})
