"""
Repair messy user questions before retrieval:
- normalize whitespace / casing quirks
- fix common domain misspellings
- fuzzy-correct tokens against a lexicon built from indexed CMS text
"""

from __future__ import annotations

import re
import threading
import time
from collections import Counter
from difflib import get_close_matches

from sqlalchemy.orm import Session
from sqlalchemy import text

_WORD_RE = re.compile(r"[a-zA-Z][a-zA-Z'-]{1,}")
_SPACE_RE = re.compile(r"\s+")
_REPEAT_PUNCT_RE = re.compile(r"([?!.,])\1{1,}")

# High-frequency HCG / care domain fixes (cheap, no DB needed).
_COMMON_TYPOS: dict[str, str] = {
    "hcgfoudation": "hcg foundation",
    "hcgfoundaton": "hcg foundation",
    "foundtion": "foundation",
    "foundatoin": "foundation",
    "fondation": "foundation",
    "privacey": "privacy",
    "privcy": "privacy",
    "polcy": "policy",
    "polici": "policy",
    "cancr": "cancer",
    "cnacer": "cancer",
    "oralcancr": "oral cancer",
    "oralcanccer": "oral cancer",
    "prevenion": "prevention",
    "preventon": "prevention",
    "prevetion": "prevention",
    "donaton": "donation",
    "donaiton": "donation",
    "volunter": "volunteer",
    "volnteer": "volunteer",
    "testimonail": "testimonial",
    "patinet": "patient",
    "pateint": "patient",
    "announcment": "announcement",
    "evnt": "event",
    "eveent": "event",
    "projct": "project",
    "wat": "what",
    "wht": "what",
    "whn": "when",
    "wher": "where",
    "hw": "how",
    "teh": "the",
    "adn": "and",
    "becuase": "because",
    "becasue": "because",
    "infomation": "information",
    "informaton": "information",
    "abut": "about",
    "abot": "about",
    "whatis": "what is",
    "tellme": "tell me",
    "howdo": "how do",
    "howto": "how to",
}

_STOP = {
    "a", "an", "the", "is", "are", "was", "were", "be", "to", "of", "and", "or",
    "in", "on", "for", "with", "about", "from", "at", "by", "as", "it", "this",
    "that", "i", "me", "my", "we", "you", "your", "do", "does", "did", "can",
    "could", "would", "should", "what", "when", "where", "which", "who", "how",
    "why", "please", "pls", "plz",
}

_lexicon: set[str] = set()
_lexicon_loaded_at = 0.0
_lock = threading.Lock()
_LEXICON_TTL_SECONDS = 1800


def invalidate_lexicon() -> None:
    global _lexicon, _lexicon_loaded_at
    with _lock:
        _lexicon = set()
        _lexicon_loaded_at = 0.0


def _ensure_lexicon(db: Session) -> set[str]:
    global _lexicon, _lexicon_loaded_at
    now = time.time()
    with _lock:
        if _lexicon and now - _lexicon_loaded_at < _LEXICON_TTL_SECONDS:
            return _lexicon

    rows = db.execute(
        text("SELECT content FROM document_chunks ORDER BY created_at DESC LIMIT 400")
    ).fetchall()
    counts: Counter[str] = Counter()
    for (content,) in rows:
        for w in _WORD_RE.findall(content or ""):
            token = w.lower().strip("'")
            if len(token) >= 4 and token not in _STOP and token.isalpha():
                counts[token] += 1

    # Keep meaningful vocabulary only.
    words = {w for w, c in counts.items() if c >= 1}
    words.update(
        {
            "hcg",
            "foundation",
            "cancer",
            "privacy",
            "policy",
            "donation",
            "volunteer",
            "patient",
            "story",
            "event",
            "project",
            "prevention",
            "oral",
            "team",
            "announcement",
            "report",
            "screening",
            "treatment",
        }
    )
    with _lock:
        _lexicon = words
        _lexicon_loaded_at = now
        return _lexicon


def clean_question(question: str) -> str:
    text_q = (question or "").strip()
    text_q = text_q.replace("\u2019", "'").replace("\u2018", "'")
    text_q = _REPEAT_PUNCT_RE.sub(r"\1", text_q)
    text_q = _SPACE_RE.sub(" ", text_q)
    return text_q.strip(" \t\r\n-_|")


def _correct_token(token: str, lexicon: set[str]) -> str:
    lower = token.lower()
    if lower in _COMMON_TYPOS:
        return _COMMON_TYPOS[lower]
    if lower in _STOP or len(lower) < 4:
        return token
    if lower in lexicon:
        return token

    # Allow small typos against domain lexicon.
    cutoff = 0.78 if len(lower) <= 5 else 0.72
    matches = get_close_matches(lower, lexicon, n=1, cutoff=cutoff)
    if not matches:
        return token
    fixed = matches[0]
    if token.isupper():
        return fixed.upper()
    if token[0].isupper():
        return fixed.capitalize()
    return fixed


def repair_question(db: Session, question: str) -> tuple[str, str]:
    """
    Returns (search_query, display_question).
    search_query is typo-repaired for retrieval; display keeps user intent readable.
    """
    cleaned = clean_question(question)
    if not cleaned:
        return "", ""

    lexicon = _ensure_lexicon(db)
    words = cleaned.split(" ")
    repaired_words: list[str] = []
    for raw in words:
        # Keep trailing punctuation outside the token.
        m = re.match(r"^([A-Za-z][A-Za-z'-]*)([?!.,:;]*)$", raw)
        if not m:
            repaired_words.append(raw)
            continue
        token, punct = m.group(1), m.group(2)
        repaired_words.append(_correct_token(token, lexicon) + punct)

    repaired = _SPACE_RE.sub(" ", " ".join(repaired_words)).strip()

    # Phrase-level common glues: "oralcancr" already handled; also "hcgfoundation"
    lowered = repaired.lower()
    for bad, good in _COMMON_TYPOS.items():
        if bad in lowered.replace(" ", ""):
            # Only apply spaced phrase replacements carefully
            if " " in good and bad.replace(" ", "") in lowered.replace(" ", ""):
                repaired = re.sub(re.escape(bad), good, repaired, flags=re.I)

    if not repaired:
        repaired = cleaned
    return repaired, cleaned
