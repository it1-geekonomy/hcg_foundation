from __future__ import annotations

import time

from app.config import settings
from app.rag import answer_cache
from app.rag import constants as C
from app.rag.catalog import answer_catalog_question
from app.rag.generate import (
    generate_answer,
    generate_related_answer,
    mentions_internal_terms,
    recover_if_needed,
)
from app.rag.hospitals import hospital_context
from app.rag.intents import detect_intents, is_on_topic, match_fast_intent
from app.rag.links import clean_answer, valid_sources
from app.rag.memory import append_turn, get_history, resolve_session_id
from app.rag.normalize import normalize_for_retrieval
from app.rag.rerank import pick_sources, rerank
from app.rag.retrieve import hybrid_retrieve
from app.rag.rewrite import build_multi_queries, rewrite_query
from app.rag.team import answer_team_question
from app.services import vector_store


def run_chat(message: str, session_id: str | None = None) -> dict:
    result = _answer(message, session_id)
    # Every reply path (fast intents, catalog, cache, RAG) gets the same link check,
    # against the pages the website currently has
    result["answer"] = clean_answer(result["answer"])
    result["sources"] = valid_sources(result.get("sources"))
    return result


def _answer(message: str, session_id: str | None) -> dict:
    started = time.perf_counter()
    sid = resolve_session_id(session_id)
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

    catalog = answer_team_question(user_message) or answer_catalog_question(user_message)
    if catalog:
        append_turn(sid, "user", user_message)
        append_turn(sid, "assistant", catalog["answer"])
        return {
            **catalog,
            "session_id": sid,
            "response_time_ms": int((time.perf_counter() - started) * 1000),
        }

    history = get_history(sid)
    # Opening questions don't depend on history, so their answers can be reused
    cacheable = not history
    index_version = vector_store.index_version()
    if cacheable:
        cached = answer_cache.get(user_message)
        if cached:
            append_turn(sid, "user", user_message)
            append_turn(sid, "assistant", cached["answer"])
            return {
                **cached,
                "session_id": sid,
                "response_time_ms": int((time.perf_counter() - started) * 1000),
            }

    search_text = normalize_for_retrieval(user_message)
    rewritten = rewrite_query(search_text, history)
    intents = detect_intents(f"{search_text} {rewritten}")
    queries = build_multi_queries(rewritten, intents)

    hits = hybrid_retrieve(queries, intents, question=search_text)
    ranked = vector_store.with_neighbor_chunks(rerank(hits, intents))
    
    if "summarize" in intents and history:
        last_asst = next((m["content"] for m in reversed(history) if m["role"] == "assistant"), "")
        last_user = next((m["content"] for m in reversed(history) if m["role"] == "user"), "")
        if last_asst:
            user_message = f"Regarding my previous question '{last_user}', {user_message}"
            ranked = [{"title": "Previous Answer", "content": last_asst, "url": "", "category": "Memory"}]

    if "hospital" in intents:
        extra = hospital_context()
        if extra:
            ranked = [{**extra, "score": ranked[0]["score"] if ranked else 1.0}] + ranked
    answer = generate_answer(user_message, ranked)
    first = clean_answer(answer)
    if first in ("", C.NO_ANSWER_TOKEN) or mentions_internal_terms(first):
        answer = generate_related_answer(user_message, ranked)
    answer = recover_if_needed(clean_answer(answer) or C.NO_ANSWER_TOKEN, user_message, ranked, intents)
    answer = clean_answer(answer) or C.NO_ANSWER_TOKEN
    sources = pick_sources(ranked, intents, answer)

    # If model returned token somehow, or if recovery triggered fallback, clear sources
    if answer.strip() == C.NO_ANSWER_TOKEN or answer.strip() == C.FALLBACK_ANSWER.strip():
        answer = C.FALLBACK_ANSWER if is_on_topic(user_message, intents) else C.OUT_OF_SCOPE_ANSWER
        sources = []
    elif answer == C.OUT_OF_SCOPE_ANSWER:
        sources = []

    append_turn(sid, "user", user_message)
    append_turn(sid, "assistant", answer)
    if cacheable:
        answer_cache.put(user_message, answer, sources, index_version)

    return {
        "answer": answer,
        "sources": sources,
        "session_id": sid,
        "response_time_ms": int((time.perf_counter() - started) * 1000),
    }
