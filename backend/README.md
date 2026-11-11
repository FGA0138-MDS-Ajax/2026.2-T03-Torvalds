# Backend - Cancha

API REST do Cancha, desenvolvida em Java com Spring Boot (Controller, Service e Repository), Spring Security para autenticação e autorização via JWT, Spring Data JPA e PostgreSQL com migrações Flyway.

## Pré-requisitos

- Docker e Docker Compose
- Repositório do projeto clonado

Para rodar com Docker não é preciso ter Java nem Maven instalados: o `Dockerfile` compila o projeto com JDK 21 e executa o `.jar` com JRE 21, igual em qualquer máquina.

## Como executar (Docker)

Crie um arquivo `.env` na raiz do repositório, ao lado do `docker-compose.yml`, com:

    JWT_SECRET=<substitua-por-um-segredo-aleatorio-forte>
    JWT_EXPIRATION=PT1H

O segredo deve ter pelo menos 32 bytes em UTF-8.
Não utilize literalmente o texto de exemplo.
O arquivo `.env` não deve ser commitado.

O Docker Compose lê esse arquivo e repassa as variáveis ao backend.

No terminal, a partir da pasta raiz do repositório, suba o banco de dados e a API:

```
docker compose up --build
```

(ou adicione a flag `-d` para rodar em segundo plano)

A API fica disponível em `http://localhost:8080` e o PostgreSQL em `localhost:5432` (banco `cancha`, usuário `cancha`, senha `cancha`). O endereço `http://localhost:8080/actuator/health` responde `{"status":"UP"}` quando a aplicação está de pé.

Para parar:

```
docker compose down
```

Os dados do banco ficam salvos entre execuções. Para apagá-los, use `docker compose down -v`.

## Autenticação JWT

A API utiliza tokens JWT assinados com HS256. As requisições às rotas
protegidas devem enviar o cabeçalho:

    Authorization: Bearer <token>

Não é mais utilizado o usuário provisório `user` com senha gerada no log.

Rotas públicas:
- POST /auth/login.
- GET /actuator/health.
- Documentação Swagger: /swagger-ui.html, /swagger-ui/** e /v3/api-docs/**.

As demais rotas exigem autenticação. Tokens inválidos ou expirados recebem
HTTP 401. A autenticação é stateless, sem sessão de usuário no servidor.

`GET /disciplinas/{disciplinaId}/conteudos` lista os materiais publicados para
uma disciplina do aluno autenticado. O aluno precisa estar matriculado nela;
caso contrário, a API responde HTTP 403. A rota também aparece no Swagger.

`GET /atividades/proximas` lista as próximas entregas do aluno autenticado para a
tela Início: até 5 entregas ainda não concluídas de todas as disciplinas dele, da
mais urgente para a menos urgente. As que já venceram vêm primeiro, com
`atrasada: true`. Cada item traz `disciplinaId` e `disciplinaNome`, para o front
levar o aluno à página da disciplina.

### Configuração

- JWT_SECRET: obrigatório, com pelo menos 32 bytes em UTF-8. Use um segredo
  aleatório forte, exclusivo de cada ambiente, sem salvá-lo no repositório.
- JWT_EXPIRATION: opcional, com duração no formato ISO-8601.
  O padrão é PT1H (uma hora).
- CORS_ALLOWED_ORIGINS: opcional, com os endereços do frontend autorizados a
  chamar a API pelo navegador, separados por vírgula. O padrão é
  http://localhost:5173. Veja a seção CORS abaixo.

Para executar pela IDE, configure essas variáveis no campo de variáveis
de ambiente da configuração de execução. Pelo terminal, forneça-as na
mesma sessão que executará o Maven Wrapper.

Os testes utilizam um segredo exclusivo de testes definido em
src/test/resources/application.yml e não exigem JWT_SECRET no terminal.

### Estado da implementação
POST /auth/login autentica alunos cadastrados por e-mail e senha, comparando a senha com o hash BCrypt armazenado. Em caso de sucesso, retorna {"token": "..."}.

Credenciais incorretas retornam HTTP 401 com a mensagem "E-mail ou senha inválidos". Campos inválidos retornam HTTP 400.

GET /me exige um token válido e retorna id, nome, email e matriculaUnB do aluno autenticado, sem expor senha ou hash.

Os alunos do seed podem realizar login em desenvolvimento com as credenciais descritas na seção de dados de exemplo.

A emissão e a validação dos tokens estão implementadas. O login com
e-mail e senha e o endpoint GET /me serão entregues em tarefa separada.
Os alunos do seed ainda não podem realizar login.

### CORS

A API só aceita chamadas feitas pelo navegador a partir das origens listadas em
`CORS_ALLOWED_ORIGINS`, com suporte aos cabeçalhos Authorization e Content-Type.
Sem a variável, vale apenas http://localhost:5173.

Em um ambiente publicado, informe o endereço do frontend, por exemplo:

    CORS_ALLOWED_ORIGINS=https://cancha-frontend-ew8b.onrender.com,http://localhost:5173

Ao definir a variável, a lista substitui o padrão: inclua também
http://localhost:5173 se ainda precisar dele. Cada endereço deve ter `http://`
ou `https://`, sem caminho (a barra final é removida). O coringa `*` não é
aceito. Um valor inválido impede a API de iniciar, com uma mensagem que explica
o erro.

## Como executar para desenvolver (sem container do backend)

Use este modo para rodar a API pela IDE ou pelo Maven, com recarregamento automático. Requer o **JDK 21 completo** (não apenas o JRE) e o Maven Wrapper (`mvnw`) já incluso.

Suba somente o banco de dados, a partir da raiz do repositório:

```
docker compose up -d postgres
```

Entre na pasta do backend e inicie a aplicação:

```
cd backend
```

```
./mvnw spring-boot:run
```

Por padrão a conexão usa o banco `cancha` do `docker-compose.yml`. Por padrão, a conexão usa o banco cancha do docker-compose.yml.
Para usar outro banco, configure DB_URL, DB_USER e DB_PASSWORD nas variáveis de ambiente do terminal ou da execução na IDE.

Configure também JWT_SECRET antes de iniciar a API.
O arquivo .env usado pelo Docker Compose não é carregado automaticamente ao executar pelo Maven ou pela IDE.

No Windows, utilize .\mvnw.cmd spring-boot:run.

> Se o Maven reclamar de `release version 21 not supported`, o `java` do seu sistema não é um JDK 21. Aponte o `JAVA_HOME` para um JDK 21 e tente de novo.

## Testes

```
./mvnw test
```

Os testes usam um banco H2 em memória (ver `src/test/resources/application.yml`) e não dependem do Docker. O Flyway roda as migrations também nos testes e o Hibernate valida as entidades contra as tabelas, então uma entidade que não bate com a migration quebra o build. O `MigracoesIntegrationTest` é o exemplo de teste de integração com o banco, e o `DisciplinaIntegracaoTest` mostra como testar uma regra de negócio (um aluno só vê as próprias disciplinas) com o seed.

O JaCoCo mede a cobertura dos testes. Depois de `./mvnw test`, abra `backend/target/site/jacoco/index.html` no navegador. Na CI, o mesmo relatório fica na página da execução (aba Actions, seção Artifacts, arquivo `relatorio-jacoco`).

## Banco de dados e dados de exemplo

O esquema vem das migrations em `src/main/resources/db/migration/` (`V<n>__descricao.sql`). Depois que uma migration for mergeada, não edite o arquivo: crie uma nova com o próximo número.

- `V1__base.sql`: tabelas `usuario`, `aluno`, `disciplina` e `matricula`.
- `V2__seed_base.sql`: 2 alunos de teste, 5 disciplinas e a matrícula dos dois em todas elas.
- `V3__tabela_de_entregas.sql`: tabelas `entrega` (trabalhos, listas e provas de cada disciplina, com prazo) e `progresso_atividade` (a situação de cada aluno em cada entrega).
- `V4__seed_entregas.sql`: 16 entregas de exemplo (trabalhos, listas e provas) e as situações dos dois alunos de teste.
- `V5__conteudos.sql`: tabela `conteudo` e dois materiais de exemplo para cada disciplina do seed.
- `V6__restringe_status_do_progresso.sql`: o status de `progresso_atividade` só aceita `A_FAZER`, `EM_ANDAMENTO` e `CONCLUIDA`.
- `V7__amplia_dados_de_exemplo.sql`: mais 9 entregas (25 no total), situações variadas para os dois alunos de teste e o `aluno3@cancha.test`, sem nenhuma matrícula, para mostrar as telas vazias.

Alunos de teste (somente desenvolvimento): `aluno1@cancha.test`, `aluno2@cancha.test` e `aluno3@cancha.test` (este sem matrícula), todos com a senha `cancha-dev-123`. No banco fica só o hash BCrypt.

Se você já tinha rodado uma versão antiga das migrations, o Flyway recusa o banco com erro de checksum. Apague o volume e suba de novo:

```
docker compose down -v
docker compose up --build
```

## Documentação da API (Swagger)

Com a API no ar, a documentação interativa abre em `http://localhost:8080/swagger-ui.html` e o JSON em `/v3/api-docs`.

A documentação pode ser consultada sem autenticação. A execução de endpoints protegidos exige um token JWT válido.

## Disciplinas do aluno (`GET /disciplinas`)

Devolve só as disciplinas em que o aluno da requisição está matriculado, em ordem alfabética, com o progresso dele em cada uma:

```json
[
  { "id": 3, "nome": "Compiladores", "periodoLetivo": "2026.2", "progressoPercentual": 0.0 }
]
```

O ID do aluno não é recebido como parâmetro nem como cabeçalho de identificação separado. A implementação da interface `AlunoAtual` (`auth/service`) obtém esse ID do campo `subject` (`sub`) do JWT validado, enviado no cabeçalho `Authorization`. O `DisciplinaController` apenas chama `alunoAtual.id()`, sem permitir que o cliente escolha outro aluno informando um ID.

A implementação AlunoAutenticadoAtual obtém o ID do aluno pelo campo subject (sub) do JWT validado e confirma sua existência no banco.
A seleção de aluno fixo por CANCHA_ALUNO_PROVISORIO_EMAIL foi removida.

Para consultar GET /disciplinas, envie Authorization: Bearer <token>.

## Formato de erro

Os erros tratados pelo `GlobalExceptionHandler` seguem o formato abaixo:

```json
{
  "timestamp": "2026-10-30T16:58:57Z",
  "status": 404,
  "erro": "Not Found",
  "mensagem": "Recurso não encontrado.",
  "caminho": "/nada",
  "campos": null
}
```

`campos` só vem preenchido em erros de validação (400), com `campo` e `mensagem` de cada item inválido. Para um erro de negócio, lance `RecursoNaoEncontradoException` (404) ou crie uma exceção nova e trate-a no `GlobalExceptionHandler`. Erros inesperados viram 500 com mensagem genérica; o detalhe fica só no log.

## Estrutura

A organização segue o Documento de Arquitetura (Seção 2.5.2): um pacote por módulo (package-by-feature), cada um com suas camadas.

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/cancha/
│   │   │   ├── auth/            # Login, JWT e perfis de acesso
│   │   │   │   └── security/    # Configuração do Spring Security e filtro JWT
│   │   │   ├── discipline/      # Disciplina e Conteudo
│   │   │   ├── agenda/          # Entregas e prazos
│   │   │   ├── progress/        # Cálculo do progresso do aluno
│   │   │   ├── annotation/      # Anotações por disciplina
│   │   │   ├── notification/    # Lembretes de prazos
│   │   │   ├── common/          # config, dto e exception compartilhados
│   │   │   └── CanchaApplication.java
│   │   └── resources/
│   │       ├── application.yml  # Configuração da aplicação
│   │       └── db/migration/    # Migrações Flyway (esquema e dados de exemplo)
│   └── test/
│       ├── java/com/cancha/     # Testes unitários e de integração (JUnit)
│       └── resources/           # Configuração dos testes
├── Dockerfile                   # Imagem da API (build com JDK 21, execução com JRE 21)
├── .env.example                 # Variáveis de ambiente do banco
├── mvnw / mvnw.cmd              # Maven Wrapper
└── pom.xml                      # Dependências e build
```

Dentro de cada módulo (exceto `common`), os subpacotes são `controller`, `service`, `repository`, `model` e `dto`. Um módulo só acessa outro por meio da camada `service`, nunca pelo `repository`.

## Concluir ou desfazer a conclusão de uma entrega

`PATCH /atividades/{id}/status`

Exige token JWT no cabeçalho `Authorization: Bearer <token>`.
O aluno é identificado pelo token, sem informar seu ID no corpo.

Para concluir:

```json
{"status":"CONCLUIDA"}
```

Cria o progresso individual quando não existe e atualiza quando já existe.
Registra a data de conclusão. Chamadas repetidas não duplicam o registro
nem alteram a data já registrada.

Para desfazer a conclusão:

```json
{"status":"A_FAZER"}
```

Altera a situação para `A_FAZER` e limpa o campo `data_conclusao`.

Para marcar como em andamento (por exemplo, ao arrastar o cartão no quadro
das Matérias):

```json
{"status":"EM_ANDAMENTO"}
```

Altera a situação para `EM_ANDAMENTO` e também limpa o campo `data_conclusao`.

As três operações verificam se o aluno está matriculado na disciplina
e alteram somente o progresso do aluno autenticado.

### Respostas

- `204`: situação atualizada, sem corpo na resposta.
- `400`: corpo inválido ou situação diferente de `CONCLUIDA`, `EM_ANDAMENTO` e `A_FAZER`.
- `401`: autenticação ausente ou inválida.
- `403`: aluno não matriculado na disciplina.
- `404`: atividade inexistente.
