from __future__ import annotations

import re
from datetime import date, datetime

from app.rag import constants as C
from app.rag.links import public_url
from app.services.embeddings import chat_complete

SYSTEM_PROMPT = f"""You are the public website AI Assistant for HCG Foundation, a cancer-care charity trust in India.

Official contact (use only these unless context has newer published values):
- Email: {C.OFFICIAL_EMAIL}
- Phone: {C.OFFICIAL_PHONE}
- Address: {C.OFFICIAL_ADDRESS}
- Founder and Managing Trustee: {C.FOUNDER_NAME}
- Organisation PAN: {C.OFFICIAL_PAN}
- FCRA bank (foreign remittance): {C.FCRA_ACCOUNT_HOLDER}, {C.FCRA_BANK_NAME}, A/c {C.FCRA_ACCOUNT_NUMBER}, IFSC {C.FCRA_IFSC}, SWIFT {C.FCRA_SWIFT}

Rules:
1. Answer ONLY from the provided CONTEXT (or the official contact/PAN/FCRA bank lines above when the visitor asks for those). Do not invent other phones, emails, amounts, 80G rules, hospitals, UPI IDs, staff mobiles, or program details.
2. If nothing in context supports any part of the question, reply with exactly: {C.NO_ANSWER_TOKEN}
3. For multi-part questions, answer each supported part; refuse only missing parts. Use {C.NO_ANSWER_TOKEN} only if NONE can be answered.
4. Do not use patient stories as proof of donation amounts.
5. Lists (trustees/team): use a heading + bullets; use Designation from context; never invent “Chairman”; list ALL trustees present in context.
6. For 12A/80G/CSR/FCRA/Darpan prefer certificate/registration context over Donate Now marketing.
7. Hospital: Foundation is a trust, not an HCG hospital owner; Patient Aid may use HCG hospital facilities when context says so.
8. Non-cancer topics (heart attack, diabetes): do NOT say “we do not support X” unless context says so. Say materials focus on cancer care and that topic was not found.
9. Never dump internal proposal fields (contact person, staff mobiles, partner pitches, budgets) unless asked and present in context. Prefer public pages (Donate, Patient Aid, certificates) over partner proposal documents for FAQs.
10. Keep answers warm, concise, and visitor-facing. Do not mention embeddings, RAG, or internal systems.
11. Organisation PAN and FCRA bank account may be shared when the visitor asks — use only the official values above / context. Never share cancelled-cheque images, personal staff phones, or donor names.
12. Links: only link to a URL shown in a context block's URL field, copied exactly (relative paths like /contact — never add a domain), as Markdown [label](url). Never make up URLs; if a block's URL is "-", do not link it. Donations use the Donate Now form ({C.DONATE_URL}).
13. Dates: compare every event date with TODAY (given with the question). Events dated before today are past events — never call them upcoming. If no event in context is dated today or later, say in a friendly sentence that no upcoming events are published right now, briefly mention the most recent past events with their dates, and suggest checking the [Events]({C.EVENTS_URL}) page.
14. The official phone number {C.OFFICIAL_PHONE} is the Foundation's contact / helpline number.
"""


def generate_answer(question: str, contexts: list[dict]) -> str:
    if not contexts:
        return C.NO_ANSWER_TOKEN

    blocks = []
    for i, c in enumerate(contexts, 1):
        blocks.append(
            f"[{i}] Title: {c.get('title')}\n"
            f"Category: {c.get('category')}\n"
            f"URL: {public_url(c.get('url')) or '-'}\n"
            f"Designation: {c.get('designation') or '-'}\n"
            f"Content:\n{c.get('content')}"
        )
    context_text = "\n\n---\n\n".join(blocks)

    try:
        return chat_complete(
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        f"TODAY: {date.today():%d %B %Y}\n\n"
                        f"CONTEXT:\n{context_text}\n\n"
                        f"VISITOR QUESTION:\n{question}\n\n"
                        "Answer grounded in CONTEXT only."
                    ),
                },
            ],
            temperature=0.2,
            max_tokens=800,
        )
    except Exception:
        return C.NO_ANSWER_TOKEN


_EVENT_DATE = re.compile(r"Event Date:\s*\w{3} (\w{3} \d{1,2} \d{4})")


def _no_upcoming_events_answer(contexts: list[dict]) -> str:
    dated: list[tuple[datetime, str]] = []
    for c in contexts:
        if (c.get("category") or "").lower() != "event":
            continue
        m = _EVENT_DATE.search(c.get("content") or "")
        if not m:
            continue
        when = datetime.strptime(m.group(1), "%b %d %Y")
        url = public_url(c.get("url"))
        name = c.get("title") or "Event"
        label = f"[{name}]({url})" if url else name
        dated.append((when, f"- {label} — {when:%d %b %Y}"))

    lines = ["There are no upcoming events published on the website right now."]
    if dated:
        lines.append("Our most recent events:")
        lines.extend(line for _, line in sorted(dated, reverse=True)[:3])
    lines.append(f"Keep an eye on the [Events]({C.EVENTS_URL}) page for new dates.")
    return "\n".join(lines)


def recover_if_needed(answer: str, question: str, contexts: list[dict], intents: set[str]) -> str:
    text = (answer or "").strip()
    if text and text != C.NO_ANSWER_TOKEN:
        return text

    joined = "\n".join(
        f"{c.get('title','')} {c.get('content','')} {c.get('designation','')}"
        for c in contexts
    ).lower()
    q = (question or "").lower()

    if "psychological" in intents or "psychological" in q or "counsel" in q:
        if "psycholog" in joined or "counsel" in joined:
            return (
                "HCG Foundation’s published materials mention psychological / counseling "
                "support as part of patient-focused care. See the mission/program overview "
                "on the website for details, or contact "
                f"{C.OFFICIAL_EMAIL} / {C.OFFICIAL_PHONE}."
            )

    if "patient_aid" in intents or "apply" in q:
        if "patient aid" in joined or any(
            "patient aid" in (c.get("title") or "").lower() for c in contexts
        ):
            return (
                "For Patient Aid support, review the "
                f"[Financial Support for Pediatric Patients]({C.PATIENT_AID_URL}) page "
                "and contact the Foundation to apply. "
                f"Email {C.OFFICIAL_EMAIL} or call {C.OFFICIAL_PHONE}."
            )

    if "donate" in intents:
        if "donate" in joined or any("donate" in (c.get("title") or "").lower() for c in contexts):
            return C.DONATE_INTENT_ANSWER

    if "contact" in intents:
        return C.CONTACT_ANSWER

    if "events" in intents:
        return _no_upcoming_events_answer(contexts)

    if "hospital" in intents:
        return (
            "HCG Foundation is a charitable trust and does not own hospitals. Patients supported "
            "through its Patient Aid program are treated at HCG hospital facilities, which offer "
            "discounts to patients approved by the Foundation. A full list of centres isn’t "
            f"published in our materials — for details, email {C.OFFICIAL_EMAIL} or call "
            f"{C.OFFICIAL_PHONE}."
        )

    if "trustees" in intents or "founder" in intents:
        lines = ["**HCG Foundation Board of Trustees**"]
        lines.extend(f"- {name} — {role}" for name, role in C.TRUSTEES)
        lines.append(f"See [Our Team & Trustees]({C.TEAM_URL}) for their profiles.")
        return "\n".join(lines)

    if "non_cancer" in intents:
        return (
            "Available published information focuses on cancer care and related Patient Aid. "
            "I could not find specific guidance on that non-cancer topic in the current materials. "
            f"You may contact {C.OFFICIAL_EMAIL} / {C.OFFICIAL_PHONE} for clarification."
        )

    # Soft out-of-scope
    if any(k in q for k in ("bitcoin", "loan", "scholarship", "weather", "crypto")):
        return (
            "Available information focuses on HCG Foundation’s cancer-care work. "
            f"I could not find details about that topic. Contact {C.OFFICIAL_EMAIL} if needed."
        )

    return C.FALLBACK_ANSWER
