from __future__ import annotations

from app.rag import constants as C
from app.services.embeddings import chat_complete

SYSTEM_PROMPT = f"""You are the public website assistant for HCG Foundation, a cancer-care charity trust in India.

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
"""


def generate_answer(question: str, contexts: list[dict]) -> str:
    if not contexts:
        return C.NO_ANSWER_TOKEN

    blocks = []
    for i, c in enumerate(contexts, 1):
        blocks.append(
            f"[{i}] Title: {c.get('title')}\n"
            f"Category: {c.get('category')}\n"
            f"URL: {c.get('url')}\n"
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
                "For Patient Aid support, review the Patient Aid information on the website "
                "and contact the Foundation to apply. "
                f"Email {C.OFFICIAL_EMAIL} or call {C.OFFICIAL_PHONE}."
            )

    if "donate" in intents:
        if "donate" in joined or any("donate" in (c.get("title") or "").lower() for c in contexts):
            return C.DONATE_INTENT_ANSWER

    if "trustees" in intents or "founder" in intents:
        trustees = [
            c
            for c in contexts
            if (c.get("category") or "").lower() == "trustee"
            or "ajaikumar" in (c.get("title") or "").lower()
        ]
        if trustees:
            lines = ["HCG Foundation’s published trustees / leadership include:"]
            for t in trustees:
                des = t.get("designation") or ""
                title = t.get("title") or "Trustee"
                lines.append(f"- {title}" + (f" — {des}" if des else ""))
            lines.append(
                f"For more, see Our Team / Trustees on the website, or contact {C.OFFICIAL_EMAIL}."
            )
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
