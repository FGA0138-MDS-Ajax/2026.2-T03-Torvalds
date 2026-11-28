import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router'
import { CHAVE_TUTORIAL, EVENTO_TUTORIAL, PASSOS } from './tutorialPassos'
import './Tutorial.css'

const ESPACO = 8
const LARGURA_DO_CARTAO = 320

function estaPendente() {
  try {
    return localStorage.getItem(CHAVE_TUTORIAL) === 'pendente'
  } catch {
    return false
  }
}

/** O elemento do passo, se estiver na tela (com tamanho). */
function alvoDoPasso(passo) {
  if (!passo?.alvo) return null

  const elemento = document.querySelector(passo.alvo)
  const caixa = elemento?.getBoundingClientRect()

  return caixa && caixa.width > 0 && caixa.height > 0 ? caixa : null
}

/** Onde o cartão fica: do lado do destaque, se couber; senão, embaixo ou em cima. */
function posicaoDoCartao(caixa) {
  if (!caixa) return null

  const largura = window.innerWidth
  const altura = window.innerHeight

  // Celular: o balão fica sempre à vista, no alto ou embaixo (acima da barra
  // de menu), do lado oposto ao destaque, para o botão Próximo nunca sumir
  if (largura <= 760) {
    const meio = caixa.top + caixa.height / 2
    const esquerda = Math.max(16, (largura - LARGURA_DO_CARTAO) / 2)

    return meio > altura / 2
      ? { left: esquerda, top: 64 }
      : { left: esquerda, bottom: 96 }
  }
  // Destaque quase do tamanho da tela (o painel inteiro): o balão vai para o canto
  if (caixa.height > altura * 0.6 && caixa.width > largura * 0.5) {
    return { right: 24, bottom: 24 }
  }

  const cabeAoLado = caixa.right + 16 + LARGURA_DO_CARTAO < largura - 16

  if (cabeAoLado) {
    return {
      left: caixa.right + ESPACO + 16,
      top: Math.max(16, Math.min(caixa.top - ESPACO, altura - 240)),
    }
  }

  const left = Math.max(
    16,
    Math.min(
      caixa.left + caixa.width / 2 - LARGURA_DO_CARTAO / 2,
      largura - LARGURA_DO_CARTAO - 16,
    ),
  )
  const embaixo = caixa.bottom + ESPACO + 16

  return embaixo + 220 < altura
    ? { left, top: embaixo }
    : { left, bottom: altura - caixa.top + ESPACO + 16 }
}

/**
 * Tutorial do primeiro acesso (logo depois do cadastro): escurece a tela,
 * destaca cada parte do site com um balão explicando e anda com
 * Próximo/Voltar (ou as setas). "Pular tutorial" ou o Esc encerram a
 * qualquer momento. As Configurações podem abri-lo de novo.
 */
export default function Tutorial() {
  const navegar = useNavigate()
  const [indice, setIndice] = useState(() => (estaPendente() ? 0 : null))
  const [caixa, setCaixa] = useState(null)
  const passo = indice === null ? null : PASSOS[indice]

  const encerrar = useCallback(() => {
    try {
      localStorage.setItem(CHAVE_TUTORIAL, 'visto')
    } catch {
      // Sem armazenamento: vale só nesta visita
    }
    setIndice(null)
  }, [])

  /** Anda para o próximo passo com alvo na tela (ou o anterior). */
  const andar = useCallback((direcao) => {
    setIndice((atual) => {
      let proximo = atual + direcao

      while (
        proximo > 0 &&
        proximo < PASSOS.length - 1 &&
        PASSOS[proximo].alvo &&
        !alvoDoPasso(PASSOS[proximo])
      ) {
        proximo += direcao
      }

      return Math.max(0, Math.min(PASSOS.length - 1, proximo))
    })
  }, [])

  // Pelas Configurações: mostra de novo desde o começo
  useEffect(() => {
    const abrir = () => setIndice(0)

    window.addEventListener(EVENTO_TUTORIAL, abrir)

    return () => window.removeEventListener(EVENTO_TUTORIAL, abrir)
  }, [])

  // Traz o destaque para a tela (no celular a página pode estar rolada)
  useEffect(() => {
    if (!passo?.alvo) return

    document
      .querySelector(passo.alvo)
      ?.scrollIntoView?.({ block: 'center', inline: 'nearest' })
  }, [passo])

  // Mede o destaque a cada passo (e quando a janela muda de tamanho)
  useEffect(() => {
    if (!passo) return undefined

    const medir = () => setCaixa(alvoDoPasso(passo))
    const quadro = requestAnimationFrame(medir)

    window.addEventListener('resize', medir)
    window.addEventListener('scroll', medir, true)

    return () => {
      cancelAnimationFrame(quadro)
      window.removeEventListener('resize', medir)
      window.removeEventListener('scroll', medir, true)
    }
  }, [passo])

  useEffect(() => {
    if (!passo) return undefined

    function tecla(evento) {
      if (evento.key === 'Escape') encerrar()
      if (evento.key === 'ArrowRight' && !passo.final) andar(1)
      if (evento.key === 'ArrowLeft' && indice > 0) andar(-1)
    }

    document.addEventListener('keydown', tecla)

    return () => document.removeEventListener('keydown', tecla)
  }, [passo, indice, andar, encerrar])

  if (!passo) return null

  const destaque = passo.alvo ? caixa : null
  // No celular o menu é uma pílula de ícones: o destaque também vira uma pílula,
  // colada no ícone, em vez de um retângulo que sobra para fora da barra
  const noMenuDoCelular =
    window.innerWidth <= 760 && passo.alvo?.startsWith('.layout-links')
  const folga = noMenuDoCelular ? 3 : ESPACO
  const lugar = posicaoDoCartao(destaque)

  // Fora do layout (direto no body), para nada da página recortar a sombra
  return createPortal(
    <div className="tutorial">
      <div
        className={`tutorial-foco${destaque ? '' : ' sem-alvo'}${
          noMenuDoCelular ? ' redondo' : ''
        }`}
        style={
          destaque
            ? {
                top: destaque.top - folga,
                left: destaque.left - folga,
                width: destaque.width + folga * 2,
                height: destaque.height + folga * 2,
              }
            : undefined
        }
      />

      <button type="button" className="tutorial-pular" onClick={encerrar}>
        Pular tutorial ✕
      </button>

      <section
        key={indice}
        className={`tutorial-cartao${lugar ? '' : ' no-meio'}`}
        style={lugar ?? undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-titulo"
        aria-describedby="tutorial-texto"
      >
        <p className="tutorial-contador">
          {indice + 1} de {PASSOS.length}
        </p>
        <h2 id="tutorial-titulo">{passo.titulo}</h2>
        <p id="tutorial-texto">{passo.texto}</p>
        <div className="tutorial-pontos" aria-hidden="true">
          {PASSOS.map((item, posicao) => (
            <span
              key={item.titulo}
              className={posicao === indice ? 'atual' : undefined}
            />
          ))}
        </div>
        <div className="tutorial-acoes">
          {passo.final ? (
            <>
              <button type="button" onClick={encerrar}>
                Explorar sozinho
              </button>
              <button
                type="button"
                className="tutorial-principal"
                onClick={() => {
                  encerrar()
                  navegar('/materias')
                }}
                autoFocus
              >
                Ver minhas matérias
              </button>
            </>
          ) : (
            <>
              {indice > 0 && (
                <button type="button" onClick={() => andar(-1)}>
                  Voltar
                </button>
              )}
              <button
                type="button"
                className="tutorial-principal"
                onClick={() => andar(1)}
                autoFocus
              >
                {indice === 0 ? 'Começar' : 'Próximo'}
              </button>
            </>
          )}
        </div>
      </section>
    </div>,
    document.body,
  )
}
