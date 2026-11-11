import './BarraProgresso.css'
import { descreverProgresso } from './descreverProgresso'

/**
 * Barra de progresso com o texto ao lado ("3 de 4 · 75%"), para a informação não
 * depender só da cor.
 *
 * Use `percentual` com o valor de `progressoPercentual` da API. Quando a tela
 * souber quantas entregas existem, passe também `concluidas` e `total`.
 */
export default function BarraProgresso({
  percentual,
  concluidas,
  total,
  rotulo = 'Progresso',
}) {
  const { semEntregas, valor, texto } = descreverProgresso({
    percentual,
    concluidas,
    total,
  })

  return (
    <div
      className={
        semEntregas
          ? 'barra-progresso barra-progresso-vazia'
          : 'barra-progresso'
      }
    >
      <div
        className="barra-progresso-trilho"
        role="progressbar"
        aria-label={rotulo}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={semEntregas ? undefined : valor}
        aria-valuetext={texto}
      >
        <div
          className="barra-progresso-preenchimento"
          style={{ width: `${valor}%` }}
        />
      </div>
      <span className="barra-progresso-texto">{texto}</span>
    </div>
  )
}
