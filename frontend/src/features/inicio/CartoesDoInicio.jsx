import { Link } from 'react-router'
import {
  descreverDiasAte,
  entregasDaSemana,
  formatarPrazoCurto,
  proximaProva,
} from './inicioUtils'

/** Cartão colorido que leva a outra tela. */
export function CartaoResumo({ cor, titulo, valor, legenda, para, rotulo }) {
  return (
    <Link className={`resumo resumo-${cor}`} to={para} aria-label={rotulo}>
      <span className="resumo-titulo">{titulo}</span>
      <span className="resumo-valor">{valor}</span>
      <span className="resumo-legenda">{legenda}</span>
    </Link>
  )
}

/** Amarelo: quanto falta para a prova mais próxima. */
export function ProximaProva({ entregas }) {
  const prova = proximaProva(entregas)

  if (!prova) {
    return (
      <CartaoResumo
        cor="amarelo"
        titulo="Próxima prova"
        valor="—"
        legenda="Nenhuma prova marcada"
        para="/agenda"
        rotulo="Próxima prova: nenhuma marcada"
      />
    )
  }

  const quando = descreverDiasAte(prova.prazo)

  return (
    <CartaoResumo
      cor="amarelo"
      titulo="Próxima prova"
      valor={quando}
      legenda={
        <>
          <strong className="resumo-nome">{prova.titulo}</strong>
          <span>{prova.disciplina}</span>
          <small>{formatarPrazoCurto(prova.prazo)}</small>
        </>
      }
      para={`/disciplinas/${prova.disciplinaId}`}
      rotulo={`Próxima prova: ${prova.titulo}, ${prova.disciplina}, ${quando}`}
    />
  )
}

/** Verde: quantas entregas vencem em cada dia da semana atual. */
export function EntregasDaSemana({ entregas }) {
  const dias = entregasDaSemana(entregas)
  const maior = Math.max(
    1,
    ...dias.map((dia) => dia.concluidas + dia.pendentes),
  )
  const total = dias.reduce(
    (soma, dia) => soma + dia.concluidas + dia.pendentes,
    0,
  )

  return (
    <section className="inicio-caixa inicio-semana">
      <div className="inicio-caixa-topo">
        <h2>Entregas da semana</h2>
        <Link to="/agenda">Ver agenda →</Link>
      </div>

      <ul className="semana-grafico">
        {dias.map((dia) => {
          const quantidade = dia.concluidas + dia.pendentes

          return (
            <li
              key={dia.chave}
              className={dia.ehHoje ? 'semana-dia semana-hoje' : 'semana-dia'}
            >
              <span className="inicio-so-leitor">
                {dia.rotulo}: {dia.pendentes} pendentes, {dia.concluidas}{' '}
                concluídas
              </span>
              <span className="semana-numero" aria-hidden="true">
                {quantidade > 0 ? quantidade : ''}
              </span>
              <span className="semana-coluna" aria-hidden="true">
                {dia.pendentes > 0 && (
                  <span
                    className="semana-barra semana-barra-pendente"
                    style={{ height: `${(dia.pendentes / maior) * 100}%` }}
                  />
                )}
                {dia.concluidas > 0 && (
                  <span
                    className="semana-barra semana-barra-concluida"
                    style={{ height: `${(dia.concluidas / maior) * 100}%` }}
                  />
                )}
              </span>
              <span className="semana-rotulo" aria-hidden="true">
                {dia.rotulo}
              </span>
            </li>
          )
        })}
      </ul>

      <p className="semana-legenda">
        {total === 0
          ? 'Nenhuma entrega nesta semana.'
          : `${total} ${total === 1 ? 'entrega' : 'entregas'} nesta semana`}
      </p>
    </section>
  )
}
