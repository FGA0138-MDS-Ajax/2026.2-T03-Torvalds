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
