import { describe, expect, it } from 'vitest'
import {
  envolver,
  interpretarLinha,
  interpretarTexto,
  prefixarLinhas,
} from './formatacao'

describe('envolver', () => {
  it('põe a marca em volta do trecho selecionado e mantém a seleção', () => {
    expect(envolver('Um texto simples', 3, 8, '**')).toEqual({
      texto: 'Um **texto** simples',
      inicio: 5,
      fim: 10,
    })
  })

  it('sem seleção, abre e fecha a marca com o cursor no meio', () => {
    expect(envolver('ab', 1, 1, '==')).toEqual({
      texto: 'a====b',
      inicio: 3,
      fim: 3,
    })
  })

  it('tira a marca quando o trecho já estava marcado', () => {
    expect(envolver('Um **texto** simples', 5, 10, '**')).toEqual({
      texto: 'Um texto simples',
      inicio: 3,
      fim: 8,
    })
  })
})

describe('prefixarLinhas', () => {
  it('põe o prefixo na linha do cursor', () => {
    expect(prefixarLinhas('primeira\nsegunda', 10, 10, '- ')).toEqual({
      texto: 'primeira\n- segunda',
      inicio: 9,
      fim: 18,
    })
  })

  it('põe o prefixo em todas as linhas selecionadas', () => {
    expect(prefixarLinhas('a\nb\nc', 0, 3, '- ').texto).toBe('- a\n- b\nc')
  })

  it('tira o prefixo quando todas as linhas já tinham', () => {
    expect(prefixarLinhas('- a\n- b', 0, 7, '- ').texto).toBe('a\nb')
  })

  it('não repete o prefixo numa linha que já tem', () => {
    expect(prefixarLinhas('- a\nb', 0, 5, '- ').texto).toBe('- a\n- b')
  })
})

describe('interpretarLinha', () => {
  it('separa texto, negrito e marca-texto', () => {
    expect(interpretarLinha('a **b** c ==d==')).toEqual([
      { tipo: 'texto', conteudo: 'a ' },
      { tipo: 'negrito', filhos: [{ tipo: 'texto', conteudo: 'b' }] },
      { tipo: 'texto', conteudo: ' c ' },
      { tipo: 'marca', filhos: [{ tipo: 'texto', conteudo: 'd' }] },
    ])
  })

  it('aceita marca-texto dentro de negrito', () => {
    expect(interpretarLinha('**um ==dois==**')).toEqual([
      {
        tipo: 'negrito',
        filhos: [
          { tipo: 'texto', conteudo: 'um ' },
          { tipo: 'marca', filhos: [{ tipo: 'texto', conteudo: 'dois' }] },
        ],
      },
    ])
  })

  it('deixa como texto uma marca que não fecha', () => {
    expect(interpretarLinha('**aberto')).toEqual([
      { tipo: 'texto', conteudo: '**aberto' },
    ])
  })
})

describe('interpretarTexto', () => {
  it('reconhece título, parágrafo e listas', () => {
    const blocos = interpretarTexto(
      '# Etapas\nPrimeira linha\nSegunda linha\n\n- léxica\n- sintática\n\n1. um\n2. dois',
    )

    expect(blocos.map((bloco) => bloco.tipo)).toEqual([
      'titulo',
      'paragrafo',
      'lista',
      'lista',
    ])
    expect(blocos[1].linhas).toHaveLength(2)
    expect(blocos[2]).toMatchObject({ ordenada: false })
    expect(blocos[2].itens).toHaveLength(2)
    expect(blocos[3]).toMatchObject({ ordenada: true })
  })

  it('aceita texto vazio', () => {
    expect(interpretarTexto('')).toEqual([])
    expect(interpretarTexto(undefined)).toEqual([])
  })
})
