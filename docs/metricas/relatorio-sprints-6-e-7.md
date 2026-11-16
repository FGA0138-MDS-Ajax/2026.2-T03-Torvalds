# Registro de métricas — Sprints 6 e 7

| | |
|---|---|
| **Período** | Sprint 6 (29/10 a 04/11/2026) e Sprint 7 (05/11 a 11/11/2026) |
| **Plano de referência** | [Documento de Visão](../documento-de-visao.md), seção 5.1 (GQM) |
| **Fontes dos dados** | Milestones, issues e execuções do GitHub Actions do repositório; [relatório de testes da Sprint 7](../testes/relatorio-sprint-7.md) |
| **Data do registro** | 16/11/2026 |

Este documento registra os valores das métricas do GQM (BASILI; CALDIERA; ROMBACH, 1994) definidas na seção 5.1 do Documento de Visão para as Sprints 6 e 7, compara cada valor com a meta e registra as ações decorrentes. As métricas de usabilidade (M6 a M11) dependem das sessões com estudantes, que começam na Sprint 9, e por isso não têm valores neste período.

## 1. Valores coletados

O Quadro 1 resume os valores das métricas de progresso (objetivo O1) e de qualidade técnica (objetivo O2) nas duas sprints. Das cinco métricas desse grupo, quatro foram coletadas e uma (M2) não pôde ser calculada, como explica a seção 5.

**Quadro 1 – Valores das métricas M1 a M5 nas Sprints 6 e 7**

| Métrica | Meta | Sprint 6 | Sprint 7 | Situação |
|---|---|---|---|---|
| M1 – Histórias concluídas | ≥ 80% | 100% (1 de 1) | 100% (6 de 6) | Meta atingida |
| M2 – Velocidade | variação ≤ 30% | não coletada | não coletada | Sem estimativa em pontos (seção 5) |
| M3 – Defeitos por sprint | queda a partir da Sprint 9 | 0 | 2 | Linha de base registrada |
| M4 – Aprovação dos testes na CI | 100% | 91,7% (11 de 12) | 88,9% (32 de 36) | Abaixo da meta; nenhuma falha chegou à `developer` |
| M5 – Correção de defeitos | 100% antes da Review | sem defeitos | 100% (2 de 2) | Meta atingida |

*Fonte: elaborado pelo grupo (2026), com dados do GitHub consultados em 16/11/2026.*

## 2. Como cada valor foi obtido

O Quadro 2 indica, para cada métrica, de onde o dado foi tirado e como foi calculado, para que qualquer pessoa possa refazer a contagem.

**Quadro 2 – Origem e cálculo de cada valor**

| Métrica | Origem do dado | Cálculo |
|---|---|---|
| M1 | Issues com a label `historia` nos milestones [Sprint 6](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/milestone/1?closed=1) e [Sprint 7](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/milestone/2?closed=1), aceitas na Sprint Review | Sprint 6: US08 (#18). Sprint 7: US01 (#78), US02 (#79), US03a (#80), US03b (#30), US04a (#82) e US09 (#81). Histórias aceitas ÷ planejadas × 100 |
| M2 | Labels `pontos: N` nas histórias (CONTRIBUTING, seção 6.4) | Nenhuma história recebeu pontos; sem eles, não há velocidade |
| M3 | Issues com a label `bug` abertas no período de cada sprint (sem contar pull requests) | Sprint 6: nenhuma. Sprint 7: #95 (Agenda em branco) e #96 (materiais não aparecem) |
| M4 | Execuções do workflow `CI` nos pull requests para a `developer` ([Actions](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/actions)) | Execuções sem falha ÷ total de execuções no período × 100 |
| M5 | Issues #95 e #96 e os PRs que as corrigiram (#101 e #102) | Defeitos corrigidos antes da Review ÷ defeitos identificados × 100 |

*Fonte: elaborado pelo grupo (2026).*

## 3. Análise

**O1 – Progresso do desenvolvimento.** As duas sprints entregaram tudo o que foi planejado: a Sprint 6 entregou a US08 (acesso ao sistema, parte do back-end), e a Sprint 7 entregou as seis histórias do seu milestone. Além disso, a US05a (concluir entrega) e a US05b (progresso por disciplina), planejadas para a Sprint 8, foram adiantadas e aceitas em 11/11. Com a M1 acima de 80%, o critério 3 de replanejamento (seção 2.6 da Visão) não foi acionado. A release v0.1.0 saiu em 11/11, dois dias depois da data prevista (09/11), desvio já registrado na Tabela 1 da Visão.

**O2 – Qualidade técnica.** A Sprint 7 foi a primeira com execução do roteiro de testes de sistema, o que explica a passagem de zero para dois defeitos: os dois foram encontrados pelo Analista de Qualidade nos casos CT-03 e CT-05 e eram de integração entre front-end e API. Os dois foram corrigidos no mesmo dia, antes da Review, e a M5 ficou em 100%. Esses dois defeitos passam a ser a linha de base da M3, que deve cair a partir da Sprint 9.

A M4 ficou abaixo da meta de 100% nas duas sprints. As cinco execuções com falha aconteceram em pull requests de três branches de trabalho, e todas foram seguidas de uma execução com sucesso na mesma branch antes do merge. A CI cumpriu o papel de barrar o código com erro: nenhuma falha chegou à `developer`. A meta de 100% foi escrita pensando na `developer`, mas o workflow só roda nos pull requests; a seção 5 registra o ajuste.

## 4. Medições complementares

O Quadro 3 reúne as metas não funcionais da estratégia de testes (Visão, seção 6.1) que já foram medidas.

**Quadro 3 – Metas não funcionais medidas na Sprint 7**

| Meta | Valor esperado | Valor medido | Fonte |
|---|---|---|---|
| Cobertura do back-end (JaCoCo) | ≥ 80% | 90,1% de linhas e 83,3% de ramos, com 109 testes | [Relatório de testes da Sprint 7](../testes/relatorio-sprint-7.md), seção 4 |
| Cobertura do front-end | ≥ 70% | não medida | — |
| Tempo de resposta (REQ-13) | 95% das consultas em até 2 s, com o serviço ativo | 100% abaixo de 2 s em `/disciplinas`, `/agenda` e `/progresso`: de 0,23 a 0,91 s em 20 chamadas por rota (issue #94) e de 1,2 a 1,8 s na execução do roteiro | [Issue #94](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/issues/94) e relatório de testes da Sprint 7 |
| Primeiro acesso com o serviço dormindo | — | 175 s | Relatório de testes da Sprint 7, seção 4 (confirma o risco R7) |

*Fonte: elaborado pelo grupo (2026).*

## 5. Limitações da coleta e ações

O Quadro 4 registra o que impediu ou limitou a coleta neste período e o que o grupo fará a respeito.

**Quadro 4 – Limitações da coleta e ações**

| Limitação | Ação | Responsável | Quando |
|---|---|---|---|
| As labels `pontos: 1` a `pontos: 8` previstas no CONTRIBUTING não foram criadas no repositório, e nenhuma história foi estimada; por isso a M2 não pôde ser calculada | Criar as labels e estimar as histórias com o jogo do planejamento, registrando os pontos na issue | Scrum Master | Planning da Sprint 9 |
| A M4 mede a CI nos pull requests, mas a meta foi escrita para a `developer` | Redefinir a M4 na Visão como "execuções da CI nos pull requests para a `developer`" e manter a meta de nenhuma falha integrada | Analista de Qualidade | Visão v1.4 |
| A cobertura do front-end não é medida | Gerar a cobertura do Vitest na CI | Desenvolvedores | Sprint 9 |
| Cinco das seis issues de histórias da Sprint 7 (#78 a #82) foram criadas em 11/11, no fim da sprint; as tarefas existiam desde 05/11 | Abrir a issue da história na Planning, antes das tarefas | PO | A partir da Sprint 8 |
| M6 a M11 dependem das sessões de usabilidade | Coletar nas rodadas com estudantes | Analista de Qualidade | Sprints 9 e 10 |

*Fonte: elaborado pelo grupo (2026).*

## Referências

BASILI, V. R.; CALDIERA, G.; ROMBACH, H. D. The Goal Question Metric approach. In: MARCINIAK, J. J. (ed.). **Encyclopedia of Software Engineering**. New York: John Wiley & Sons, 1994. p. 528-532.
