// Ligações que ficam em minúscula no meio do nome ("Maria da Silva e Souza").
const LIGACOES = new Set(['da', 'de', 'do', 'das', 'dos', 'e'])

/**
 * Põe a primeira letra de cada nome em maiúscula ("joão da silva" vira
 * "João da Silva"). Só mexe na primeira letra: o resto do que a pessoa digitou
 * é mantido, para não estragar nomes como "McDonald".
 */
export function capitalizarNome(nome) {
  return String(nome ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((palavra, posicao) => {
      if (posicao > 0 && LIGACOES.has(palavra.toLocaleLowerCase('pt-BR'))) {
        return palavra.toLocaleLowerCase('pt-BR')
      }

      // Depois de hífen ou apóstrofo também começa um nome ("Ana-Maria", "d'Ávila").
      return palavra.replace(
        /(^|[-'’])(\p{L})/gu,
        (_, antes, letra) => antes + letra.toLocaleUpperCase('pt-BR'),
      )
    })
    .join(' ')
}
