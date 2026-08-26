from openai import OpenAI
from sqlalchemy.orm import Session

from app.config import settings
from app.services import embeddings, privacy, query_repair, vector_store
from app.services.answer_cache import answer_cache

_client = OpenAI(
    api_key=settings.openai_api_key,
    base_url=settings.openai_base_url or None,
)

SYSTEM_PROMPT = """You are the public HCG Foundation assistant.

Rules:
- Answer ONLY from CONTEXT. Never invent facts.
- The user question may have typos/grammar issues — interpret their intended meaning.
- Lead with a direct clear answer, then short bullets only if listing steps/points.
- Use plain language. Do not dump whole pages or long quotes.
- Privacy: never reveal emails, phones, addresses, donor/patient private records, IDs, cards, credentials.
- If CONTEXT has [redacted], do not guess originals.
- If CONTEXT does not support the question, say so briefly and suggest contacting HCG Foundation.
"""

NO_HIT_ANSWER = (
    "I could not find matching public information in the HCG Foundation knowledge base. "
    "Please try rephrasing your question, or contact the foundation directly."
)


def _build_context(results: list[dict]) -> str:
    blocks: list[str] = []
    max_chars = settings.context_excerpt_chars
    for i, r in enumerate(results, start=1):
        safe = privacy.redact_pii(r["content"])
        excerpt = safe if len(safe) <= max_chars else safe[:max_chars].rsplit(" ", 1)[0] + "..."
        blocks.append(f"[{i}] ({r['source_table']}#{r['source_id']})\n{excerpt}")
    return "\n\n".join(blocks)


def _merge_results(*result_lists: list[dict], limit: int) -> list[dict]:
    best: dict[tuple[str, str, str], dict] = {}
    for results in result_lists:
        for r in results:
            key = (r["source_table"], r["source_id"], r["content"][:80])
            prev = best.get(key)
            if prev is None or r["distance"] < prev["distance"]:
                best[key] = r
    merged = sorted(best.values(), key=lambda x: x["distance"])
    return merged[:limit]


def answer_question(db: Session, question: str) -> dict:
    raw = (question or "").strip()
    if len(raw) < 2:
        return {
            "answer": "Please ask a short question about HCG Foundation.",
            "sources": [],
            "cached": False,
        }

    if privacy.is_blocked_question(raw):
        return {"answer": privacy.REFUSAL_MESSAGE, "sources": [], "cached": False}

    # Repair typos before cache/retrieval so "privacey polcy" hits the same path.
    search_q, cleaned_q = query_repair.repair_question(db, raw)
    if not search_q:
        return {
            "answer": "Please ask a short question about HCG Foundation.",
            "sources": [],
            "cached": False,
        }

    for key_q in (search_q, cleaned_q, raw):
        hit = answer_cache.get_exact(key_q)
        if hit:
            return hit

    query_vector = embeddings.embed_text(search_q)
    hit = answer_cache.get_semantic(search_q, query_vector)
    if hit:
        return hit

    results = vector_store.similarity_search_with_vector(
        db, query_vector, settings.top_k_chunks
    )

    # If the repaired query still looks weak and differs from original, try original too.
    if cleaned_q.lower() != search_q.lower():
        if not results or results[0]["distance"] > settings.max_retrieval_distance * 0.85:
            original_vector = embeddings.embed_text(cleaned_q)
            alt = vector_store.similarity_search_with_vector(
                db, original_vector, settings.top_k_chunks
            )
            results = _merge_results(results, alt, limit=settings.top_k_chunks)

    sources = sorted({f"{r['source_table']}#{r['source_id']}" for r in results})

    if not results or results[0]["distance"] > settings.max_retrieval_distance:
        payload = {"answer": NO_HIT_ANSWER, "sources": [], "cached": False}
        answer_cache.put(search_q, payload["answer"], [], query_vector)
        answer_cache.put(raw, payload["answer"], [], query_vector)
        return payload

    context = _build_context(results)
    user_prompt = (
        f"CONTEXT:\n{context}\n\n"
        f"USER QUESTION (may contain typos): {cleaned_q}\n"
        f"INTERPRETED QUESTION: {search_q}\n\n"
        "Write a clear, direct public-safe answer for the user."
    )

    completion = _client.chat.completions.create(
        model=settings.chat_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.15,
        max_tokens=settings.chat_max_tokens,
    )

    answer = privacy.redact_pii((completion.choices[0].message.content or "").strip())
    payload = {"answer": answer, "sources": sources, "cached": False}

    # Cache under repaired + original so future typos/repeats skip the LLM.
    answer_cache.put(search_q, answer, sources, query_vector)
    if normalize_differs(raw, search_q):
        answer_cache.put(raw, answer, sources, query_vector)
    return payload


def normalize_differs(a: str, b: str) -> bool:
    return a.strip().lower() != b.strip().lower()
