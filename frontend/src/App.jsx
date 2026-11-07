import { Navigate, Route, Routes } from 'react-router'
import LoginPage from './features/auth/LoginPage'
import RotaProtegida from './features/auth/RotaProtegida'
import { useSessao } from './features/auth/useSessao'
import PaginaDisciplina from './features/disciplinas/PaginaDisciplina'
import InicioPage from './features/inicio/InicioPage'
import MateriasPage from './features/materias/MateriasPage'
import PaginaNaoEncontrada from './shared/components/PaginaNaoEncontrada'

function RotaLogin() {
  const { perfil, entrar } = useSessao()

  if (perfil) {
    return <Navigate to="/" replace />
  }

  return <LoginPage onEntrar={entrar} />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<RotaLogin />} />
      <Route element={<RotaProtegida />}>
        <Route index element={<InicioPage />} />
        <Route path="materias" element={<MateriasPage />} />
        <Route path="disciplinas/:id" element={<PaginaDisciplina />} />
      </Route>
      <Route path="*" element={<PaginaNaoEncontrada />} />
    </Routes>
  )
}

export default App
