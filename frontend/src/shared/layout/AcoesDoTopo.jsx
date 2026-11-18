import { useEffect, useRef, useState } from 'react'
import ConfiguracoesMenu from './ConfiguracoesMenu'
import NotificacoesMenu from './NotificacoesMenu'
import PerfilMenu from './PerfilMenu'
import './AcoesDoTopo.css'

/**
 * Botões do canto direito do topo (notificações, configurações e perfil). Só um painel fica
 * aberto por vez; ele fecha ao clicar fora, ao apertar Esc ou ao escolher uma opção.
 */
export default function AcoesDoTopo() {
  const [aberto, setAberto] = useState(null)
  const raiz = useRef(null)

  useEffect(() => {
    if (!aberto) return undefined

    function aoClicar(evento) {
      if (raiz.current && !raiz.current.contains(evento.target)) {
        setAberto(null)
      }
    }

    function aoTeclar(evento) {
      if (evento.key !== 'Escape') return

      setAberto(null)
      document.getElementById(`gatilho-${aberto}`)?.focus()
    }

    document.addEventListener('mousedown', aoClicar)
    document.addEventListener('keydown', aoTeclar)

    return () => {
      document.removeEventListener('mousedown', aoClicar)
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [aberto])

  const alternar = (nome) => () =>
    setAberto((atual) => (atual === nome ? null : nome))
  const fechar = () => setAberto(null)

  return (
    <div className="layout-acoes" ref={raiz}>
      <NotificacoesMenu
        aberto={aberto === 'notificacoes'}
        aoAlternar={alternar('notificacoes')}
        aoFechar={fechar}
      />
      <ConfiguracoesMenu
        aberto={aberto === 'configuracoes'}
        aoAlternar={alternar('configuracoes')}
        aoFechar={fechar}
      />
      <PerfilMenu
        aberto={aberto === 'perfil'}
        aoAlternar={alternar('perfil')}
        aoFechar={fechar}
      />
    </div>
  )
}
