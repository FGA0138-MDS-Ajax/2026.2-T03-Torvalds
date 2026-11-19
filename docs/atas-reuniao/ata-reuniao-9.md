# Ata da 9ª reunião da disciplina "Métodos de Desenvolvimento de Software"

[//]: # (**Ordem do escrivão da ata:** Ana Jullia Barbara Mendes Lopes, Eduardo Viana Ribeiro da Silva, Gustavo Linhares Lima, Jefferson de Souza Reis, João Lucas R. Cabral, Pedro Henrique Galdino de Andrade Wollmann, Pedro Lucas Souza Silva, Thiago Kauã de Sousa Cardoso.)

**Data**: 18/11/2026 **Local**: remoto, com verificação no ambiente publicado <br>
**Projeto**: cAnCHA <br>
**Assunto**: Sprint Review da Sprint 8 <br>
**Escrivão**: Eduardo Viana Ribeiro da Silva

<center>

**Tabela 01** - Previsão de início e término da reunião

|   | Horário Previsto | Horário Realizado |
| :-: | :-: | :-: |
| **Início da reunião** | — | 15:27 |
| **Fim da reunião** | — | 16:20 |

*Fonte: elaborado pelo grupo (2026)*

</center>

## 1. Identificação

<center>

**Tabela 02** - Integrantes presentes

| Convidados | Presente |
| --- | :-: |
| Ana Jullia Barbara Mendes Lopes | — |
| Eduardo Viana Ribeiro da Silva | X |
| Gustavo Linhares Lima | — |
| Jefferson de Souza Reis | — |
| João Lucas R. Cabral | — |
| Pedro Henrique Galdino de Andrade Wollmann | — |
| Pedro Lucas Souza Silva | — |
| Thiago Kauã de Sousa Cardoso | — |

*Fonte: elaborado pelo grupo (2026)*

</center>

**Legenda:** X = conduziu a verificação; — = não participou da verificação. A Review foi conduzida pelo PO, que conferiu cada item no ambiente publicado; os demais integrantes recebem o resultado por esta ata e pelo pull request que a publica.

## 2. Pautas

A Tabela 03 resume o que foi verificado e decidido na Review. O PO conferiu cada item no ambiente publicado: o app no Render, com o aluno de teste `aluno1@cancha.test`, e o site da documentação no GitHub Pages.

<center>

**Tabela 03** - Pautas discutidas na reunião

| **N°** | **Descrição** |
| --- | --- |
| 1 | **Incremento publicado.** Durante a Review, o PO aprovou e integrou à `developer` três pull requests de tarefas: #142 (cobertura mínima do JaCoCo na CI), #115 (ajustes do topo, do login, de Matérias, da Agenda e da página da matéria ao protótipo) e #141 (respostas 401 documentadas no Swagger). O app no Render foi atualizado com eles e continua sem o filtro da Agenda. No primeiro acesso, a API levou cerca de 4 minutos para acordar (risco R7). |
| 2 | **US04b · Filtrar a agenda por disciplina (#85): não aceita.** A tarefa #130 não tem pull request e o filtro não está no app publicado. A história volta ao backlog e será levada à Planning da Sprint 9. |
| 3 | **Documentação: aceita.** Conferido no site da documentação: Documento de Visão v1.4, com as métricas e os testes de usabilidade atualizados (#119, #129); registro das métricas das Sprints 6 e 7 (#117); Documento de Arquitetura v1.2, com as sete figuras carregando (#125); CONTRIBUTING e modelos de issue e de pull request sem trabalho em pares (#116). |
| 4 | **Tela de criar conta no Figma (#127): aceita,** com as capturas de tela na issue. |
| 5 | **Reexecução dos casos de teste: aceita.** A reexecução de CT-03, CT-04 e CT-05 registrada no relatório de testes da Sprint 7 (#128) foi feita em ambiente local. Na Review, os três casos e o CT-07 (#131) foram executados no ambiente publicado e passaram, e foram repetidos depois da atualização do app com os três pull requests (Tabela 04). |
| 6 | **Itens não concluídos na sprint:** testes do filtro da Agenda (#133), que dependem da US04b; acessibilidade das telas (#138); ata da Planning da Sprint 8 (#139); página inicial do site (#140), que ainda mostra "Welcome to MkDocs"; preparação da inspeção do código (#134); refinamento da US13a e da US13b (#124); confirmação dos participantes da usabilidade (#123). As issues #75, #132 e #135 continuam abertas, embora os pull requests delas tenham sido integrados. |
| 7 | **Métricas da Sprint 8.** M1 = 0% (0 de 1: a única história planejada era a US04b). M3 = 0 defeitos. M4 = 100% (3 de 3 execuções da CI nos pull requests para a `developer`, sem falha; os três foram integrados com aprovação). M5: sem defeitos no período. Dos seis entregáveis da Sprint 8 na Tabela 1 da Visão, cinco foram concluídos. |
| 8 | **Inspeção do grupo Perlman (16/11).** Nota 7,42, aprovado com ressalvas, sem defeitos críticos. Os 12 defeitos de severidade Alta precisam ser reparados até a entrega final. |

*Fonte: elaborado pelo grupo (2026)*

</center>

A Tabela 04 traz o resultado dos casos de teste executados no ambiente publicado em 18/11/2026, com o roteiro da seção 6.2 da Visão v1.4. Os quatro casos passaram nas duas execuções: antes e depois da atualização do app.

<center>

**Tabela 04** - Casos de teste no ambiente publicado

| **Caso** | **Resultado** | **Evidência** |
| --- | :-: | --- |
| CT-03 Localização de entrega e material | Passou | MDS mostra as 7 entregas com título, tipo, prazo e situação, e as vencidas marcadas como "Atrasada". O prazo do Documento de Visão (06/10) é o mesmo na Agenda. Os dois materiais abrem em nova aba. |
| CT-04 Limite de navegação | Passou | Do Início, 1 clique até MDS, onde as entregas e os materiais já aparecem; abrir um material é o 2º clique. |
| CT-05 Agenda e próximas entregas | Passou | As 5 próximas entregas do Início são as 5 não concluídas de prazo mais próximo, em ordem. A Agenda tem 12 + 7 + 6 = 25 cartões, cada um na coluna da sua situação, em ordem de prazo, igual à resposta da API. |
| CT-07 Painel de progresso | Passou | Ao concluir "Roteiro de testes funcionais", MDS passou de 1/7 (14%) para 2/7 (29%) sem recarregar a página, e o semestre de 6/25 (24%) para 7/25 (28%). A conclusão foi desfeita em seguida, e os dados voltaram ao estado anterior. |

*Fonte: elaborado pelo grupo (2026)*

</center>

Com a API já acordada, as consultas responderam entre 0,4 e 0,9 segundo. Ficaram três pontos de atenção:

- Na página da disciplina, as entregas concluídas vão para o fim da lista, e o CT-03 fala só em "ordenadas por prazo". O roteiro ou a tela precisa ser alinhado.
- Muitas entregas da carga de exemplo já aparecem como atrasadas (6 das 12 em "A fazer"). Antes da rodada 1 de usabilidade, os prazos da carga devem ser atualizados.
- A tela de login já mostra "Cadastre-se" com o aviso "Cadastro e recuperação de senha indisponíveis no momento", o que deve ser revisto quando a criação de conta (US13a) entrar.

## 3. Compromissos

<center>

**Tabela 05** - Compromissos e seus responsáveis

| **N°** | **Compromisso** | **Responsável** | **Data** |
| --- | --- | --- | --- |
| 1 | Levar a US04b (#85, #130 e #133) à Planning da Sprint 9 | Eduardo Viana Ribeiro da Silva | 19/11/2026 |
| 2 | Fechar as issues concluídas: #117, #119, #125, #128, #129 e #131 | Eduardo Viana Ribeiro da Silva | 18/11/2026 |
| 3 | Conferir os critérios e fechar as issues #75, #132 e #135, cujos pull requests foram integrados | Jefferson de Souza Reis, Gustavo Linhares Lima e Pedro Lucas Souza Silva | 19/11/2026 |
| 4 | Fechar a milestone Sprint 7 | Eduardo Viana Ribeiro da Silva | 18/11/2026 |
| 5 | Passar as issues abertas da Sprint 8 para a Sprint 9 e fechar a milestone Sprint 8 | Ana Jullia Barbara Mendes Lopes | 19/11/2026 |
| 6 | Publicar as métricas da Sprint 8 no relatório de métricas | Eduardo Viana Ribeiro da Silva | 18/11/2026 |
| 7 | Registrar na Tabela 1 da Visão o resultado da Sprint 8 e a US04b na Sprint 9 | Eduardo Viana Ribeiro da Silva | 18/11/2026 |
| 8 | Atualizar os prazos da carga de exemplo antes da rodada 1 de usabilidade | A definir na Planning | 24/11/2026 |

*Fonte: elaborado pelo grupo (2026)*

</center>

## 4. Link da Gravação

Sem gravação.

## 5. Próxima Reunião

A próxima reunião é a Sprint Planning da Sprint 9, em 19/11/2026.

## 📑 Histórico de versão

| Versão | Data | Descrição | Autor | Revisor |
| :-: | :-----: | :------ | ---- | ------- |
| `1.0` | 18/11/2026 | Criação da ata | Eduardo Viana Ribeiro da Silva | Revisão no pull request da ata |
