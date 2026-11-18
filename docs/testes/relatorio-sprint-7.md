# Relatório de execução dos testes — Sprint 7

| | |
|---|---|
| **Responsável** | João Lucas R. Cabral (Analista de Qualidade) |
| **Data da execução** | 10 e 11/11/2026 |
| **Versão da aplicação** | `developer` em `2390f7a` (após os merges dos PRs #64, #65 e #71) |
| **Casos executados** | CT-01, CT-02, CT-03, CT-04, CT-05, CT-07, CT-08 |
| **Roteiro de referência** | [Documento de Visão v1.2](../documento-de-visao.md), seção 6.2 |
| **Atualização** | 11/11/2026: os defeitos D1 e D2 foram corrigidos e entraram na release v0.1.0 (ver [seção 8](#8-situacao-dos-defeitos)). 18/11/2026: CT-03, CT-04 e CT-05 reexecutados em `3fdb107` e aprovados; D1 e D2 fechados (ver [seção 9](#9-reexecucao-de-ct-03-ct-04-e-ct-05)) |

## 1. Resumo

A execução foi feita em dois níveis: **API** (com `curl`, direto nos endpoints) e **interface** (navegador dirigido por script, simulando o aluno).

| Nível | Verificações | Passaram | Falharam |
|---|---|---|---|
| API | 45 | 43 | 2 |
| Interface | 17 | 11 | 6 |

As 6 falhas de interface se reduzem a **2 defeitos** (cada um reprova várias verificações). As 2 falhas de API são de uma funcionalidade ainda não mergeada, não de defeito.

**Conclusão:** o back-end cumpre o que a Visão pede. Os dois defeitos estão no front-end e são de **integração** — cada peça funciona isolada, e a junção é que falha.

## 2. Defeitos encontrados

### D1 — Agenda fica em branco ([issue #95](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/issues/95))

**Situação:** corrigido no [PR #101](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/pull/101), na release v0.1.0.

A tela `/agenda` não renderiza nada. O `GET /agenda` responde 200, mas o front quebra ao consumir.

O back-end devolve um objeto agrupado (`{"A_FAZER": [...], "EM_ANDAMENTO": [...], "CONCLUIDA": [...]}`) e `AgendaPage.jsx` trata a resposta como array, chamando `itens.filter(...)`. O resultado é `TypeError: itens.filter is not a function` durante a renderização.

![Agenda em branco](../imagens/testes/agenda-em-branco.png)

**Impacto:** a US04a (Agenda Kanban, Must) não é demonstrável. Afeta o CT-05.

### D2 — Materiais não aparecem na disciplina ([issue #96](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/issues/96))

**Situação:** corrigido no [PR #102](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/pull/102), na release v0.1.0.

A página da disciplina mostra apenas as entregas. O `disciplinaApi.js` nunca chama `GET /disciplinas/{id}/conteudos`, então a seção de materiais não existe na tela.

O back-end responde corretamente: em MDS devolve "Scrum Guide" e "Princípios ágeis", com tipo, data e link.

![Disciplina sem materiais](../imagens/testes/disciplina-sem-materiais.png)

**Impacto:** a US03b (Materiais da disciplina, Must) não é demonstrável. Como não há nenhum link com `target="_blank"`, o critério "abre em nova aba" também fica sem como verificar. Afeta os CT-03 e CT-04.

## 3. Resultado por caso de teste

| Caso | Resultado | Observação |
|---|---|---|
| CT-01 Autenticação | **Passou** | Senha errada mostra a mensagem; tela protegida sem login redireciona ao login; token inválido devolve 401. |
| CT-02 Acesso às disciplinas | **Passou** | As 5 disciplinas da carga aparecem e cada card abre a disciplina. |
| CT-03 Entrega e material | **Falhou** | Entregas corretas e ordenadas por prazo. Materiais não aparecem (D2). |
| CT-04 Limite de navegação | **Passou com ressalva** | Disciplina em 1 clique, entrega em 1, Agenda em 1 — todos dentro do limite de 3. O alvo "material" não pôde ser contado por causa do D2. |
| CT-05 Agenda e próximas entregas | **Falhou** | As próximas entregas no Início estão certas (5 itens, sem concluídas, ordenadas). A Agenda não renderiza (D1). |
| CT-07 Painel de progresso | **Passou** | Progresso por disciplina e no semestre coerentes com as entregas concluídas; o valor muda ao concluir uma entrega, sem recarregar a página. |
| CT-08 Integração front-end e API | **Passou** | Todas as telas obtêm os dados da API; as alterações se refletem sem recarregar. |

CT-06 (anotações) e CT-09/CT-10 completos não foram executados: a funcionalidade de anotações está prevista para a Sprint 10 e o fluxo completo depende dos dois defeitos acima.

## 4. Verificações adicionais

**Isolamento entre alunos.** Um aluno nunca vê nem altera dados de outro. O aluno sem matrícula (`aluno3@cancha.test`, da carga V7) recebe `403` ao tentar ler atividades, materiais ou concluir entregas de disciplinas em que não está matriculado, e vê listas vazias bem formadas nas telas gerais.

**Legibilidade (US02).** Nenhum texto visível abaixo de 14px, medido sobre os elementos renderizados.

**Cobertura do back-end (JaCoCo).** 90,1% de linhas e 83,3% de ramos, com 109 testes passando — acima da meta de 80% da estratégia de testes.

**Desempenho (REQ-13).** Com o serviço já ativo, `/disciplinas`, `/agenda` e `/progresso` responderam entre 1,2 e 1,8 s no Render, dentro da meta de 2 s. O primeiro acesso após o serviço dormir levou **175 s**, o que confirma o risco R7: é preciso acordar o ambiente antes da apresentação.

## 5. Nota sobre o roteiro de testes

Os valores esperados dos casos de teste na Visão v1.2 **não batem** com a carga de exemplo atual (V7), porque os prazos do seed são relativos a `CURRENT_DATE` e o número de entregas mudou.

| Caso | A Visão espera | Os dados atuais têm |
|---|---|---|
| CT-03 | Entregas "Lista 1, Trabalho 1, Prova 1, Lista 2"; prazo 14/11 | 7 entregas em MDS, com outros títulos e prazos relativos |
| CT-05 | 10 entregas, 1 concluída | 25 entregas: 10 a fazer, 4 em andamento, 11 concluídas |
| CT-07 | MDS 25% → 50%; semestre 2 de 10 | MDS 42,9%; semestre 11 de 25 |
| CT-03 | Material "Slides da aula 1" | "Scrum Guide" e "Princípios ágeis" |

Por isso a execução verificou os **critérios** de cada caso (ordenação, coerência do cálculo, permissões, estados vazios) em vez dos números fixos: um valor fixo escrito hoje volta a ficar desatualizado assim que a carga mudar ou o dia virar.

**Recomendação:** na revisão do roteiro, trocar os valores fixos por critérios verificáveis — por exemplo, "o progresso da disciplina é igual a concluídas ÷ total" em vez de "a barra mostra 25%". Também vale alinhar o nome: a Visão fala em "materiais" e a API expõe `/conteudos`.

## 6. Observação sobre a suíte automatizada

O defeito D1 passou pela CI porque `AgendaPage.test.jsx` monta o mock da agenda como um **array**, ou seja, valida um contrato diferente do que a API entrega. Os testes do front ficam verdes e a tela quebra assim mesmo.

Ao corrigir o D1, vale ajustar o mock para o formato real da resposta — senão o teste continua verde sobre uma tela quebrada. É o mesmo cuidado que vale para os demais testes de tela: quando o mock e a API divergem, o teste deixa de proteger.

## 7. Como reproduzir

1. Subir o ambiente: `docker compose up --build -d` na raiz do repositório.
2. Em `frontend/`, criar `.env.local` com `VITE_API_URL=http://localhost:8080` e rodar `npm run dev`.
3. Entrar com `aluno1@cancha.test` e a senha de desenvolvimento descrita no [README do back-end](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/blob/developer/backend/README.md).

Os alunos de teste da carga V7 são `aluno1` e `aluno2` (matriculados nas 5 disciplinas) e `aluno3` (sem matrícula, para verificar os estados vazios e as permissões).

## 8. Situação dos defeitos

Atualizado em 11/11/2026, depois da release v0.1.0.

| Defeito | Correção | Casos a reexecutar |
|---|---|---|
| D1 — Agenda em branco ([#95](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/issues/95)) | [PR #101](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/pull/101): a tela transforma a resposta agrupada do `GET /agenda` em uma lista. O teste da página passou a usar o formato real da resposta, como recomendado na seção 6. | CT-05 **reexecutado e aprovado em 18/11** (seção 9) |
| D2 — Materiais não aparecem ([#96](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/issues/96)) | [PR #102](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/pull/102): a página da disciplina chama `GET /disciplinas/{id}/conteudos` e mostra a seção Materiais, com o link abrindo em nova aba. | CT-03 e CT-04 **reexecutados e aprovados em 18/11** (seção 9) |

Os resultados da seção 3 continuam valendo para a versão testada (`2390f7a`). A reexecução de CT-03, CT-04 e CT-05 na release v0.1.0 fica com o Analista de Qualidade e deve ser registrada neste relatório ou no da Sprint 8.

## 9. Reexecução de CT-03, CT-04 e CT-05

| | |
|---|---|
| **Data** | 18/11/2026 |
| **Versão** | `developer` em `3fdb107` (v0.1.1 e PR #109 já integrados) |
| **Roteiro** | [Documento de Visão v1.4](../documento-de-visao.md), seção 6.2 |
| **Ambiente** | Local (Docker Compose), `aluno1@cancha.test` |
| **Motivo** | Reexecução dos casos afetados pelos defeitos D1 e D2 (seção 8) |

| Caso | Resultado | Em resumo |
|---|---|---|
| CT-03 Entrega e material | **Passou** | Entregas ordenadas e completas; materiais abrem em nova aba. D2 corrigido |
| CT-04 Limite de navegação | **Passou** | 2 cliques até as entregas e até os materiais, dentro do limite de 3 |
| CT-05 Agenda e próximas entregas | **Passou** | Atrasadas em destaque no topo, demais por proximidade de prazo, cada uma na coluna da sua situação. D1 corrigido |

### 9.1 CT-03 — Localização de entrega e material

**Resultado: passou.** O defeito D2 está corrigido.

#### Passo a passo

| Passo | Resultado esperado | Observado |
|---|---|---|
| 1. Abrir MDS | Entregas ordenadas por prazo, com título, tipo, prazo (dd/mm) e situação; atrasadas em destaque | 7 entregas em ordem crescente de prazo, com os quatro campos. Situações presentes: concluída, em andamento e a fazer |
| 2. Localizar a primeira entrega pendente | O prazo mostrado é o mesmo da Agenda | "Documento de Visão corrigido", prazo 12/11. `GET /agenda` e `GET /disciplinas/5/atividades` devolvem `2026-11-12T23:59:00` para a mesma entrega, e a coluna da Agenda corresponde à situação exibida na disciplina |
| 3. Abrir o primeiro material | O material abre em nova aba | A seção Materiais aparece com "Scrum Guide" e "Princípios ágeis"; cada bloco abre em aba nova. Confere com `PaginaDisciplina.jsx`, que monta o link com `target="_blank"` e `rel="noopener noreferrer"` |

#### Nota sobre os valores do roteiro

A v1.4 substituiu os valores fixos por critérios verificáveis, como recomendado na [seção 5](#5-nota-sobre-o-roteiro-de-testes) deste relatório. Os nomes citados na v1.2 ("Trabalho 1", "Slides da aula 1") não existem na carga V7 e deixaram de ser esperados: a verificação é da ordenação, dos campos e das situações, não dos títulos. A carga mudou de quantidade e de títulos desde a redação do roteiro, e a execução garantiu o que importa para o critério — **pelo menos uma entrega em cada situação** (a fazer, em andamento e concluída) em todas as telas verificadas.

### 9.2 CT-04 — Limite de navegação

**Resultado: passou.** O alvo "material", que o D2 impedia de contar na Sprint 7, agora é alcançável.

| Alvo | Cliques | Limite | Observado |
|---|---|---|---|
| Disciplina (MDS) | 2 | 3 | Do Início até a página da disciplina |
| Entrega da disciplina | 2 | 3 | A lista de entregas já aparece na página da disciplina, sem clique extra |
| Material de apoio | 2 | 3 | A seção Materiais aparece na mesma página; o 3º clique é o do material, que redireciona para o conteúdo |

Todos os alvos ficam dentro do limite de 3 cliques exigido pelo REQ-02.

**Ressalva:** ainda não existe tela expandida da tarefa. Quando ela for implementada, a contagem até o detalhe da entrega passa a 3 cliques — no limite, sem folga. Vale reavaliar este caso quando a tela entrar, porque qualquer nível a mais de navegação estoura o requisito.

### 9.3 CT-05 — Agenda e próximas entregas

**Resultado: passou.** O defeito D1 está corrigido: a Agenda renderiza.

| Passo | Resultado esperado | Observado |
|---|---|---|
| 1. Ler as próximas entregas no Início | As 5 entregas não concluídas de prazo mais próximo, de todas as disciplinas, em ordem de prazo | 5 entregas de 5 disciplinas diferentes, em ordem crescente de prazo, nenhuma concluída. As atrasadas vêm primeiro e ficam destacadas no topo |
| 2. Abrir a Agenda | Todas as entregas do aluno, cada uma na coluna da sua situação, em ordem de prazo; o total de cartões é igual ao total de entregas | Três colunas (A fazer, Em andamento, Concluídas), cada entrega na coluna da situação em que foi definida, ordenadas por proximidade de prazo. `GET /agenda` devolve 25 entregas (10 a fazer, 4 em andamento, 11 concluídas) |

A ordenação e o destaque conferem com o código: [`AgendaPage.jsx`](../../frontend/src/features/agenda/AgendaPage.jsx) filtra cada coluna por situação e aplica `compararPrazo`, e `ehAtrasada` nunca marca uma entrega concluída como atrasada.

**Nota sobre a carga.** Todas as entregas pendentes estão atrasadas na data da execução, porque os prazos do seed são relativos à data de criação do banco (11/11) e a reexecução ocorreu em 18/11. O destaque de atrasada ficou, portanto, verificado em todos os itens pendentes, mas sem contraste com um item no prazo. Para verificar o contraste, é preciso recarregar a carga (`docker compose down -v && docker compose up --build`), o que regenera os prazos a partir do dia. É a mesma limitação descrita na [seção 5](#5-nota-sobre-o-roteiro-de-testes).

### 9.4 Observação de ambiente, não defeito

Durante a execução, o botão de situação concluía uma entrega, mas não desfazia a conclusão, e arrastar o cartão não surtia efeito. **A causa era o ambiente, não a aplicação:** o contêiner do back-end rodava uma imagem de 11/11, anterior aos PRs #66, #76 e #109. Medido direto na API, com o contêiner antigo:

| Chamada | Antes do rebuild | Depois do rebuild |
|---|---|---|
| `PATCH /atividades/{id}/status` → `CONCLUIDA` | 204 | 204 |
| → `A_FAZER` | 400 "O status deve ser CONCLUIDA." | 204 |
| → `EM_ANDAMENTO` | 400 "O status deve ser CONCLUIDA." | 204 |

O `ConclusaoEntregaRequest` no código já aceitava os três valores; a mensagem devolvida era a da versão anterior. Depois de `docker compose up --build -d backend`, as três situações passaram a responder 204.

Isso não afeta o resultado do CT-03, cujos passos não incluem alterar a situação de uma entrega. Fica registrado porque os cliques feitos com o contêiner antigo gravaram `CONCLUIDA` em duas entregas de MDS; a carga foi devolvida ao estado do seed (3 concluídas de 7 em MDS; Agenda com 10 a fazer, 4 em andamento e 11 concluídas, total de 25) antes de prosseguir.

**Recomendação:** reconstruir a imagem do back-end (`docker compose up --build -d backend`) antes de cada rodada de testes. Um contêiner defasado produz falhas que parecem defeito da aplicação — o espelho do que a [seção 6](#6-observacao-sobre-a-suite-automatizada) descreve, onde o teste passa sobre uma tela quebrada.

### 9.5 Situação dos defeitos após a reexecução

| Defeito | Caso | Situação |
|---|---|---|
| D1 — Agenda em branco ([#95](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/issues/95)) | CT-05 | **Fechado.** A Agenda renderiza as três colunas com todas as entregas |
| D2 — Materiais não aparecem ([#96](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/issues/96)) | CT-03, CT-04 | **Fechado.** A seção Materiais aparece e o link abre em nova aba |

Com isso, os três casos que a seção 8 deixou pendentes estão reexecutados e aprovados. O CT-07, também previsto para a Sprint 8, continua pendente de reexecução.
