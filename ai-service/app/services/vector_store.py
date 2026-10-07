"""Postgres + pgvector store for HCG Foundation RAG."""

from __future__ import annotations

import hashlib
import json
import re
import threading
from typing import Any, Callable

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal
from app.models.document_chunk import DocumentChunk, RagMeta
from app.services import chunker, embeddings

_FINGERPRINT_KEY = "corpus_fingerprint"

# Bumped on every real index write so answer caches know when they are stale.
# Process-local: the AI service runs as a single uvicorn worker.
_index_version = 0
_version_lock = threading.Lock()
_change_listeners: list[Callable[[], None]] = []


def index_version() -> int:
    return _index_version


def add_change_listener(listener: Callable[[], None]) -> None:
    _change_listeners.append(listener)


def _index_changed() -> None:
    global _index_version
    with _version_lock:
        _index_version += 1
    for listener in _change_listeners:
        try:
            listener()
        except Exception:
            pass


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
        "chunk_index": row.chunk_index,
    }


def with_neighbor_chunks(hits: list[dict]) -> list[dict]:
    """Give each hit the chunks around it: retrieval keeps one chunk per document,
    and an answer often spans two (a list in one chunk, its last items in the next)."""
    db = _db()
    try:
        out: list[dict] = []
        for hit in hits:
            idx = hit.get("chunk_index")
            if idx is None or hit.get("expanded"):
                out.append(hit)
                continue
            rows = (
                db.query(DocumentChunk.chunk_index, DocumentChunk.content)
                .filter(
                    DocumentChunk.source_table == hit["table"],
                    DocumentChunk.source_id == hit["source_id"],
                    DocumentChunk.chunk_index.between(idx - 1, idx + 1),
                )
                .order_by(DocumentChunk.chunk_index)
                .all()
            )
            item = dict(hit)
            if len(rows) > 1:
                item["content"] = "\n".join(content for _, content in rows)
            out.append(item)
        return out
    finally:
        db.close()


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


def _lock_document(db: Session, table: str, source_id: str) -> None:
    """Serialize writers of one document (instant CMS sync vs periodic reconcile)."""
    db.execute(
        text("SELECT pg_advisory_xact_lock(hashtext(:k))"),
        {"k": f"{table}#{source_id}"},
    )


def delete_row(table: str, source_id: str) -> int:
    db = _db()
    try:
        _lock_document(db, table, str(source_id))
        deleted = (
            db.query(DocumentChunk)
            .filter(
                DocumentChunk.source_table == table,
                DocumentChunk.source_id == str(source_id),
            )
            .delete(synchronize_session=False)
        )
        db.commit()
        if deleted:
            _index_changed()
        return int(deleted)
    finally:
        db.close()


def delete_stale(tables: set[str], keep: set[tuple[str, str]]) -> int:
    """Delete chunks from ``tables`` whose (table, source_id) is no longer in ``keep``."""
    db = _db()
    try:
        existing = (
            db.query(DocumentChunk.source_table, DocumentChunk.source_id)
            .filter(DocumentChunk.source_table.in_(tables))
            .distinct()
            .all()
        )
        deleted = 0
        for table, source_id in existing:
            if (table, source_id) in keep:
                continue
            deleted += (
                db.query(DocumentChunk)
                .filter(
                    DocumentChunk.source_table == table,
                    DocumentChunk.source_id == source_id,
                )
                .delete(synchronize_session=False)
            )
        db.commit()
        if deleted:
            _index_changed()
        return int(deleted)
    finally:
        db.close()


def _is_unchanged(table: str, source_id: str, pieces: list[str], meta: tuple) -> bool:
    db = _db()
    try:
        rows = (
            db.query(
                DocumentChunk.content,
                DocumentChunk.title,
                DocumentChunk.url,
                DocumentChunk.category,
                DocumentChunk.slug,
                DocumentChunk.designation,
            )
            .filter(
                DocumentChunk.source_table == table,
                DocumentChunk.source_id == source_id,
            )
            .order_by(DocumentChunk.chunk_index)
            .all()
        )
        return [r[0] for r in rows] == pieces and all(
            (r[1] or "", r[2] or "", r[3] or "", r[4] or "", r[5] or "") == meta for r in rows
        )
    finally:
        db.close()


def upsert_document(doc: dict, force: bool = False) -> int:
    """
    Upsert one parent document as overlapping chunks.
    Required keys: table, source_id, content, title, url, category
    Unchanged documents are left alone (no embedding call) unless ``force``.
    """
    table = doc["table"]
    source_id = str(doc["source_id"])
    content = (doc.get("content") or "").strip()
    if not content:
        return delete_row(table, source_id)

    pieces = chunker.split_text(content)
    if not pieces:
        return delete_row(table, source_id)

    title = doc.get("title") or table
    url = doc.get("url") or "/"
    category = doc.get("category") or "Page"
    slug = doc.get("slug") or ""
    designation = doc.get("designation") or ""

    if not force and _is_unchanged(table, source_id, pieces, (title, url, category, slug, designation)):
        return len(pieces)

    vectors = embeddings.embed_batch(pieces)

    db = _db()
    try:
        _lock_document(db, table, source_id)
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
        _index_changed()
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
        _index_changed()
    finally:
        db.close()

    total_chunks = 0
    for doc in docs:
        total_chunks += upsert_document(doc, force=True)
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
    query_vector: list[float] | None = None,
) -> list[dict]:
    k = n_results or settings.retrieval_candidate_k
    if indexed_count() == 0:
        return []

    if query_vector is None:
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
                    "chunk_index": r["chunk_index"],
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


def get_by_phrase(phrase: str, max_parents: int = 3) -> list[dict]:
    """Chunks containing `phrase` as whole words, e.g. a person's name.

    Returns nothing when the phrase appears in more than `max_parents`
    documents: then it is a common term, not a name worth boosting.
    """
    words = [w for w in "".join(c if c.isalnum() else " " for c in phrase).split() if w]
    if not words:
        return []
    pattern = r"\m" + r"\s+".join(words) + r"\M"

    db = _db()
    try:
        rows = (
            db.query(DocumentChunk)
            .filter(
                text("(document_chunks.content ~* :p OR document_chunks.title ~* :p)")
            )
            .params(p=pattern)
            .order_by(DocumentChunk.source_table, DocumentChunk.source_id, DocumentChunk.chunk_index)
            .all()
        )
        first: dict[str, DocumentChunk] = {}
        for row in rows:
            first.setdefault(f"{row.source_table}#{row.source_id}", row)
        if len(first) > max_parents:
            return []
        return [_named_hit(db, row) for row in first.values()]
    finally:
        db.close()


def get_by_title_in_text(question: str, tables: set[str], max_parents: int = 3) -> list[dict]:
    """Documents from `tables` whose title appears in the question, e.g. "what about Sangamesh"."""
    db = _db()
    try:
        rows = (
            db.query(DocumentChunk)
            .filter(DocumentChunk.source_table.in_(tables))
            .order_by(DocumentChunk.source_table, DocumentChunk.source_id, DocumentChunk.chunk_index)
            .all()
        )
        first: dict[str, DocumentChunk] = {}
        for row in rows:
            title = (row.title or "").strip()
            if len(title) < 4:
                continue
            words = r"\s+".join(re.escape(w) for w in title.split())
            if re.search(rf"\b{words}\b", question, re.I):
                first.setdefault(f"{row.source_table}#{row.source_id}", row)
        if not first or len(first) > max_parents:
            return []
        return [_named_hit(db, row) for row in first.values()]
    finally:
        db.close()


def list_titles(source_table: str) -> list[str]:
    """One title per indexed (i.e. published) item of the table, A-Z."""
    db = _db()
    try:
        rows = (
            db.query(DocumentChunk.source_id, DocumentChunk.title)
            .filter(DocumentChunk.source_table == source_table)
            .distinct()
            .all()
        )
        titles = {source_id: (title or "").strip() for source_id, title in rows}
        return sorted((t for t in titles.values() if t), key=str.lower)
    finally:
        db.close()


def documents(source_table: str) -> list[dict]:
    """Every indexed document of a table, with its chunks joined back in order."""
    db = _db()
    try:
        rows = (
            db.query(DocumentChunk)
            .filter(DocumentChunk.source_table == source_table)
            .order_by(DocumentChunk.source_id, DocumentChunk.chunk_index)
            .all()
        )
        docs: dict[str, dict] = {}
        for row in rows:
            doc = docs.get(row.source_id)
            if doc:
                doc["content"] += "\n" + (row.content or "")
                continue
            docs[row.source_id] = {
                "table": source_table,
                "source_id": row.source_id,
                "title": (row.title or "").strip(),
                "url": row.url or "",
                "category": row.category or "",
                "designation": (row.designation or "").strip(),
                "content": row.content or "",
            }
        return list(docs.values())
    finally:
        db.close()


def chunks_matching(pattern: str) -> list[dict]:
    """Every indexed chunk whose text matches a case-insensitive Postgres regex."""
    db = _db()
    try:
        rows = (
            db.query(
                DocumentChunk.source_table,
                DocumentChunk.source_id,
                DocumentChunk.title,
                DocumentChunk.url,
                DocumentChunk.content,
            )
            .filter(text("document_chunks.content ~* :p"))
            .params(p=pattern)
            .order_by(DocumentChunk.title)
            .all()
        )
        return [
            {"table": t, "source_id": s, "title": title or "", "url": url or "", "content": content or ""}
            for t, s, title, url, content in rows
        ]
    finally:
        db.close()


def get_by_pattern(pattern: str, rank_terms: list[str], max_parents: int = 3) -> list[dict]:
    """Documents with a chunk matching a Postgres regex, best first by how many of
    ``rank_terms`` that chunk mentions."""
    db = _db()
    try:
        rows = (
            db.query(DocumentChunk)
            .filter(text("document_chunks.content ~* :p"))
            .params(p=pattern)
            .all()
        )
        best: dict[str, tuple[int, DocumentChunk]] = {}
        for row in rows:
            lower = (row.content or "").lower()
            score = sum(1 for t in rank_terms if t in lower)
            parent = f"{row.source_table}#{row.source_id}"
            if parent not in best or score > best[parent][0]:
                best[parent] = (score, row)
        top = sorted(best.values(), key=lambda item: item[0], reverse=True)[:max_parents]
        return [_named_hit(db, row) for _, row in top]
    finally:
        db.close()


def _named_hit(db: Session, row: DocumentChunk) -> dict:
    hit = _row_to_hit(row, 0.9)
    # A name near the end of a chunk has its details in the next one
    nxt = (
        db.query(DocumentChunk)
        .filter(
            DocumentChunk.source_table == row.source_table,
            DocumentChunk.source_id == row.source_id,
            DocumentChunk.chunk_index == row.chunk_index + 1,
        )
        .first()
    )
    if nxt:
        hit["content"] = f"{row.content}\n{nxt.content}"
    hit["expanded"] = True
    return hit


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
