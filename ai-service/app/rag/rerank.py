from __future__ import annotations

from app.config import settings


def rerank(hits: list[dict], intents: set[str]) -> list[dict]:
    scored: list[dict] = []
    for h in hits:
        score = float(h.get("similarity") or 0)
        title = (h.get("title") or "").lower()
        category = (h.get("category") or "").lower()
        content = h.get("content") or ""

        if "contact" in intents:
            if "contact" in title:
                score += 0.40
            if category in ("patient story", "patient testimonial"):
                score -= 0.35

        if "donate" in intents and "fcra" not in intents and "certificate" not in intents:
            if "donate" in title:
                score += 0.40
            if category in ("patient story", "patient testimonial"):
                score -= 0.50  # stories leak fake donation amounts
            if "proposal" in title:
                score -= 0.35  # partner proposals are not public donate FAQs

        if "certificate" in intents or "fcra" in intents or "bank" in intents or "pan" in intents:
            if any(
                k in title
                for k in (
                    "fcra",
                    "80g",
                    "12a",
                    "csr",
                    "darpan",
                    "registration",
                    "pan",
                    "bank",
                )
            ):
                score += 0.45
            if category == "page" and "donate" in title and "bank" not in intents:
                score -= 0.15
            if "proposal" in title:
                score -= 0.40

        if "bank" in intents:
            if any(k in title for k in ("bank", "fcra")) or "ifsc" in content.lower():
                score += 0.50

        if "pan" in intents:
            if "pan" in title or "pan" in content.lower():
                score += 0.50

        if "founder" in intents:
            if "ajaikumar" in title or "ajaikumar" in content.lower():
                score += 0.45
            if category == "trustee":
                score += 0.20

        if "trustees" in intents:
            if category == "trustee":
                score += 0.35
            if category in ("team", "patient story"):
                score -= 0.25

        if "patient_aid" in intents:
            if "patient aid" in title or "patient-aid" in title:
                score += 0.40
            if title.strip() == "patient aid" or title.startswith("patient aid"):
                score += 0.10

        if "internship" in intents:
            if "internship" in title:
                score += 0.40

        if "privacy" in intents and "privacy" in title:
            score += 0.40

        if "programs" in intents and category in ("project", "page", "award"):
            score += 0.15

        if len(content) < 120:
            score -= 0.20  # title-only junk

        item = dict(h)
        item["score"] = score
        scored.append(item)

    # parent dedupe already done in retrieve; keep best score sort
    scored.sort(key=lambda x: x["score"], reverse=True)

    # trustee-only: drop team/story categories
    if "trustees" in intents and "programs" not in intents:
        scored = [
            s
            for s in scored
            if (s.get("category") or "").lower()
            not in ("team", "patient story", "patient testimonial")
            or "ajaikumar" in (s.get("title") or "").lower()
        ]

    filtered = [
        s for s in scored if s["score"] >= settings.similarity_threshold
    ]
    return filtered[: settings.retrieval_top_k]


def pick_sources(hits: list[dict], intents: set[str]) -> list[dict]:
    if not hits:
        return []
    best = hits[0]["score"]
    margin = settings.source_score_margin
    sources: list[dict] = []
    seen_urls: set[str] = set()

    for h in hits:
        if h["score"] < best - margin:
            break
        title = h.get("title") or "HCG Foundation"
        url = h.get("url") or "/"
        category = (h.get("category") or "").lower()

        if "fcra" in intents or "certificate" in intents or "bank" in intents or "pan" in intents:
            if category not in ("page", "legal") and not any(
                k in title.lower()
                for k in (
                    "fcra",
                    "80g",
                    "12a",
                    "csr",
                    "darpan",
                    "registration",
                    "pan",
                    "bank",
                )
            ):
                continue
        if "trustees" in intents or "founder" in intents:
            if category not in ("trustee", "page", "team") and "ajaikumar" not in title.lower():
                # still allow trustee pages
                if category != "trustee":
                    continue
        if "programs" in intents and category in (
            "patient story",
            "patient testimonial",
        ):
            continue

        key = url.lower()
        if key in seen_urls:
            continue
        seen_urls.add(key)
        sources.append({"title": title, "url": url})
        if len(sources) >= settings.max_sources:
            break

    return sources
