const TAMANHO_MINIMO_SENHA = 8

export function validarCadastro({ nome, email, senha, confirmacao }) {
  if (!nome.trim() || !email.trim() || !senha || !confirmacao) {
    return 'Preencha todos os campos.'
  }
  if (senha.length < TAMANHO_MINIMO_SENHA) {
    return `A senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`
  }
  if (senha !== confirmacao) {
    return 'As senhas não conferem.'
  }
  return ''
}
