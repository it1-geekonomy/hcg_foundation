from sqlalchemy.orm import Session
from sqlalchemy import text

from app.models.document_chunk import DocumentChunk
from app.services import chunker, embeddings


def upsert_row(db: Session, source_table: str, source_id: str, content: str) -> int:
    """
    Re-indexes one CMS row: deletes any existing chunks for it, then chunks +
    embeds the new content and stores fresh rows. Called on INSERT/UPDATE webhooks.
    Returns the number of chunks stored.
    """
    db.query(DocumentChunk).filter(
        DocumentChunk.source_table == source_table,
        DocumentChunk.source_id == source_id,
    ).delete()

    if not content or not content.strip():
        db.commit()
        return 0

    chunks = chunker.split_text(content)
    if not chunks:
        db.commit()
        return 0

    vectors = embeddings.embed_batch(chunks)

    for i, (chunk_text, vector) in enumerate(zip(chunks, vectors)):
        db.add(
            DocumentChunk(
                source_table=source_table,
                source_id=source_id,
                content=chunk_text,
                chunk_index=i,
                embedding=vector,
            )
        )

    db.commit()
    return len(chunks)


def delete_row(db: Session, source_table: str, source_id: str) -> None:
    """Deletes all chunks for one CMS row. Called on DELETE webhooks."""
    db.query(DocumentChunk).filter(
        DocumentChunk.source_table == source_table,
        DocumentChunk.source_id == source_id,
    ).delete()
    db.commit()


def similarity_search(db: Session, query: str, top_k: int) -> list[dict]:
    """
    Embeds the query and returns the top_k most similar chunks using
    pgvector's cosine distance operator (<=>). Lower distance = more similar.
    """
    query_vector = embeddings.embed_text(query)
    vector_literal = f"[{','.join(str(v) for v in query_vector)}]"

    rows = db.execute(
        text(
            """
            SELECT content, source_table, source_id,
                   embedding <=> :qv AS distance
            FROM document_chunks
            ORDER BY embedding <=> :qv
            LIMIT :k
            """
        ),
        {"qv": vector_literal, "k": top_k},
    ).fetchall()

    return [
        {
            "content": r.content,
            "source_table": r.source_table,
            "source_id": r.source_id,
            "distance": float(r.distance),
        }
        for r in rows
    ]
