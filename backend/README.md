# Backend - Folha Digital

API REST do Folha Digital, desenvolvida em Java com Spring Boot (Controller, Service e Repository), Spring Security para autenticação e autorização via JWT, Spring Data JPA e PostgreSQL com migrações Flyway.

## Pré-requisitos

- JDK 21
- Docker (para subir o PostgreSQL local)
- Repositório do projeto clonado

Não é preciso instalar o Maven: o projeto inclui o Maven Wrapper (`mvnw`).

## Como executar

No terminal, a partir da pasta raiz do repositório, suba o banco de dados:

```
docker compose up -d
```

Entre na pasta do backend:

```
cd backend
```

Inicie a aplicação:

```
./mvnw spring-boot:run
```

A API fica disponível em `http://localhost:8080`. Por padrão a conexão usa o banco `folha` do `docker-compose.yml`. Para usar outro banco, copie `.env.example` e ajuste as variáveis `DB_URL`, `DB_USER` e `DB_PASSWORD`.

> Enquanto o módulo `auth` não for implementado, o Spring Security bloqueia todos os endpoints com a senha gerada no log de inicialização.

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
│   │   ├── java/com/folha/
│   │   │   ├── auth/            # Login, JWT e perfis de acesso
│   │   │   │   └── security/    # Configuração do Spring Security e filtro JWT
│   │   │   ├── discipline/      # Disciplina e Conteudo
│   │   │   ├── agenda/          # Entregas e prazos
│   │   │   ├── progress/        # Cálculo do progresso do aluno
│   │   │   ├── annotation/      # Anotações por disciplina
│   │   │   ├── notification/    # Lembretes de prazos
│   │   │   ├── common/          # config, dto e exception compartilhados
│   │   │   └── FolhaApplication.java
│   │   └── resources/
│   │       ├── application.yml  # Configuração da aplicação
│   │       └── db/migration/    # Migrações Flyway (schema e carga inicial de conteúdo)
│   └── test/
│       ├── java/com/folha/      # Testes unitários e de integração (JUnit)
│       └── resources/           # Configuração dos testes
├── .env.example                 # Variáveis de ambiente do banco
├── mvnw / mvnw.cmd              # Maven Wrapper
└── pom.xml                      # Dependências e build
```

Dentro de cada módulo (exceto `common`), os subpacotes são `controller`, `service`, `repository`, `model` e `dto`. Um módulo só acessa outro por meio da camada `service`, nunca pelo `repository`.
