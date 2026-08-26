from __future__ import annotations

from functools import lru_cache

from openai import OpenAI

from app.config import settings

_openai_client: OpenAI | None = None


def _get_openai_client() -> OpenAI:
    global _openai_client
    if _openai_client is None:
        _openai_client = OpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url or None,
        )
    return _openai_client


@lru_cache(maxsize=1)
def _local_model():
    # fastembed is much lighter than full torch + sentence-transformers in Docker
    from fastembed import TextEmbedding

    return TextEmbedding(model_name=settings.embedding_model)


def embed_batch(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []

    if settings.embedding_provider == "openai":
        response = _get_openai_client().embeddings.create(
            model=settings.embedding_model,
            input=texts,
        )
        return [d.embedding for d in response.data]

    vectors = list(_local_model().embed(texts))
    return [v.tolist() if hasattr(v, "tolist") else list(v) for v in vectors]


def embed_text(text: str) -> list[float]:
    return embed_batch([text])[0]
