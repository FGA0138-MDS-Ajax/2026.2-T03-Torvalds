import { useSessao } from '../auth/useSessao'
import './PerfilPage.css'

export default function PerfilPage() {
  const { perfil, sair } = useSessao()
  const inicial = (perfil.nome ?? '?').trim().charAt(0).toUpperCase() || '?'

  return (
    <section className="perfil">
      <h1>Meu perfil</h1>

      <div className="perfil-caixa">
        <span className="perfil-avatar" aria-hidden="true">
          {inicial}
        </span>
        <dl>
          <div>
            <dt>Nome</dt>
            <dd>{perfil.nome}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{perfil.email}</dd>
          </div>
          {perfil.matriculaUnB && (
            <div>
              <dt>Matrícula UnB</dt>
              <dd>{perfil.matriculaUnB}</dd>
            </div>
          )}
        </dl>
        <button type="button" className="perfil-sair" onClick={sair}>
          Sair da conta
        </button>
      </div>
    </section>
  )
}
