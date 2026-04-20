# Gestor de Célula

Aplicação web para gerenciamento de células, com controle de membros, reuniões, estudos bíblicos e hinário.

## Tecnologias

**Backend** (`app-backend`)
- Node.js + Express
- Prisma ORM
- PostgreSQL (Supabase)

**Frontend** (`app-front`)
- Next.js 14 + TypeScript
- Tailwind CSS

## Estrutura do projeto

```
gestor-celula/
├── app-backend/        # API REST em Express + Prisma
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── app.js
│       └── routes/
│           ├── member.js
│           ├── meeting.js
│           ├── study.js
│           └── hino.js
└── app-front/          # Interface web em Next.js
    └── src/
        ├── app/
        ├── components/
        ├── hooks/
        ├── lib/
        ├── services/
        └── types/
```

## Como rodar

### Backend

```bash
cd app-backend
npm install
npm run dev
```

A API estará disponível em `http://localhost:3001`.

### Frontend

```bash
cd app-front
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:3000`.

## Funcionalidades

- Cadastro e gerenciamento de membros
- Controle de reuniões com sorteio de participantes
- Gerenciamento e leitura de estudos bíblicos
- Hinário com busca, cache local e base própria (populada progressivamente)
- Toggle de tamanho de fonte para acessibilidade
- Cache local (stale-while-revalidate) em todas as rotas para carregamento instantâneo
