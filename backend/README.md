# NestJS Backend — HCG Foundation

NestJS + TypeScript + PostgreSQL (Docker) + TypeORM migrations + Swagger.

## Stack

- **NestJS** (TypeScript)
- **PostgreSQL** via Docker
- **TypeORM** (migrations; `synchronize` off by default)
- **Swagger** at `/api/docs`

## Architecture

Domain modules map **1:1 to site pages** from the ERD.

> **ERD rule:** no foreign keys — every table is independent.

```
src/
  common/                         # shared cross-cutting concerns
    constants/
    decorators/
    dto/                          # PaginationQueryDto
    entities/                     # BaseEntity (uuid + timestamps)
    filters/                      # GlobalHttpExceptionFilter
    guards/
    interceptors/                 # ResponseTransformInterceptor
    interfaces/

  config/
    configuration.ts

  database/
    database.module.ts
    data-source.ts                # TypeORM CLI
    migrations/

  modules/
    about/                        # ABOUT US PAGE
      about.module.ts
      teams/
      trustees/
      awards/

    resources/                    # RESOURCES PAGE
      resources.module.ts
      annual-reports/
      publications/
      newsletters/
      gallery/
      articles/
      blogs/

    home/                         # HOME PAGE
      home.module.ts
      projects/
      events/
      patient-stories/

    donation/                     # DONATION PAGE
      donation.module.ts
      donors/

    contact/                      # CONTACT US PAGE
      contact.module.ts
      leads-contact/

    admin/                        # INTERNAL / ADMIN
      admin.module.ts
      users/                      # admins

  chatbot/                        # AI ingestion / Q&A (existing)
  app.module.ts
  main.ts
```

Each feature folder follows the same Nest pattern:

```
feature/
  entities/*.entity.ts
  dto/create-*.dto.ts
  dto/update-*.dto.ts
  feature.controller.ts
  feature.service.ts
  feature.module.ts
```

## Getting started

### 1. Install

```bash
pnpm install
```

### 2. Env

```bash
cp .env.example .env
```

### 3. Postgres

```bash
docker run -d --name hcg_postgres  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hcg_db -p 5432:5432 -v pgdata:/var/lib/postgresql/data postgres:16-alpine
```

### 4. Migrations

```bash
# After entities exist / change:
pnpm run migration:generate -- src/database/migrations/InitSchema
pnpm run migration:run
```

For local bootstrap only you may set `DB_SYNCHRONIZE=true` once — keep it `false` in shared/prod environments.

### 5. Seed super-admin

```bash
pnpm seed
```

Defaults (override via `SEED_ADMIN_*` in `.env`): `admin@hcgfoundation.org` / `admin` / `Admin@12345`. Idempotent — skips if that user already exists.

### 6. Run

```bash
pnpm run start:dev
```

- API: `http://localhost:6060/api`
- Swagger: `http://localhost:6060/api/docs`
- Health: `http://localhost:6060/api` (root controller)

## API surface (scaffold)

| Domain | Route prefix | Table |
|--------|--------------|-------|
| About | `/api/teams` | `teams` |
| About | `/api/trustees` | `trustees` |
| About | `/api/awards` | `awards` |
| Resources | `/api/annual-reports` | `annual_reports` |
| Resources | `/api/publications` | `publications` |
| Resources | `/api/newsletters` | `newsletters` |
| Resources | `/api/gallery` | `gallery` |
| Resources | `/api/articles` | `articles` |
| Resources | `/api/blogs` | `blogs` |
| Home | `/api/projects` | `projects` |
| Home | `/api/events` | `events` |
| Home | `/api/patient-stories` | `patient_stories` |
| Donation | `/api/donors` | `donors` |
| Contact | `/api/leads-contact` | `leads_contact` |
| Admin | `/api/users` | `users` |

CRUD: `POST /` · `GET /` (paginated) · `GET /:id` · `PATCH /:id` · `DELETE /:id`

## Adding a new independent table

1. Create a feature folder under the correct page domain.
2. Add entity (extend `BaseEntity`), DTOs, service, controller, module.
3. Import the feature module into the domain `*.module.ts`.
4. Generate + run a migration.

Do **not** add TypeORM `@ManyToOne` / `@JoinColumn` relations — keep tables independent per ERD.
