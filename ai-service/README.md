# HCG Foundation chatbot — AI service (RAG)

Quality RAG service modeled on the old PHP + FastAPI bot:

1. Fast intents (greeting / donate / founder) — no LLM
2. Typo normalize → query rewrite → multi-query retrieve
3. **pgvector** cosine search in Postgres + keyword/authority injection + category expansion
4. Rerank + parent dedupe + similarity threshold
5. Grounded LLM generation + recoveries
6. Sources (max 3)

CMS rows are pushed by NestJS (`POST /internal/sync`) for **published** content only.
Static pages + `knowledge/public/` + whitelisted files under
`knowledge/source-docs/` (PDF/DOCX/PPTX) are refreshed by `POST /sync`
(fingerprint; not on every chat).

Embeddings live in the same Postgres DB as the CMS (`document_chunks` + `pgvector`).

## Run

```bash
# Postgres must use a pgvector image (see backend/docker-compose.yml)
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env   # set OPENAI_API_KEY + INTERNAL_API_KEY
alembic upgrade head
uvicorn app.main:app --reload --port 8001
```

Then from Nest (JWT): `POST /api/chatbot/reindex` to push CMS + sync corpus.

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
