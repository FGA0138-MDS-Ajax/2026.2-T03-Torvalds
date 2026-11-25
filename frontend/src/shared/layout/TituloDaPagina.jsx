import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { tituloDaRota } from './titulos'

// Atualiza o título da aba a cada troca de tela.
export default function TituloDaPagina() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = tituloDaRota(pathname)
  }, [pathname])

  return null
}
