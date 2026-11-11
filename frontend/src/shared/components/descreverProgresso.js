/**
 * Transforma os números de progresso no que a barra mostra.
 *
 * Aceita o percentual que vem da API (`progressoPercentual`, de 0 a 100 ou nulo) e,
 * quando a tela tiver, a quantidade de entregas concluídas e o total. Sem entregas
 * (total 0, ou percentual nulo sem total) não há progresso a mostrar.
 */
export function descreverProgresso({ percentual, concluidas, total } = {}) {
  const temContagem = Number.isFinite(concluidas) && Number.isFinite(total)

  if (temContagem && total <= 0) {
    return { semEntregas: true, valor: 0, texto: 'Sem entregas' }
  }

  let bruto = percentual
  if (!Number.isFinite(bruto) && temContagem) {
    bruto = (concluidas / total) * 100
  }
  if (!Number.isFinite(bruto)) {
    return { semEntregas: true, valor: 0, texto: 'Sem entregas' }
  }

  const valor = Math.min(100, Math.max(0, Math.round(bruto)))
  const texto = temContagem
    ? `${concluidas} de ${total} · ${valor}%`
    : `${valor}%`

  return { semEntregas: false, valor, texto }
}
