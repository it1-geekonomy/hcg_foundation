import uuid
from sqlalchemy import Column, String, Text, Integer, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector

from app.database import Base
from app.config import settings


class DocumentChunk(Base):
    """
    Owned by the AI service. NestJS never reads/writes this table directly —
    it only sends webhook events; this service decides how to store the
    resulting chunks + embeddings.
    """

    __tablename__ = "document_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_table = Column("source_table", String(100), nullable=False, index=True)
    source_id = Column("source_id", String(100), nullable=False, index=True)
    content = Column(Text, nullable=False)
    chunk_index = Column("chunk_index", Integer, nullable=False)
    embedding = Column(Vector(settings.embedding_dimensions), nullable=False)
    created_at = Column("created_at", DateTime(timezone=True), server_default=func.now())
