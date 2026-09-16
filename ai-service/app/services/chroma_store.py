"""Persistent Chroma vector store for HCG Foundation RAG."""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
from typing import Any

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.config import settings
from app.services import chunker, embeddings

_client: chromadb.ClientAPI | None = None
_collection = None
_FINGERPRINT_FILE = "fingerprint.json"


def _ensure() -> Any:
    global _client, _collection
    if _collection is not None:
        return _collection

    persist = Path(settings.chroma_persist_dir)
    persist.mkdir(parents=True, exist_ok=True)
    _client = chromadb.PersistentClient(
        path=str(persist),
        settings=ChromaSettings(anonymized_telemetry=False),
    )
    _collection = _client.get_or_create_collection(
        name=settings.chroma_collection,
        metadata={"hnsw:space": "cosine"},
    )
    return _collection


def indexed_count() -> int:
    return int(_ensure().count())


def fingerprint_path() -> Path:
    return Path(settings.chroma_persist_dir) / _FINGERPRINT_FILE


def load_fingerprint() -> str | None:
    path = fingerprint_path()
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8")).get("hash")
    except Exception:
        return None


def save_fingerprint(value: str) -> None:
    path = fingerprint_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"hash": value}), encoding="utf-8")


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


def reset_collection() -> None:
    global _collection
    client = _ensure()._client if hasattr(_ensure(), "_client") else None
    # Recreate via PersistentClient
    persist = Path(settings.chroma_persist_dir)
    client = chromadb.PersistentClient(
        path=str(persist),
        settings=ChromaSettings(anonymized_telemetry=False),
    )
    try:
        client.delete_collection(settings.chroma_collection)
    except Exception:
        pass
    _collection = client.get_or_create_collection(
        name=settings.chroma_collection,
        metadata={"hnsw:space": "cosine"},
    )


def delete_row(table: str, source_id: str) -> int:
    col = _ensure()
    parent = f"{table}#{source_id}"
    try:
        existing = col.get(
            where={
                "$and": [
                    {"table": {"$eq": table}},
                    {"source_id": {"$eq": source_id}},
                ]
            }
        )
        ids = existing.get("ids") or []
        if ids:
            col.delete(ids=ids)
            return len(ids)
    except Exception:
        pass

    # Fallback: id prefix scan
    try:
        all_ids = col.get(include=[]).get("ids") or []
    except Exception:
        return 0
    to_delete = [i for i in all_ids if i.startswith(f"{parent}::")]
    if to_delete:
        col.delete(ids=to_delete)
    return len(to_delete)


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

    delete_row(table, source_id)

    pieces = chunker.split_text(content)
    if not pieces:
        return 0

    parent = f"{table}#{source_id}"
    ids = [f"{parent}::{i}" for i in range(len(pieces))]
    vectors = embeddings.embed_batch(pieces)
    metadatas = []
    for i, _ in enumerate(pieces):
        metadatas.append(
            {
                "table": table,
                "source_id": source_id,
                "parent_source_id": parent,
                "title": doc.get("title") or table,
                "url": doc.get("url") or "/",
                "category": doc.get("category") or "Page",
                "slug": doc.get("slug") or "",
                "designation": doc.get("designation") or "",
                "chunk_index": i,
            }
        )

    _ensure().upsert(
        ids=ids,
        embeddings=vectors,
        documents=pieces,
        metadatas=metadatas,
    )
    return len(pieces)


def rebuild_from_documents(docs: list[dict]) -> dict:
    reset_collection()
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
    col = _ensure()
    k = n_results or settings.retrieval_candidate_k
    if col.count() == 0:
        return []

    vector = embeddings.embed_text(query)
    result = col.query(
        query_embeddings=[vector],
        n_results=min(k, max(col.count(), 1)),
        include=["documents", "metadatas", "distances"],
    )

    docs = result.get("documents", [[]])[0]
    metas = result.get("metadatas", [[]])[0]
    distances = result.get("distances", [[]])[0]
    ids = result.get("ids", [[]])[0]

    out: list[dict] = []
    for doc, meta, dist, _id in zip(docs, metas, distances, ids):
        # cosine distance in Chroma => similarity = 1 - distance
        similarity = 1.0 - float(dist)
        out.append(
            {
                "id": _id,
                "content": doc,
                "similarity": similarity,
                "title": meta.get("title") or "",
                "url": meta.get("url") or "/",
                "category": meta.get("category") or "",
                "table": meta.get("table") or "",
                "source_id": meta.get("source_id") or "",
                "parent_source_id": meta.get("parent_source_id")
                or f"{meta.get('table')}#{meta.get('source_id')}",
                "designation": meta.get("designation") or "",
                "slug": meta.get("slug") or "",
            }
        )
    return out


def get_by_title_keywords(keywords: list[str]) -> list[dict]:
    """Scan metadata titles for keyword hits (authority / keyword injection)."""
    col = _ensure()
    if col.count() == 0:
        return []
    data = col.get(include=["documents", "metadatas"])
    ids = data.get("ids") or []
    docs = data.get("documents") or []
    metas = data.get("metadatas") or []
    keys = [k.lower() for k in keywords if k]
    hits: list[dict] = []
    seen_parents: set[str] = set()
    for _id, doc, meta in zip(ids, docs, metas):
        title = (meta.get("title") or "").lower()
        category = (meta.get("category") or "").lower()
        if not any(k in title or k in category for k in keys):
            continue
        parent = meta.get("parent_source_id") or f"{meta.get('table')}#{meta.get('source_id')}"
        if parent in seen_parents:
            continue
        seen_parents.add(parent)
        hits.append(
            {
                "id": _id,
                "content": doc,
                "similarity": 0.55,
                "title": meta.get("title") or "",
                "url": meta.get("url") or "/",
                "category": meta.get("category") or "",
                "table": meta.get("table") or "",
                "source_id": meta.get("source_id") or "",
                "parent_source_id": parent,
                "designation": meta.get("designation") or "",
                "slug": meta.get("slug") or "",
            }
        )
    return hits


def get_all_by_category(category: str) -> list[dict]:
    col = _ensure()
    if col.count() == 0:
        return []
    try:
        data = col.get(
            where={"category": category},
            include=["documents", "metadatas"],
        )
    except Exception:
        data = col.get(include=["documents", "metadatas"])
        filtered_ids, filtered_docs, filtered_metas = [], [], []
        for i, m in enumerate(data.get("metadatas") or []):
            if (m.get("category") or "") == category:
                filtered_ids.append(data["ids"][i])
                filtered_docs.append(data["documents"][i])
                filtered_metas.append(m)
        data = {
            "ids": filtered_ids,
            "documents": filtered_docs,
            "metadatas": filtered_metas,
        }

    out: list[dict] = []
    seen: set[str] = set()
    for _id, doc, meta in zip(
        data.get("ids") or [],
        data.get("documents") or [],
        data.get("metadatas") or [],
    ):
        parent = meta.get("parent_source_id") or f"{meta.get('table')}#{meta.get('source_id')}"
        if parent in seen:
            continue
        seen.add(parent)
        out.append(
            {
                "id": _id,
                "content": doc,
                "similarity": 0.5,
                "title": meta.get("title") or "",
                "url": meta.get("url") or "/",
                "category": meta.get("category") or "",
                "table": meta.get("table") or "",
                "source_id": meta.get("source_id") or "",
                "parent_source_id": parent,
                "designation": meta.get("designation") or "",
                "slug": meta.get("slug") or "",
            }
        )
    return out
