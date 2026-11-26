# Relatório de execução dos testes — Sprint 9

| | |
|---|---|
| **Responsável** | João Lucas R. Cabral (Analista de Qualidade) |
| **Data da execução** | 26/11/2026 |
| **Versão da aplicação** | Ambiente publicado, a partir da `main` em `422676f` |
| **Casos executados** | CT-05 e CT-11 |
| **Roteiro de referência** | [Documento de Visão v1.6](../documento-de-visao.md), seção 6.2 |
| **Ambiente** | CT-05: publicado (Render e Neon). CT-11: rodada 1 no publicado e verificação dirigida no ambiente local em `d78142c` |

A execução foi feita por integrante que não é o Product Owner, conforme a [issue #173](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/issues/173).

## 1. Resumo

| Caso | Resultado |
|---|---|
| CT-05 Agenda, próximas entregas e filtro por matéria | **Passou** |
| CT-11 Criação de conta | **Falhou** — defeito D3, na validação da confirmação de senha (ver [seção 4](#4-defeito-encontrado)) |

Os dois casos verificam funcionalidades entregues nesta sprint: o filtro por matéria na Agenda (US04b) e a criação de conta (US13a). Cinco dos seis passos do CT-11 passaram; o passo 5 revelou um critério de aceitação não cumprido no back-end.

## 2. CT-05 — Agenda, próximas entregas e filtro por matéria

**Resultado: passou.**

| Passo | Resultado esperado | Observado |
|---|---|---|
| 1. Ler as próximas entregas no Início | As 5 entregas não concluídas de prazo mais próximo, de todas as disciplinas, em ordem de prazo | 5 entregas, em ordem crescente de prazo, nenhuma concluída, de 5 disciplinas diferentes |
| 2. Abrir a Agenda | Todas as entregas do aluno, cada uma na coluna da sua situação, em ordem de prazo; o total de cartões é igual ao total de entregas | 25 cartões: 12 a fazer, 7 em andamento e 6 concluídas. Cada coluna ordenada por prazo |
| 3. Desmarcar uma matéria no filtro, em cada vista | A matéria desmarcada deixa de aparecer, e o filtro vale igual em todas as vistas | O filtro se aplica nas vistas da Agenda; a matéria desmarcada sai da listagem |
| 4. Deixar só duas matérias marcadas, em cada vista | Só as entregas das duas matérias aparecem, mantida a ordem por prazo | Apenas as entregas das matérias marcadas, na ordem de prazo |
| 5. Mover um cartão de coluna com o filtro ativo | O cartão muda de coluna e a situação é gravada, sem o filtro ser perdido | O cartão troca de coluna e o filtro permanece aplicado |
| 6. Limpar o filtro | Todas as entregas voltam a aparecer | Os 25 cartões voltam à Agenda |

**Distribuição das entregas por matéria**, que serve de base para conferir o filtro:

| Entregas | Matéria |
|---|---|
| 7 | Métodos de Desenvolvimento de Software |
| 5 | Gestão e Produção da Qualidade |
| 5 | Projeto Integrador em Engenharia |
| 5 | Teoria dos Números |
| 3 | Compiladores |

**Ordenação por prazo**, conferida na resposta do `GET /agenda`: as três colunas vêm ordenadas (a fazer, em andamento e concluídas).

**Entregas atrasadas com contraste.** Diferente da reexecução da Sprint 8, a carga publicada agora tem 1 entrega atrasada e 4 no prazo entre as próximas do Início. A migration `V9__atualiza_prazos_das_entregas_de_exemplo.sql` ([#167](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/issues/167)) recalculou os prazos do seed, o que resolveu a limitação registrada na [seção 9.3 do relatório da Sprint 7](relatorio-sprint-7.md#93-ct-05--agenda-e-próximas-entregas): antes, todas as pendentes apareciam atrasadas e o destaque não tinha com o que contrastar.

## 3. CT-11 — Criação de conta

**Resultado: falhou**, pelo defeito D3 da seção 4. Cinco dos seis passos passaram.

A execução teve duas partes. Os passos 1, 2 e 6 foram cobertos pela **rodada 1 de testes de usabilidade**, realizada em 26/11 com estudantes reais, em que cada participante começa criando a própria conta — procedimento previsto na [seção 5.1 da Visão](../documento-de-visao.md) e nos [materiais da rodada 1](rodada-1-usabilidade.md). Os passos 3, 4 e 5, que dependem de tentativas recusadas, foram verificados em **execução dirigida** na interface e confirmados na API.

| Passo | Resultado esperado | Observado | Resultado |
|---|---|---|---|
| 1. Cadastro com matrícula UnB | A conta é criada e o Login mostra "Conta criada!" | Participantes da UnB se cadastraram com a matrícula preenchida. Na API, o cadastro com matrícula de 9 dígitos respondeu `201` | Passou |
| 2. Cadastro sem matrícula UnB | A matrícula em branco não impede o cadastro | Participantes de fora da UnB se cadastraram com o campo em branco. Na API, o cadastro sem matrícula respondeu `201`, com `matriculaUnB: null` | Passou |
| 3. E-mail já cadastrado | A conta não é criada e a tela avisa | A tela mostrou "Este e-mail já está cadastrado." A API respondeu `409 — E-mail já cadastrado.` | Passou |
| 4. Matrícula UnB já em uso | A conta não é criada e a tela avisa | A tela mostrou "Esta matrícula UnB já está em uso." A API respondeu `409 — Matrícula UnB já cadastrada.` | Passou |
| 5. Senha curta e confirmação diferente | A tela recusa nos dois casos, e o back-end repete a validação | Senha curta: a tela mostrou "A senha precisa ter pelo menos 8 caracteres." e a API respondeu `400`. Confirmação diferente: a tela mostrou "As senhas não conferem.", mas a API **criou a conta** (`201`) | **Falhou** (D3) |
| 6. Entrar com a conta criada | O aluno entra e vê as disciplinas de exemplo com progresso 0% | O login foi efetuado com sucesso ao fim do cadastro | Passou |

**Fontes das observações.** Os passos 1, 2 e 6 vêm do registro do facilitador durante a rodada 1, sem consulta ao banco e sem captura de tela: o acesso ao banco publicado (Neon) depende de credenciais que ficam apenas nas variáveis de ambiente do Render, fora do alcance de quem executou. Os passos 3, 4 e 5 foram verificados na interface e, em seguida, reproduzidos na API do ambiente local, com o código HTTP e a mensagem de cada resposta registrados acima em lugar de captura de tela.

## 4. Defeito encontrado

### D3 — O back-end não valida a confirmação de senha

**Onde:** `POST /auth/cadastro` (US13a).

A tela de Cadastro recusa corretamente duas senhas diferentes, com o aviso "As senhas não conferem." A validação, porém, existe **só no front-end**: `CadastroPage.jsx` compara os campos antes de enviar, e `authApi.js` monta o corpo da requisição apenas com `nome`, `email`, `senha` e `matriculaUnB`. O campo de confirmação não chega à API.

No back-end, o `CadastroRequest` declara `nome`, `email`, `senha` e `matriculaUnB`. Não há campo de confirmação nem validação de igualdade, então uma chamada direta à API cria a conta sem que a senha tenha sido confirmada:

| Requisição | Resposta |
|---|---|
| `senha: "senha-forte-123"` com `confirmacaoSenha: "senha-forte-999"` | `201 Created` — conta criada |

**Impacto.** O critério de aceitação 4 da US13a ([#155](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/issues/155)) pede que "a senha tem no mínimo 8 caracteres e precisa ser igual à confirmação" e que "o back-end repete essas validações". O mínimo de 8 caracteres é repetido (`@Size(min = 8)`); a igualdade com a confirmação não. O critério fica cumprido pela metade.

Pelo navegador o aluno não consegue burlar a regra, porque a tela bloqueia antes do envio. O risco está em qualquer cliente que não seja a tela — um script, um teste de integração ou uma chamada manual: a conta nasce com uma senha que o aluno pode não ter digitado duas vezes, e ele descobre no login seguinte.

**Correção sugerida:** acrescentar o campo de confirmação ao `CadastroRequest` e validar a igualdade no back-end, devolvendo `400` quando divergir, e passar a enviá-lo no `authApi.js`. A alternativa é registrar na Visão que a confirmação é responsabilidade exclusiva do front-end — mas isso contraria o critério 4 como está escrito hoje.

**Observação sobre a suíte automatizada.** `CadastroIntegracaoTest` e `AuthServiceCadastroTest` passam, porque nenhum dos dois exercita senhas divergentes: o cenário não existe nos testes, do mesmo modo que o contrato da Agenda não existia no mock que deixou o D1 passar pela CI. É o padrão descrito na [seção 6 do relatório da Sprint 7](relatorio-sprint-7.md#6-observação-sobre-a-suíte-automatizada) — vale cobrir o caso ao corrigir.

## 5. Observação sobre o ambiente publicado

O back-end gratuito dorme após 15 minutos sem uso. Nesta execução, a primeira requisição depois do serviço dormir levou **176 segundos** para responder, acima dos 2 a 3 minutos já medidos na Sprint 7. O número confirma o risco **R7** e reforça o procedimento de acordar o ambiente antes de cada sessão de teste ou apresentação — nos materiais da rodada 1, 5 minutos de antecedência.

## 6. Como reproduzir

1. Acordar o ambiente publicado: `GET https://cancha-backend-07nv.onrender.com/actuator/health` deve responder `{"status":"UP"}`.
2. Abrir o front-end publicado e entrar com uma conta da carga de exemplo (`aluno1@cancha.test`), ou criar uma conta nova pelo Cadastro.
3. Para o CT-05, a Agenda do `aluno1` tem 25 entregas distribuídas em 5 matérias, conforme o quadro da seção 2.

Para reproduzir o D3, com o ambiente local de pé, basta uma chamada à API com a confirmação diferente da senha — o corpo precisa ir direto à API, porque a tela bloqueia antes do envio:

```
curl -X POST http://localhost:8080/auth/cadastro \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","email":"novo@cancha.test","senha":"senha-forte-123","confirmacaoSenha":"senha-forte-999"}'
```

A resposta esperada pelo critério 4 da US13a é `400`; a obtida é `201`.

As credenciais de desenvolvimento estão no [README do back-end](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/blob/developer/backend/README.md).
