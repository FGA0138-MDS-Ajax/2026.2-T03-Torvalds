import { describe, expect, it } from 'vitest'
import { capitalizarNome } from './nomeDoUsuario'

describe('capitalizarNome', () => {
  it('põe a primeira letra de cada nome em maiúscula', () => {
    expect(capitalizarNome('joão pedro souza')).toBe('João Pedro Souza')
  })

  it('mantém da, de, do, das, dos e e em minúscula', () => {
    expect(capitalizarNome('maria da silva e souza')).toBe(
      'Maria da Silva e Souza',
    )
    expect(capitalizarNome('DE paula')).toBe('DE Paula')
    expect(capitalizarNome('ana de OLIVEIRA dos santos')).toBe(
      'Ana de OLIVEIRA dos Santos',
    )
  })

  it('trata hífen e apóstrofo', () => {
    expect(capitalizarNome('ana-maria d’ávila')).toBe('Ana-Maria D’Ávila')
  })

  it('tira espaços sobrando e não mexe no resto das letras', () => {
    expect(capitalizarNome('  jefferson   de souza  reis ')).toBe(
      'Jefferson de Souza Reis',
    )
    expect(capitalizarNome('ronald mcDonald')).toBe('Ronald McDonald')
  })

  it('aceita vazio', () => {
    expect(capitalizarNome('')).toBe('')
    expect(capitalizarNome(undefined)).toBe('')
  })
})
