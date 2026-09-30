from fastapi import APIRouter
from app.config import settings
from app.services import vector_store

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return {
        "status": "ok",
        "vector_store": "pgvector",
        "indexed_chunks": vector_store.indexed_count(),
        "openai_configured": bool(settings.openai_api_key),
        "chat_model": settings.resolved_chat_model,
        "embedding_model": settings.resolved_embedding_model,
        "fingerprint": vector_store.load_fingerprint(),
    }
