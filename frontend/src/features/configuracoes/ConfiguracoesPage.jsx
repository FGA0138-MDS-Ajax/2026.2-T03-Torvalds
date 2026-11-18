import AjusteTamanhoTexto from './AjusteTamanhoTexto'
import './ConfiguracoesPage.css'

export default function ConfiguracoesPage() {
  return (
    <section className="configuracoes">
      <h1>Configurações</h1>
      <p className="configuracoes-subtitulo">
        Ajuste o cAnCHA para ficar confortável de usar.
      </p>

      <div className="configuracoes-caixa">
        <h2>Tamanho do texto</h2>
        <p>Aumente as letras de todo o site. A escolha fica neste navegador.</p>
        <AjusteTamanhoTexto />
      </div>

      <div className="configuracoes-caixa">
        <h2>Outras opções</h2>
        <p>
          <span className="configuracoes-em-breve">Em breve</span>
          Tema, avisos por e-mail e mais ajustes.
        </p>
      </div>
    </section>
  )
}
