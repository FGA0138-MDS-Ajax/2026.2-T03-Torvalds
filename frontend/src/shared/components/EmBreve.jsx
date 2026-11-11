import './EmBreve.css'

/** Tela provisória das funcionalidades que ainda não têm back-end. */
export default function EmBreve({
  titulo,
  descricao = 'Esta funcionalidade está em desenvolvimento.',
}) {
  return (
    <section>
      <h1>{titulo}</h1>
      <div className="em-breve">
        <span className="em-breve-selo">Em breve</span>
        <p>{descricao}</p>
      </div>
    </section>
  )
}
