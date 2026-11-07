# Frontend - Cancha

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

- `features/auth`: login, sessão do aluno e proteção de rotas
- `features/inicio`: tela Início
- `features/materias`: tela Matérias
- `features/disciplinas`: componentes e arquivos relacionados às disciplinas
- `features/agenda`: componentes e arquivos relacionados à agenda
- `shared/api`: código compartilhado para comunicação com o backend
- `shared/auth`: armazenamento do token
- `shared/components`: componentes usados por mais de uma funcionalidade

Os diretórios que ainda não existem serão criados conforme as funcionalidades forem desenvolvidas.

## Rotas

A navegação usa React Router. As rotas ficam em `src/App.jsx`:

| Endereço           | Tela                  | Acesso                                     |
| ------------------ | --------------------- | ------------------------------------------ |
| `/login`           | Login                 | público (quem já está logado vai para `/`) |
| `/`                | Início                | só logado                                  |
| `/materias`        | Matérias              | só logado                                  |
| `/disciplinas/:id` | Página da disciplina  | só logado                                  |
| qualquer outro     | Página não encontrada | público                                    |

Quem não está logado e abre uma rota protegida é levado para `/login`. A sessão do aluno vem do `SessaoProvider` (`useSessao()` devolve `perfil`, `entrar` e `sair`).

No Static Site do Render, cadastre em **Redirects/Rewrites** a regra `/*` → `/index.html` (tipo **Rewrite**); sem ela, recarregar a página em `/materias` dá erro 404.

## Login e integração com a API

O frontend utiliza estes endpoints:

- POST /auth/login: recebe e-mail e senha e retorna um token JWT
- GET /me: consulta o perfil com Authorization: Bearer <token>

O backend precisa estar em execução com os endpoints de autenticação implementados. A origem local permitida pelo backend é http://localhost:5173; use esse endereço para acessar o frontend.

### Endereço do backend

Por padrão, o frontend acessa http://localhost:8080

Para usar outro endereço, crie frontend/.env.local com:

    VITE_API_URL=http://localhost:8080

Reinicie o Vite depois de alterar essa variável.
Para um build publicado, configure VITE_API_URL antes de gerar o build e autorize a origem do frontend no CORS do backend.

Variáveis VITE_ são públicas. Nunca coloque JWT_SECRET ou outras credenciais nelas.

### Sessão

- Sem "Lembrar de mim": token armazenado em sessionStorage
- Com "Lembrar de mim": token armazenado em localStorage
- Ao recarregar, GET /me verifica a sessão antes de mostrar o perfil
- Sair remove o token dos dois armazenamentos
- A opção de lembrar não altera a expiração definida pelo backend

A tela autenticada atual mostra o perfil e o botão Sair, como ponto de integração com a navegação do grupo. Cadastro e recuperação de senha ainda não estão disponíveis.

### Verificação manual

1. Tentar entrar com senha incorreta e conferir a mensagem de erro
2. Entrar com uma conta do seed e conferir o perfil
3. Recarregar e verificar a restauração da sessão
4. Entrar com "Lembrar de mim", fechar a aba e abrir novamente
5. Sair e verificar que recarregar não restaura a sessão
6. Desligar o backend e conferir a mensagem de falha de conexão
7. Conferir o layout em desktop e mobile, com zoom de 100%

As credenciais de desenvolvimento estão no README do backend.

### Referência visual

A tela segue o protótipo desktop e mobile do Figma:
https://www.figma.com/design/nl1ra0yeXBlse8CLl9H3M9/Untitled?node-id=0-1

A ilustração atual utiliza um recorte por CSS do arquivo exportado.
A substituição por uma exportação transparente exigirá ajustar o enquadramento em LoginPage.css.
