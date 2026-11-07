import { Link } from 'react-router'

export default function MateriasPage() {
  return (
    <main className="session-page">
      <section className="session-card">
        <h1>Matérias</h1>
        <p>Em breve: a lista das suas disciplinas.</p>
        <Link to="/">Voltar ao início</Link>
      </section>
    </main>
  )
}
