import Cartao from '../../shared/components/Cartao'
import './CartaoDisciplina.css'

export default function CartaoDisciplina({ disciplina }) {
  const progresso = Math.round(disciplina.progressoPercentual ?? 0)

  return (
    <Cartao
      titulo={disciplina.nome}
      subtitulo={`Período ${disciplina.periodoLetivo}`}
      para={`/disciplinas/${disciplina.id}`}
    >
      <progress
        className="cartao-progresso"
        value={progresso}
        max="100"
        aria-label={`Progresso em ${disciplina.nome}`}
      />
      <p className="cartao-progresso-texto">{progresso}% concluído</p>
    </Cartao>
  )
}
