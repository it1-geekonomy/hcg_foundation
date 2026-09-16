from fastapi import APIRouter, Depends, HTTPException
from app.core.security import verify_internal_api_key
from app.schemas.schemas import ChatRequest, ChatResponse, ChatSource
from app.rag.pipeline import run_chat

router = APIRouter(prefix="/chat", tags=["chat"], dependencies=[Depends(verify_internal_api_key)])


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest):
    message = payload.resolved_message()
    if not message:
        raise HTTPException(status_code=400, detail="message is required")

    result = run_chat(message, payload.session_id)
    return ChatResponse(
        answer=result["answer"],
        sources=[ChatSource(**s) for s in result.get("sources") or []],
        session_id=result["session_id"],
        response_time_ms=result["response_time_ms"],
    )
