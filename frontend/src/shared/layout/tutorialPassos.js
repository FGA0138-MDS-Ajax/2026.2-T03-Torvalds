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
 * aparece no meio da tela; `senao` é o destaque de reserva, se o alvo não
 * estiver na tela). Passos cujo alvo não está na tela (as entregas
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
      'O resumo do dia: a próxima prova, as entregas da semana, as próximas tarefas e o seu progresso no semestre.',
  },
  {
    alvo: '.inicio-semana',
    titulo: 'Entregas da semana',
    texto:
      'Cada barra é um dia, na cor da matéria. Clique no cartão (ou no ⤢) para ver as entregas do mês inteiro.',
  },
  {
    // No Início, destaca o quadro das matérias; nas outras telas, o item do menu
    alvo: '.inicio-materias-caixa',
    senao: '.layout-links a[href$="/materias"]',
    titulo: 'Matérias',
    texto:
      'As matérias do semestre, cada uma com a sua cor (a mesma em todas as telas). Clique numa para ver as entregas, os materiais e as anotações dela, ou use o item Matérias do menu.',
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
