import uuid
from sqlalchemy import Column, String, Text, Integer, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector

from app.database import Base
from app.config import settings


class DocumentChunk(Base):
    """
    Owned by the AI service. NestJS never reads/writes this table directly —
    it sends sync events; this service stores chunks + embeddings in Postgres
    via pgvector.
    """

    __tablename__ = "document_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_table = Column("source_table", String(100), nullable=False, index=True)
    source_id = Column("source_id", String(100), nullable=False, index=True)
    content = Column(Text, nullable=False)
    chunk_index = Column("chunk_index", Integer, nullable=False)
    embedding = Column(Vector(settings.embedding_dimensions), nullable=False)

    title = Column(String(500), nullable=False, server_default="")
    url = Column(String(1000), nullable=False, server_default="/")
    category = Column(String(100), nullable=False, server_default="Page", index=True)
    slug = Column(String(300), nullable=False, server_default="")
    designation = Column(String(300), nullable=False, server_default="")

    created_at = Column(
        "created_at", DateTime(timezone=True), server_default=func.now()
    )


class RagMeta(Base):
    """Key/value state for corpus fingerprint sync."""

    __tablename__ = "rag_meta"

    key = Column(String(100), primary_key=True)
    value = Column(Text, nullable=False)
