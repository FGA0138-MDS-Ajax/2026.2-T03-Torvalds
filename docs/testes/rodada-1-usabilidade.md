# Materiais da rodada 1 de testes de usabilidade

Este roteiro apoia a rodada 1 do cAnCHA, com três estudantes de EaD, conforme a [Issue #171](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/issues/171). A sessão usa o ambiente publicado e dura no máximo 20 minutos.

**Referências:** [Documento de Visão](../documento-de-visao.md), seções 4.2, 4.3, 4.4, 5.1 e 6; [Documento de Arquitetura](../documento-de-arquitetura.md), seções 2.5.1, 2.5.2 e 2.7.1; [US13a](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/issues/155).

## 1. Objetivo e escopo

Observar se estudantes conseguem criar a própria conta e, sem orientação, localizar uma disciplina e suas entregas, identificar o próximo prazo, interpretar o progresso e concluir uma entrega.

A criação de conta é a primeira atividade de cada participante e permite observar o fluxo feliz da US13a. Ela não substitui a execução funcional completa do CT-11: as tentativas com e-mail/matrícula duplicados, matrícula preenchida e dados inválidos devem continuar cobertas no teste funcional.

Cada sessão começa com uma conta nova. O cadastro deve terminar no Login com a mensagem **“Conta criada!”**; o participante entra manualmente. Antes de concluir qualquer entrega, as cinco disciplinas de exemplo devem aparecer no Início com progresso 0% e nenhuma entrega concluída.

## 2. Preparação

### Antes de cada sessão

- [ ] Confirmar que a US13a está publicada e que o ambiente está acessível.
- [ ] Acordar o serviço publicado pelo menos cinco minutos antes da sessão, conforme o risco R7 da Visão.
- [ ] Separar um e-mail de teste único por participante. Não solicitar nem registrar senha pessoal, matrícula real ou outros dados desnecessários.
- [ ] Usar identificadores anônimos P1, P2 e P3; não colocar nomes na planilha.
- [ ] Abrir uma sessão limpa do navegador e deixar a aplicação na tela inicial de cadastro/login, sem conta autenticada.
- [ ] Preparar cronômetro e planilha do observador. O observador registra os dados e não orienta o participante.
- [ ] Explicar a participação e obter consentimento. Não gravar áudio, vídeo ou tela sem consentimento explícito.

Se houver indisponibilidade do ambiente, registrar a sessão como **bloqueada por ambiente**, com o motivo. Não contabilizar a falha técnica como falha de usabilidade do participante.

### Distribuição do tempo

| Etapa | Tempo sugerido |
|---|---:|
| Acolhimento e instruções | 1 min |
| T0 — Criar conta e entrar | até 4 min |
| T1 a T5 — tarefas de usabilidade | até 10 min |
| SUS | até 3 min |
| Encerramento | até 2 min |
| **Total** | **até 20 min** |

O limite de 2 minutos é usado para classificar o sucesso da M8 nas tarefas T1–T5. Se uma tarefa passar de 2 minutos, registrar o tempo e o resultado; deixar o participante continuar enquanto houver tempo na sessão, sem dar pistas.

## 3. Roteiro do facilitador

### Abertura — ler para o participante

> Obrigado por participar. Queremos avaliar o cAnCHA, não você. Não há resposta certa sobre como navegar: use o sistema como faria normalmente. Enquanto você realiza as tarefas, vou observar sem orientar. Se algo não ficar claro ou não funcionar, diga o que esperava que acontecesse. Você pode parar a qualquer momento. Não preciso da sua senha pessoal nem de dados reais; usaremos um e-mail de teste. A sessão dura até 20 minutos.

### T0 — Criar conta e entrar (US13a)

> Para começar, crie uma conta para usar o cAnCHA. Use o e-mail de teste fornecido, deixe a matrícula UnB em branco e escolha uma senha de teste que você não use em outros serviços. Depois, entre com a conta que acabou de criar.

O facilitador fornece somente o e-mail de teste. Não dita os passos nem aponta controles. Se houver dificuldade, perguntar apenas **“O que você esperava que acontecesse?”** e registrar qualquer intervenção como ajuda.

### Instrução geral para cada tarefa

> Agora vou propor algumas tarefas. Faça cada uma como faria normalmente; avise quando considerar que terminou.

Ler cada tarefa abaixo sem acrescentar instruções de navegação. Iniciar o cronômetro quando terminar de ler a tarefa. Para medir cliques desde o Início, iniciar a tarefa com o participante no Início; se necessário, pedir apenas que volte ao Início, sem indicar como chegar lá.

| Tarefa | Fala do facilitador |
|---|---|
| T1 — Abrir disciplina | “No Início, abra Métodos de Desenvolvimento de Software.” |
| T2 — Achar entrega e prazo | “No Início, encontre a primeira entrega pendente de Métodos de Desenvolvimento de Software e me diga o prazo.” |
| T3 — Próxima entrega | “No Início, qual é a próxima entrega que você precisa fazer? Diga o título, a disciplina e o prazo que aparecem.” |
| T4 — Ler progresso | “No Início, quanto do progresso de Métodos de Desenvolvimento de Software já foi concluído? Diga a porcentagem.” |
| T5 — Concluir entrega | “Encontre a primeira entrega pendente de Métodos de Desenvolvimento de Software e marque-a como concluída.” |

Não corrigir respostas nem confirmar se estão certas durante as tarefas. Registrar a resposta literal e comparar com o gabarito depois. Ao final, entregar o SUS sem explicar a pontuação ou sugerir respostas.

### Encerramento

> Obrigado. Antes de terminarmos: houve algo que foi difícil, confuso ou diferente do que você esperava? Se pudesse mudar uma coisa, o que mudaria?

Registrar as respostas abertas sem interpretar ou atribuir intenção ao participante. Agradecer e encerrar a sessão.

## 4. Gabarito do dia

Os valores de prazos, quantidade de entregas e percentual após concluir uma entrega podem variar conforme a carga e a data. Conferir os dados exibidos no ambiente no dia da rodada; não usar títulos ou datas fixos como gabarito.

| Etapa | Critério de conclusão / resposta esperada | O que registrar |
|---|---|---|
| T0 — Cadastro e login | Cadastro aceito com matrícula em branco; Login mostra “Conta criada!”; participante entra manualmente; Início mostra as cinco disciplinas de exemplo, todas com 0%, sem entregas concluídas. | Concluiu cadastro? Entrou sem ajuda? Tempo, tentativas e mensagens vistas. Anotar falhas de validação separadamente. |
| T1 — Disciplina | Abre Métodos de Desenvolvimento de Software. A métrica M6 conta os cliques desde o Início até a disciplina abrir; esperado: no máximo 3. | Número de cliques e caminho utilizado. |
| T2 — Entrega e prazo | Localiza a primeira entrega pendente de MDS e informa o prazo apresentado. O prazo deve corresponder ao mesmo item na disciplina e na Agenda. M7: até 3 cliques desde o Início até ver a entrega. | Título e prazo respondidos, correspondência com a interface, cliques e caminho. |
| T3 — Próximo prazo | Identifica a próxima entrega não concluída e informa título, disciplina e prazo de acordo com o Início. M9: tempo desde o Início até a resposta, esperado: até 30 segundos. | Resposta literal, resposta conferida, tempo em segundos. |
| T4 — Progresso | Antes de T5, MDS deve estar em 0%, pois a conta é nova e ainda não teve entrega concluída. M10 considera correta uma resposta com diferença máxima de 10 pontos percentuais do valor real. | Percentual respondido, percentual exibido e diferença em pontos percentuais. |
| T5 — Concluir entrega | A entrega escolhida passa a concluída para a conta do participante. O progresso da disciplina é atualizado sem recarregar e corresponde a entregas concluídas ÷ total de entregas × 100. | Entrega escolhida, mudança de estado/progresso, tempo, cliques e ajuda necessária. |

**US13a — limites do que esta sessão comprova:** esta atividade observa o cadastro válido com matrícula opcional em branco e o primeiro login. O CT-11 também pede a verificação de matrícula válida preenchida, e-mail/matrícula duplicados, senha menor que 8 caracteres, confirmação diferente e isolamento entre contas; não marcar esses critérios como aprovados apenas com a rodada de usabilidade.

### Classificação de sucesso e ajuda

- **Concluída:** o participante chega ao resultado solicitado, mesmo que a resposta esteja incorreta; a correção da resposta é registrada separadamente.
- **Concluída sem ajuda:** o participante conclui sem dica, instrução de navegação ou intervenção do facilitador.
- **Sucesso M8:** tarefa T1–T5 concluída sem ajuda e em até 120 segundos.
- **Parcial:** inicia o caminho correto, mas não chega ao resultado solicitado.
- **Não concluída:** não chega ao resultado solicitado ou abandona.
- **Bloqueada por ambiente:** falha de disponibilidade ou erro técnico impede a observação; não contar como sucesso nem como falha do participante.

Gravidade dos problemas (M12): **grave** — impede concluir a tarefa; **moderado** — atrasa ou exige ajuda; **leve** — incomoda, sem atrasar. Registrar evidência observável, sem inferir a causa.

## 5. Template da planílha, removi pra não ficar ocupando muito espaço

## 6. Formulário SUS

**SUS** significa *System Usability Scale* (Escala de Usabilidade do Sistema). É um questionário padronizado de dez afirmações para medir a percepção geral de usabilidade. Ele complementa a observação: uma nota SUS não substitui o sucesso nas tarefas, os tempos, os cliques nem o registro de problemas.

**Instrução ao participante:** “Considerando sua experiência com o cAnCHA nesta sessão, indique o quanto você concorda ou discorda de cada afirmação.”

Use a mesma escala em todos os itens:

| Nota | Resposta |
|---:|---|
| 1 | Discordo totalmente |
| 2 | Discordo |
| 3 | Nem concordo nem discordo |
| 4 | Concordo |
| 5 | Concordo totalmente |

| Nº | Afirmação | Resposta (1–5) |
|---:|---|:---:|
| 1 | Eu gostaria de usar este sistema com frequência. | |
| 2 | Achei este sistema desnecessariamente complexo. | |
| 3 | Achei este sistema fácil de usar. | |
| 4 | Acho que precisaria do apoio de uma pessoa com conhecimentos técnicos para usar este sistema. | |
| 5 | Achei que as várias funções deste sistema estão bem integradas. | |
| 6 | Achei que havia muita inconsistência neste sistema. | |
| 7 | Imagino que a maioria das pessoas aprenderia a usar este sistema rapidamente. | |
| 8 | Achei este sistema muito complicado de usar. | |
| 9 | Senti-me confiante ao usar este sistema. | |
| 10 | Precisei aprender várias coisas novas antes de conseguir usar este sistema. | |

### Cálculo da pontuação SUS

1. Para cada item ímpar (1, 3, 5, 7, 9), subtrair 1 da resposta.
2. Para cada item par (2, 4, 6, 8, 10), subtrair a resposta de 5.
3. Somar os dez valores ajustados e multiplicar o total por 2,5. A nota SUS individual fica entre 0 e 100.
4. Calcular a média das notas individuais para a rodada e acompanhar também a média acumulada, conforme a M11.

Exemplos do ajuste: item 1 respondido com 4 contribui 3; item 2 respondido com 4 contribui 1. **68 é a referência de média definida na Visão, não uma porcentagem de participantes satisfeitos.** Com apenas três pessoas, apresentar resultados como evidência exploratória, sem generalizar para todos os estudantes.

Na aba **SUS**, guardar uma linha por participante, as respostas 1–10, a soma ajustada e a nota individual. Não alterar a ordem, a redação ou a escala entre participantes; as frases acima são a versão em português usada neste roteiro.

## 7. Leitura dos resultados

Ao fechar a rodada, resumir:

1. M6–M11 e seus valores, sem omitir participantes ou tarefas bloqueadas.
2. Tarefas com sucesso abaixo de 80%, caminhos com mais de três cliques e respostas incorretas de prazo/progresso.
3. Problemas observados, evidências e gravidade M12; criar issues para problemas que precisem de correção.
4. Limitações da amostra: três participantes nesta rodada não representam toda a variedade de estudantes.
5. Se o mesmo participante voltar em outra rodada, trocar a disciplina e a entrega pedidas, conforme a Visão, para reduzir o efeito de aprendizado.
