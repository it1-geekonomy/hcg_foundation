from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import verify_internal_api_key
from app.schemas.schemas import ChatRequest, ChatResponse
from app.services import agent_service

router = APIRouter(prefix="/chat", tags=["chat"], dependencies=[Depends(verify_internal_api_key)])


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    result = agent_service.answer_question(db, payload.question)
    return result
