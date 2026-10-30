# Backend - Cancha

API REST do Cancha, desenvolvida em Java com Spring Boot (Controller, Service e Repository), Spring Security para autenticação e autorização via JWT, Spring Data JPA e PostgreSQL com migrações Flyway.

## Pré-requisitos

- Docker e Docker Compose
- Repositório do projeto clonado

Para rodar com Docker não é preciso ter Java nem Maven instalados: o `Dockerfile` compila o projeto com JDK 21 e executa o `.jar` com JRE 21, igual em qualquer máquina.

## Como executar (Docker)

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

## Acesso à API enquanto o login não existe

> **Aviso para quem for implementar o módulo `auth` (login e JWT):** esta seção descreve o estado **provisório**. Quando o login estiver pronto, atualize ou apague esta seção, a observação do Swagger mais abaixo e o aviso sobre os alunos de teste.

O módulo `auth` ainda não está implementado, então vale o comportamento padrão do Spring Security:

- Todos os endpoints exigem login, exceto `/actuator/health`.
- O único usuário é **`user`**, e a senha é gerada de novo a cada inicialização do backend. Ela aparece no log, na linha `Using generated security password`. Com Docker:

```
docker compose logs backend | grep "generated security password"
```

- Os **alunos de teste do seed (`aluno1@cancha.test` e `aluno2@cancha.test`) ainda não fazem login**: o Spring Security não está ligado à tabela `usuario`. Eles só existem no banco por enquanto.

O que falta fazer no `auth/security` (configuração do Spring Security): carregar o usuário da tabela `usuario`, conferir a senha BCrypt, emitir e validar o JWT, e liberar `/auth/login`, `/actuator/health`, `/swagger-ui.html`, `/swagger-ui/**` e `/v3/api-docs/**` sem token.

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

Por padrão a conexão usa o banco `cancha` do `docker-compose.yml`. Para usar outro banco, copie `.env.example` e ajuste as variáveis `DB_URL`, `DB_USER` e `DB_PASSWORD`.

> Se o Maven reclamar de `release version 21 not supported`, o `java` do seu sistema não é um JDK 21. Aponte o `JAVA_HOME` para um JDK 21 e tente de novo.

## Testes

```
./mvnw test
```

Os testes usam um banco H2 em memória (ver `src/test/resources/application.yml`) e não dependem do Docker. O Flyway roda as migrations também nos testes e o Hibernate valida as entidades contra as tabelas, então uma entidade que não bate com a migration quebra o build. O `MigracoesIntegrationTest` é o exemplo de teste de integração com o banco.

## Banco de dados e dados de exemplo

O esquema vem das migrations em `src/main/resources/db/migration/` (`V<n>__descricao.sql`). Depois que uma migration for mergeada, não edite o arquivo: crie uma nova com o próximo número.

- `V1__base.sql`: tabelas `usuario`, `aluno`, `disciplina` e `matricula`.
- `V2__seed_base.sql`: 2 alunos de teste, 5 disciplinas e a matrícula dos dois em todas elas.

Alunos de teste (somente desenvolvimento): `aluno1@cancha.test` e `aluno2@cancha.test`, ambos com a senha `cancha-dev-123`. No banco fica só o hash BCrypt.

Se você já tinha rodado uma versão antiga das migrations, o Flyway recusa o banco com erro de checksum. Apague o volume e suba de novo:

```
docker compose down -v
docker compose up --build
```

## Documentação da API (Swagger)

Com a API no ar, a documentação interativa abre em `http://localhost:8080/swagger-ui.html` e o JSON em `/v3/api-docs`.

> Enquanto a configuração do Spring Security do módulo `auth` não liberar essas rotas, elas pedem login com o usuário provisório descrito em [Acesso à API enquanto o login não existe](#acesso-à-api-enquanto-o-login-não-existe).

## Formato de erro

Todo erro da API sai no mesmo formato (`common/exception`), com o `GlobalExceptionHandler`:

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
