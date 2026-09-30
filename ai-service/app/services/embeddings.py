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
