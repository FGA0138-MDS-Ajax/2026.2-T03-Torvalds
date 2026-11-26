import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import {
  agruparPorDia,
  chaveDoDia,
  ehAtrasada,
  ehConcluida,
  montarSemanas,
  nomeDoMes,
} from '../agenda/agendaUtils'

const DIAS_DA_SEMANA = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']
const POR_CELULA = 2

function classeDoItem(item) {
  if (ehConcluida(item.status)) return 'mes-item mes-item-concluida'
  if (ehAtrasada(item)) return 'mes-item mes-item-atrasada'

  return 'mes-item'
}

/**
 * Janela com as entregas do mês inteiro, em calendário. Abre a partir do card
 * "Entregas da semana"; Esc, o botão Fechar ou um clique fora fecham. O foco
 * fica dentro da janela enquanto ela está aberta.
 */
export default function EntregasDoMes({ entregas, aoFechar }) {
  const hoje = new Date()
  const [{ ano, mes }, definirMes] = useState({
    ano: hoje.getFullYear(),
    mes: hoje.getMonth(),
  })
  const janela = useRef(null)
  const botaoFechar = useRef(null)
  const chaveDeHoje = chaveDoDia(hoje)
  const porDia = agruparPorDia(entregas)
  const semanas = montarSemanas(ano, mes)
  const doMes = semanas
    .flat()
    .filter((dia) => !dia.foraDoMes)
    .reduce((soma, dia) => soma + (porDia.get(dia.chave)?.length ?? 0), 0)

  useEffect(() => {
    botaoFechar.current?.focus()
  }, [])

  useEffect(() => {
    function aoTeclar(evento) {
      if (evento.key === 'Escape') {
        aoFechar()
        return
      }

      if (evento.key !== 'Tab' || !janela.current) return

      const focaveis = janela.current.querySelectorAll('button, a[href]')
      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primeiro.focus()
      }
    }

    document.addEventListener('keydown', aoTeclar)

    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aoFechar])

  function mover(passo) {
    const data = new Date(ano, mes + passo, 1)

    definirMes({ ano: data.getFullYear(), mes: data.getMonth() })
  }

  return (
    <div
      className="mes-fundo"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar()
      }}
    >
      <div
        ref={janela}
        className="mes-janela"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mes-titulo"
      >
        <div className="mes-topo">
          <h2 id="mes-titulo">Entregas de {nomeDoMes(ano, mes)}</h2>
          <div className="mes-navegacao">
            <button type="button" onClick={() => mover(-1)}>
              <span aria-hidden="true">‹</span>
              <span className="inicio-so-leitor">Mês anterior</span>
            </button>
            <button type="button" onClick={() => mover(1)}>
              <span aria-hidden="true">›</span>
              <span className="inicio-so-leitor">Próximo mês</span>
            </button>
            <button
              ref={botaoFechar}
              type="button"
              className="mes-fechar"
              onClick={aoFechar}
            >
              Fechar
            </button>
          </div>
        </div>

        <p className="mes-resumo" role="status">
          {doMes === 0
            ? 'Nenhuma entrega neste mês.'
            : `${doMes} ${doMes === 1 ? 'entrega' : 'entregas'} neste mês`}
        </p>

        <table className="mes-tabela">
          <thead>
            <tr>
              {DIAS_DA_SEMANA.map((dia) => (
                <th key={dia} scope="col">
                  {dia}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {semanas.map((semana) => (
              <tr key={semana[0].chave}>
                {semana.map((dia) => {
                  const itens = porDia.get(dia.chave) ?? []
                  const classes = ['mes-celula']

                  if (dia.foraDoMes) classes.push('mes-celula-fora')
                  if (dia.chave === chaveDeHoje) classes.push('mes-celula-hoje')

                  return (
                    <td key={dia.chave} className={classes.join(' ')}>
                      <span className="mes-dia">{dia.data.getDate()}</span>
                      {itens.length > 0 && (
                        <>
                          <span className="mes-contagem" aria-hidden="true">
                            {itens.length}
                          </span>
                          <ul className="mes-lista">
                            {itens.slice(0, POR_CELULA).map((item) => (
                              <li key={`${item.disciplinaId}-${item.id}`}>
                                <Link
                                  className={classeDoItem(item)}
                                  to={`/disciplinas/${item.disciplinaId}`}
                                  title={`${item.titulo} · ${item.disciplina}`}
                                >
                                  {item.titulo}
                                </Link>
                              </li>
                            ))}
                            {itens.length > POR_CELULA && (
                              <li className="mes-mais">
                                +{itens.length - POR_CELULA} mais
                              </li>
                            )}
                          </ul>
                        </>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
