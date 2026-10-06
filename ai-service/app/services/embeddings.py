from collections import OrderedDict
from threading import Lock

from openai import OpenAI
from app.config import settings

_client = OpenAI(
    api_key=settings.openai_api_key,
    timeout=settings.openai_timeout_seconds,
)


def embed_batch(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    # OpenAI embedding API limits batch size; chunk defensively.
    out: list[list[float]] = []
    model = settings.resolved_embedding_model
    for i in range(0, len(texts), 64):
        batch = texts[i : i + 64]
        response = _client.embeddings.create(model=model, input=batch)
        out.extend([d.embedding for d in response.data])
    return out


def embed_text(text: str) -> list[float]:
    return embed_batch([text])[0]


# Search queries repeat a lot (suggested questions, the fixed per-intent queries).
_QUERY_CACHE_SIZE = 256
_query_cache: OrderedDict[str, list[float]] = OrderedDict()
_query_cache_lock = Lock()


def embed_queries(texts: list[str]) -> list[list[float]]:
    """Embed search queries in one API call, reusing recently embedded ones."""
    with _query_cache_lock:
        cached = {t: _query_cache[t] for t in texts if t in _query_cache}
        for t in cached:
            _query_cache.move_to_end(t)
    missing = list(dict.fromkeys(t for t in texts if t not in cached))
    if missing:
        fresh = dict(zip(missing, embed_batch(missing)))
        cached.update(fresh)
        with _query_cache_lock:
            _query_cache.update(fresh)
            while len(_query_cache) > _QUERY_CACHE_SIZE:
                _query_cache.popitem(last=False)
    return [cached[t] for t in texts]


def chat_complete(
    messages: list[dict],
    *,
    temperature: float = 0.2,
    max_tokens: int = 700,
) -> str:
    completion = _client.chat.completions.create(
        model=settings.resolved_chat_model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return (completion.choices[0].message.content or "").strip()
