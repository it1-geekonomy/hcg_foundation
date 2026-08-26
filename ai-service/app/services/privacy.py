"""Privacy / confidentiality barriers for the chatbot."""

from __future__ import annotations

import re

# Questions that must be refused even if something similar exists in CMS text.
_BLOCKED_PATTERNS = [
    r"\b(password|otp|api[_\s-]?key|secret|token|credential)\b",
    r"\b(pan|aadhaar|aadhar|passport|bank\s*account|ifsc|credit\s*card|debit\s*card)\b",
    r"\b(donor|donar|donation)\b.*\b(list|database|email|phone|mobile|address|pan|amount)\b",
    r"\b(patient)\b.*\b(phone|mobile|email|address|medical\s*record|diagnosis|mrn|id)\b",
    r"\b(staff|employee|team)\b.*\b(phone|mobile|email|home\s*address|salary|personal)\b",
    r"\b(give|share|show|list|dump)\b.*\b(emails?|phone\s*numbers?|contacts?|personal\s*data)\b",
    r"\b(leads?|intern(ship)?\s*applicants?|volunteer\s*applicants?)\b",
    r"\b(export|download)\b.*\b(database|users?|donors?|patients?)\b",
]

_BLOCKED_RE = [re.compile(p, re.I) for p in _BLOCKED_PATTERNS]

# Scrub from retrieved context before the LLM sees it.
_REDACTIONS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I), "[email redacted]"),
    (re.compile(r"\b(?:\+?\d{1,3}[-.\s]?)?(?:\d{10}|\d{3}[-.\s]\d{3}[-.\s]\d{4})\b"), "[phone redacted]"),
    (re.compile(r"\b[A-Z]{5}\d{4}[A-Z]\b"), "[PAN redacted]"),
    (re.compile(r"\b\d{4}\s?\d{4}\s?\d{4}\b"), "[ID redacted]"),
    (re.compile(r"\b(?:\d[ -]*?){13,19}\b"), "[card redacted]"),
]

REFUSAL_MESSAGE = (
    "I cannot share private or confidential information "
    "(personal contacts, donor/patient records, financial identifiers, or internal data). "
    "I can help with public information about HCG Foundation programs, events, "
    "and published stories. For sensitive requests, please contact the foundation directly."
)


def is_blocked_question(question: str) -> bool:
    text = (question or "").strip()
    if not text:
        return False
    return any(p.search(text) for p in _BLOCKED_RE)


def redact_pii(text: str) -> str:
    out = text or ""
    for pattern, replacement in _REDACTIONS:
        out = pattern.sub(replacement, out)
    return out
