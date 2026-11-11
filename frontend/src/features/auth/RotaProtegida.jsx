import { Navigate, Outlet } from 'react-router'
import { useSessao } from './useSessao'

/** Só deixa passar quem está logado; os demais vão para /login. */
export default function RotaProtegida() {
  const { perfil } = useSessao()

  if (!perfil) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
