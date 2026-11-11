import { useEffect, useState } from 'react'
import { consultarPerfil } from './authApi'
import { SessaoContext } from './SessaoContext'
import { aoExpirarSessao } from '../../shared/api/sessaoExpirada'
import { obterToken, removerToken } from '../../shared/auth/tokenStorage'

/**
 * Guarda quem é o aluno logado e restaura a sessão ao abrir o site.
 * Enquanto verifica o token (ou se falhar), mostra só a tela de status;
 * as rotas só aparecem depois disso.
 */
export default function SessaoProvider({ children }) {
  const [perfil, setPerfil] = useState(null)
  const [verificando, setVerificando] = useState(true)
  const [erroSessao, setErroSessao] = useState('')
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function restaurarSessao() {
      try {
        if (!obterToken()) return

        const aluno = await consultarPerfil(controller.signal)
        setPerfil(aluno)
      } catch (erro) {
        if (controller.signal.aborted) return

        if (erro.status === 401) {
          removerToken()
        } else {
          setErroSessao(
            erro.message || 'Não foi possível verificar sua sessão.',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setVerificando(false)
        }
      }
    }

    restaurarSessao()

    return () => controller.abort()
  }, [tentativa])

  useEffect(() => aoExpirarSessao(() => setPerfil(null)), [])

  function sair() {
    removerToken()
    setPerfil(null)
    setErroSessao('')
  }

  function tentarNovamente() {
    setErroSessao('')
    setVerificando(true)
    setTentativa((valor) => valor + 1)
  }

  if (verificando) {
    return (
      <main className="session-page">
        <p role="status">Verificando sua sessão…</p>
      </main>
    )
  }

  if (erroSessao) {
    return (
      <main className="session-page">
        <section className="session-card">
          <p role="alert">{erroSessao}</p>
          <button type="button" onClick={tentarNovamente}>
            Tentar novamente
          </button>
          <button type="button" onClick={sair}>
            Voltar ao login
          </button>
        </section>
      </main>
    )
  }

  return (
    <SessaoContext.Provider value={{ perfil, entrar: setPerfil, sair }}>
      {children}
    </SessaoContext.Provider>
  )
}
