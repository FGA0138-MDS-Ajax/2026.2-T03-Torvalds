/**
 * Marcações do texto das anotações, como nos cadernos:
 *   **negrito**   ==marca-texto==   # título   - item de lista   1. item numerado
 * O texto continua sendo texto puro (a API não muda); só a tela interpreta.
 */

/** Envolve o trecho selecionado com a marca (ou tira a marca se já estava). */
export function envolver(texto, inicio, fim, marca) {
  const tamanho = marca.length
  const antes = texto.slice(0, inicio)
  const selecionado = texto.slice(inicio, fim)
  const depois = texto.slice(fim)

  if (antes.endsWith(marca) && depois.startsWith(marca)) {
    return {
      texto: antes.slice(0, -tamanho) + selecionado + depois.slice(tamanho),
      inicio: inicio - tamanho,
      fim: fim - tamanho,
    }
  }

  return {
    texto: antes + marca + selecionado + marca + depois,
    inicio: inicio + tamanho,
    fim: fim + tamanho,
  }
}

/** Põe o prefixo (ex.: "- ") em cada linha tocada pela seleção, ou o tira se todas já tinham. */
export function prefixarLinhas(texto, inicio, fim, prefixo) {
  const comeco = inicio === 0 ? 0 : texto.lastIndexOf('\n', inicio - 1) + 1
  const quebra = texto.indexOf('\n', fim)
  const termino = quebra === -1 ? texto.length : quebra
  const linhas = texto.slice(comeco, termino).split('\n')
  const todasTem = linhas.every((linha) => linha.startsWith(prefixo))
  const novas = linhas.map((linha) => {
    if (todasTem) return linha.slice(prefixo.length)
    return linha.startsWith(prefixo) ? linha : prefixo + linha
  })
  const trecho = novas.join('\n')

  return {
    texto: texto.slice(0, comeco) + trecho + texto.slice(termino),
    inicio: comeco,
    fim: comeco + trecho.length,
  }
}

const INLINE = /\*\*(.+?)\*\*|==(.+?)==/

/** Quebra uma linha em pedaços: texto comum, negrito e marca-texto (podem se aninhar). */
export function interpretarLinha(linha) {
  const achado = INLINE.exec(linha)

  if (!achado) return linha ? [{ tipo: 'texto', conteudo: linha }] : []

  const antes = linha.slice(0, achado.index)
  const depois = linha.slice(achado.index + achado[0].length)
  const negrito = achado[1] !== undefined

  return [
    ...(antes ? [{ tipo: 'texto', conteudo: antes }] : []),
    {
      tipo: negrito ? 'negrito' : 'marca',
      filhos: interpretarLinha(negrito ? achado[1] : achado[2]),
    },
    ...interpretarLinha(depois),
  ]
}

const TITULO = /^(#{1,2})\s+(.*)$/
const LISTA = /^[-*]\s+(.*)$/
const NUMERADA = /^\d+[.)]\s+(.*)$/

/** Divide o texto em blocos: títulos, listas (com ou sem número) e parágrafos. */
export function interpretarTexto(texto) {
  const blocos = []
  let paragrafo = null
  let lista = null

  const fechar = () => {
    paragrafo = null
    lista = null
  }

  for (const linha of String(texto ?? '').split(/\r?\n/)) {
    const titulo = TITULO.exec(linha)
    const item = LISTA.exec(linha)
    const numerado = NUMERADA.exec(linha)

    if (!linha.trim()) {
      fechar()
    } else if (titulo) {
      fechar()
      blocos.push({
        tipo: 'titulo',
        nivel: titulo[1].length,
        filhos: interpretarLinha(titulo[2]),
      })
    } else if (item || numerado) {
      const ordenada = Boolean(numerado)

      paragrafo = null
      if (!lista || lista.ordenada !== ordenada) {
        lista = { tipo: 'lista', ordenada, itens: [] }
        blocos.push(lista)
      }
      lista.itens.push(interpretarLinha((item ?? numerado)[1]))
    } else {
      lista = null
      if (!paragrafo) {
        paragrafo = { tipo: 'paragrafo', linhas: [] }
        blocos.push(paragrafo)
      }
      paragrafo.linhas.push(interpretarLinha(linha))
    }
  }

  return blocos
}
