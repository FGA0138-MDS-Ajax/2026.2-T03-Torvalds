import { useState } from 'react'
import {
  TAMANHOS,
  lerTamanho,
  salvarTamanho,
} from '../../shared/preferencias/tamanhoTexto'
import './AjusteTamanhoTexto.css'

/** Escolha do tamanho do texto do site, guardada neste navegador. */
export default function AjusteTamanhoTexto() {
  const [escolhido, setEscolhido] = useState(lerTamanho)

  function escolher(id) {
    salvarTamanho(id)
    setEscolhido(id)
  }

  return (
    <div className="ajuste-texto" role="group" aria-label="Tamanho do texto">
      {TAMANHOS.map((tamanho) => (
        <button
          key={tamanho.id}
          type="button"
          aria-pressed={escolhido === tamanho.id}
          onClick={() => escolher(tamanho.id)}
        >
          {tamanho.rotulo}
        </button>
      ))}
    </div>
  )
}
