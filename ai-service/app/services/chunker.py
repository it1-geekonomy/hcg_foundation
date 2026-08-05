from app.config import settings


def split_text(text: str) -> list[str]:
    """Splits text into overlapping chunks so retrieval stays precise on long content."""
    cleaned = text.strip()
    if not cleaned:
        return []
    if len(cleaned) <= settings.chunk_size:
        return [cleaned]

    chunks = []
    start = 0
    while start < len(cleaned):
        end = min(start + settings.chunk_size, len(cleaned))
        chunk = cleaned[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end == len(cleaned):
            break
        start = end - settings.chunk_overlap

    return chunks
