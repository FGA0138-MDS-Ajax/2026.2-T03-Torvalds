import { Link } from 'react-router'
import AjusteTamanhoTexto from '../../features/configuracoes/AjusteTamanhoTexto'
import Icone from './Icone'
import { EVENTO_TUTORIAL } from './tutorialPassos'

/** Engrenagem do topo: ajustes rápidos e o caminho para a tela de configurações. */
export default function ConfiguracoesMenu({ aberto, aoAlternar, aoFechar }) {
  return (
    <>
      <button
        type="button"
        id="gatilho-configuracoes"
        className="layout-gatilho layout-engrenagem"
        aria-haspopup="true"
        aria-expanded={aberto}
        aria-controls="painel-configuracoes"
        aria-label="Configurações"
        onClick={aoAlternar}
      >
        <Icone nome="engrenagem" />
      </button>

      {aberto && (
        <div
          id="painel-configuracoes"
          className="layout-painel layout-painel-estreito"
          role="region"
          aria-label="Configurações"
        >
          <h2 className="layout-painel-titulo">Configurações</h2>
          <div className="layout-painel-corpo">
            <p className="layout-painel-rotulo">Tamanho do texto</p>
            <AjusteTamanhoTexto />
            <p className="layout-painel-rotulo">Tutorial</p>
            <button
              type="button"
              className="layout-painel-botao"
              onClick={() => {
                aoFechar()
                window.dispatchEvent(new Event(EVENTO_TUTORIAL))
              }}
            >
              Rever o tutorial
            </button>
          </div>
          <Link
            className="layout-painel-rodape"
            to="/configuracoes"
            onClick={aoFechar}
          >
            Todas as configurações
          </Link>
        </div>
      )}
    </>
  )
}
