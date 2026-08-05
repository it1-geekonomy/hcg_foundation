from pydantic import BaseModel, Field
from typing import Literal, Optional


class SyncEvent(BaseModel):
    table: str = Field(..., examples=["programs"])
    source_id: str = Field(..., examples=["42"])
    action: Literal["upsert", "delete"]
    content: Optional[str] = Field(
        None,
        description="Combined text from the row's tracked columns. Required for 'upsert', ignored for 'delete'.",
    )


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=2, examples=["What programs do you offer for children?"])


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
