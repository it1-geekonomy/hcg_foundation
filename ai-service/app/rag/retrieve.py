from __future__ import annotations

import re

from app.config import settings
from app.services import vector_store

# "who is Ananya Nair", "tell me about Meera Sreekumar": semantic search ranks a
# bare name poorly, so the named phrase is also matched word-for-word.
_NAME_QUESTION = re.compile(
    r"^\s*(?:who|what)\s+(?:is|are|was|were)\s+"
    r"|^\s*(?:tell\s+me|know)\s+(?:more\s+)?about\s+"
    r"|^\s*(?:and\s+|what\s+|how\s+)?about\s+",
    re.I,
)
_NOT_A_NAME = {"the", "a", "an", "your", "our", "you", "we", "this", "that", "it", "hcg"}

# CMS items whose title names them (patients, team members, events...): if the
# question contains one, that item is what the visitor is asking about.
_TITLED_TABLES = {
    "patient_stories",
    "patient_testimonials",
    "teams",
    "events",
    "projects",
    "awards",
    "blogs",
}


def _named_phrases(queries: list[str]) -> set[str]:
    phrases: set[str] = set()
    for q in queries:
        m = _NAME_QUESTION.match(q)
        if not m:
            continue
        words = re.sub(r"[^\w\s]", " ", q[m.end():]).split()
        phrase = " ".join(words)
        if 1 <= len(words) <= 4 and len(phrase) >= 4 and words[0].lower() not in _NOT_A_NAME:
            phrases.add(phrase)
    return phrases


AUTHORITY_KEYWORDS = {
    "contact": ["contact", "contact us"],
    "donate": ["donate", "donate now"],
    "patient_aid": ["patient aid", "patient-aid"],
    "internship": ["internship", "volunteer, intern"],
    "volunteer": ["volunteer"],
    "hospital": ["patient aid"],
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


def hybrid_retrieve(queries: list[str], intents: set[str], question: str = "") -> list[dict]:
    merged: dict[str, dict] = {}

    for q in queries:
        for hit in vector_store.search(q, n_results=settings.retrieval_candidate_k):
            parent = hit["parent_source_id"]
            prev = merged.get(parent)
            if not prev or hit["similarity"] > prev["similarity"]:
                merged[parent] = hit

    # The rewritten queries often pad the name ("... associated with the HCG Foundation?")
    named: list[dict] = []
    for phrase in _named_phrases([question, *queries]):
        named.extend(vector_store.get_by_phrase(phrase))
    if question:
        named.extend(vector_store.get_by_title_in_text(question, _TITLED_TABLES))
    for hit in named:
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
