"""Deprecated — RAG now uses Postgres pgvector via vector_store.

Kept as a thin re-export so any leftover imports keep working.
"""

from app.services.vector_store import (  # noqa: F401
    compute_fingerprint,
    delete_row,
    get_all_by_category,
    get_by_title_keywords,
    indexed_count,
    load_fingerprint,
    rebuild_from_documents,
    save_fingerprint,
    search,
    upsert_document,
)
