from fastapi import APIRouter
from app.config import settings
from app.services import chroma_store

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return {
        "status": "ok",
        "indexed_chunks": chroma_store.indexed_count(),
        "openai_configured": bool(settings.openai_api_key),
        "chat_model": settings.resolved_chat_model,
        "embedding_model": settings.resolved_embedding_model,
        "fingerprint": chroma_store.load_fingerprint(),
    }
