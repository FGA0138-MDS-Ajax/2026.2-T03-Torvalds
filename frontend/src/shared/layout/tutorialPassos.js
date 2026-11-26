/** Guarda o estado do tutorial: "pendente" logo depois do cadastro, "visto" ao terminar ou pular. */
export const CHAVE_TUTORIAL = 'cancha.tutorial'

/** Abre o tutorial de novo (pelas Configurações). */
export const EVENTO_TUTORIAL = 'cancha:tutorial'

/** Marca o tutorial para abrir no primeiro acesso, logo depois do cadastro. */
export function marcarTutorialPendente() {
  try {
    localStorage.setItem(CHAVE_TUTORIAL, 'pendente')
  } catch {
    // Sem armazenamento: o tutorial continua disponível nas Configurações
  }
}

/**
 * Os passos do tour: `alvo` é o que fica em destaque (sem alvo, o cartão
 * aparece no meio da tela; Passos cujo alvo não está na tela (as entregas
 * da semana, fora do Início, por exemplo) são pulados.
 */
export const PASSOS = [
  {
    titulo: 'Bem-vindo ao cAnCHA!',
    texto:
      'Seu caderno digital do semestre: matérias, anotações e entregas no mesmo lugar. Bora dar uma volta rápida?',
  },
  {
    alvo: '.layout-links a[href="/"]',
    titulo: 'Início',
    texto:
      'A primeira tela do cAnCHA: o resumo do seu semestre. Clique aqui sempre que quiser voltar a ela.',
  },
  {
    // O dashboard inteiro em destaque (só no Início; nas outras telas é pulado)
    alvo: '.inicio',
    titulo: 'Seu painel',
    texto:
      'O que mudou hoje, a próxima prova, as entregas da semana (clique no cartão para ver o mês inteiro), as próximas tarefas, as suas matérias e o progresso no semestre. Tudo num lugar só.',
  },
  {
    alvo: '.layout-links a[href$="/materias"]',
    titulo: 'Matérias',
    texto:
      'Aqui ficam as matérias do semestre, cada uma com a sua cor. Escolha uma para ver as entregas, os materiais e as anotações dela.',
  },
  {
    // Só no Início: o quadro das matérias; nas outras telas o passo é pulado
    alvo: '.inicio-materias-caixa',
    titulo: 'Suas matérias no Início',
    texto:
      'O Início também mostra as suas matérias, com o que falta entregar em cada uma. A cor é a mesma em todas as telas. Clique numa para abrir.',
  },
  {
    alvo: '.layout-links a[href$="/anotacoes"]',
    titulo: 'Anotações',
    texto:
      'Um caderno para cada matéria: escreva, use negrito e marca-texto e organize tudo em abas.',
  },
  {
    alvo: '.layout-links a[href$="/agenda"]',
    titulo: 'Agenda',
    texto:
      'Veja as entregas por mês, semana ou quadro. Clique num dia para ver tudo o que vence nele.',
  },
  {
    alvo: '#gatilho-notificacoes',
    titulo: 'Avisos',
    texto:
      'O sininho mostra as entregas que estão chegando, as mais urgentes primeiro.',
  },
  {
    alvo: '#gatilho-configuracoes',
    titulo: 'Configurações',
    texto:
      'Aumente o tamanho do texto do site inteiro e, quando quiser, veja este tutorial de novo.',
  },
  {
    titulo: 'Tudo pronto!',
    texto: 'Que tal começar olhando as suas matérias?',
    final: true,
  },
]
