const DOIS_DIAS = 2 * 24 * 60 * 60 * 1000

/** Entrega urgente: já atrasada ou com prazo nas próximas 48 horas. */
export function ehUrgente(entrega, agora = new Date()) {
  if (entrega.atrasada) return true

  const prazo = new Date(entrega.prazo)

  return !Number.isNaN(prazo.getTime()) && prazo - agora <= DOIS_DIAS
}

/** Quantas entregas pedem atenção: é o número do selo no sino. */
export function contarUrgentes(entregas, agora = new Date()) {
  return entregas.filter((entrega) => ehUrgente(entrega, agora)).length
}
