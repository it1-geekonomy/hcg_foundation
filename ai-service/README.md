# HCG Foundation chatbot — AI service (RAG)

Quality RAG service modeled on the old PHP + FastAPI bot:

1. Fast intents (greeting / donate / founder) — no LLM
2. Typo normalize → query rewrite → multi-query retrieve
3. **pgvector** cosine search in Postgres + keyword/authority injection + category expansion
4. Rerank + parent dedupe + similarity threshold
5. Grounded LLM generation + recoveries
6. Sources (max 3)

CMS rows are pushed by NestJS (`POST /internal/sync`) for **published** content only.
Website page text (fetched from the frontend) + curated static pages + `knowledge/public/` + whitelisted files under
`knowledge/source-docs/` (PDF/DOCX/PPTX) are refreshed by `POST /sync`
(fingerprint; not on every chat).

Embeddings live in the same Postgres DB as the CMS (`document_chunks` + `pgvector`).

## Run

Prerequisites: Python 3.12+, and Postgres running from a pgvector image
(see `backend/docker-compose.yml`).

### 1. First-time setup

Windows (PowerShell):

```powershell
cd ai-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

macOS / Linux:

```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` and set:

- `OPENAI_API_KEY`: your OpenAI key
- `INTERNAL_API_KEY`: must equal `AI_SERVICE_INTERNAL_KEY` in `backend/.env`
- `DB_*`: same database as the NestJS backend

Then create the pgvector extension and the `document_chunks` table:

```bash
alembic upgrade head
```

### 2. Start the service

Activate the venv first (`.\venv\Scripts\Activate.ps1` or `source venv/bin/activate`), then:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001
```
or 
#Run 
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --host 0.0.0.0 --port 8001


For auto-restart on code changes, add `--reload`. On Windows `--reload` can hang
and keep serving old code; if that happens, stop it and run without `--reload`
(restart manually after each code change).

Check it is up:

```bash
curl http://localhost:8001/health
```

The NestJS backend reaches it through `AI_SERVICE_URL=http://localhost:8001` in `backend/.env`.

### 3. Build the search index

Run once after setup, and again whenever `knowledge/` files or the website page text change:

```bash
python -c "from app.services.sync_service import full_sync; print(full_sync(force=True))"
```

The sync also reads the visible text of the public website pages (About Us, programs,
Get Involved, Contact, ...) from the running frontend at `SITE_CRAWL_URL`
(default `http://localhost:3000`), so start the frontend first. The page list is in
`app/services/site_pages.py`. If a page can't be fetched, its previously indexed text is kept
and the result lists it under `site_pages_failed`.

To push CMS content (projects, events, blogs, ...) as well, call the Nest endpoint
`POST /api/chatbot/reindex` with an admin JWT. It sends the CMS rows and triggers the corpus sync.
Afterwards, published CMS changes are synced automatically.

### Docker

The `Dockerfile` runs `alembic upgrade head` and then starts uvicorn on port 8001.
In production it is started by the root `docker-compose.prod.yml` (see `DEPLOY.md`).

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/health` | none | indexed count + OpenAI configured |
| POST | `/chat` | `X-Internal-Api-Key` | `{ message, session_id? }` |
| POST | `/internal/sync` | key | Nest CMS upsert/delete |
| POST | `/sync` | key | `{ force? }` fingerprint corpus sync |

Public site calls Nest `POST /api/chatbot/chat` (never talks to this service directly).

## Never indexed

donors, leads, fundraising campaigns, partnership inquiries, users.
