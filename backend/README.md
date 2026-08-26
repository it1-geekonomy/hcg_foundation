# NestJS Backend + Chatbot sync

NestJS reads the legacy **MySQL** dump (testing) and keeps the Python **ai-service** knowledge base in sync.

## Architecture

```
MySQL (standalone Docker)        Postgres + pgvector (standalone Docker)
        │                                 │
        ▼                                 ▼
   NestJS (local)  ──HTTP sync──►  ai-service (local FastAPI)
```

Databases are **standalone** containers (not Docker Compose). Nest + ai-service run on the host.

## 1. Start DBs (one-time create)

```bash
docker volume create hcg_mysql_data
docker volume create hcg_pgdata

docker run -d --name hcg_mysql --restart unless-stopped ^
  -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=hcgfoundation ^
  -e MYSQL_USER=hcg -e MYSQL_PASSWORD=hcg -p 3306:3306 ^
  -v hcg_mysql_data:/var/lib/mysql ^
  -v "%CD%/docker/mysql/init:/docker-entrypoint-initdb.d:ro" ^
  mysql:8.0 --default-authentication-plugin=mysql_native_password --character-set-server=utf8mb4

docker run -d --name hcg_postgres --restart unless-stopped ^
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres ^
  -e POSTGRES_DB=hcg_vectors -p 5432:5432 ^
  -v hcg_pgdata:/var/lib/postgresql/data ^
  pgvector/pgvector:pg16
```

Later: `docker start hcg_mysql hcg_postgres`

| Container | Port |
|-----------|------|
| `hcg_mysql` | `3306` — `hcg` / `hcg` / `hcgfoundation` |
| `hcg_postgres` | `5432` — `postgres` / `postgres` / `hcg_vectors` |

## 2. AI service (local)

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8001
```

## 3. NestJS (local)

```bash
cd backend
pnpm install
pnpm run start:dev
```

| Service | URL |
|---------|-----|
| Nest API | http://localhost:6060/api |
| Swagger | http://localhost:6060/api/docs |
| AI docs | http://localhost:8001/docs |

```bash
curl -X POST http://localhost:6060/api/chatbot/reindex
curl -X POST http://localhost:6060/api/chatbot/chat -H "Content-Type: application/json" -d "{\"question\":\"What is the privacy policy?\"}"
```
