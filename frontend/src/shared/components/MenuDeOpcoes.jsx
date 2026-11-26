import Icone from '../layout/Icone'
import './MenuDeOpcoes.css'

/**
 * Só um ícone; ao clicar, abre a lista de opções do navegador. Por baixo é um
 * <select> normal (invisível sobre o ícone), então teclado e leitor de tela
 * continuam funcionando.
 */
export default function MenuDeOpcoes({
  rotulo,
  valor,
  opcoes,
  aoMudar,
  icone = 'mover',
  tamanho = 16,
}) {
  return (
    <span className="menu-opcoes" title={rotulo}>
      <Icone nome={icone} tamanho={tamanho} />
      <select
        aria-label={rotulo}
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
      >
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.titulo}
          </option>
        ))}
      </select>
    </span>
  )
}
