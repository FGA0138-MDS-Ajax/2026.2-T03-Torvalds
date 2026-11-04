import { useState } from 'react'
import ilustracao from '../../assets/login-ilustracao.png'
import './LoginPage.css'
import { entrar, consultarPerfil } from './authApi'
import { guardarToken, removerToken } from '../../shared/auth/tokenStorage'

export default function LoginPage({ onEntrar }) {
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function enviarLogin(event) {
    event.preventDefault()

    if (carregando) return

    const formulario = new FormData(event.currentTarget)
    const email = String(formulario.get('email')).trim()
    const senha = String(formulario.get('senha'))
    const lembrar = formulario.get('lembrar') === 'on'

    setErro('')
    setCarregando(true)

    try {
      const token = await entrar(email, senha)
      guardarToken(token, lembrar)

      const perfil = await consultarPerfil()
      onEntrar(perfil)
    } catch (falha) {
      removerToken()

      setErro(
        falha.status === 401
          ? 'E-mail ou senha inválidos'
          : falha.message || 'Não foi possível entrar. Tente novamente.',
      )
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-book">
        <section
          className="login-art"
          aria-label="Cancha: seu caderno, agora digital"
        >
          <div className="login-art-crop">
            <img
              src={ilustracao}
              alt="Cancha — Seu caderno, agora digital! Estudante com livros e notebook."
            />
          </div>
        </section>

        <div className="login-binding" aria-hidden="true">
          {Array.from({ length: 10 }, (_, index) => (
            <span key={index} />
          ))}
        </div>

        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-card">
            <header className="login-heading">
              <h1 id="login-title">Entrar</h1>
              <p>Acesse sua conta e continue sua jornada de estudos.</p>
            </header>

            <form
              className="login-form"
              onSubmit={enviarLogin}
              aria-busy={carregando}
            >
              <div className="login-field">
                <label className="visually-hidden" htmlFor="email">
                  E-mail
                </label>
                <span className="login-field-icon" aria-hidden="true">
                  @
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="E-mail"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="login-field">
                <label className="visually-hidden" htmlFor="senha">
                  Senha
                </label>
                <svg
                  className="login-field-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <rect x="5" y="10" width="14" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  <path d="M12 14v3" />
                </svg>
                <input
                  id="senha"
                  name="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="Senha"
                  autoComplete="current-password"
                  required
                />
                <button
                  className="login-password-toggle"
                  type="button"
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={mostrarSenha}
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                    {!mostrarSenha && <path d="m3 21 18-18" />}
                  </svg>
                </button>
              </div>

              <div className="login-options">
                <label className="login-remember">
                  <input type="checkbox" name="lembrar" />
                  <span>Lembrar de mim</span>
                </label>

                <button
                  className="login-forgot"
                  type="button"
                  disabled
                  aria-describedby="login-unavailable"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {erro && (
                <p className="login-error" role="alert">
                  {erro}
                </p>
              )}

              <button
                className="login-submit"
                type="submit"
                disabled={carregando}
              >
                {carregando ? 'Entrando…' : 'Entrar'}
                {!carregando && <span aria-hidden="true"> →</span>}
              </button>

              <div className="login-divider" aria-hidden="true">
                <span>ou</span>
              </div>

              <button
                className="login-register"
                type="button"
                disabled
                aria-describedby="login-unavailable"
              >
                Cadastre-se <span aria-hidden="true">→</span>
              </button>

              <p id="login-unavailable" className="login-unavailable">
                Cadastro e recuperação de senha indisponíveis no momento.
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}
