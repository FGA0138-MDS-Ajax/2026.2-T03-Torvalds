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

> Enquanto o módulo `auth` não for implementado, o Spring Security exige login em todos os endpoints da API (exceto `/actuator/health`) e gera uma senha no log de inicialização.

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

Os testes usam um banco H2 em memória (ver `src/test/resources/application.yml`) e não dependem do Docker.

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
│   │       └── db/migration/    # Migrações Flyway (schema e carga inicial de conteúdo)
│   └── test/
│       ├── java/com/cancha/      # Testes unitários e de integração (JUnit)
│       └── resources/           # Configuração dos testes
├── Dockerfile                   # Imagem da API (build com JDK 21, execução com JRE 21)
├── .env.example                 # Variáveis de ambiente do banco
├── mvnw / mvnw.cmd              # Maven Wrapper
└── pom.xml                      # Dependências e build
```

Dentro de cada módulo (exceto `common`), os subpacotes são `controller`, `service`, `repository`, `model` e `dto`. Um módulo só acessa outro por meio da camada `service`, nunca pelo `repository`.
