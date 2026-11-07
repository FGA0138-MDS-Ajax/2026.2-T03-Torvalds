import { Link } from 'react-router'
import { useSessao } from '../auth/useSessao'

export default function InicioPage() {
  const { perfil, sair } = useSessao()

  return (
    <main className="session-page">
      <section className="session-card">
        <h1>Olá, {perfil.nome}!</h1>
        <p>Você entrou no Cancha.</p>
        <p>{perfil.email}</p>
        <Link to="/materias">Ver matérias</Link>
        <button type="button" onClick={sair}>
          Sair
        </button>
      </section>
    </main>
  )
}
