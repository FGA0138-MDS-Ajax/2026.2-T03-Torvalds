# Como Trabalhamos: Guia de Contribuição

Este documento descreve como o nosso time usa o GitHub: branches, commits, pull requests, issues e sprints. Vale para todo mundo, em toda mudança, inclusive nas pequenas.

Se algo aqui não se encaixar numa situação real, não contorne em silêncio: abra uma issue propondo a mudança neste guia.

---

## Sumário

1. [O fluxo em uma imagem](#1-o-fluxo-em-uma-imagem)
2. [Branches](#2-branches)
3. [Mensagens de commit](#3-mensagens-de-commit)
4. [Pull requests e revisão](#4-pull-requests-e-revisão)
5. [Releases: developer → main](#5-releases-developer--main)
6. [Backlog: issues, labels e milestones](#6-backlog-issues-labels-e-milestones)
7. [A rotina da sprint](#7-a-rotina-da-sprint)
8. [Como quebrar uma HU em tarefas](#8-como-quebrar-uma-hu-em-tarefas)
9. [Práticas do XP refletidas no Git](#9-práticas-do-xp-refletidas-no-git)
10. [Configuração do repositório (admins)](#10-configuração-do-repositório-admins)
11. [Erros comuns e como evitá-los](#11-erros-comuns-e-como-evitá-los)
12. [Cola rápida](#12-cola-rápida)
13. [Apêndice: modelos](#13-apêndice-modelos)

---

## 1. O fluxo em uma imagem

```
 Issue (tarefa)
     │
     ▼
 Branch a partir da developer ──► commits ──► push ──► Pull request para a developer
                                                             │
                                          revisão + aprovação (+ CI, quando existir)
                                                             │
                                                             ▼
                                                Squash and merge na developer
                                                             │
                                          fim da sprint / antes de uma entrega
                                                             │
                                                             ▼
                                     Pull request de release: developer ──► main
                                                             │
                                                             ▼
                                               Tag + GitHub Release na main
```

A documentação segue a mesma ideia, num trilho próprio: branch a partir da `docs`, pull request para a `docs`.

---

## 2. Branches

### 2.1 Branches permanentes

Nenhuma delas recebe commit direto. Tudo entra por pull request.

| Branch | Para que serve |
|---|---|
| `main` | Produção. A versão estável e entregue do software. Só recebe pull requests de release vindos da `developer`. |
| `developer` | Integração. Toda tarefa pronta entra aqui primeiro, para que as partes sejam testadas juntas antes de uma release. |
| `docs` | Fonte do site de documentação (MkDocs). Branches de documentação saem daqui e voltam para cá. |
| `gh-pages` | O site de documentação gerado. É sobrescrita pelo pipeline de deploy, então **ninguém edita à mão**. |

### 2.2 Branches de trabalho: `tipo/numero-da-issue-assunto-curto`

Uma branch por tarefa. Vida curta: o ideal é o merge em 1 a 2 dias.

- Letras minúsculas, palavras separadas por hífen.
- Sem acento, sem espaço, sem nome de pessoa.
- Sempre com o número da issue.

| Tipo | Quando usar | Sai de / PR para |
|---|---|---|
| `feat/` | Funcionalidade nova | `developer` |
| `fix/` | Correção de erro | `developer` |
| `test/` | Só testes automatizados | `developer` |
| `refactor/` | Mudança interna, mesmo comportamento | `developer` |
| `ci/` | Workflows e automações | `developer` |
| `chore/` | Dependências, configuração, manutenção | `developer` |
| `docs/` | Conteúdo do site de documentação | `docs` |

**Bons nomes**

```
feat/18-validacao-email
fix/31-produto-inexistente-404
docs/7-visao-geral-arquitetura
```

**Nomes a evitar**

| Nome | Problema |
|---|---|
| `usuario-patch-1` | Nome automático do editor web do GitHub; não diz nada |
| `backlog`, `origin` | Sem tipo; `origin` ainda se confunde com o remoto |
| `Teste Joao`, `ajustes-finais-v2` | Espaço, nome de pessoa, assunto vago |

### 2.3 Ciclo de vida de uma branch

```bash
# 1. Partir da base atualizada
git switch developer && git pull
git switch -c feat/18-validacao-email

# 2. Commitar só os seus arquivos (nada de `git add .` ou `git add -A`)
git status
git add src/cadastro/validacao.ts src/cadastro/validacao.test.ts
git commit -m "feat(cadastro): valida o e-mail antes de salvar (#18)"

# 3. Enviar e abrir o pull request no GitHub
git push -u origin feat/18-validacao-email

# 4. Depois do merge: limpar
git switch developer && git pull
git fetch --prune
git branch -d feat/18-validacao-email
```

Por que não usar `git add .`: ele leva para o commit arquivos que não são seus, pastas geradas (`node_modules/`, `.venv/`, saída de build) e segredos como o `.env`. Confira o `git status` e adicione os arquivos pelo caminho.

O `git branch -d` só apaga uma branch que já foi integrada; se não for o caso, o Git avisa.

---

## 3. Mensagens de commit

Seguimos o [Conventional Commits](https://www.conventionalcommits.org/pt-br/), com o tipo em inglês e o resto em português.

### 3.1 Formato

```
tipo(escopo): descrição curta no presente (#issue)

Corpo opcional: por que a mudança foi feita, em frases curtas.

Co-authored-by: Nome do Par <email-do-par@exemplo.com>
```

1. **tipo**: da tabela abaixo, em inglês.
2. **escopo** (opcional, mas recomendado): o módulo ou a área afetada (`auth`, `api`, `ui`, `db`…). O time usa sempre os mesmos nomes.
3. **descrição**: verbo na 3ª pessoa do presente ("adiciona", "corrige", "remove"), minúscula, sem ponto final, com até 72 caracteres.
4. **(#issue)**: o número da tarefa. Qualquer `#numero` cria o link entre o commit e a issue.
5. **Trabalho em par** leva a linha `Co-authored-by:` no fim, depois de uma linha em branco. Assim o GitHub mostra as duas pessoas como autoras.

**Um commit = uma mudança lógica.** Não misture refatoração com funcionalidade nova.

### 3.2 Tipos

| Tipo | Quando usar | Exemplo |
|---|---|---|
| `feat` | Funcionalidade nova para o usuário | `feat(cadastro): valida o e-mail antes de salvar (#18)` |
| `fix` | Correção de erro | `fix(api): retorna 404 quando o produto não existe (#31)` |
| `test` | Só testes (o "vermelho" do TDD) | `test(carrinho): cobre o desconto acima de 100 (#25)` |
| `refactor` | Mudança interna, sem mudar comportamento | `refactor(auth): extrai a validação do token para um serviço` |
| `docs` | Documentação | `docs(readme): explica como rodar os testes` |
| `style` | Só formatação, sem mudar lógica | `style(ui): aplica o formatador nos componentes` |
| `ci` | Workflows e automações | `ci: roda o linter em todo pull request` |
| `chore` | Manutenção, dependências, configuração | `chore(deps): atualiza o framework de testes` |
| `perf` | Melhoria de desempenho, mesmo comportamento | `perf(busca): adiciona índice na tabela de produtos` |

### 3.3 Evitar / preferir

| Evitar | Por quê | Preferir |
|---|---|---|
| `update cadastro` | Sem tipo, não diz o que mudou | `feat(cadastro): valida o e-mail (#18)` |
| `arrumei o bug` | Passado, vago, sem issue | `fix(login): bloqueia após 5 tentativas (#22)` |
| `Add files via upload` | Mensagem automática do editor web | Commitar pela sua máquina, com mensagem de verdade |
| `feat: login + css + testes` | Três mudanças num commit só | `test(login): …` e depois `feat(login): …` |

> **Editando pelo site do GitHub?** As mesmas regras valem. Escolha "Create a new branch" (nunca commite direto), dê um nome no padrão da seção 2.2 e escreva uma mensagem de commit de verdade no lugar da padrão.

---

## 4. Pull requests e revisão

### 4.1 Abrindo um pull request

- **Confira a branch base antes de criar**: `developer` para código, `docs` para documentação. Se errou: Edit → troque a base.
- **Abra cedo, como rascunho (draft).** Começar uma tarefa = abrir um PR em rascunho. Isso mostra ao time que a tarefa está em andamento.
- **Título** no padrão de commit: `feat(cadastro): valida o e-mail antes de salvar (#18)`. Com o squash merge, o título vira o commit na `developer`, então ele importa.
- **Preencha o template** (veja o apêndice): descrição, tarefa, tipo de alteração, como testar, evidências, checklist.
- Quando terminar, clique em **Ready for review**.

### 4.2 Ligando o pull request à tarefa

As palavras-chave de fechamento do GitHub (`Closes #18`, `Fixes #18`) só funcionam em pull requests que apontam para a **branch padrão**, que é a `main`. Os PRs de tarefa apontam para a `developer`, então essas palavras são ignoradas ali. A nossa regra:

1. Na descrição do PR, escreva `Tarefa: #18` (e `HU: #12`). Qualquer `#numero` cria uma referência cruzada na linha do tempo da issue.
2. Ligue também na barra lateral direita do PR, em **Development**, para a issue mostrar o PR ligado.
3. **Depois do merge, quem abriu o PR fecha a issue da tarefa**, com um comentário como "Integrada no #45".

Histórias de usuário nunca são fechadas por PR. Quem fecha é o Product Owner, na sprint review, depois de conferir os critérios de aceitação.

### 4.3 Regras de revisão (Definition of Done do PR)

Um pull request só pode receber merge quando:

- [ ] Tem pelo menos **uma aprovação** de alguém que **não** trabalhou na tarefa (o par já revisou enquanto escrevia; a revisão do PR traz um olhar de fora).
- [ ] O CI está verde (quando o time tiver CI).
- [ ] O checklist do template está todo marcado.
- [ ] Todas as conversas da revisão estão resolvidas.

PRs grandes demais para revisar com calma (algumas centenas de linhas ou mais) devem ser divididos.

### 4.4 Fazendo o merge

| Merge | Método | Por quê |
|---|---|---|
| Branch de tarefa → `developer` | **Squash and merge** | A tarefa inteira vira um commit limpo, com o título do PR. Os commits de rascunho continuam visíveis dentro do PR. |
| Branch de documentação → `docs` | **Squash and merge** | Mesmo motivo. |
| `developer` → `main` (release) | **Create a merge commit** | Fazer squash de uma branch permanente faz a `developer` e a `main` se afastarem e gera conflitos repetidos. |

Depois do merge: apague a branch (o GitHub pode fazer isso sozinho, veja a seção 10) e rode os comandos de limpeza da seção 2.3.

### 4.5 Nunca fazer

- Commit direto na `main`, na `developer` ou na `docs`.
- `git push --force` numa branch permanente.
- `git add .` sem conferir o `git status`.
- Commitar arquivos `.env`, chaves ou senhas.
- Deixar branch já integrada sem apagar.

---

## 5. Releases: developer → main

No fim de uma sprint, ou antes de uma entrega ou apresentação:

1. Confira se a `developer` funciona como um todo (rode o sistema, rode os testes).
2. Abra um pull request da `developer` para a `main`, com título como `release: v0.3.0`. Liste na descrição as HUs entregues.
3. Consiga uma aprovação e faça o merge com **Create a merge commit**.
4. Crie uma tag e uma GitHub Release na `main` (`v0.1.0`, `v0.2.0`, …). O GitHub consegue gerar as notas da release a partir dos PRs integrados.

---

## 6. Backlog: issues, labels e milestones

Fazemos Scrum usando só recursos nativos do GitHub: **Issues** (com labels e sub-issues), **Milestones** e **Pull Requests**.

### 6.1 Três níveis

```
Épico (label: epico)                       Product Backlog
  └─ História de usuário (label: historia)  Product Backlog → Sprint Backlog
       └─ Tarefa (label: tarefa)            Sprint Backlog; feita por um par em uma sprint
```

- **Épico**: um tema grande, que não cabe numa sprint. As HUs dele são sub-issues.
- **História de usuário (HU)**: "Como …, quero …, para …", com critérios de aceitação. Criada pelo template.
- **Tarefa**: sub-issue de uma HU, feita por um par dentro de uma sprint, entregue por um pull request.

### 6.2 O que vira o quê

| Conceito do Scrum | No nosso repositório |
|---|---|
| Product Backlog | Issues abertas com label `historia` e sem milestone, ordenadas pela label de prioridade |
| Épico | Issue com label `epico`; as HUs entram como sub-issues |
| História de usuário | Issue com label `historia`, criada pelo template |
| Tarefa | Sub-issue da HU, com label `tarefa` e o par nos assignees |
| Sprint | Milestone "Sprint N", com a data de fim |
| Sprint Backlog | HUs e tarefas colocadas na milestone da sprint |
| Release | Tag + GitHub Release na `main` |
| Estimativa | Label `pontos: 1`, `2`, `3`, `5` ou `8` nas HUs (jogo do planejamento do XP) |
| Burndown / velocidade | Barra de progresso da milestone; velocidade = pontos das HUs fechadas na sprint |
| Status da tarefa | Estado da issue + PR ligado (filtros abaixo) |
| Definition of Done | Checklist do PR + 1 aprovação, garantidos pelas regras das branches |
| Aceite da HU | O Product Owner confere os critérios de aceitação e fecha a HU na review |

### 6.3 Ver o "quadro" sem um quadro

A barra de busca das abas Issues e Pull requests substitui as colunas de um quadro. Vale salvar estes links no README.

| Pergunta | Filtro |
|---|---|
| O que está no Product Backlog? | `is:issue is:open label:historia no:milestone` |
| O que entrou nesta sprint? | `is:issue milestone:"Sprint 3"` |
| O que ninguém pegou? | `is:issue is:open milestone:"Sprint 3" no:assignee` |
| O que está em andamento? | `is:pr is:open draft:true` |
| O que espera revisão? | `is:pr is:open draft:false review:required` |
| O que é meu? | `is:issue is:open assignee:@me label:tarefa` |
| O que está travado? | `is:issue is:open label:bloqueada` |

Para os filtros funcionarem, todo mundo segue três hábitos:

1. **Pegou uma tarefa** → coloca você e o seu par nos assignees.
2. **Começou** → abre um PR em rascunho na hora, ligado à tarefa.
3. **Terminou** → clica em "Ready for review". Depois do merge, fecha a tarefa.

### 6.4 Labels

| Grupo | Labels |
|---|---|
| Tipo de item | `epico`, `historia`, `tarefa`, `bug` |
| Prioridade | `prioridade: alta`, `prioridade: média`, `prioridade: baixa` (ou MoSCoW) |
| Estimativa | `pontos: 1`, `pontos: 2`, `pontos: 3`, `pontos: 5`, `pontos: 8` |
| Fluxo | `bloqueada` |

Um item com a label errada some do filtro certo e aparece no errado, então as labels importam.

---

## 7. A rotina da sprint

| Evento | O que acontece no GitHub |
|---|---|
| **Refinamento** | Ajustar as HUs (critérios de aceitação, pontos, prioridade) e quebrar épicos. Uma HU está **pronta** para a sprint quando é pequena, independente e testável (INVEST), tem critérios de aceitação e está estimada. |
| **Sprint planning** | Criar a milestone "Sprint N" com a data de fim. Colocar nela as HUs escolhidas (limitadas pela velocidade da sprint anterior). Criar as tarefas como sub-issues e atribuir os pares. |
| **Daily** | Abrir a milestone da sprint. Impedimento vira comentário na issue e label `bloqueada`. |
| **Sprint review** | O Product Owner confere os critérios e fecha as HUs aceitas. Fazer a release `developer` → `main` e criar a tag (seção 5). |
| **Retrospectiva** | Registrar no site de documentação (pelo trilho da `docs`). Cada ação de melhoria vira uma issue. |
| **Fim da sprint** | Fechar a milestone. O que não terminou passa para a milestone seguinte. |

---

## 8. Como quebrar uma HU em tarefas

Na planning, para cada HU, o time responde a quatro perguntas:

1. **Qual é o resultado concreto?** Algo que dá para mostrar: código, um teste, uma tela, um relatório.
2. **Cabe numa sprint para um par?** Se não couber, vira duas tarefas.
3. **Depende de outra coisa?** Anote em "Dependências" e coloque a tarefa depois dela.
4. **Como saber que terminou?** Critérios de pronto que outra pessoa consiga verificar: "o formulário rejeita um e-mail inválido e mostra uma mensagem", e não "funciona bem".

**Regras de bolso:** de 2 a 4 tarefas por HU; cada pessoa em no máximo 2 tarefas abertas ao mesmo tempo (uma como responsável, outra como par).

**Sinais de tarefa mal definida:**

| Tarefa | Problema |
|---|---|
| "Fazer o backend" | Grande demais |
| "Estudar o framework" | Sem resultado |
| "Ajudar um colega" | Sem entregável |
| "Testes" | Não diz o que é testado |

**Exemplo**

```
HU: Cadastro com e-mail (#12)                           par
├─ tarefa  Criar a tela do formulário de cadastro       A + B
├─ tarefa  Validar o formato do e-mail no servidor      C + D
├─ tarefa  Salvar o novo usuário no banco de dados      A + C
└─ tarefa  Teste ponta a ponta do fluxo de cadastro     B + D
```

Título da tarefa: verbo + objeto. Cada tarefa tem exatamente uma HU como pai, nunca direto um épico, e pertence a exatamente uma sprint. Não coube? Divida.

---

## 9. Práticas do XP refletidas no Git

| Prática do XP | Como aparece no repositório |
|---|---|
| Programação em par | As duas pessoas nos assignees da tarefa; `Co-authored-by:` nos commits |
| Desenvolvimento guiado por testes (TDD) | O histórico mostra: `test:` → `feat:` → `refactor:`. O CI roda os testes em todo PR. |
| Integração contínua | Branches curtas (1 a 2 dias), PRs pequenos, `developer` sempre funcionando; CI obrigatório para o merge (quando existir) |
| Pequenas releases | Uma tag por sprint, com notas da release |
| Design simples e refatoração | Refatoração em commit próprio, sem mudar comportamento; um assunto por PR |
| Propriedade coletiva do código | Qualquer pessoa pode revisar ou alterar qualquer parte; revisores em rodízio |
| Padrão de codificação | Linter e formatador (no CI); mudanças só de formatação usam `style:` |
| Jogo do planejamento | Pontos como label nas HUs; a velocidade da sprint anterior limita a próxima |
| Ritmo sustentável | No máximo 2 tarefas abertas por pessoa |
| Cliente presente | O Product Owner aceita as HUs pelos critérios de aceitação, na review |

---

## 10. Configuração do repositório (admins)

Feita uma vez, por quem administra o repositório. É isso que transforma o combinado em regra de verdade.

### 10.1 Settings → General → Pull Requests

- [x] Allow merge commits (usado só nas releases para a `main`)
- [x] Allow squash merging, com mensagem padrão: **título do pull request**
- [ ] Allow rebase merging (desligado)
- [x] Always suggest updating pull request branches
- [x] Automatically delete head branches

### 10.2 Settings → Rules → Rulesets

| Ruleset | Alvo | Regras |
|---|---|---|
| Proteger main | `main` | Exigir pull request · 1 aprovação · descartar aprovações antigas quando houver commits novos · exigir conversas resolvidas · método de merge permitido: **merge** · bloquear force push · impedir exclusão |
| Proteger developer | `developer` | Igual, com método de merge permitido: **squash** |
| Proteger docs | `docs` | Igual, com método de merge permitido: **squash** |

- Deixe a `gh-pages` **sem** regra de pull request: o pipeline de deploy precisa enviar para ela.
- Não adicione permissões de bypass: as regras valem também para os admins.
- Quando houver CI, adicione "Require status checks to pass" em cada ruleset.

### 10.3 Issues

- Criar as labels da seção 6.4.
- Criar uma milestone por sprint ("Sprint 1", "Sprint 2", …) com a data de fim.

### 10.4 Arquivos

| Arquivo | Conteúdo |
|---|---|
| `CONTRIBUTING.md` | Este guia |
| `.github/ISSUE_TEMPLATE/historia.md` | Modelo de HU (apêndice) |
| `.github/ISSUE_TEMPLATE/tarefa.md` | Modelo de tarefa (apêndice) |
| `.github/pull_request_template.md` | Modelo de PR (apêndice) |
| `.gitignore` | Pastas geradas, dependências, `.env` |

Opcional: uma GitHub Action que verifica se o título do PR segue o Conventional Commits (por exemplo, `amannn/action-semantic-pull-request`). Combina bem com o squash merge, já que o título vira o commit.

---

## 11. Erros comuns e como evitá-los

| Problema | Regra que resolve |
|---|---|
| Branch com nome automático (`usuario-patch-1`) | Ao editar pelo site, escolher "Create a new branch" e dar um nome no padrão |
| Commits fora do padrão vindos do editor web | Squash merge com o título do PR no padrão |
| Branches antigas acumuladas | "Automatically delete head branches" + `git fetch --prune` |
| PR aberto contra a base errada | Conferir a base antes de criar; corrigir com Edit → trocar a base |
| Arquivos de outra pessoa ou pastas geradas no commit | `git add` pelo caminho + um bom `.gitignore` |
| Merge sem revisão | Rulesets exigindo PR e 1 aprovação desde o primeiro dia |
| A revisão existe mas não é obrigatória, e poucas pessoas acabam aprovando e fazendo merge de tudo | Exigir a aprovação nos rulesets e revezar os revisores |
| HU fechada por engano no merge | Só tarefas são ligadas a PRs; HUs são fechadas pelo Product Owner |

---

## 12. Cola rápida

**Começar uma tarefa**

```bash
git switch developer && git pull
git switch -c feat/18-validacao-email
```

**Atualizar a sua branch com a developer mais recente**

```bash
git switch developer && git pull
git switch feat/18-validacao-email
git merge developer
```

**Commitar (em par) e enviar**

```bash
git status
git add src/cadastro/validacao.ts
git commit -m "feat(cadastro): valida o e-mail antes de salvar (#18)" \
           -m "Co-authored-by: Nome <email@exemplo.com>"
git push -u origin feat/18-validacao-email
```

**Depois do merge**

```bash
git switch developer && git pull
git fetch --prune
git branch -d feat/18-validacao-email
```

**As regras em uma linha cada**

1. `tipo(escopo): descrição (#n)`, no presente.
2. Branch `tipo/n-assunto`, curta, apagada no merge.
3. Nada direto na `main`, na `developer` ou na `docs`: PR + 1 aprovação.
4. Tarefas são fechadas depois do merge do PR; HUs são fechadas pelo Product Owner.
5. Milestone = sprint; tag = release.

**A sprint em uma linha**

Refinamento (HUs + pontos) → planning (milestone + tarefas + pares) → execução (branch, TDD, PR em rascunho) → revisão (aprovação, squash) → sprint review (PO fecha as HUs, release, tag) → retrospectiva (ações viram issues).

---

## 13. Apêndice: modelos

### `.github/ISSUE_TEMPLATE/historia.md`

```markdown
---
name: História de usuário
about: Item do Product Backlog
title: "HU-XX · "
labels: historia
---

## História
**Como** <papel>, **quero** <ação>
**para** <benefício>.

## Critérios de aceitação
- [ ] Dado ..., quando ..., então ...
- [ ] Dado ..., quando ..., então ...

## Notas
Link do protótipo, regras de negócio, dúvidas para o PO.

## Rastreabilidade
- Épico: #
- Requisito:
```

Pontos e prioridade entram como labels, para os filtros funcionarem. As tarefas são criadas na planning, pela seção Sub-issues da HU.

### `.github/ISSUE_TEMPLATE/tarefa.md`

```markdown
---
name: Tarefa
about: Parte de uma HU, feita por um par em uma sprint
title: ""
labels: tarefa
---

## Descrição
O que será feito, em uma ou duas frases.

## Critérios de pronto
- [ ] Resultado verificável
- [ ] Testes escritos e passando
- [ ] Evidência no PR (print, log ou saída dos testes)

## Dependências
Tarefas que precisam estar prontas antes.

**HU:** #
```

### `.github/pull_request_template.md`

```markdown
## Descrição
O que muda e por quê.

## Issues
Tarefa: #<tarefa>
HU: #<hu>

## Tipo de alteração
- [ ] feat
- [ ] fix
- [ ] refactor
- [ ] test
- [ ] docs
- [ ] outro

## Como testar
1.
2.

## Evidências
Prints, logs ou saída dos testes.

## Checklist (Definition of Done)
- [ ] Título do PR no padrão `tipo(escopo): descrição (#n)`
- [ ] A branch base está certa (`developer` para código, `docs` para documentação)
- [ ] Tarefa ligada em Development, na barra lateral
- [ ] Testes novos ou atualizados, passando
- [ ] Revisei o meu próprio diff; não há arquivos estranhos
- [ ] Documentação atualizada, quando necessário
- [ ] Sem segredos (.env, chaves, senhas) no commit
- [ ] Par registrado com Co-authored-by, se houve par
```
