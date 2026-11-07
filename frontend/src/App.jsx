import { Navigate, Route, Routes } from 'react-router'
import AgendaPage from './features/agenda/AgendaPage'
import LoginPage from './features/auth/LoginPage'
import RotaProtegida from './features/auth/RotaProtegida'
import { useSessao } from './features/auth/useSessao'
import PaginaDisciplina from './features/disciplinas/PaginaDisciplina'
import InicioPage from './features/inicio/InicioPage'
import MateriasPage from './features/materias/MateriasPage'
import PaginaNaoEncontrada from './shared/components/PaginaNaoEncontrada'
import LayoutBase from './shared/layout/LayoutBase'

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
        <Route element={<LayoutBase />}>
          <Route index element={<InicioPage />} />
          <Route path="materias" element={<MateriasPage />} />
        </Route>
        {/* Agenda e Disciplina ainda trazem o próprio menu lateral. */}
        <Route path="disciplinas/:id" element={<PaginaDisciplina />} />
        <Route path="agenda" element={<AgendaPage />} />
      </Route>
      <Route path="*" element={<PaginaNaoEncontrada />} />
    </Routes>
  )
}

export default App
