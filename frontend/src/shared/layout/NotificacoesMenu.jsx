import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { formatarPrazoCurto } from '../../features/inicio/inicioUtils'
import Icone from './Icone'
import { carregarNotificacoes } from './notificacoesApi'
import { contarUrgentes } from './notificacoesUtils'

/**
 * Sino do topo: o selo conta as entregas urgentes e o painel lista as próximas entregas do
 * aluno, com o prazo. Não há "lida/não lida", porque os avisos vêm das próprias entregas.
 */
export default function NotificacoesMenu({ aberto, aoAlternar, aoFechar }) {
  const [estado, setEstado] = useState({ itens: null, erro: null })
  const [tentativa, setTentativa] = useState(0)

  // Busca ao carregar a tela e de novo ao abrir ou fechar o painel, para o selo e a lista
  // acompanharem o que o aluno mudou nas Matérias.
  useEffect(() => {
    const controller = new AbortController()

    carregarNotificacoes(controller.signal)
      .then((itens) => {
        if (!controller.signal.aborted)
          setEstado({ itens: itens ?? [], erro: null })
      })
      .catch((erro) => {
        if (!controller.signal.aborted) {
          setEstado((anterior) => ({ itens: anterior.itens, erro }))
        }
      })

    return () => controller.abort()
  }, [aberto, tentativa])

  const itens = estado.itens
  const urgentes = itens ? contarUrgentes(itens) : 0

  return (
    <>
      <button
        type="button"
        id="gatilho-notificacoes"
        className="layout-gatilho"
        aria-haspopup="true"
        aria-expanded={aberto}
        aria-controls="painel-notificacoes"
        aria-label={
          urgentes > 0
            ? `Notificações, ${urgentes} com prazo urgente`
            : 'Notificações'
        }
        onClick={aoAlternar}
      >
        <Icone nome="sino" />
        {urgentes > 0 && (
          <span className="layout-selo" aria-hidden="true">
            {urgentes}
          </span>
        )}
      </button>

      {aberto && (
        <div
          id="painel-notificacoes"
          className="layout-painel"
          role="region"
          aria-label="Notificações"
        >
          <h2 className="layout-painel-titulo">Notificações</h2>

          {estado.erro && !itens ? (
            <div className="layout-painel-aviso" role="alert">
              <p>Não foi possível carregar as notificações.</p>
              <button type="button" onClick={() => setTentativa((v) => v + 1)}>
                Tentar novamente
              </button>
            </div>
          ) : !itens ? (
            <p className="layout-painel-aviso" role="status">
              Carregando…
            </p>
          ) : itens.length === 0 ? (
            <p className="layout-painel-aviso">
              Tudo em dia! Você não tem atividades pendentes.
            </p>
          ) : (
            <ul className="layout-notificacoes">
              {itens.map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/materias?materia=${item.disciplinaId}`}
                    onClick={aoFechar}
                  >
                    <strong>{item.titulo}</strong>
                    <span>
                      {item.disciplinaNome} · {item.tipo}
                    </span>
                    <span
                      className={
                        item.atrasada
                          ? 'layout-notificacao-prazo layout-notificacao-atrasada'
                          : 'layout-notificacao-prazo'
                      }
                    >
                      {item.atrasada ? 'Atrasada · ' : 'Prazo: '}
                      {formatarPrazoCurto(item.prazo)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link
            className="layout-painel-rodape"
            to="/agenda"
            onClick={aoFechar}
          >
            Ver agenda
          </Link>
        </div>
      )}
    </>
  )
}
