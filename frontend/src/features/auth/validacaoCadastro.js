const TAMANHO_MINIMO_SENHA = 8
const TAMANHO_MATRICULA = 9

export function validarCadastro({
  nome,
  email,
  senha,
  confirmacao,
  matricula = '',
}) {
  if (!nome.trim() || !email.trim() || !senha || !confirmacao) {
    return 'Preencha todos os campos.'
  }
  if (matricula && !/^\d{9}$/.test(matricula)) {
    return `A matrícula UnB precisa ter ${TAMANHO_MATRICULA} dígitos.`
  }
  if (senha.length < TAMANHO_MINIMO_SENHA) {
    return `A senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`
  }
  if (senha !== confirmacao) {
    return 'As senhas não conferem.'
  }
  return ''
}

// O servidor responde 409 com a mensagem do caso: "E-mail já cadastrado.",
// "Matrícula UnB já cadastrada." ou, numa corrida entre dois cadastros, as duas juntas.
// Sem mensagem útil, o aviso fala dos dois dados.
export function mensagemDeCadastroDuplicado(mensagemDoServidor = '') {
  const falaDoEmail = /e-?mail/i.test(mensagemDoServidor)
  const falaDaMatricula = /matr[ií]cula/i.test(mensagemDoServidor)

  if (falaDoEmail && !falaDaMatricula) {
    return 'Este e-mail já está cadastrado.'
  }
  if (falaDaMatricula && !falaDoEmail) {
    return 'Esta matrícula UnB já está em uso.'
  }
  return 'Este e-mail ou esta matrícula UnB já está cadastrado.'
}
