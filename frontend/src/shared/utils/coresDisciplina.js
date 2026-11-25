const CORES = ['lilas', 'amarelo', 'verde', 'rosa', 'azul']

// Cores do protótipo (Figma) para as disciplinas do semestre.
const CORES_POR_NOME = [
  ['compiladores', 'lilas'],
  ['gestao', 'amarelo'],
  ['projeto integrador', 'verde'],
  ['metodos', 'rosa'],
  ['teoria', 'azul'],
]

function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

/**
 * Cor de uma disciplina (lilas, amarelo, verde, rosa ou azul). As do protótipo têm cor fixa,
 * para ser a mesma em Matérias e na Agenda; as outras seguem a ordem em que aparecem.
 */
export function corDaDisciplina(nome, indice = 0) {
  const normalizado = normalizar(nome)
  const conhecida = CORES_POR_NOME.find(([inicio]) =>
    normalizado.startsWith(inicio),
  )

  return conhecida ? conhecida[1] : CORES[Math.abs(indice) % CORES.length]
}
