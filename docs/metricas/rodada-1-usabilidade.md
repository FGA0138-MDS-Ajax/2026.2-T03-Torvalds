# Resultados da rodada 1 de testes de usabilidade

| | |
|---|---|
| **Rodada** | 1, na Sprint 9 |
| **Data das sessões** | 25/11/2026 |
| **Versão testada** | Ambiente publicado, v0.1.1 |
| **Participantes** | 3 estudantes (P1, P2 e P3) |
| **Plano de referência** | [Documento de Visão](../documento-de-visao.md), seção 5.1 (GQM) |
| **Roteiro aplicado** | [Materiais da rodada 1](../testes/rodada-1-usabilidade.md) |
| **Fontes dos dados** | Planilha do observador e formulário SUS respondido ao fim de cada sessão |
| **Data do registro** | 27/11/2026 |

Este documento consolida a primeira rodada de testes de usabilidade do cAnCHA, com as métricas M6 a M12 definidas na seção 5.1 do Documento de Visão. É a primeira coleta dessas métricas: os registros das Sprints 6, 7 e 8 as deixaram em aberto, porque dependiam das sessões com estudantes.

Cada participante criou a própria conta antes das tarefas, o que também exercitou a US13a (criação de conta). Os resultados dessa parte estão no [relatório de testes da Sprint 9](../testes/relatorio-sprint-9.md).

## 1. Valores coletados

| Métrica | Valor | Meta | Situação |
|---|---|---|---|
| **M6** Cliques até a disciplina | P1: 2 · P2: 2 · P3: 1 | ≤ 3 para todos | **Atingida** |
| **M7** Cliques até a entrega | não coletada | ≤ 3 para todos | **Não coletada** (ver seção 3) |
| **M8** Taxa de sucesso | 83,3% ou 94,4%, conforme o critério | ≥ 80% | **Atingida** nas duas leituras |
| **M9** Tempo até o próximo prazo | P1: 13 s · P2: **66 s** · P3: 23 s | ≤ 30 s para cada | **Não atingida** (1 de 3) |
| **M10** Acerto na leitura do progresso | 100% (3 de 3) | ≥ 80% | **Atingida** |
| **M11** Nota SUS | **81,67** | ≥ 68 | **Atingida** |
| **M12** Problemas de usabilidade | 4 problemas: 0 graves, 2 moderados, 2 leves | Graves corrigidos antes da rodada 2 | **Atingida** (nenhum grave) |

## 2. Detalhamento

### M6 — Cliques até a disciplina (T1)

Todos os participantes abriram a disciplina pedida dentro do limite de 3 cliques, e nenhum precisou de ajuda para isso.

| Participante | Cliques | Tempo | Caminho |
|---|---|---|---|
| P1 | 2 | 6 s | Início → Matérias → disciplina |
| P2 | 2 | 15 s | Mesmo caminho |
| P3 | **1** | 3 s | Direto pelo banner da disciplina na tela inicial |

O P3 chegou em 1 clique por um caminho que o roteiro não previa: clicou no banner da matéria na própria tela inicial, em vez de passar pela página Matérias. O resultado é melhor que o esperado e confirma o objetivo do REQ-02 (navegação rasa), mas mostra que o caminho previsto no roteiro não é o único — vale registrar os dois na rodada 2.

### M7 — Cliques até a entrega (T2)

**Não coletada nesta rodada.** A planilha registra `N/A` na contagem de cliques da T2 para os três participantes, com a observação de que cada um "já estava na página desejada" por causa da tarefa anterior. A T2 mediu o tempo para *localizar* a entrega na tela, não o número de cliques desde o Início, que é o que a M7 define.

Os tempos observados foram P1: 15 s, P2: 18 s e P3: 9 s — todos encontraram a entrega e informaram o prazo corretamente.

**Ação:** na rodada 2, aplicar a T2 a partir da tela Início, e não na sequência da T1, para que a contagem de cliques seja possível. Alternativamente, rever a definição da M7 na Visão, se a intenção for medir a localização e não a navegação.

### M8 — Taxa de sucesso (todas as tarefas)

A métrica pede tarefas concluídas **sem ajuda e em até 2 minutos**, sobre 18 tarefas (6 por participante, de T0 a T5). Todos os 18 registros estão marcados como concluídos.

O cálculo depende de como se classifica o apoio dado ao P2, e por isso ficam registradas as duas leituras:

| Leitura | Critério | Resultado |
|---|---|---|
| Conservadora | Desconta T0, T1 e T3 do P2, em que a planilha registra ajuda ou pedido de validação | 15/18 = **83,3%** |
| Estrita ao campo da planilha | Desconta só o T0 do P2, única tarefa marcada em "Precisou de ajuda?" | 17/18 = **94,4%** |

As duas ficam acima da meta de 80%. A diferença está nas tarefas T1 e T3 do P2, em que a planilha descreve pedidos de confirmação ("é aqui que clica para confirmar?") e a confirmação de um nome de matéria — apoio que o observador classificou como validação, não como ajuda para concluir.

O T0 do P2 (criação de conta) levou 2 min 17 s, acima do limite de 2 minutos, e também registra ajuda explícita: é a única tarefa reprovada nas duas leituras.

**Ação:** padronizar na planilha da rodada 2 o que conta como ajuda, para a métrica ter um valor único.

### M9 — Tempo até o próximo prazo (T3)

**Meta não atingida.** O P2 levou 66 segundos para dizer qual era a próxima entrega, contra o limite de 30 segundos.

| Participante | Tempo | Dentro da meta |
|---|---|---|
| P1 | 13 s | Sim |
| P2 | **66 s** | **Não** |
| P3 | 23 s | Sim |

A observação do facilitador aponta a causa: o P2 não estava habituado às disciplinas da carga de exemplo e travou para identificar qual era a matéria pedida — não para encontrar a informação na tela. O observador registra que precisou confirmar que "Gestão e Produção da Qualidade" era a matéria em questão.

Isso sugere que o gargalo está na carga de exemplo, e não no desenho da tela Início: com disciplinas reais do próprio aluno, o reconhecimento tende a ser imediato. A interpretação da métrica na Visão manda "rever a tela Início" quando o tempo passa de 30 s; antes de mexer na tela, convém verificar na rodada 2 se o atraso se repete com participantes que tenham criado disciplinas próprias (US13b) ou que recebam a disciplina pedida por escrito.

### M10 — Acerto na leitura do progresso (T4)

**Atingida: 100% (3 de 3).**

Os três participantes relataram a porcentagem exata exibida na tela, com diferença de zero ponto em relação ao valor real — bem dentro da tolerância de 10 pontos que a métrica admite. O campo "Concluiu?" da planilha reflete essa conferência: o observador só marcou a tarefa como concluída depois de comparar a resposta dita com o valor da tela, e uma resposta errada teria sido registrada como não concluída.

**Ação para a rodada 2:** registrar na planilha a resposta dada e o valor real em colunas próprias. A conferência foi feita, mas fica implícita no campo de conclusão; explicitá-la permite recalcular a métrica a partir da planilha, sem depender da memória de quem observou.

Os tempos foram P1: 7 s, P2: 10 s e P3: 10 s. O P3 leu o progresso sem nenhum clique, direto da janela "Minhas matérias" na tela inicial; P1 e P2 foram até a página Matérias.

### M11 — Nota SUS

**Atingida: média de 81,67**, acima da meta de 68.

Cálculo pela fórmula padrão do SUS (BROOKE, 1996): nos itens ímpares, soma-se (resposta − 1); nos pares, (5 − resposta); o total é multiplicado por 2,5.

| Participante | Soma bruta | Nota SUS |
|---|---|---|
| P1 | 36 | **90,0** |
| P2 | 27 | **67,5** |
| P3 | 35 | **87,5** |
| | **Média** | **81,67** |

A média fica na faixa classificada como excelente na escala adjetiva de Bangor, Kortum e Miller (2009), com adjetivo "excellent" entre 72,8 e 85,5 e "best imaginable" acima disso.

O P2, com 67,5, ficou meio ponto abaixo do mínimo individual de 68 — coerente com ser o participante que mais encontrou atritos nas tarefas (T0, T1 e T3). É o mesmo participante que nunca havia usado um sistema de gestão escolar, segundo o registro do observador.

**Comentários abertos do questionário:**

- P1: sugeriu um modo escuro e letras grandes um pouco maiores.
- P2: "Site muito funcional".
- P3: achou o sistema bastante intuitivo e destacou o uso das cores.

### M12 — Problemas de usabilidade

**Atingida: nenhum problema grave.** Quatro problemas identificados, classificados pelos critérios da Visão (grave: impede concluir a tarefa; moderado: atrasa a tarefa ou exige ajuda; leve: incomoda sem atrasar).

| # | Problema | Gravidade | Origem |
|---|---|---|---|
| 1 | O botão de cadastrar-se é pouco visível, e não fica claro que é preciso criar uma conta antes de entrar | **Moderado** | T0 do P2: 2 min 17 s e ajuda explícita; P1 e P3 também confundiram o campo de e-mail do login com o de cadastro |
| 2 | Não há como visualizar a senha digitada na criação de conta | **Moderado** | Observação do facilitador: sem isso, o participante não tem como conferir o que digitou num campo mascarado, logo após ter de repeti-lo na confirmação |
| 3 | Ao concluir uma atividade, a entrega seguinte ocupa o lugar da anterior sem distinção visual, dando a impressão de que nada mudou | **Leve** | Observação do facilitador na T5 |
| 4 | O campo de nome no cadastro não aplica maiúscula inicial automaticamente | **Leve** | Observação do facilitador |

Nenhum problema impediu a conclusão de qualquer tarefa: os 18 registros da planilha estão marcados como concluídos.

Os problemas 1 e 2 concentram-se na criação de conta, funcionalidade publicada nesta sprint (US13a) e que os participantes usaram pela primeira vez. Os dois são moderados por atrasarem a tarefa ou exigirem ajuda, e a Visão só obriga a corrigir os graves antes da rodada seguinte — mas, por estarem na primeira tela que o aluno novo encontra, convém tratá-los antes da rodada 2.

### Encaminhamento dos problemas

O **problema 1** já está sendo tratado na [issue #195](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/issues/195) e no PR #196, que dão destaque ao botão de cadastro e levam o login sem conta à tela de cadastro com o e-mail já preenchido. Vale registrar que aquelas melhorias partiram da análise das entrevistas, antes desta rodada: os dados de campo confirmam a leitura que a equipe havia feito, já que a criação de conta foi a única tarefa reprovada no critério de tempo da M8.

Os problemas **2**, **3** e **4** não estão cobertos por nenhum trabalho em andamento e viraram issues próprias, conforme a [#172](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/issues/172).

### Pedido registrado, sem issue: modo escuro

O P1 pediu um modo escuro, no questionário SUS e nos comentários gerais. O pedido **não vira issue**: a identidade visual do produto foi planejada em claro, e um tema escuro contraria as decisões de design já tomadas. Fica o registro do usuário, para o caso de o pedido se repetir em rodadas seguintes e justificar uma revisão dessa decisão.

O mesmo participante pediu letras grandes um pouco maiores. A opção de tamanho de texto já existe nas Configurações, e o PR #196 faz o conteúdo crescer junto com ela — o que deve atender ao pedido quando for publicado.

## 3. Limitações desta rodada

- **M7 não coletada**, pela ordem das tarefas na sessão (ver seção 2).
- **Três participantes.** Pela curva de Nielsen (2000), três pessoas por perfil cobrem a variedade mínima de comportamentos recomendada pelo autor, mas um participante encontra em média 31% dos problemas de uso: a lista da M12 não deve ser lida como exaustiva.
- **Carga de exemplo.** As disciplinas usadas são as do seed, que nenhum participante cursa de verdade. Isso afetou diretamente a M9 e, segundo o observador, também a identificação das matérias na T3.

## 4. Ações decorrentes

| Ação | Métrica | Prazo sugerido |
|---|---|---|
| Abrir issue para os problemas 2, 3 e 4 da M12 (o 1 já está no PR #196) | M12 | Antes da Planning da Sprint 10 |
| Tratar os problemas 1 e 2, ambos na criação de conta | M12 | Antes da rodada 2 |
| Aplicar a T2 a partir do Início, para coletar a M7 | M7 | Rodada 2 |
| Registrar em colunas próprias a resposta dada e o valor real na T4 | M10 | Rodada 2 |
| Padronizar o que conta como ajuda na planilha | M8 | Rodada 2 |
| Verificar se o atraso da M9 se repete com participantes mais familiarizados com as disciplinas | M9 | Rodada 2 |

## Referências

BANGOR, A.; KORTUM, P.; MILLER, J. Determining what individual SUS scores mean: adding an adjective rating scale. **Journal of Usability Studies**, v. 4, n. 3, p. 114-123, 2009.

BROOKE, J. SUS: a "quick and dirty" usability scale. In: JORDAN, P. W. et al. (ed.). **Usability Evaluation in Industry**. London: Taylor & Francis, 1996. p. 189-194.

NIELSEN, J. **Why you only need to test with 5 users**. Nielsen Norman Group, 2000. Disponível em: https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/. Acesso em: 27 nov. 2026.
