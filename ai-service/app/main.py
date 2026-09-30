from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import sync, chat, health

app = FastAPI(
    title="HCG Foundation Chatbot AI Service",
    description=(
        "Quality RAG chatbot: intents, query rewrite, multi-query retrieval, "
        "rerank, grounded generation. Sync is fingerprint-based — not on every chat."
    ),
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(sync.router)
app.include_router(chat.router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
