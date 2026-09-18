from __future__ import annotations

from app.config import settings
from app.services import vector_store


AUTHORITY_KEYWORDS = {
    "contact": ["contact", "contact us"],
    "donate": ["donate", "donate now"],
    "patient_aid": ["patient aid", "patient-aid"],
    "internship": ["internship"],
    "privacy": ["privacy"],
    "terms": ["terms"],
    "founder": ["ajaikumar", "founder"],
    "fcra": ["fcra", "bank", "ifsc", "swift"],
    "bank": ["fcra", "bank", "ifsc", "swift", "account"],
    "pan": ["pan"],
    "certificate": [
        "80g",
        "12a",
        "csr",
        "darpan",
        "registration",
        "pan",
        "urn",
        "gst",
    ],
    "programs": ["mission", "program", "overview", "screening", "hpv", "ventilator"],
}


def hybrid_retrieve(queries: list[str], intents: set[str]) -> list[dict]:
    merged: dict[str, dict] = {}

    for q in queries:
        for hit in vector_store.search(q, n_results=settings.retrieval_candidate_k):
            parent = hit["parent_source_id"]
            prev = merged.get(parent)
            if not prev or hit["similarity"] > prev["similarity"]:
                merged[parent] = hit

    # Keyword title hints
    keyword_bag: list[str] = []
    for intent in intents:
        keyword_bag.extend(AUTHORITY_KEYWORDS.get(intent, []))
    if keyword_bag:
        for hit in vector_store.get_by_title_keywords(keyword_bag):
            parent = hit["parent_source_id"]
            prev = merged.get(parent)
            if not prev or hit["similarity"] > prev["similarity"]:
                merged[parent] = hit

    # Category expansion
    if "trustees" in intents or "founder" in intents:
        for hit in vector_store.get_all_by_category("Trustee"):
            parent = hit["parent_source_id"]
            if parent not in merged:
                merged[parent] = hit
    if "events" in intents:
        for hit in vector_store.get_all_by_category("Event"):
            parent = hit["parent_source_id"]
            if parent not in merged:
                merged[parent] = hit
    if "programs" in intents:
        for cat in ("Project", "Page", "Award"):
            for hit in vector_store.get_all_by_category(cat):
                parent = hit["parent_source_id"]
                if parent not in merged:
                    merged[parent] = hit

    return list(merged.values())
