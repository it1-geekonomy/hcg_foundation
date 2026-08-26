"""
In-process answer cache:
  1) Exact match on normalized question  → zero LLM / zero embed (if embedding cached)
  2) Semantic match on query embedding   → zero LLM (local embed only)

Invalidated whenever CMS content syncs so answers never go stale.
"""

from __future__ import annotations

import hashlib
import re
import threading
import time
from collections import OrderedDict
from dataclasses import dataclass
from typing import Any

import numpy as np

from app.config import settings


_NORMALIZE_RE = re.compile(r"[^a-z0-9\s]+")
_SPACE_RE = re.compile(r"\s+")


def normalize_question(question: str) -> str:
    text = (question or "").lower().strip()
    text = _NORMALIZE_RE.sub(" ", text)
    return _SPACE_RE.sub(" ", text).strip()


def exact_key(question: str) -> str:
    return hashlib.sha256(normalize_question(question).encode("utf-8")).hexdigest()


def _cosine(a: np.ndarray, b: np.ndarray) -> float:
    denom = float(np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


@dataclass
class CacheEntry:
    answer: str
    sources: list[str]
    embedding: np.ndarray | None
    created_at: float


class AnswerCache:
    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._exact: OrderedDict[str, CacheEntry] = OrderedDict()
        self._hits = 0
        self._misses = 0

    def clear(self) -> None:
        with self._lock:
            self._exact.clear()

    def stats(self) -> dict[str, Any]:
        with self._lock:
            return {
                "size": len(self._exact),
                "hits": self._hits,
                "misses": self._misses,
                "hit_rate": round(self._hits / max(1, self._hits + self._misses), 3),
            }

    def _evict_expired_unlocked(self) -> None:
        ttl = settings.answer_cache_ttl_seconds
        if ttl <= 0:
            return
        now = time.time()
        expired = [k for k, v in self._exact.items() if now - v.created_at > ttl]
        for k in expired:
            del self._exact[k]

    def _touch_unlocked(self, key: str, entry: CacheEntry) -> None:
        self._exact.move_to_end(key)
        self._exact[key] = entry

    def get_exact(self, question: str) -> dict[str, Any] | None:
        if not settings.answer_cache_enabled:
            return None
        key = exact_key(question)
        with self._lock:
            self._evict_expired_unlocked()
            entry = self._exact.get(key)
            if not entry:
                self._misses += 1
                return None
            self._touch_unlocked(key, entry)
            self._hits += 1
            return {
                "answer": entry.answer,
                "sources": list(entry.sources),
                "cached": True,
                "cache": "exact",
            }

    def get_semantic(self, question: str, query_embedding: list[float]) -> dict[str, Any] | None:
        if not settings.answer_cache_enabled or not settings.answer_cache_semantic:
            return None
        threshold = settings.answer_cache_similarity_threshold
        q = np.asarray(query_embedding, dtype=np.float32)
        best_key = None
        best_score = -1.0
        best_entry: CacheEntry | None = None

        with self._lock:
            self._evict_expired_unlocked()
            for key, entry in self._exact.items():
                if entry.embedding is None:
                    continue
                score = _cosine(q, entry.embedding)
                if score > best_score:
                    best_score = score
                    best_key = key
                    best_entry = entry

            if best_entry is None or best_key is None or best_score < threshold:
                return None

            self._touch_unlocked(best_key, best_entry)
            self._hits += 1
            return {
                "answer": best_entry.answer,
                "sources": list(best_entry.sources),
                "cached": True,
                "cache": "semantic",
                "similarity": round(best_score, 4),
            }

    def put(
        self,
        question: str,
        answer: str,
        sources: list[str],
        query_embedding: list[float] | None = None,
    ) -> None:
        if not settings.answer_cache_enabled:
            return
        key = exact_key(question)
        emb = (
            np.asarray(query_embedding, dtype=np.float32)
            if query_embedding is not None
            else None
        )
        entry = CacheEntry(
            answer=answer,
            sources=list(sources),
            embedding=emb,
            created_at=time.time(),
        )
        with self._lock:
            if key in self._exact:
                del self._exact[key]
            self._exact[key] = entry
            while len(self._exact) > settings.answer_cache_max_entries:
                self._exact.popitem(last=False)


answer_cache = AnswerCache()
