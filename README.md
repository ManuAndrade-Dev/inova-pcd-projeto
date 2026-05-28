# Projeto Inova.PCD

Aplicação completa com backend, frontend e dados reais do dataset `Inova.PCD`.

## Estrutura

- `backend/` - API Node.js + Express + MongoDB
- `frontend/` - dashboard simples em HTML/JS
- `data/` - CSVs do dataset
- `.env.example` - variáveis de ambiente de exemplo
- `.gitignore` - ignore de dependências e `.env`

## Pré-requisitos

- Node.js instalado
- MongoDB local ou Atlas

## Instalação

1. Entre na pasta do backend:

```bash
cd backend
```

2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo `.env` com base em `.env.example`.

## Importar dados para o MongoDB

No diretório `backend` rode:

```bash
npm run seed
```

Isso importa:
- `atividades.csv`
- `responsaveis.csv`
- `status_historico.csv`
- usuário padrão para login

## Usuário padrão

- Email: `admin@inova.com`
- Senha: `senha123`

## Executar a aplicação

No diretório `backend` rode:

```bash
npm start
```

Depois abra no navegador na porta exibida no console.

Se a porta `5000` estiver ocupada, o servidor tentará `5001` automaticamente.

## Endpoints disponíveis

- `POST /api/auth/register` - registra usuário
- `POST /api/auth/login` - gera token JWT
- `GET /api/tasks` - lista tarefas (autorizado)
- `POST /api/tasks` - cria tarefa (autorizado)
- `PUT /api/tasks/:id` - atualiza tarefa (autorizado)
- `DELETE /api/tasks/:id` - remove tarefa (autorizado)
- `GET /api/data/summary` - resumo das tarefas
- `GET /api/data/analytics` - métricas adicionais
- `GET /api/data/responsaveis` - lista responsáveis
- `GET /api/data/status-history` - histórico de status

## Frontend

- Login com JWT
- Criação de tarefas
- Lista de tarefas com filtro por status e categoria
- Concluir e excluir tarefas
- Gráficos de status e categoria
- Métricas de taxa de conclusão e lead time

## Observações

- O frontend é servido pela mesma API Express.
- O login usa JWT e o token fica salvo no `localStorage`.
- Se o MongoDB não estiver disponível, o backend usa um banco local em `backend/local-db.json`.
- Se a porta `5000` já estiver ocupada, o servidor tentará `5001`.
