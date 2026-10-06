"""Pre-answer the chat widget's suggested questions so clicking one is instant.

Runs shortly after start-up (which also opens the DB and OpenAI connections) and
again after content syncs, debounced so a bulk reindex triggers a single run.
"""

from __future__ import annotations

import logging
import threading

from app.services import vector_store

logger = logging.getLogger(__name__)

# Must match SUGGESTIONS in frontend/src/shared/components/ChatbotWidget.tsx
SUGGESTED_QUESTIONS = [
    "How can I donate?",
    "What programs do you run?",
    "How can I volunteer?",
    "How do I contact HCG Foundation?",
]

_STARTUP_DELAY_SECONDS = 2.0
_AFTER_SYNC_DELAY_SECONDS = 20.0

_timer: threading.Timer | None = None
_timer_lock = threading.Lock()


def _run() -> None:
    from app.rag.pipeline import run_chat

    for question in SUGGESTED_QUESTIONS:
        try:
            run_chat(question)
        except Exception:
            logger.exception("Chatbot warm-up failed for %r", question)


def schedule(delay: float = _AFTER_SYNC_DELAY_SECONDS) -> None:
    global _timer
    with _timer_lock:
        if _timer is not None:
            _timer.cancel()
        _timer = threading.Timer(delay, _run)
        _timer.daemon = True
        _timer.start()


def start() -> None:
    vector_store.add_change_listener(schedule)
    schedule(_STARTUP_DELAY_SECONDS)
