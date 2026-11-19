# Registro de métricas — Sprint 8

| | |
|---|---|
| **Período** | Sprint 8 (12/11 a 18/11/2026) |
| **Plano de referência** | [Documento de Visão](../documento-de-visao.md), seção 5.1 (GQM) |
| **Fontes dos dados** | Milestone Sprint 8, issues, pull requests e execuções do GitHub Actions do repositório; [ata da Sprint Review da Sprint 8](../atas-reuniao/ata-reuniao-9.md) |
| **Data do registro** | 18/11/2026, no dia da Review |

Este documento registra os valores das métricas do GQM (BASILI; CALDIERA; ROMBACH, 1994) definidas na seção 5.1 do Documento de Visão para a Sprint 8, compara cada valor com a meta e registra as ações decorrentes. Como no registro das Sprints 6 e 7, as métricas de usabilidade (M6 a M12) começam com as sessões da Sprint 9.

## 1. Valores coletados

O Quadro 1 resume os valores das métricas de progresso (objetivo O1) e de qualidade técnica (objetivo O2) na Sprint 8.

**Quadro 1 – Valores das métricas M1 a M5 na Sprint 8**

| Métrica | Meta | Sprint 8 | Situação |
|---|---|---|---|
| M1 – Histórias concluídas | ≥ 80% | 0% (0 de 1) | Abaixo da meta; critério 3 de replanejamento aplicado |
| M2 – Velocidade | variação ≤ 30% | não coletada | Sem estimativa em pontos (seção 4) |
| M3 – Defeitos por sprint | queda a partir da Sprint 9 | 0 | Sem defeitos novos |
| M4 – Aprovação dos testes na CI | nenhum pull request integrado com a CI falhando | 100% (3 de 3) | Meta atingida |
| M5 – Correção de defeitos | 100% antes da Review | sem defeitos | Não se aplica |

*Fonte: elaborado pelo grupo (2026), com dados do GitHub consultados em 18/11/2026.*

## 2. Como cada valor foi obtido

O Quadro 2 indica, para cada métrica, de onde o dado foi tirado e como foi calculado.

**Quadro 2 – Origem e cálculo de cada valor**

| Métrica | Origem do dado | Cálculo |
|---|---|---|
| M1 | Issues com a label `historia` planejadas para a Sprint 8 ([milestone Sprint 8](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/milestone/3)) e aceite na Review (ata 9) | Só a US04b (#85) foi planejada para a sprint. A US05a (#83) e a US05b (#84) estão no milestone, mas foram entregues e contadas na Sprint 7. Histórias aceitas ÷ planejadas × 100 |
| M2 | Labels de pontos nas histórias | Nenhuma história recebeu pontos; sem eles, não há velocidade |
| M3 | Issues com a label `bug` abertas de 12/11 a 18/11 | Nenhuma |
| M4 | Execuções do workflow `CI` nos pull requests para a `developer` ([Actions](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/actions)) | PRs #115 (16/11), #141 (17/11) e #142 (17/11), todas sem falha. Execuções sem falha ÷ total × 100 |
| M5 | Issues de defeito abertas na sprint | Nenhum defeito para corrigir |

*Fonte: elaborado pelo grupo (2026).*

## 3. Análise

**O1 – Progresso do desenvolvimento.** A Sprint 8 concentrou-se na documentação e na inspeção mútua entre os grupos, e os cinco entregáveis de documentação e testes foram aceitos na Review. A única história da sprint, a US04b (filtro da Agenda por disciplina), não foi entregue: a tarefa #130 não tem pull request. Os três pull requests integrados à `developer` no último dia (#142, #115 e #141) são de tarefas de qualidade, de interface e de documentação da API, e nenhum deles entrega a US04b. Com a M1 abaixo de 80%, aplica-se o critério 3 de replanejamento (seção 2.6 da Visão): a US04b, de prioridade Should, passa para a Sprint 9, e a mudança fica registrada na Tabela 1 e no histórico da Visão (v1.5). A causa do atraso deve ser discutida na Retrospectiva, como manda a interpretação da M1.

**O2 – Qualidade técnica.** Não houve defeitos novos na sprint, e as três execuções da CI nos pull requests para a `developer` passaram. Os três foram integrados em 18/11, com a aprovação de quem não fez a tarefa. Na Review, os casos CT-03, CT-04, CT-05 e CT-07 foram executados no ambiente publicado e passaram, antes e depois da atualização do app (ata 9, Tabela 04).

## 4. Limitações da coleta e ações

O Quadro 3 registra o que limitou a coleta neste período e o que o grupo fará a respeito.

**Quadro 3 – Limitações da coleta e ações**

| Limitação | Ação | Responsável | Quando |
|---|---|---|---|
| As histórias continuam sem estimativa em pontos, e a M2 não pode ser calculada | Decidir se o grupo estima em pontos ou revisar a DoR, a M2 e os critérios 1 e 3 de replanejamento | PO, com o time | Planning da Sprint 9 |
| A M1 da sprint dependeu de uma única história | Criar as issues das histórias na Planning, com milestone, antes das tarefas | PO | A partir da Sprint 9 |
| A cobertura do front-end não é medida pela equipe | Gerar a cobertura do Vitest na CI | Desenvolvedores | Sprint 9 |

*Fonte: elaborado pelo grupo (2026).*

## Referências

BASILI, V. R.; CALDIERA, G.; ROMBACH, H. D. The Goal Question Metric approach. In: MARCINIAK, J. J. (ed.). **Encyclopedia of Software Engineering**. New York: John Wiley & Sons, 1994. p. 528-532.
