import { useEffect, useRef, useState } from 'react'
import { chaveDoDia, nomeDoMes } from '../agenda/agendaUtils'
import { entregasDoMes } from './inicioUtils'

/**
 * Janela com as entregas do mês inteiro: uma barra por dia, dividida pelas
 * matérias, e a legenda com quantas entregas cada matéria tem no mês. Abre a
 * partir do card "Entregas da semana"; Esc, o botão Fechar ou um clique fora
 * fecham. O foco fica dentro da janela enquanto ela está aberta.
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
  const { dias, materias, total, pendentes } = entregasDoMes(entregas, ano, mes)
  const maior = Math.max(1, ...dias.map((dia) => dia.total))
  const nomeDe = new Map(materias.map((materia) => [materia.id, materia]))

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

      const focaveis = janela.current.querySelectorAll('button')
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

  let resumo = 'Nenhuma entrega neste mês'
  if (total > 0) {
    resumo =
      pendentes === 0
        ? 'Tudo concluído'
        : `${pendentes} ${pendentes === 1 ? 'pendente' : 'pendentes'}`
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
          <button type="button" className="mes-botao" onClick={() => mover(-1)}>
            <span aria-hidden="true">‹</span>
            <span className="inicio-so-leitor">Mês anterior</span>
          </button>

          <div className="mes-titulos">
            <h2 id="mes-titulo">
              Entregas de{' '}
              {nomeDoMes(ano, mes).replace(' ', ' de ').toLowerCase()}
            </h2>
            <p role="status">{resumo}</p>
          </div>

          <div className="mes-navegacao">
            <button
              type="button"
              className="mes-botao"
              onClick={() => mover(1)}
            >
              <span aria-hidden="true">›</span>
              <span className="inicio-so-leitor">Próximo mês</span>
            </button>
            <button
              ref={botaoFechar}
              type="button"
              className="mes-botao"
              onClick={aoFechar}
            >
              <span aria-hidden="true">×</span>
              <span className="inicio-so-leitor">Fechar</span>
            </button>
          </div>
        </div>

        <ul
          className="mes-grafico"
          style={{
            gridTemplateColumns: `repeat(${dias.length}, minmax(0, 1fr))`,
          }}
        >
          {dias.map((dia, posicao) => {
            const classes = ['mes-dia']
            const atraso = { animationDelay: `${posicao * 18}ms` }

            if (dia.chave === chaveDeHoje) classes.push('mes-dia-hoje')

            return (
              <li key={dia.chave} className={classes.join(' ')}>
                <span className="inicio-so-leitor">
                  Dia {dia.dia}:{' '}
                  {dia.total === 0
                    ? 'sem entregas'
                    : [...dia.porMateria]
                        .map(
                          ([id, quantidade]) =>
                            `${nomeDe.get(id)?.nome} ${quantidade}`,
                        )
                        .join(', ')}
                </span>
                <span className="mes-numero" style={atraso} aria-hidden="true">
                  {dia.total > 0 ? dia.total : ''}
                </span>
                <span className="mes-coluna" aria-hidden="true">
                  {[...dia.porMateria].map(([id, quantidade]) => (
                    <span
                      key={id}
                      className={`mes-barra mes-cor-${nomeDe.get(id)?.cor ?? 0}`}
                      style={{
                        height: `${(quantidade / maior) * 100}%`,
                        ...atraso,
                      }}
                    />
                  ))}
                </span>
                <span className="mes-rotulo" aria-hidden="true">
                  {dia.dia}
                </span>
              </li>
            )
          })}
        </ul>

        <ul className="mes-legenda">
          {materias.map((materia) => (
            <li key={materia.id}>
              <span
                className={`mes-quadrado mes-cor-${materia.cor}`}
                aria-hidden="true"
              />
              {materia.nome} <strong>{materia.total}</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
