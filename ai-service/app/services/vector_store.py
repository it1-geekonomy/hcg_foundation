"""Postgres + pgvector store for HCG Foundation RAG."""

from __future__ import annotations

import hashlib
import json
from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal
from app.models.document_chunk import DocumentChunk, RagMeta
from app.services import chunker, embeddings

_FINGERPRINT_KEY = "corpus_fingerprint"


def _db() -> Session:
    return SessionLocal()


def _row_to_hit(row: DocumentChunk, similarity: float) -> dict:
    parent = f"{row.source_table}#{row.source_id}"
    return {
        "id": str(row.id),
        "content": row.content,
        "similarity": similarity,
        "title": row.title or "",
        "url": row.url or "/",
        "category": row.category or "",
        "table": row.source_table or "",
        "source_id": row.source_id or "",
        "parent_source_id": parent,
        "designation": row.designation or "",
        "slug": row.slug or "",
    }


def indexed_count() -> int:
    db = _db()
    try:
        return int(db.query(DocumentChunk).count())
    finally:
        db.close()


def load_fingerprint() -> str | None:
    db = _db()
    try:
        row = db.get(RagMeta, _FINGERPRINT_KEY)
        return row.value if row else None
    finally:
        db.close()


def save_fingerprint(value: str) -> None:
    db = _db()
    try:
        row = db.get(RagMeta, _FINGERPRINT_KEY)
        if row:
            row.value = value
        else:
            db.add(RagMeta(key=_FINGERPRINT_KEY, value=value))
        db.commit()
    finally:
        db.close()


def compute_fingerprint(docs: list[dict]) -> str:
    payload = [
        {
            "source_id": d.get("source_id"),
            "table": d.get("table"),
            "title": d.get("title"),
            "content": d.get("content"),
            "url": d.get("url"),
            "category": d.get("category"),
        }
        for d in sorted(docs, key=lambda x: f"{x.get('table')}:{x.get('source_id')}")
    ]
    raw = json.dumps(payload, ensure_ascii=True, sort_keys=True)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def delete_row(table: str, source_id: str) -> int:
    db = _db()
    try:
        deleted = (
            db.query(DocumentChunk)
            .filter(
                DocumentChunk.source_table == table,
                DocumentChunk.source_id == str(source_id),
            )
            .delete(synchronize_session=False)
        )
        db.commit()
        return int(deleted)
    finally:
        db.close()


def upsert_document(doc: dict) -> int:
    """
    Upsert one parent document as overlapping chunks.
    Required keys: table, source_id, content, title, url, category
    """
    table = doc["table"]
    source_id = str(doc["source_id"])
    content = (doc.get("content") or "").strip()
    if not content:
        return delete_row(table, source_id)

    pieces = chunker.split_text(content)
    if not pieces:
        return delete_row(table, source_id)

    vectors = embeddings.embed_batch(pieces)
    title = doc.get("title") or table
    url = doc.get("url") or "/"
    category = doc.get("category") or "Page"
    slug = doc.get("slug") or ""
    designation = doc.get("designation") or ""

    db = _db()
    try:
        db.query(DocumentChunk).filter(
            DocumentChunk.source_table == table,
            DocumentChunk.source_id == source_id,
        ).delete(synchronize_session=False)

        for i, (chunk_text, vector) in enumerate(zip(pieces, vectors)):
            db.add(
                DocumentChunk(
                    source_table=table,
                    source_id=source_id,
                    content=chunk_text,
                    chunk_index=i,
                    embedding=vector,
                    title=title,
                    url=url,
                    category=category,
                    slug=slug,
                    designation=designation,
                )
            )
        db.commit()
        return len(pieces)
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def rebuild_from_documents(docs: list[dict]) -> dict:
    db = _db()
    try:
        db.query(DocumentChunk).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()

    total_chunks = 0
    for doc in docs:
        total_chunks += upsert_document(doc)
    fp = compute_fingerprint(docs)
    save_fingerprint(fp)
    return {
        "documents": len(docs),
        "chunks": total_chunks,
        "fingerprint": fp,
    }


def search(
    query: str,
    *,
    n_results: int | None = None,
) -> list[dict]:
    k = n_results or settings.retrieval_candidate_k
    if indexed_count() == 0:
        return []

    query_vector = embeddings.embed_text(query)
    vector_literal = "[" + ",".join(str(float(v)) for v in query_vector) + "]"

    db = _db()
    try:
        rows = db.execute(
            text(
                """
                SELECT id, source_table, source_id, content, chunk_index,
                       title, url, category, slug, designation,
                       (embedding <=> CAST(:qv AS vector)) AS distance
                FROM document_chunks
                ORDER BY embedding <=> CAST(:qv AS vector)
                LIMIT :k
                """
            ),
            {"qv": vector_literal, "k": k},
        ).mappings().all()

        out: list[dict] = []
        for r in rows:
            distance = float(r["distance"])
            similarity = 1.0 - distance
            parent = f"{r['source_table']}#{r['source_id']}"
            out.append(
                {
                    "id": str(r["id"]),
                    "content": r["content"],
                    "similarity": similarity,
                    "title": r["title"] or "",
                    "url": r["url"] or "/",
                    "category": r["category"] or "",
                    "table": r["source_table"] or "",
                    "source_id": r["source_id"] or "",
                    "parent_source_id": parent,
                    "designation": r["designation"] or "",
                    "slug": r["slug"] or "",
                }
            )
        return out
    finally:
        db.close()


def get_by_title_keywords(keywords: list[str]) -> list[dict]:
    keys = [k.lower() for k in keywords if k]
    if not keys:
        return []

    db = _db()
    try:
        rows = db.query(DocumentChunk).all()
        hits: list[dict] = []
        seen_parents: set[str] = set()
        for row in rows:
            title = (row.title or "").lower()
            category = (row.category or "").lower()
            if not any(k in title or k in category for k in keys):
                continue
            parent = f"{row.source_table}#{row.source_id}"
            if parent in seen_parents:
                continue
            seen_parents.add(parent)
            hits.append(_row_to_hit(row, 0.55))
        return hits
    finally:
        db.close()


def get_all_by_category(category: str) -> list[dict]:
    db = _db()
    try:
        rows = (
            db.query(DocumentChunk)
            .filter(DocumentChunk.category == category)
            .order_by(DocumentChunk.source_id, DocumentChunk.chunk_index)
            .all()
        )
        out: list[dict] = []
        seen: set[str] = set()
        for row in rows:
            parent = f"{row.source_table}#{row.source_id}"
            if parent in seen:
                continue
            seen.add(parent)
            out.append(_row_to_hit(row, 0.5))
        return out
    finally:
        db.close()


# --- Legacy helpers used by older agent_service ---


def upsert_row(db: Session, source_table: str, source_id: str, content: str) -> int:
    return upsert_document(
        {
            "table": source_table,
            "source_id": source_id,
            "content": content,
            "title": source_table,
            "url": "/",
            "category": "Page",
        }
    )


def similarity_search(db: Session, query: str, top_k: int) -> list[dict]:
    hits = search(query, n_results=top_k)
    return [
        {
            "content": h["content"],
            "source_table": h["table"],
            "source_id": h["source_id"],
            "distance": 1.0 - float(h["similarity"]),
        }
        for h in hits
    ]


def ensure_schema() -> None:
    """No-op placeholder; schema is managed by Alembic."""
    _: Any = None
