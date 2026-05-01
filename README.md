# Task Manager API

API REST  para um sistema de Gerenciamento de Tarefas com gerenciamento de equipes, membros, tarefas e histórico de alterações, com autenticação JWT, controle de acesso por perfil e modelagem relacional com Prisma.

Projeto desenvolvido como peça de portfólio para demonstrar construção de backend com Node.js, TypeScript e regras de negócio reais.

## Felipe Mendes
Desenvolvedor Web Júnior

[![Portfólio](https://img.shields.io/badge/Portf%C3%B3lio-Acessar-111827?style=for-the-badge&logo=google-chrome&logoColor=white)](https://felipemasdev.github.io/Portfolio-Dev/)

**Contato**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Perfil-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/felipe-mendes-a-s-dev/)

[![E-mail](https://img.shields.io/badge/E--mail-Contato-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:felipe.mas.dev@gmail.com)

## Sobre o projeto

A aplicação organiza o trabalho em um fluxo simples:

1. Um usuário se cadastra e faz login.
2. Um administrador cria equipes e adiciona membros.
3. As tarefas são criadas, atribuídas e atualizadas por equipe.
4. Cada mudança de status fica registrada no histórico.

## Funcionalidades

- Cadastro e login de usuários
- Autorização por papel: `admin` e `member`
- CRUD de equipes
- Gerenciamento de membros da equipe
- CRUD de tarefas por equipe
- Atribuição e desatribuição de tarefas
- Histórico de alterações de status
- Rota de health check
- Validação com Zod e tratamento centralizado de erros

## Tecnologias utilizadas

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL
- Zod
- JWT
- Docker
- Jest
- Supertest

## Deploy

Aplicação em produção: https://task-manager-glpx.onrender.com

## Como executar localmente

### Pré-requisitos

- Node.js 22+
- PostgreSQL
- npm

### Passos

```bash
# 1) Instalar dependências
npm install

# 2) Criar o arquivo de ambiente
# copie o conteúdo de .env.example para .env e ajuste as credenciais

# 3) Gerar o client do Prisma
npm run prisma:generate

# 4) Executar as migrations
npm run prisma:migrate:dev

# 5) Popular o banco com dados iniciais
npm run prisma:seed

# 6) Iniciar a aplicação em modo desenvolvimento
npm run dev
```

Servidor local: `http://localhost:3333`

## Variáveis de ambiente

O arquivo `.env.example` traz as variáveis esperadas pelo projeto:

- `DATABASE_URL`
- `DATABASE_URL_DOCKER`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `JWT_SECRET`
- `PORT`
- `NODE_ENV`
- `ADMIN_USER`
- `ADMIN_PASSWORD`
- `MEMBER_USER`
- `MEMBER_PASSWORD`

## Endpoints

### Health

- `GET /health`

### Usuários

- `POST /users` cadastra usuário
- `POST /users/login` autentica usuário
- `PATCH /users/:userID/add-admin` promove usuário para admin

### Equipes

- `POST /teams` cria equipe
- `GET /teams` lista equipes
- `PATCH /teams/:id` atualiza equipe
- `DELETE /teams/:id` remove equipe

### Membros da equipe

- `POST /teams/:teamID/members` adiciona membro
- `GET /teams/:teamID/members` lista membros
- `DELETE /teams/:teamID/members/:userID` remove membro

### Tarefas

- `POST /teams/:teamID/tasks` cria tarefa
- `GET /teams/:teamID/tasks` lista tarefas da equipe
- `PATCH /teams/:teamID/tasks/:taskID` atualiza tarefa
- `DELETE /teams/:teamID/tasks/:taskID` remove tarefa
- `PATCH /teams/:teamID/tasks/:taskID/assign` atribui tarefa a um usuário

### Histórico de tarefas

- `GET /teams/:teamID/tasks/:taskID/history` lista o histórico da tarefa

## Exemplos de payload

### 1) Criar usuário

```http
POST /users
Content-Type: application/json
```

```json body
{
  "name": "Felipe Mendes",
  "email": "felipe@example.com",
  "password": "123456"
}
```

### 2) Login

```http
POST /users/login
Content-Type: application/json
```

```json body
{
  "email": "felipe@example.com",
  "password": "123456"
}
```

### 3) Promover usuário para admin (rota protegida)

```http
PATCH /users/:userID/add-admin
Authorization: Bearer <token_admin>
```

### 4) Criar equipe (rota protegida)

```http
POST /teams
Authorization: Bearer <token_admin>
Content-Type: application/json
```

```json body
{
  "name": "Equipe Backend",
  "description": "Responsável pelos serviços da API"
}
```

### 5) Atualizar equipe (rota protegida)

```http
PATCH /teams/:id
Authorization: Bearer <token_admin>
Content-Type: application/json
```

```json body
{
  "description": "Equipe focada em APIs e integrações"
}
```

Opcionais no body:
- "name": "Nome da equipe"
- "description": "Descrição da equipe"

### 6) Adicionar membro na equipe (rota protegida)

```http
POST /teams/:teamID/members
Authorization: Bearer <token_admin>
Content-Type: application/json
```

```json body
{
  "userID": 2
}
```

### 7) Criar tarefa (rota protegida)

```http
POST /teams/:teamID/tasks
Authorization: Bearer <token_admin>
Content-Type: application/json
```

```json body
{
  "title": "Implementar filtro de tarefas",
  "description": "Adicionar filtro por prioridade e status",
  "priority": "high",
  "assignedTo": 2
}
```

Opcionais no body:
- "priority": "low | medium | high"
- "assignedTo": UserID

### 8) Atualizar tarefa (rota protegida)

```http
PATCH /teams/:teamID/tasks/:taskID
Authorization: Bearer <token_admin_ou_member>
Content-Type: application/json
```

```json body
{
  "status": "in_progress",
  "priority": "medium"
}
```

Opcionais no body:
- "title": "Novo titulo"
- "description": "Nova descricao da tarefa"
- "priority": "low | medium | high"

### 9) Atribuir ou desatribuir tarefa (rota protegida)

```http
PATCH /teams/:teamID/tasks/:taskID/assign
Authorization: Bearer <token_admin_ou_member>
Content-Type: application/json
```

```json body
{
  "assignedTo": 3
}
```

Para desatribuir:

```json body
{
  "assignedTo": null
}
```

### 10) Listar membros, tarefas e histórico (rotas protegidas)

```http
GET /teams/:teamID/members
Authorization: Bearer <token_admin_ou_member>

GET /teams/:teamID/tasks?status=pending&priority=high
Authorization: Bearer <token_admin_ou_member>

GET /teams/:teamID/tasks/:taskID/history
Authorization: Bearer <token_admin_ou_member>
```

## Usando o Insomnia

O arquivo `insomnia-config.yaml` pode ser importado no Insomnia para testar a API sem montar as requisições manualmente.

### Como usar

1. Importe o arquivo `insomnia-config.yaml` no Insomnia.
2. Selecione o ambiente desejado:
  - `Dev` usa `http://localhost:3333`
  - `Prod` usa `https://task-manager-glpx.onrender.com`
3. Faça o login na rota de usuário para obter o token.
4. As requisições protegidas já estão configuradas com `Bearer Token` usando a resposta do login.
5. Ajuste apenas os IDs e os campos do body quando necessário.

## Testes

Os testes são executados com Jest e Supertest:

```bash
npm run test
```

Os testes de integração dependem dos usuários e times criados pelo seed, então não apague esses registros se quiser manter a suíte funcionando normalmente.

Se você apagar os dados de teste, recrie o banco e rode o seed novamente:

```bash
npm run prisma:reset
npm run prisma:seed
```

As credenciais usadas nos testes de integração já estão descritas no `.env.example`.

## Docker

O projeto também possui suporte a Docker Compose:

```bash
npm run docker:dev
```

## Aprendizados do projeto

- Modelagem relacional com Prisma para entidades ligadas por equipe
- Separação clara entre controllers, services e rotas
- Controle de acesso por autenticação e autorização
- Registro de histórico para rastrear mudanças de status
- Criação de testes automatizados para validar fluxos críticos da API
- Tratamento de erros e exceções com middleware centralizado
- Uso de lint e formatação automática para manter padrão de código, melhorar legibilidade e prevenir inconsistências
