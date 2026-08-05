# NGO chatbot — AI microservice (Python / FastAPI)

Agentic RAG service. Receives content-change events from a NestJS backend,
maintains a pgvector-backed knowledge base, and answers questions using an
LLM that decides for itself when to search — not a fixed retrieve-then-answer
pipeline.

This service **does not talk to your CMS directly**. It has no knowledge of
your CMS schema at all — NestJS sends it plain `{table, source_id, content}`
events, and this service just chunks/embeds/stores/searches that content.

## Project structure

```
ai-service/
  app/
    main.py              # FastAPI app
    config.py             # settings from .env
    database.py            # SQLAlchemy engine/session
    models/document_chunk.py
    schemas/schemas.py
    core/security.py       # internal API key check
    services/
      chunker.py
      embeddings.py
      vector_store.py      # pgvector CRUD + similarity search
      agent_service.py     # the agentic chat logic
    routers/
      sync.py               # POST /internal/sync  (webhook receiver)
      chat.py                # POST /chat            (Q&A)
      health.py               # GET  /health
  alembic/                # this service's own migrations (independent of NestJS)
  requirements.txt
  Dockerfile
  .env.example
```

## Setup

### 1. Create a virtual environment and install dependencies
```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment
```bash
cp .env.example .env
```
Fill in:
- `OPENAI_API_KEY` — https://platform.openai.com/api-keys
- `DB_*` — should point at the **same Postgres instance** your NestJS
  backend uses (the `pgvector/pgvector:pg16` image, per the updated
  `docker-compose.yml`), since embeddings live alongside your CMS data.
- `INTERNAL_API_KEY` — generate one (`openssl rand -hex 32`) and put the
  **exact same value** in NestJS's `.env` as `AI_SERVICE_INTERNAL_KEY`.

### 3. Run the migration
This enables the `vector` Postgres extension and creates `document_chunks`:
```bash
alembic upgrade head
```

### 4. Run the service
```bash
uvicorn app.main:app --reload --port 8001
```
API docs at `http://localhost:8001/docs`.

## Endpoints

All except `/health` require header `X-Internal-Api-Key: <your key>`.

- `POST /internal/sync` — called by NestJS on CMS insert/update/delete.
  ```json
  {"table": "programs", "source_id": "42", "action": "upsert", "content": "Youth mentoring...\n\nA weekly program for..."}
  ```
- `POST /chat` — ask a question.
  ```json
  {"question": "What programs do you offer for children?"}
  ```
  Returns `{"answer": "...", "sources": ["programs#42", "faqs#7"]}`.

## The agentic part

`agent_service.py` gives the LLM one tool, `search_knowledge_base`, and lets
it decide when to call it — including calling it more than once with a
reformulated query if the first search doesn't help. This differs from
naive RAG (always retrieve top-k, always stuff into the prompt) in that the
model can:
- Skip searching for a question it can answer from the system prompt alone (rare, but possible for meta questions like "what can you help with").
- Search multiple times with different phrasings if the first attempt misses.
- Decide it genuinely doesn't know, rather than forcing an answer from irrelevant chunks.

## Adding a scheduled safety-net (optional)

If you're not 100% sure every CMS write goes through NestJS's Repository
pattern (see the NestJS README's caveat), you can add a periodic
reconciliation job here that re-pulls everything NestJS has and diffs it —
but the simpler fix is almost always to make sure CMS writes go through
`repository.save()`/`repository.remove()` in the first place.

## Scaling notes

- `ivfflat` vector index performance improves with more data; if you have a
  huge number of rows, consider periodically running `REINDEX INDEX
  idx_document_chunks_embedding;`.
- This service is stateless aside from the DB — you can run multiple
  instances behind a load balancer with no extra work.
- Swap `CHAT_MODEL`/`EMBEDDING_MODEL` in `.env` to change providers/models —
  if you change embedding dimensions, update `Vector(...)` in
  `models/document_chunk.py` and the Alembic migration, then re-run a full
  backfill (`POST /chatbot/reindex` on the NestJS side).
