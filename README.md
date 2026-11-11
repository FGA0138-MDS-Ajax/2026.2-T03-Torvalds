# cAnCHA

Plataforma web para estudantes de Ensino a Distância (EaD) que organiza a vida acadêmica como um caderno: o aluno encontra disciplinas, prazos e progresso com poucos cliques, num só lugar.

Projeto do Grupo Torvalds na disciplina Métodos de Desenvolvimento de Software (MDS), 2026.2, com o professor Ricardo Ajax.

## O problema

No EaD, quase tudo acontece dentro de ambientes virtuais e sistemas acadêmicos separados. Com menus profundos e prazos espalhados entre plataformas, o aluno perde tempo para achar conteúdos, esquece entregas e não sabe quanto já avançou. O cAnCHA reorganiza essa informação a partir da perspectiva do aluno.

## O que o cAnCHA oferece

- **Disciplinas na tela inicial**, com acesso a qualquer conteúdo em no máximo 3 cliques.
- **Atividades e materiais** de cada disciplina em um só lugar.
- **Agenda unificada de entregas**, em estilo kanban, juntando os prazos de todas as disciplinas.
- **Painel de progresso** por disciplina e no semestre, a partir das atividades concluídas.
- **Anotações** do aluno vinculadas às disciplinas (funcionalidade secundária).

> Em desenvolvimento. Hoje existem a base do banco, o cadastro de disciplinas e entregas e o endpoint `GET /disciplinas`. As telas e o login (JWT) ainda estão por vir.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | React com Vite |
| Backend | Java 21 e Spring Boot (API REST) |
| Banco de dados | PostgreSQL, com migrações Flyway |
| Autenticação | Spring Security com JWT (em implementação) |
| Execução | Docker e Docker Compose |
| Qualidade | GitHub Actions (CI) |

## Como executar

- Backend e banco: veja [`backend/README.md`](backend/README.md).
- Frontend: veja [`frontend/README.md`](frontend/README.md).

## Documentação

Documento de Visão, Documento de Arquitetura, atas e guia de contribuição ficam na branch [`docs`](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Torvalds/tree/docs/docs).

## Equipe

| Nome | Função |
|---|---|
| Ana Jullia Barbara Mendes Lopes | QA e Scrum Master |
| Eduardo Viana Ribeiro da Silva | Product Owner e desenvolvedor |
| Gustavo Linhares Lima | Desenvolvedor |
| Jefferson de Souza Reis | Desenvolvedor |
| João Lucas R. Cabral | Designer e QA |
| Pedro Henrique Galdino de Andrade Wollmann | Desenvolvedor |
| Pedro Lucas Souza Silva | Desenvolvedor |
| Thiago Kauã de Sousa Cardoso | Desenvolvedor |

## Especificações Técnicas do Repositório

Este repositório é planejado e estruturado para que seja realizado documentações de software. Caso haja outra necessidades, deve-se consultar a professora.

Atualmente se usa a ferramenta MkDocs para gerar sua documentação baseado nos seus arquivos markdowns, vocês podem achar mais instruções sobre o MkDocs através do link da documentação da ferramenta: [https://www.mkdocs.org/](https://www.mkdocs.org/).

Também é usado uma "sub-ferramenta" do MkDocs para sua estilização, o Material Theme, que pode ser consultado através do link: [https://squidfunk.github.io/mkdocs-material/](https://squidfunk.github.io/mkdocs-material/).

Este repositório também conta com uma pipeline de automatização de deploy do seu conteúdo MkDocs, para que a cada commit feito na main, a pipeline gere uma versão atualizada da sua documentação em minutos. Vale ressaltar que é importante realizar uma configuração para que tudo funcione da forma correta, as instruções são as seguintes:

* Acesse as configurações do repositório;
* Procure a aba de "Pages"
* Em "Source" escolha a opção "Deploy from a branch";
* Em "Branch" escolha "gh-pages";
* Clique em salvar e pronto;

Após essas etapas de configuração, o seu GitPages deve funcionar normalmente.

## Integração contínua (CI)

Todo pull request para a `developer` roda o workflow `.github/workflows/ci.yml`, com dois checks:

* **Backend (JDK 21):** `./mvnw test` e depois `./mvnw -DskipTests package`, dentro de `backend/`.
* **Frontend (lint, formato e build):** `npm ci`, `npm run lint`, `npm run format:check` e `npm run build`, dentro de `frontend/`.

Para rodar a mesma coisa antes de abrir o PR, use esses mesmos comandos nas pastas indicadas. O check só pode ser exigido nos rulesets depois de ter rodado ao menos uma vez no repositório.

## Deploy

Ambiente publicado a partir da branch `developer`.

| Peça | Serviço | Endereço |
|---|---|---|
| Frontend | Render (Static Site) | https://cancha-frontend-ew8b.onrender.com |
| Backend | Render (Web Service, Docker) | https://cancha-backend-07nv.onrender.com |
| Banco | Neon (PostgreSQL) | credenciais só nas variáveis de ambiente do Render |

Verificado em 02/11/2026:
- `GET /actuator/health` do backend respondeu `{"status":"UP"}`.
- `GET /disciplinas` devolveu as 5 disciplinas do seed.
- O frontend abre a página inicial "cAnCHA".

Para o frontend publicado conversar com o backend publicado, duas configurações são necessárias: `VITE_API_URL` no Static Site (definida antes do build, com o endereço do backend) e `CORS_ALLOWED_ORIGINS` no backend (com o endereço do frontend).

Observações:
- O backend gratuito dorme após 15 minutos sem uso. Ao acordar, a primeira requisição pode levar de 2 a 3 minutos (a subida medida foi de cerca de 2,5 minutos).
- O login é feito em `POST /auth/login` e devolve um token JWT; as demais rotas exigem o cabeçalho `Authorization: Bearer <token>`. Sem token, só respondem o login, o `/actuator/health` e o Swagger.
- As variáveis do backend (`DB_URL`, `DB_USER`, `DB_PASSWORD`, `PORT`, `JWT_SECRET` e `CORS_ALLOWED_ORIGINS`) e a do frontend (`VITE_API_URL`) ficam só no painel do Render, nunca no repositório. O `JWT_SECRET` é obrigatório: sem ele o backend não inicia.
