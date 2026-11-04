import { useEffect, useState } from 'react'
import LoginPage from './features/auth/LoginPage'
import { consultarPerfil } from './features/auth/authApi'
import { obterToken, removerToken } from './shared/auth/tokenStorage'

function App() {
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

  if (!perfil) {
    return <LoginPage onEntrar={setPerfil} />
  }

  return (
    <main className="session-page">
      <section className="session-card">
        <h1>Olá, {perfil.nome}!</h1>
        <p>Você entrou no Cancha.</p>
        <p>{perfil.email}</p>
        <button type="button" onClick={sair}>
          Sair
        </button>
      </section>
    </main>
  )
}

export default App
