import { useContext } from 'react'
import { SessaoContext } from './SessaoContext'

export function useSessao() {
  const sessao = useContext(SessaoContext)

  if (!sessao) {
    throw new Error('useSessao deve ser usado dentro de SessaoProvider.')
  }

  return sessao
}
