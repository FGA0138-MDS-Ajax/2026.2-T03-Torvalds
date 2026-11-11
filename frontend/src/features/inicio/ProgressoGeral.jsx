const RAIO = 54
const CIRCUNFERENCIA = 2 * Math.PI * RAIO

/**
 * Donut de progresso do protótipo: o anel verde cresce conforme o percentual
 * (0 a 100). O texto no centro e o `role="img"` dizem o mesmo para quem não
 * enxerga o desenho.
 */
export default function ProgressoGeral({ percentual }) {
  const valor = Math.min(100, Math.max(0, percentual))
  const preenchido = (valor / 100) * CIRCUNFERENCIA

  return (
    <div
      className="progresso-geral"
      role="img"
      aria-label={`${valor}% do semestre concluído`}
    >
      <svg viewBox="0 0 140 140" aria-hidden="true">
        <circle className="progresso-geral-trilho" cx="70" cy="70" r={RAIO} />
        <circle
          className="progresso-geral-anel"
          cx="70"
          cy="70"
          r={RAIO}
          strokeDasharray={`${preenchido} ${CIRCUNFERENCIA}`}
          transform="rotate(-90 70 70)"
        />
      </svg>
      <p className="progresso-geral-centro">
        <strong>{valor}%</strong>
        <span>do semestre concluído</span>
      </p>
    </div>
  )
}
