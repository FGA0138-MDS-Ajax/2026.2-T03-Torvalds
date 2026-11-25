import { matchPath } from 'react-router'

export const NOME_DO_SISTEMA = 'cAnCHA'

// Título da aba de cada tela (WCAG 2.1, critério 2.4.2): diz a tela e o sistema.
const TITULOS = [
  ['/login', 'Entrar'],
  ['/cadastro', 'Criar conta'],
  ['/', 'Início'],
  ['/materias', 'Matérias'],
  ['/disciplinas/:id', 'Matéria'],
  ['/agenda', 'Agenda'],
  ['/anotacoes', 'Anotações'],
  ['/configuracoes', 'Configurações'],
  ['/perfil', 'Perfil'],
]

export function tituloDaRota(caminho) {
  const encontrado = TITULOS.find(([padrao]) =>
    matchPath({ path: padrao, end: true }, caminho),
  )
  const tela = encontrado ? encontrado[1] : 'Página não encontrada'

  return `${tela} · ${NOME_DO_SISTEMA}`
}
