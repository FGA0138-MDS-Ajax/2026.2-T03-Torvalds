import { Link } from 'react-router'
import { useSessao } from '../../features/auth/useSessao'
import Icone from './Icone'

/** Foto (inicial) do aluno no topo: abre o perfil, as configurações e o botão Sair. */
export default function PerfilMenu({ aberto, aoAlternar, aoFechar }) {
  const { perfil, sair } = useSessao()
  const inicial = (perfil.nome ?? '?').trim().charAt(0).toUpperCase() || '?'

  return (
    <>
      <button
        type="button"
        id="gatilho-perfil"
        className="layout-gatilho layout-gatilho-perfil"
        aria-haspopup="true"
        aria-expanded={aberto}
        aria-controls="painel-perfil"
        aria-label={`Menu do perfil de ${perfil.nome ?? 'aluno'}`}
        onClick={aoAlternar}
      >
        <span className="layout-avatar" aria-hidden="true">
          {inicial}
        </span>
        <Icone nome="seta" tamanho={16} />
      </button>

      {aberto && (
        <div
          id="painel-perfil"
          className="layout-painel layout-painel-estreito"
          role="region"
          aria-label="Perfil"
        >
          <div className="layout-perfil-cabecalho">
            <span className="layout-avatar" aria-hidden="true">
              {inicial}
            </span>
            <div>
              <strong>{perfil.nome}</strong>
              {perfil.email && <span>{perfil.email}</span>}
            </div>
          </div>

          <ul className="layout-perfil-links">
            <li>
              <Link to="/perfil" onClick={aoFechar}>
                Meu perfil
              </Link>
            </li>
            <li>
              <Link to="/configuracoes" onClick={aoFechar}>
                Configurações
              </Link>
            </li>
          </ul>

          <button
            type="button"
            className="layout-sair"
            onClick={() => {
              aoFechar()
              sair()
            }}
          >
            Sair
          </button>
        </div>
      )}
    </>
  )
}
