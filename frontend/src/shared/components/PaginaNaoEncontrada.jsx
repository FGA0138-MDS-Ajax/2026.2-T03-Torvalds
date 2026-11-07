import { Link } from 'react-router'

export default function PaginaNaoEncontrada() {
  return (
    <main className="session-page">
      <section className="session-card">
        <h1>Página não encontrada</h1>
        <p>O endereço que você abriu não existe.</p>
        <Link to="/">Ir para o início</Link>
      </section>
    </main>
  )
}
