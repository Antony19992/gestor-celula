# Gestor de Célula

Aplicação web para gerenciamento de células, com controle de membros, reuniões e estudos bíblicos.

## Tecnologias

**Backend**
- ASP.NET Core 8.0
- Entity Framework Core + SQLite
- Swagger (documentação da API)

**Frontend**
- Next.js + TypeScript
- Tailwind CSS

## Estrutura do projeto

```
gestor-celula/
├── app-back/       # API REST em ASP.NET Core
│   ├── Controllers/
│   ├── Services/
│   ├── Repositories/
│   ├── Models/
│   └── DTOs/
└── app-front/      # Interface web em Next.js
    └── src/
        ├── app/
        ├── components/
        ├── hooks/
        ├── services/
        └── types/
```

## Como rodar

### Backend

```bash
cd app-back
dotnet run
```

A API estará disponível em `http://localhost:5000`. A documentação Swagger em `http://localhost:5000/swagger`.

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
- Gerenciamento de estudos bíblicos
