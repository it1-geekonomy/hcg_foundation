"""create document_chunks

Revision ID: 0001
Revises:
Create Date: 2026-08-05

"""
from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    op.create_table(
        "document_chunks",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True,
                   server_default=sa.text("gen_random_uuid()")),
        sa.Column("source_table", sa.String(100), nullable=False),
        sa.Column("source_id", sa.String(100), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("chunk_index", sa.Integer, nullable=False),
        sa.Column("embedding", Vector(1536), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_index(
        "idx_document_chunks_source",
        "document_chunks",
        ["source_table", "source_id"],
    )

    # Approximate nearest-neighbour index for fast cosine similarity search
    op.execute(
        """
        CREATE INDEX idx_document_chunks_embedding
        ON document_chunks USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);
        """
    )


def downgrade() -> None:
    op.drop_table("document_chunks")
