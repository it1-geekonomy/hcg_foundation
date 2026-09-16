from __future__ import annotations

from collections import defaultdict, deque

from app.config import settings

_SESSIONS: dict[str, deque] = defaultdict(
    lambda: deque(maxlen=settings.conversation_memory_size)
)


def get_history(session_id: str) -> list[dict]:
    return list(_SESSIONS[session_id])


def append_turn(session_id: str, role: str, content: str) -> None:
    _SESSIONS[session_id].append({"role": role, "content": content})
