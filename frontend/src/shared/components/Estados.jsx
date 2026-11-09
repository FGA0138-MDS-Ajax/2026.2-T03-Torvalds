import './Estados.css'

export function Carregando({ mensagem = 'Carregando…' }) {
  return (
    <div className="estado">
      <p role="status">{mensagem}</p>
    </div>
  )
}

export function ErroCarregamento({
  titulo = 'Não foi possível carregar',
  mensagem,
  aoTentarNovamente,
}) {
  return (
    <section className="estado estado-erro" role="alert">
      <h2>{titulo}</h2>
      <p>{mensagem || 'Tente novamente em instantes.'}</p>
      {aoTentarNovamente && (
        <button type="button" onClick={aoTentarNovamente}>
          Tentar novamente
        </button>
      )}
    </section>
  )
}

export function EstadoVazio({ mensagem }) {
  return (
    <div className="estado">
      <p>{mensagem}</p>
    </div>
  )
}
