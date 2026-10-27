# Frontend - cAnCHA

Aplicação frontend do Cancha, desenvolvida com React e JavaScript e configurada com Vite.

## Pré-requisitos

- Node.js e npm instalados
- Repositório do projeto clonado

## Como executar

No terminal, a partir da pasta raiz do repositório, entre na pasta do frontend:

```
cd frontend
```

Instale as dependências:

```
npm install
```

Inicie o servidor de desenvolvimento:

```
npm run dev
```

Abra no navegador o endereço informado no terminal. Geralmente é `http://localhost:5173`.

Para encerrar o servidor, pressione `Ctrl+C` no terminal em que ele está rodando.

## Padronização do código

Para analisar o código com o ESLint:

```
npm run lint
```

Para verificar a formatação com o Prettier:

```
npm run format:check
```

Execute esses comandos dentro da pasta `frontend`.

## Gerar a versão de produção

Para gerar os arquivos de produção:

```
npm run build
```

Os arquivos ficam na pasta `dist`.

## Organização do código

A pasta `src` contém o código da aplicação. A organização prevista no Documento de Arquitetura agrupa o código por funcionalidade:

- `features/disciplinas`: componentes e arquivos relacionados às disciplinas
- `features/agenda`: componentes e arquivos relacionados à agenda
- `shared/api`: código compartilhado para comunicação com o backend

Esses diretórios serão criados conforme as funcionalidades forem desenvolvidas. Atualmente, a aplicação ainda não está integrada ao backend.
