import { useState } from 'react'
import { useNavigate } from 'react-router'
import LinkFolha from './LinkFolha'
import ilustracao from '../../assets/cadastro-ilustracao.png'
import './LoginPage.css'
import './CadastroPage.css'
import { cadastrar } from './authApi'
import {
  mensagemDeCadastroDuplicado,
  validarCadastro,
} from './validacaoCadastro'

const DIFERENCIAIS = [
  ['Avisos de prazo', 'Veja o que vence antes de virar urgência.'],
  ['Anotações por matéria', 'Cada disciplina com o seu caderno.'],
  ['Tarefas na sua agenda', 'Entregas e estudos no mesmo calendário.'],
  ['Conteúdo do professor', 'Materiais e avisos junto das suas matérias.'],
]

function Campo({
  id,
  rotulo,
  tipo = 'text',
  autoComplete,
  icone,
  obrigatorio = true,
  ...extras
}) {
  return (
    <div className="login-field">
      <label className="visually-hidden" htmlFor={id}>
        {rotulo}
      </label>
      <span className="login-field-icon" aria-hidden="true">
        {icone}
      </span>
      <input
        id={id}
        name={id}
        type={tipo}
        placeholder={rotulo}
        autoComplete={autoComplete}
        required={obrigatorio}
        {...extras}
      />
    </div>
  )
}

const iconeSvg = (children) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    {children}
  </svg>
)

const ICONE_PESSOA = iconeSvg(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </>,
)
const ICONE_EMAIL = iconeSvg(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </>,
)
const ICONE_MATRICULA = iconeSvg(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="9" cy="11" r="2" />
    <path d="M6 16c0-1.5 1.5-2.5 3-2.5s3 1 3 2.5M15 10h3M15 13h3" />
  </>,
)
const ICONE_SENHA = iconeSvg(
  <>
    <rect x="5" y="10" width="14" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </>,
)

export default function CadastroPage() {
  const navegar = useNavigate()
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function enviar(event) {
    event.preventDefault()
    if (carregando) return

    const dados = new FormData(event.currentTarget)
    const valores = {
      nome: String(dados.get('nome')),
      email: String(dados.get('email')),
      matricula: String(dados.get('matricula')).trim(),
      senha: String(dados.get('senha')),
      confirmacao: String(dados.get('confirmacao')),
    }

    const problema = validarCadastro(valores)
    if (problema) {
      setErro(problema)
      return
    }

    setErro('')
    setCarregando(true)

    try {
      await cadastrar(
        valores.nome.trim(),
        valores.email.trim(),
        valores.senha,
        valores.confirmacao,
        valores.matricula,
      )
      navegar('/login', { state: { cadastrado: true } })
    } catch (falha) {
      if (falha.status === 404 || falha.status === 405) {
        setErro('O cadastro ainda não está disponível no servidor.')
      } else if (falha.status === 409) {
        setErro(mensagemDeCadastroDuplicado(falha.message))
      } else {
        setErro(falha.message || 'Não foi possível cadastrar. Tente novamente.')
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="login-page cadastro-page">
      <div className="login-book cadastro-book">
        <section className="cadastro-esquerda">
          <img
            className="cadastro-ilustracao"
            src={ilustracao}
            alt="cAnCHA — Seu caderno, agora digital! Grupo de amigos estudando juntos no notebook."
          />

          <div className="login-card cadastro-card">
            <header className="login-heading">
              <h1 id="cadastro-titulo">Criar conta</h1>
              <p>
                Cadastre os dados abaixo para começar sua jornada no cAnCHA.
              </p>
            </header>

            <form
              className="login-form cadastro-form"
              onSubmit={enviar}
              aria-labelledby="cadastro-titulo"
              aria-busy={carregando}
              noValidate
            >
              <div className="cadastro-linha-cheia">
                <Campo
                  id="nome"
                  rotulo="Nome completo"
                  autoComplete="name"
                  icone={ICONE_PESSOA}
                />
              </div>
              <div className="cadastro-linha-cheia">
                <Campo
                  id="email"
                  rotulo="E-mail"
                  tipo="email"
                  autoComplete="email"
                  icone={ICONE_EMAIL}
                />
              </div>
              <div className="cadastro-linha-cheia">
                <Campo
                  id="matricula"
                  rotulo="Matrícula UnB (opcional)"
                  autoComplete="off"
                  icone={ICONE_MATRICULA}
                  obrigatorio={false}
                  inputMode="numeric"
                  maxLength={9}
                />
              </div>
              <Campo
                id="senha"
                rotulo="Senha"
                tipo="password"
                autoComplete="new-password"
                icone={ICONE_SENHA}
              />
              <Campo
                id="confirmacao"
                rotulo="Confirmar senha"
                tipo="password"
                autoComplete="new-password"
                icone={ICONE_SENHA}
              />

              {erro && (
                <p className="login-error cadastro-linha-cheia" role="alert">
                  {erro}
                </p>
              )}

              <button
                className="login-submit cadastro-enviar"
                type="submit"
                disabled={carregando}
              >
                {carregando ? 'Cadastrando…' : 'Cadastrar'}
              </button>

              <p className="cadastro-entrar cadastro-linha-cheia">
                Já tem uma conta? <LinkFolha to="/login">Entrar</LinkFolha>
              </p>
            </form>
          </div>
        </section>

        <div className="login-binding" aria-hidden="true">
          {Array.from({ length: 10 }, (_, index) => (
            <span key={index} />
          ))}
        </div>

        <aside className="cadastro-info" aria-label="Sobre o cAnCHA">
          <h2>O que é cAnCHA?</h2>
          <p>
            Uma plataforma para você organizar o semestre sem perder prazo. Suas
            matérias, entregas e agenda ficam juntas, em vez de espalhadas entre
            grupos, e-mails e anotações.
          </p>

          <h2>O que o torna diferente</h2>
          <ul>
            {DIFERENCIAIS.map(([titulo, descricao]) => (
              <li key={titulo}>
                <strong>{titulo}</strong>
                <span>{descricao}</span>
              </li>
            ))}
          </ul>

          <p className="cadastro-chamada">
            <strong>Comece agora.</strong> Crie sua conta e veja suas entregas
            organizadas.
          </p>
        </aside>
      </div>
    </main>
  )
}
