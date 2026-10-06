from __future__ import annotations

import threading
import time
import uuid
from collections import OrderedDict, deque

from app.config import settings

# Per-visitor follow-up context, keyed by a server-issued UUID4. Bounded so idle
# sessions are evicted instead of growing memory forever.
_MAX_SESSIONS = 5000
_SESSION_TTL_SECONDS = 2 * 60 * 60

_SESSIONS: OrderedDict[str, tuple[float, deque]] = OrderedDict()
_LOCK = threading.Lock()


def resolve_session_id(session_id: str | None) -> str:
    """Accept only UUID4 ids we could have issued; anything else starts a fresh session."""
    if session_id:
        try:
            if uuid.UUID(session_id).version == 4:
                return str(uuid.UUID(session_id))
        except ValueError:
            pass
    return str(uuid.uuid4())


def _evict_expired(now: float) -> None:
    while _SESSIONS:
        oldest_id, (touched, _) = next(iter(_SESSIONS.items()))
        if now - touched < _SESSION_TTL_SECONDS and len(_SESSIONS) <= _MAX_SESSIONS:
            break
        del _SESSIONS[oldest_id]


def get_history(session_id: str) -> list[dict]:
    with _LOCK:
        entry = _SESSIONS.get(session_id)
        if entry is None or time.time() - entry[0] >= _SESSION_TTL_SECONDS:
            return []
        return list(entry[1])


def append_turn(session_id: str, role: str, content: str) -> None:
    now = time.time()
    with _LOCK:
        entry = _SESSIONS.pop(session_id, None)
        turns = entry[1] if entry else deque(maxlen=settings.conversation_memory_size)
        turns.append({"role": role, "content": content})
        _SESSIONS[session_id] = (now, turns)
        _evict_expired(now)
