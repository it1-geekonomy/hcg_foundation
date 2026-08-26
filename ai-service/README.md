# HCG AI Service (chatbot RAG)

Receives content-change events from NestJS, maintains a **pgvector** knowledge base, and answers questions with an agentic LLM (Groq).

Does **not** talk to MySQL/CMS directly — Nest sends `{ table, source_id, action, content }`.

## Env

Copy `.env.example` → `.env`. For this project we use:

- `OPENAI_BASE_URL=https://api.groq.com/openai/v1` (chat)
- `EMBEDDING_PROVIDER=local` + MiniLM via **fastembed** (Groq has no embeddings)
- Same `INTERNAL_API_KEY` as Nest `AI_SERVICE_INTERNAL_KEY`

## Run

Requires **Python 3.12** (3.14 is too new for these packages). Postgres: standalone container `hcg_postgres`.

```bash
# First time only — create venv with 3.12
py -3.12 -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head

uvicorn app.main:app --reload --port 8001
```

## Endpoints

Header required (except health): `X-Internal-Api-Key: <key>`

- `POST /internal/sync` — upsert/delete chunks for one CMS row
- `POST /chat` — `{ "question": "..." }` → `{ "answer", "sources" }`
- `GET /health`
