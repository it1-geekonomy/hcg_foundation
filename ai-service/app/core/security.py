from fastapi import Header, HTTPException, status
from app.config import settings


async def verify_internal_api_key(x_internal_api_key: str = Header(...)):
    """
    Guards internal-only endpoints (sync webhook, chat proxy target).
    NestJS must send this header on every call. Not meant for public/browser use.
    """
    if x_internal_api_key != settings.internal_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid internal API key",
        )
