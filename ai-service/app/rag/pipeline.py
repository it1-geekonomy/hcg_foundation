from __future__ import annotations

import time
import uuid

from app.config import settings
from app.rag import constants as C
from app.rag.generate import generate_answer, recover_if_needed
from app.rag.intents import detect_intents, match_fast_intent
from app.rag.memory import append_turn, get_history
from app.rag.normalize import normalize_for_retrieval
from app.rag.rerank import pick_sources, rerank
from app.rag.retrieve import hybrid_retrieve
from app.rag.rewrite import build_multi_queries, rewrite_query
from app.services import vector_store


def run_chat(message: str, session_id: str | None = None) -> dict:
    started = time.perf_counter()
    sid = session_id or str(uuid.uuid4())
    user_message = (message or "").strip()

    # Fast intents — skip LLM
    fast = match_fast_intent(user_message)
    if fast:
        append_turn(sid, "user", user_message)
        append_turn(sid, "assistant", fast["answer"])
        return {
            "answer": fast["answer"],
            "sources": fast.get("sources") or [],
            "session_id": sid,
            "response_time_ms": int((time.perf_counter() - started) * 1000),
        }

    if vector_store.indexed_count() == 0:
        return {
            "answer": C.SETUP_ANSWER,
            "sources": [],
            "session_id": sid,
            "response_time_ms": int((time.perf_counter() - started) * 1000),
        }

    history = get_history(sid)
    search_text = normalize_for_retrieval(user_message)
    rewritten = rewrite_query(search_text, history)
    intents = detect_intents(f"{search_text} {rewritten}")
    queries = build_multi_queries(rewritten, intents)

    hits = hybrid_retrieve(queries, intents)
    ranked = rerank(hits, intents)
    answer = generate_answer(user_message, ranked)
    answer = recover_if_needed(answer, user_message, ranked, intents)
    sources = pick_sources(ranked, intents)

    # If model returned token somehow, swap
    if answer.strip() == C.NO_ANSWER_TOKEN:
        answer = C.FALLBACK_ANSWER
        sources = []

    append_turn(sid, "user", user_message)
    append_turn(sid, "assistant", answer)

    return {
        "answer": answer,
        "sources": sources,
        "session_id": sid,
        "response_time_ms": int((time.perf_counter() - started) * 1000),
    }
