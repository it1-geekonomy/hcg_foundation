"""create document_chunks + rag_meta (pgvector)

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
        sa.Column(
            "id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("source_table", sa.String(100), nullable=False),
        sa.Column("source_id", sa.String(100), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("chunk_index", sa.Integer, nullable=False),
        sa.Column("embedding", Vector(1536), nullable=False),
        sa.Column("title", sa.String(500), nullable=False, server_default=""),
        sa.Column("url", sa.String(1000), nullable=False, server_default="/"),
        sa.Column("category", sa.String(100), nullable=False, server_default="Page"),
        sa.Column("slug", sa.String(300), nullable=False, server_default=""),
        sa.Column("designation", sa.String(300), nullable=False, server_default=""),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )

    op.create_index(
        "idx_document_chunks_source",
        "document_chunks",
        ["source_table", "source_id"],
    )
    op.create_index(
        "idx_document_chunks_category",
        "document_chunks",
        ["category"],
    )

    # HNSW works on empty tables; better default than IVFFlat for small CMS corpora.
    op.execute(
        """
        CREATE INDEX idx_document_chunks_embedding
        ON document_chunks USING hnsw (embedding vector_cosine_ops);
        """
    )

    op.create_table(
        "rag_meta",
        sa.Column("key", sa.String(100), primary_key=True),
        sa.Column("value", sa.Text, nullable=False),
    )


def downgrade() -> None:
    op.drop_table("rag_meta")
    op.drop_table("document_chunks")
