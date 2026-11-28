import { Fragment } from 'react'
import { interpretarTexto } from './formatacao'

function Pedacos({ pedacos }) {
  return pedacos.map((pedaco, posicao) => {
    if (pedaco.tipo === 'negrito') {
      return (
        <strong key={posicao}>
          <Pedacos pedacos={pedaco.filhos} />
        </strong>
      )
    }

    if (pedaco.tipo === 'marca') {
      return (
        <mark key={posicao}>
          <Pedacos pedacos={pedaco.filhos} />
        </mark>
      )
    }

    // Texto comum: o React já escapa, então um <script> digitado aparece como texto.
    return <Fragment key={posicao}>{pedaco.conteudo}</Fragment>
  })
}

/** Mostra o texto de uma anotação com negrito, marca-texto, títulos e listas. */
export default function TextoFormatado({ texto }) {
  return (
    <div className="texto-formatado">
      {interpretarTexto(texto).map((bloco, posicao) => {
        if (bloco.tipo === 'titulo') {
          const Titulo = bloco.nivel === 1 ? 'h3' : 'h4'

          return (
            <Titulo key={posicao}>
              <Pedacos pedacos={bloco.filhos} />
            </Titulo>
          )
        }

        if (bloco.tipo === 'lista') {
          const Lista = bloco.ordenada ? 'ol' : 'ul'

          return (
            <Lista key={posicao}>
              {bloco.itens.map((item, indice) => (
                <li key={indice}>
                  <Pedacos pedacos={item} />
                </li>
              ))}
            </Lista>
          )
        }

        return (
          <p key={posicao}>
            {bloco.linhas.map((linha, indice) => (
              <Fragment key={indice}>
                {indice > 0 && <br />}
                <Pedacos pedacos={linha} />
              </Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}
