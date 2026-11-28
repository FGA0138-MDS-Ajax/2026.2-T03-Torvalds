import { describe, expect, it } from 'vitest'
import { emailEhValido, validarCadastro } from './validacaoCadastro'

const valido = {
  nome: 'Mario',
  email: 'mario@test.com',
  senha: 'senha-forte-1',
  confirmacao: 'senha-forte-1',
}

describe('emailEhValido', () => {
  it.each([
    'mario@test.com',
    'ana.silva@aluno.unb.br',
    'a+b@dominio.com.br',
    ' mario@test.com ',
  ])('aceita %s', (email) => {
    expect(emailEhValido(email)).toBe(true)
  })

  it.each([
    'mario@test',
    'mario@',
    '@test.com',
    'mario',
    'mario@test.',
    'mario@test.c',
    'mario@.com',
    'mar io@test.com',
    'mario@@test.com',
  ])('recusa %s', (email) => {
    expect(emailEhValido(email)).toBe(false)
  })
})

describe('validarCadastro', () => {
  it('aceita dados completos', () => {
    expect(validarCadastro(valido)).toBe('')
  })

  it('recusa e-mail sem o domínio completo, com uma mensagem clara', () => {
    expect(validarCadastro({ ...valido, email: 'mario@test' })).toBe(
      'Informe um e-mail completo, como nome@email.com.',
    )
  })

  it('continua avisando campos vazios antes do formato do e-mail', () => {
    expect(validarCadastro({ ...valido, nome: '' })).toBe(
      'Preencha todos os campos.',
    )
  })
})
