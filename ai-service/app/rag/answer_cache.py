"""Cache of opening-question answers (no conversation history), so repeats are instant.

Entries are keyed by the normalised question, today's date (event answers depend on
it) and the index version, so any content sync makes old answers unreachable.
"""

from __future__ import annotations

import re
import threading
import time
from collections import OrderedDict
from datetime import date

from app.rag import constants as C
from app.services import vector_store

_MAX_ENTRIES = 500
_TTL_SECONDS = 6 * 60 * 60

# Fallbacks can come from a transient OpenAI error, so they are never cached.
_UNCACHEABLE = {C.FALLBACK_ANSWER.strip(), C.OUT_OF_SCOPE_ANSWER.strip(), C.SETUP_ANSWER.strip()}

_cache: OrderedDict[tuple, tuple[float, dict]] = OrderedDict()
_lock = threading.Lock()


def _key(question: str, version: int | None = None) -> tuple:
    normalised = " ".join(re.sub(r"[^\w\s]", " ", question.lower()).split())
    if version is None:
        version = vector_store.index_version()
    return (normalised, date.today().isoformat(), version)


def get(question: str) -> dict | None:
    key = _key(question)
    with _lock:
        entry = _cache.get(key)
        if entry is None:
            return None
        if time.time() - entry[0] >= _TTL_SECONDS:
            del _cache[key]
            return None
        _cache.move_to_end(key)
        return {"answer": entry[1]["answer"], "sources": list(entry[1]["sources"])}


def put(question: str, answer: str, sources: list[dict], version: int) -> None:
    """``version`` is the index version read before answering, so a sync mid-answer isn't masked."""
    if not answer.strip() or answer.strip() in _UNCACHEABLE:
        return
    with _lock:
        _cache[_key(question, version)] = (time.time(), {"answer": answer, "sources": list(sources)})
        while len(_cache) > _MAX_ENTRIES:
            _cache.popitem(last=False)
