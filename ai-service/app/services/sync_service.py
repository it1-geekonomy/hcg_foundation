from __future__ import annotations

from app.services import corpus, site_pages, vector_store

# Indexed by full_sync itself, never by CMS table sync.
_CURATED_TABLES = {"static", "knowledge", "site"}


def prune_cms_table(table: str, keep_ids: list[str]) -> dict:
    """Drop indexed rows of a CMS table that are no longer published."""
    if table in _CURATED_TABLES:
        return {"status": "skipped", "table": table, "chunks_deleted": 0}
    keep = {(table, str(i)) for i in keep_ids}
    deleted = vector_store.delete_stale({table}, keep)
    return {"status": "pruned", "table": table, "chunks_deleted": deleted}


def upsert_cms_event(event: dict) -> dict:
    action = event.get("action")
    table = event["table"]
    source_id = str(event["source_id"])

    if action == "delete":
        deleted = vector_store.delete_row(table, source_id)
        return {
            "status": "deleted",
            "table": table,
            "source_id": source_id,
            "chunks_deleted": deleted,
        }

    doc = {
        "table": table,
        "source_id": source_id,
        "content": event.get("content") or "",
        "title": event.get("title") or table,
        "url": event.get("url") or "/",
        "category": event.get("category") or "Page",
        "slug": event.get("slug") or "",
        "designation": event.get("designation") or "",
    }
    chunks = vector_store.upsert_document(doc)
    return {
        "status": "upserted",
        "table": table,
        "source_id": source_id,
        "chunks_stored": chunks,
    }


def full_sync(force: bool = False) -> dict:
    """
    Rebuild static + knowledge corpus into Postgres/pgvector.
    CMS rows are upserted separately by NestJS; this endpoint refreshes
    curated pages/files and can force a fingerprint rewrite.
    """
    site_docs, site_failed = site_pages.load_site_pages()
    broken = site_pages.broken_links(skip={d["source_id"] for d in site_docs})
    docs = corpus.load_corpus_documents() + site_docs
    fp = vector_store.compute_fingerprint(docs)
    current = vector_store.load_fingerprint()

    if not force and current == fp and vector_store.indexed_count() > 0:
        return {
            "status": "skipped",
            "reason": "fingerprint_unchanged",
            "fingerprint": fp,
            "indexed_chunks": vector_store.indexed_count(),
            "corpus_documents": len(docs),
            "site_pages_failed": site_failed,
            "broken_links": broken,
        }

    # Only documents whose text changed are re-embedded (all of them when forced)
    for doc in docs:
        vector_store.upsert_document(doc, force=force)

    # Curated docs that were renamed or removed would otherwise linger with old titles/URLs
    # Pages that failed to load keep their previously indexed text
    keep = {(d["table"], str(d["source_id"])) for d in docs}
    keep |= {("site", path) for path in site_failed}
    stale = vector_store.delete_stale(_CURATED_TABLES, keep)

    vector_store.save_fingerprint(fp)
    return {
        "status": "synced",
        "fingerprint": fp,
        "corpus_documents": len(docs),
        "site_pages_indexed": len(site_docs),
        "site_pages_failed": site_failed,
        "broken_links": broken,
        "stale_chunks_deleted": stale,
        "indexed_chunks": vector_store.indexed_count(),
    }
