# NestJS Backend

NestJS + TypeScript backend with PostgreSQL (Docker), TypeORM migrations, and Swagger API docs.

## Stack

- **NestJS** (TypeScript)
- **PostgreSQL** via Docker
- **TypeORM** (with migrations)
- **Swagger** (`@nestjs/swagger`) at `/api/docs`

## Project structure

```
src/
  database/
    database.module.ts   # TypeORM connection module (used by Nest)
    data-source.ts        # TypeORM CLI data source (used for migrations)
    migrations/            # Migration files
      README.md
    README.md
  app.module.ts
  app.controller.ts
  app.service.ts
  main.ts                  # App bootstrap + Swagger setup
docker-compose.yml
Dockerfile
.env.example
```

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Adjust values if needed (defaults work with the provided `docker-compose.yml`).

### 3. Start Postgres

```bash
docker run -d --name hcg_postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hcg_db -p 5432:5432 -v pgdata:/var/lib/postgresql/data postgres:16-alpine
```

### 4. Run migrations

```bash
pnpm run migration:run
```

### 5. Start the app

```bash
pnpm run start:dev
```

- API base URL: `http://localhost:3000/api`
- Swagger docs: `http://localhost:6060/api/docs`
- Health check: `http://localhost:3000/api/health`

## Running everything with Docker

To run both the app and Postgres in containers:

```bash
docker compose up -d --build
```

The `app` service waits for Postgres to be healthy, runs pending migrations, then starts the server.

## Migrations

See `src/database/migrations/README.md` for the full migration workflow (generate, run, revert).

## Adding a new module/resource

Use the Nest CLI (installed as a dev dependency) to scaffold new resources, e.g.:

```bash
npx nest g resource users
```

Then move/adjust generated files to fit the project structure, and add a corresponding entity + migration.
