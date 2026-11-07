import { useSessao } from '../auth/useSessao'

export default function InicioPage() {
  const { perfil } = useSessao()

  return (
    <section>
      <h1>Olá, {perfil.nome}!</h1>
      <p>Você entrou no Cancha.</p>
    </section>
  )
}
