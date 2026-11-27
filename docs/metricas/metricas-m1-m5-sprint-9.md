
# Registro de métricas — Sprint 9

| | |
|---|---|
| **Período previsto** | Sprint 9 (19/11 a 25/11/2026) |
| **Plano de referência** | [Documento de Visão](../documento-de-visao.md), seção 5.1 (GQM) |
| **Fontes dos dados** | Milestone Sprint 9, issues, pull requests, GitHub Actions e relatório de execução dos testes da Sprint 9 |
| **Data do registro** | 26/11/2026 |

Este documento registra os valores das métricas do GQM (BASILI; CALDIERA; ROMBACH, 1994) definidas na seção 5.1 do Documento de Visão para a Sprint 9, compara cada valor com a meta estabelecida e registra as ações decorrentes.

A coleta contempla os dados disponíveis até 26/11/2026, considerando o adiamento da Sprint Review em razão da execução dos testes.

## 1. Valores coletados

O Quadro 1 resume os valores das métricas de progresso (objetivo O1) e de qualidade técnica (objetivo O2) na Sprint 9.

**Quadro 1 – Valores das métricas M1 a M5 na Sprint 9**

| Métrica | Meta | Sprint 9 | Situação |
|---|---|---|---|
| M1 – Histórias concluídas | ≥ 80% | 100% (2/2) | Atingida |
| M2 – Tarefas concluídas | ≥ 80% | 57,89% (11/19) | Não atingida |
| M3 – Defeitos por sprint | Queda a partir da Sprint 9 | 4 | Não atingida |
| M4 – Aprovação dos testes na CI | Nenhum pull request integrado com a CI falhando | 91,67% (11/12) | Atingida nas execuções verificadas |
| M5 – Correção de defeitos | 100% antes da Review | 100% (1/1) em código | Atingida |

*Fonte: elaborado pelo grupo (2026), com dados do GitHub.*

## 2. Como cada valor foi obtido

O Quadro 2 indica, para cada métrica, a origem dos dados e o método de cálculo.

**Quadro 2 – Origem e cálculo de cada valor**

| Métrica | Origem do dado | Cálculo |
|---|---|---|
| M1 | US04b ([#85](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/issues/85)) e US13a ([#155](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/issues/155)), ambas com aceite registrado pelo Product Owner | (2 ÷ 2) × 100 = 100% |
| M2 | Issues com a label `tarefa` na [milestone Sprint 9](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/milestone/5), desconsiderando a #195, prevista para transferência à Sprint 10 | (11 ÷ 19) × 100 = 57,89% |
| M3 | Issues com a label `bug` abertas durante o período de coleta: #158, #159, #200 e #201 | 4 defeitos registrados |
| M4 | Execuções do workflow `CI` nos pull requests para a `developer`, consultadas no [GitHub Actions](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/actions) | (11 ÷ 12) × 100 = 91,67% |
| M5 | Defeito D3, identificado no CT-11 ([PR #194](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/pull/194)), com correção integrada pelo [PR #198](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/pull/198) | (1 ÷ 1) × 100 = 100% de correção em código |

*Fonte: elaborado pelo grupo (2026).*

## 3. Análise

### O1 – Progresso do desenvolvimento

A Sprint 9 contemplou a US04b (filtro da Agenda por disciplina), replanejada da Sprint 8, e a US13a (criação de conta). Ambas possuem aceite registrado pelo Product Owner, resultando em 100% de histórias concluídas e atingindo a meta estabelecida para a M1.

A partir desta sprint, a M2 passa a medir a proporção de tarefas concluídas, conforme a atualização da seção 5.1 do Documento de Visão. A métrica deixa de depender de estimativas em pontos de história.

Na coleta, foram identificadas 20 issues com a label `tarefa` na milestone, das quais 11 estavam fechadas. A issue #195, criada após o período originalmente previsto para a Sprint 9, foi considerada para transferência à Sprint 10, resultando em 19 tarefas para o cálculo ajustado do escopo.

O resultado formal, considerando as issues fechadas, foi de 57,89%. Entretanto, foram identificadas tarefas com entregas realizadas ou encaminhadas que ainda não tiveram suas issues encerradas:

| Tarefa | Evidência | Situação |
|---|---|---|
| #178 – Corrigir a política de merge e configuração no CONTRIBUTING | PR #193 | Integrado |
| #173 – Executar CT-05 e CT-11 no aplicativo publicado | PR #194 | Relatório de execução integrado |
| #172 – Registrar os resultados da rodada 1 de usabilidade | PR #199 | Relatório entregue, aguardando integração |
| #179 – Coletar e registrar as métricas M1 a M5 | Presente relatório | Aguardando disponibilização ao Product Owner |

Considerando a conclusão dessas quatro tarefas, o percentual projetado de entregas realizadas é de 78,95% (15/19).

Esse percentual complementar não substitui o resultado formal da M2, mas evidencia a diferença entre a realização das entregas e o encerramento das respectivas issues no GitHub.

### O2 – Qualidade técnica

A M3 registrou quatro issues com a label `bug` durante o período de coleta:

- #158 – Páginas declaradas em inglês e sem título próprio.
- #159 – Contraste abaixo de 4,5:1 no menu ativo e em etiquetas.
- #200 e #201 – Problemas identificados na primeira rodada de testes de usabilidade.

As issues #158 e #159 foram corrigidas durante a sprint. As demais decorrem dos problemas identificados na avaliação de usabilidade.

Em comparação com a Sprint 8, que registrou zero defeitos pela M3, houve aumento na quantidade de registros. Esse resultado deve ser discutido na Retrospectiva, considerando também a realização das atividades de inspeção e validação com usuários.

A M4 apresentou uma taxa de aprovação de 91,67%, correspondente a 11 execuções aprovadas entre 12 execuções da CI. A falha ocorreu na execução #68, associada ao PR #160. A execução posterior (#69) foi aprovada antes da integração do PR à branch `developer`.

A M5 considerou o defeito D3, relacionado à ausência de validação da confirmação de senha no back-end, que comprometia o atendimento ao critério 4 da US13a.

A correção foi integrada à branch `developer` por meio do PR #198, com a inclusão de testes automatizados específicos para o cenário de senhas divergentes e aprovação da CI.

Dessa forma, foi obtido um percentual de 100% de correção em código dos defeitos impeditivos identificados.

## 4. Limitações da coleta e ações

O Quadro 3 registra as limitações identificadas durante a coleta e as ações propostas.

**Quadro 3 – Limitações da coleta e ações**

| Limitação | Ação | Responsável | Quando |
|---|---|---|---|
| A M2 não foi coletada na Sprint 8 devido à ausência de estimativas em pontos de história | Utilizar a definição atualizada da M2, estabelecendo a Sprint 9 como referência para as próximas medições | Scrum Master | Sprint 9 |
| Tarefas entregues permanecem com issues abertas | Verificar as evidências de conclusão e atualizar as issues após a validação das entregas | Scrum Master e Product Owner | Encerramento da Sprint 9 |
| Resultado da M2 abaixo da meta estabelecida | Discutir as causas das pendências e do atraso no encerramento das issues | Equipe | Retrospectiva |
| Issue #195 criada após o período previsto da sprint | Transferir a tarefa para a milestone da Sprint 10 | Scrum Master | Sprint 10 |
| Aumento da quantidade de defeitos registrados pela M3 | Analisar os defeitos identificados e acompanhar sua evolução nas próximas sprints | Analista de Qualidade e equipe | Retrospectiva |
| Defeito D3 registrado sem a label `bug` | Revisar a classificação da issue conforme a seção 6.1 do Documento de Visão | Analista de Qualidade | Sprint 10 |

*Fonte: elaborado pelo grupo (2026).*

## Referências

BASILI, V. R.; CALDIERA, G.; ROMBACH, H. D. The Goal Question Metric approach. In: MARCINIAK, J. J. (ed.). **Encyclopedia of Software Engineering**. New York: John Wiley & Sons, 1994. p. 528-532.
