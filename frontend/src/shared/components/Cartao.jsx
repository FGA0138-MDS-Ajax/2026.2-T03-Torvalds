import { Link } from 'react-router'
import './Cartao.css'

/**
 * Cartão reutilizável. Com `para`, o cartão inteiro vira um link;
 * sem ele, é só um bloco de informação.
 */
export default function Cartao({ titulo, subtitulo, para, children }) {
  const conteudo = (
    <>
      <h3 className="cartao-titulo">{titulo}</h3>
      {subtitulo && <p className="cartao-subtitulo">{subtitulo}</p>}
      {children}
    </>
  )

  if (para) {
    return (
      <Link className="cartao cartao-link" to={para}>
        {conteudo}
      </Link>
    )
  }

  return <article className="cartao">{conteudo}</article>
}
