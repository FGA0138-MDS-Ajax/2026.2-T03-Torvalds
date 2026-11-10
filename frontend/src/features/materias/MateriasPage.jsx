import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { listarDisciplinas } from '../disciplinas/listarDisciplinas'
import BarraProgresso from '../../shared/components/BarraProgresso'
import { corDaDisciplina } from '../../shared/utils/coresDisciplina'
import {
  Carregando,
  ErroCarregamento,
  EstadoVazio,
} from '../../shared/components/Estados'
import { useRequisicao } from '../../shared/hooks/useRequisicao'
import DetalheMateria from './DetalheMateria'
import './MateriasPage.css'

export default function MateriasPage() {
  const { dados, erro, carregando, tentarNovamente } =
    useRequisicao(listarDisciplinas)
  const [parametros, setParametros] = useSearchParams()
  const busca = parametros.get('busca') ?? ''
  const escolhida = parametros.get('materia')
  // Progresso recalculado aqui quando o aluno move uma atividade no quadro.
  const [progressoLocal, setProgressoLocal] = useState({})

  function voltarParaLista() {
    const novos = new URLSearchParams(parametros)
    novos.delete('materia')
    setParametros(novos)
  }

  function escolher(id) {
    const novos = new URLSearchParams(parametros)
    novos.set('materia', String(id))
    setParametros(novos)
  }

  // No celular, só a lista aparece até o aluno escolher uma matéria; aí abre a tela dela.
  let detalheAberto = false
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

    if (visiveis.length === 0) {
      conteudo = (
        <EstadoVazio mensagem="Nenhuma matéria encontrada para essa busca." />
      )
    } else {
      const selecionada =
        visiveis.find((disciplina) => String(disciplina.id) === escolhida) ??
        visiveis[0]

      detalheAberto = visiveis.some(
        (disciplina) => String(disciplina.id) === escolhida,
      )

      conteudo = (
        <div
          className={`materias-grade${
            detalheAberto ? ' materias-grade-detalhe' : ''
          }`}
        >
          <ul className="materias-lista">
            {visiveis.map((disciplina) => {
              const ativa = disciplina.id === selecionada.id
              const cor = corDaDisciplina(
                disciplina.nome,
                dados.findIndex((item) => item.id === disciplina.id),
              )

              return (
                <li key={disciplina.id}>
                  <button
                    type="button"
                    className={`materia-cartao materia-cartao-${cor}${
                      ativa ? ' materia-cartao-ativo' : ''
                    }`}
                    aria-pressed={ativa}
                    onClick={() => escolher(disciplina.id)}
                  >
                    <strong>{disciplina.nome}</strong>
                    <BarraProgresso
                      percentual={
                        progressoLocal[disciplina.id] ??
                        disciplina.progressoPercentual
                      }
                      rotulo={`Progresso em ${disciplina.nome}`}
                    />
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="materias-painel">
            <button
              type="button"
              className="materias-voltar"
              onClick={voltarParaLista}
            >
              ← Voltar para as matérias
            </button>
            <DetalheMateria
              key={selecionada.id}
              disciplina={selecionada}
              aoMudarProgresso={(percentual) =>
                setProgressoLocal((anterior) => ({
                  ...anterior,
                  [selecionada.id]: percentual,
                }))
              }
            />
          </div>
        </div>
      )
    }
  }

  return (
    <section
      className={`materias${detalheAberto ? ' materias-com-detalhe' : ''}`}
    >
      <h1>Suas Matérias</h1>
      <p className="materias-subtitulo">
        Escolha uma matéria para continuar seus estudos.
      </p>
      {conteudo}
    </section>
  )
}
