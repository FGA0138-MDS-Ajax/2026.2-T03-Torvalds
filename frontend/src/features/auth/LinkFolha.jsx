import { flushSync } from 'react-dom'
import { Link, useNavigate } from 'react-router'

const DURACAO_MS = 1100

/** Cópia estática (sem ids, sem foco) da tela atual, para usar na animação. */
function copiarTela(raiz, deslocamentoX, largura) {
  const copia = document.createElement('div')
  copia.className = 'folha-copia'
  copia.style.width = `${largura}px`
  copia.style.transform = `translate(${deslocamentoX}px, ${-window.scrollY}px)`
  const tela = raiz.firstElementChild.cloneNode(true)
  tela.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'))
  tela.querySelectorAll('input, button, a').forEach((el) => {
    el.tabIndex = -1
  })
  copia.appendChild(tela)
  return copia
}

function face(classe, copia) {
  const el = document.createElement('div')
  el.className = `folha-face ${classe}`
  el.appendChild(copia)
  return el
}

/**
 * Link que vira a página como numa folha de caderno: a metade direita da tela
 * atual gira em torno da lombada e, no verso, aparece a tela de destino.
 * Sem suporte a animação, ou com "reduzir movimento" ligado, navega normalmente.
 */
export default function LinkFolha({ to, onClick, ...resto }) {
  const navegar = useNavigate()

  function aoClicar(event) {
    onClick?.(event)

    const lombada = document.querySelector('.login-binding')
    const raiz = document.getElementById('root')
    const semAnimacao =
      !lombada ||
      !raiz?.firstElementChild ||
      typeof lombada.animate !== 'function' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cliqueComum =
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey

    if (event.defaultPrevented || semAnimacao || !cliqueComum) return

    event.preventDefault()

    const largura = document.documentElement.clientWidth
    const caixa = lombada.getBoundingClientRect()
    const x = caixa.left + caixa.width / 2
    // A folha cobre a metade esquerda inteira ao pousar.
    const larguraFolha = Math.max(x, largura - x)

    // 1) Foto da tela de origem e troca real para a tela de destino.
    const origemFrente = copiarTela(raiz, -x, largura)
    const origemEsquerda = copiarTela(raiz, 0, largura)
    flushSync(() => navegar(to))
    const destinoVerso = copiarTela(raiz, larguraFolha - x, largura)

    // 2) Palco por cima: capa da metade esquerda antiga + folha que vira.
    const palco = document.createElement('div')
    palco.className = 'folha-palco'
    palco.setAttribute('aria-hidden', 'true')
    palco.inert = true

    const capa = document.createElement('div')
    capa.className = 'folha-capa'
    capa.style.width = `${x}px`
    capa.appendChild(origemEsquerda)

    const folha = document.createElement('div')
    folha.className = 'folha'
    folha.style.left = `${x}px`
    folha.style.width = `${larguraFolha}px`
    folha.append(
      face('folha-frente', origemFrente),
      face('folha-verso', destinoVerso),
    )

    palco.append(capa, folha)
    document.body.appendChild(palco)

    const giro = folha.animate(
      [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-180deg)' }],
      { duration: DURACAO_MS, easing: 'ease-in-out', fill: 'forwards' },
    )
    giro.onfinish = giro.oncancel = () => palco.remove()
  }

  return <Link to={to} onClick={aoClicar} {...resto} />
}
