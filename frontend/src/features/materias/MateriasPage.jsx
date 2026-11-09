import { useState } from 'react'
import CartaoDisciplina from '../disciplinas/CartaoDisciplina'
import { listarDisciplinas } from '../disciplinas/listarDisciplinas'
import {
  Carregando,
  ErroCarregamento,
  EstadoVazio,
} from '../../shared/components/Estados'
import { useRequisicao } from '../../shared/hooks/useRequisicao'
import '../disciplinas/CartaoDisciplina.css'

export default function MateriasPage() {
  const { dados, erro, carregando, tentarNovamente } =
    useRequisicao(listarDisciplinas)
  const [busca, setBusca] = useState('')

  let conteudo

  if (carregando) {
    conteudo = <Carregando mensagem="Carregando suas matérias…" />
  } else if (erro) {
    conteudo = (
      <ErroCarregamento
        titulo="Não foi possível carregar as matérias"
        mensagem={erro.message}
        aoTentarNovamente={tentarNovamente}
      />
    )
  } else if (dados.length === 0) {
    conteudo = <EstadoVazio mensagem="Você ainda não tem matérias." />
  } else {
    const termo = busca.trim().toLowerCase()
    const visiveis = dados.filter((disciplina) =>
      disciplina.nome.toLowerCase().includes(termo),
    )

    conteudo = (
      <>
        <label>
          Buscar matéria{' '}
          <input
            type="search"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
          />
        </label>

        {visiveis.length === 0 ? (
          <EstadoVazio mensagem="Nenhuma matéria encontrada para essa busca." />
        ) : (
          <ul className="lista-cartoes">
            {visiveis.map((disciplina) => (
              <li key={disciplina.id}>
                <CartaoDisciplina disciplina={disciplina} />
              </li>
            ))}
          </ul>
        )}
      </>
    )
  }

  return (
    <section>
      <h1>Matérias</h1>
      {conteudo}
    </section>
  )
}
