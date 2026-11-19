# cAnCHA

Plataforma web para estudantes de Ensino a Distância (EaD) que organiza a vida acadêmica como um caderno: o aluno encontra disciplinas, prazos e progresso com poucos cliques, num só lugar.

Projeto do Grupo Torvalds (Turma 03) na disciplina Métodos de Desenvolvimento de Software (MDS), 2026.2, com o professor Ricardo Ajax.

## O problema

No EaD, quase tudo acontece dentro de ambientes virtuais e sistemas acadêmicos separados. Com menus profundos e prazos espalhados entre plataformas, o aluno perde tempo para achar conteúdos, esquece entregas e não sabe quanto já avançou. O cAnCHA reorganiza essa informação a partir da perspectiva do aluno. A análise completa do problema está na seção 1 do [Documento de Visão](documento-de-visao.md).

## O que já funciona

A versão publicada traz:

- **Login do aluno**, com as contas de teste.
- **Início** com as disciplinas e as próximas entregas.
- **Página da disciplina** com as entregas e os materiais, a no máximo 3 cliques do Início.
- **Agenda** em estilo kanban, com as entregas de todas as disciplinas; mover um cartão muda a situação da entrega.
- **Progresso** por disciplina e no semestre, calculado a partir das entregas concluídas.

Os próximos passos, como o filtro da Agenda por disciplina e a criação de conta pelo próprio aluno, estão no backlog e no cronograma do Documento de Visão.

## Onde acessar

- **Aplicação publicada:** [cancha-frontend-ew8b.onrender.com](https://cancha-frontend-ew8b.onrender.com). No plano gratuito do Render, a API pode levar alguns minutos para responder no primeiro acesso.
- **Repositório:** [FGA0138-MDS-Ajax/2026.2-T03-Torvalds](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds)

## Documentação

| Documento | O que tem |
|---|---|
| [Documento de Visão](documento-de-visao.md) | Problema, escopo, backlog priorizado, cronograma das sprints, métricas e estratégia de testes |
| [Documento de Arquitetura](documento-de-arquitetura.md) | Estilo arquitetural, tecnologias, metas e as visões de casos de uso, lógica, de classes, de componentes e de implantação |
| [Atas de reunião](atas-reuniao/index.md) | Registro das reuniões do grupo |
| [Relatório de testes da Sprint 7](testes/relatorio-sprint-7.md) | Execução dos casos de teste funcionais |
| [Registro de métricas](metricas/relatorio-sprints-6-e-7.md) | Valores das métricas do GQM por sprint |

## Como o grupo trabalha

O grupo usa Scrum com práticas do XP, em sprints de uma semana, com Planning, Review e Retrospectiva. O backlog é priorizado com MoSCoW, e cada tarefa entra por pull request, com a integração contínua passando e a aprovação de um integrante que não fez a tarefa.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | React com Vite |
| Backend | Java 21 e Spring Boot (API REST) |
| Banco de dados | PostgreSQL, com migrações Flyway |
| Autenticação | Spring Security com JWT |
| Integração contínua | GitHub Actions |
| Publicação | Render, com o banco no Neon |

## Equipe

| Integrante | Função |
|---|---|
| Ana Jullia Barbara Mendes Lopes | Scrum Master e QA |
| Eduardo Viana Ribeiro da Silva | Product Owner |
| Gustavo Linhares Lima | Desenvolvedor |
| Jefferson de Souza Reis | Desenvolvedor |
| João Lucas R. Cabral | Designer e QA |
| Pedro Henrique Galdino de Andrade Wollmann | Desenvolvedor |
| Pedro Lucas Souza Silva | Desenvolvedor |
| Thiago Kauã de Sousa Cardoso | Desenvolvedor |
