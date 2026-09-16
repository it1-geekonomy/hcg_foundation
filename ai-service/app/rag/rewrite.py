from __future__ import annotations

import re

from app.services.embeddings import chat_complete


_FOLLOWUP_HINTS = (
    "it",
    "they",
    "this",
    "that",
    "them",
    "explain please",
    "tell me more",
    "and then",
    "what about",
    "who is eligible",
)


def hard_rule_rewrite(message: str, history: list[dict]) -> str | None:
    t = (message or "").strip().lower()
    hist = " ".join(m.get("content", "") for m in history[-6:]).lower()

    if re.fullmatch(r"how do i apply\??", t):
        if "internship" in hist or "intern" in t:
            return "How do I apply for the HCG Foundation internship program?"
        if any(k in hist for k in ("fcra", "foreign")):
            return "How can a foreign donor contribute under FCRA to HCG Foundation?"
        return "How do I apply for HCG Foundation Patient Aid support?"

    if re.fullmatch(r"who runs it\??", t) or "who runs" in t:
        return "Who are the trustees and leadership that run HCG Foundation?"

    if "who is eligible" in t:
        if "internship" in hist:
            return "Who is eligible for the HCG Foundation internship program?"
        return "Who is eligible for HCG Foundation Patient Aid?"

    if any(k in t for k in ("foreign donate", "foreigners donate", "nri donate", "fcra")):
        return "Can foreigners donate to HCG Foundation under FCRA registration?"

    return None


def needs_llm_rewrite(message: str, history: list[dict]) -> bool:
    t = (message or "").strip().lower()
    if len(t.split()) <= 4 and any(h in t for h in _FOLLOWUP_HINTS):
        return True
    if history and any(h in t for h in _FOLLOWUP_HINTS):
        return True
    # messy / very short follow-up
    if history and len(t.split()) <= 3:
        return True
    return False


def rewrite_query(message: str, history: list[dict]) -> str:
    hard = hard_rule_rewrite(message, history)
    if hard:
        return hard

    if not needs_llm_rewrite(message, history):
        return message

    hist_lines = []
    for m in history[-6:]:
        role = m.get("role", "user")
        hist_lines.append(f"{role}: {m.get('content', '')}")
    prompt = (
        "Rewrite the latest visitor message as one clear standalone search question "
        "about HCG Foundation (cancer charity). Keep meaning. Do not invent facts. "
        "Return only the rewritten question.\n\n"
        f"History:\n{chr(10).join(hist_lines)}\n\n"
        f"Latest: {message}"
    )
    try:
        out = chat_complete(
            [
                {
                    "role": "system",
                    "content": "You rewrite search queries for a charity chatbot.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0,
            max_tokens=120,
        )
        return out or message
    except Exception:
        return message


def build_multi_queries(rewritten: str, intents: set[str]) -> list[str]:
    parts = re.split(r"[?;]|\.\s+| also ", rewritten, flags=re.IGNORECASE)
    queries = [p.strip() for p in parts if p and len(p.strip()) > 2]
    if rewritten.strip() and rewritten.strip() not in queries:
        queries.insert(0, rewritten.strip())

    if "donate" in intents:
        queries.append("How can I donate to HCG Foundation?")
    if "donate" in intents or "certificate" in intents:
        queries.append("Does HCG Foundation provide an 80G donation receipt?")
    if "monthly" in intents:
        queries.append("Does HCG Foundation accept monthly or recurring donations?")
    if "trustees" in intents:
        queries.append("Who are the HCG Foundation trustees?")
    if "founder" in intents:
        queries.append("Who is the founder of HCG Foundation Dr B.S. Ajaikumar?")
    if "fcra" in intents:
        queries.append("HCG Foundation FCRA registration for foreign donations")
    if "patient_aid" in intents:
        queries.append("How does HCG Foundation Patient Aid work and how to apply?")
    if "internship" in intents:
        queries.append("HCG Foundation internship program application")
    if "patient_count" in intents:
        queries.append("How many patients has HCG Foundation supported overall?")
        queries.append("HCG Foundation patients supported in Bengaluru city breakdown")
    if "programs" in intents:
        queries.append("What programs and projects does HCG Foundation run?")
    if "contact" in intents:
        queries.append("HCG Foundation contact email phone address")
    if "privacy" in intents:
        queries.append("HCG Foundation privacy policy")
    if "hospital" in intents:
        queries.append("Does HCG Foundation own a hospital or work with HCG hospitals?")

    # dedupe preserve order, cap 6
    seen: set[str] = set()
    out: list[str] = []
    for q in queries:
        key = q.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(q)
        if len(out) >= 6:
            break
    return out or [rewritten]
