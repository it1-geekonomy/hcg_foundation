from fastapi import APIRouter

from app.services.answer_cache import answer_cache

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return {"status": "ok", "cache": answer_cache.stats()}
