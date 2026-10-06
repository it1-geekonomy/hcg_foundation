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
7. Hospitals: answer what was asked first. HCG has a network of hospitals for cancer treatment and Foundation patients are treated there — name the HCG hospitals the context lists, saying they "include" these (it is not a complete official list). Mention only briefly that the Foundation itself is a trust and does not own the hospitals.
8. Non-cancer topics (heart attack, diabetes): do NOT say “we do not support X” unless context says so. Say materials focus on cancer care and that topic was not found.
9. Never dump internal proposal fields (contact person, staff mobiles, partner pitches, budgets) unless asked and present in context. Prefer public pages (Donate, Patient Aid, certificates) over partner proposal documents for FAQs.
10. Keep answers warm, concise (usually 2-4 sentences) and visitor-facing, but include the key specifics context gives for the question — dates, numbers, registration details, the related facts that explain the answer. Do not mention embeddings, RAG, or internal systems.
11. Organisation PAN and FCRA bank account may be shared when the visitor asks — use only the official values above / context. Never share cancelled-cheque images, personal staff phones, or donor names.
12. Links: only link to a URL shown in a context block's URL field, copied exactly (relative paths like /contact — never add a domain), as Markdown [label](url) using that block's "Link label" as the label, e.g. "see the [About Us](/about-us) page". Never make up URLs or page names; if a block's URL is "-", do not link it. Donations use the Donate Now form ({C.DONATE_URL}).
13. Dates: each event block has an "Event status" line — follow it exactly. PAST events must never be called upcoming or current. If no event in context is dated today or later, say in a friendly sentence that no upcoming events are published right now, briefly mention the most recent past events with their dates, and suggest checking the [Events]({C.EVENTS_URL}) page.
14. The official phone number {C.OFFICIAL_PHONE} is the Foundation's contact / helpline number.
15. Never write raw "URL:" / "Focus:" field lines. Put links inline in the sentence, e.g. "see [Awareness & Screening Camps](/awareness-and-screening-camps)".
16. Context blocks with Category "Page" hold the actual text of the public website pages — prefer them when describing programs, initiatives and how to get involved.
17. Answer the question that was asked, directly, in the first sentence. Start with Yes or No only when context states that answer explicitly; when context only says something is not published or not described, say exactly that instead of Yes/No.
18. Never mention "context", "provided information" or "documents" to the visitor. When a detail is missing, say it is not published on our website, then share any closely related facts the context does give (for example, related programs or work with schools, hospitals or communities) before suggesting the official contact.
"""

# Second chance when nothing answers the question directly ("in-kind donations?",
# "how many locations?"): an honest "not published" plus related facts beats a refusal.
RELATED_INSTRUCTION = f"""The CONTEXT may not answer this exact question. Decide:
- If CONTEXT contains facts that are clearly related and genuinely useful to this visitor, reply in 2-4 sentences: first say plainly that the specific detail asked about is not published on our website, then share the related facts, then suggest contacting {C.OFFICIAL_EMAIL} or {C.OFFICIAL_PHONE} for that specific point.
- Only use facts stated in CONTEXT. Never guess numbers, policies or yes/no answers that CONTEXT does not state.
- If nothing in CONTEXT is related, reply with exactly: {C.NO_ANSWER_TOKEN}"""


def _context_text(contexts: list[dict]) -> str:
    blocks = []
    for i, c in enumerate(contexts, 1):
        url = public_url(c.get("url"))
        blocks.append(
            f"[{i}] Title: {c.get('title')}\n"
            f"Category: {c.get('category')}\n"
            f"URL: {url or '-'}\n"
            f"Link label: {C.PAGE_LABELS.get(url or '', c.get('title')) if url else '-'}\n"
            f"Designation: {c.get('designation') or '-'}\n"
            f"{_event_status(c)}"
            f"Content:\n{c.get('content')}"
        )
    return "\n\n---\n\n".join(blocks)


def _complete(question: str, contexts: list[dict], instruction: str) -> str:
    if not contexts:
        return C.NO_ANSWER_TOKEN
    try:
        return chat_complete(
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        f"TODAY: {date.today():%d %B %Y}\n\n"
                        f"CONTEXT:\n{_context_text(contexts)}\n\n"
                        f"VISITOR QUESTION:\n{question}\n\n"
                        f"{instruction}"
                    ),
                },
            ],
            temperature=0.2,
            max_tokens=800,
        )
    except Exception:
        return C.NO_ANSWER_TOKEN


def generate_answer(question: str, contexts: list[dict]) -> str:
    return _complete(question, contexts, "Answer grounded in CONTEXT only.")


def generate_related_answer(question: str, contexts: list[dict]) -> str:
    return _complete(question, contexts, RELATED_INSTRUCTION)


_INTERNAL_TERMS = re.compile(r"\bcontext\b|\bprovided (?:information|documents?|text)\b", re.I)


def mentions_internal_terms(answer: str) -> bool:
    """The model sometimes says "the context does not mention..." despite rule 18."""
    return bool(_INTERNAL_TERMS.search(answer or ""))


_EVENT_DATE = re.compile(r"Event Date:\s*\w{3} (\w{3} \d{1,2} \d{4})")


def _event_date(context: dict) -> datetime | None:
    if (context.get("category") or "").lower() != "event":
        return None
    m = _EVENT_DATE.search(context.get("content") or "")
    return datetime.strptime(m.group(1), "%b %d %Y") if m else None


def _event_status(context: dict) -> str:
    when = _event_date(context)
    if not when:
        return ""
    status = "UPCOMING event" if when.date() >= date.today() else "PAST event (already happened)"
    return f"Event status: {status}, held on {when:%d %B %Y}\n"


def _no_upcoming_events_answer(contexts: list[dict]) -> str:
    dated: list[tuple[datetime, str]] = []
    for c in contexts:
        when = _event_date(c)
        if not when:
            continue
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
            return (
                "I couldn’t find that specific detail on our website. You can donate online "
                f"through the [Donate Now]({C.DONATE_URL}) form, and eligible Indian donations "
                "may receive an 80G tax receipt. For anything else about donating, email "
                f"{C.OFFICIAL_EMAIL} or call {C.OFFICIAL_PHONE}."
            )

    if "contact" in intents:
        return C.CONTACT_ANSWER

    if "events" in intents:
        return _no_upcoming_events_answer(contexts)

    if "hospital" in intents:
        return (
            "HCG Foundation is a registered public charitable trust and does not own hospitals. "
            "Patients supported through its Patient Aid program are treated at HCG hospitals, "
            "which give approved patients a discount. For other details, email "
            f"{C.OFFICIAL_EMAIL} or call {C.OFFICIAL_PHONE}."
        )

    if "trustees" in intents or "founder" in intents:
        from app.rag.team import list_answer

        board = list_answer(trustees=True, team=False)
        if board:
            return board["answer"]

    if "terms" in intents:
        return (
            "You can read HCG Foundation’s terms on the [Terms & Conditions](/terms) page. "
            f"For any questions about them, email {C.OFFICIAL_EMAIL} or call {C.OFFICIAL_PHONE}."
        )

    if "privacy" in intents:
        return (
            "You can read how HCG Foundation handles personal information on the "
            f"[Privacy Policy](/privacy) page. For questions, email {C.OFFICIAL_EMAIL}."
        )

    if "non_cancer" in intents:
        return (
            "Available published information focuses on cancer care and related Patient Aid. "
            "I could not find specific guidance on that non-cancer topic in the current materials. "
            f"You may contact {C.OFFICIAL_EMAIL} / {C.OFFICIAL_PHONE} for clarification."
        )

    # Soft out-of-scope
    if any(k in q for k in ("bitcoin", "loan", "scholarship", "weather", "crypto")):
        return C.OUT_OF_SCOPE_ANSWER

    return C.FALLBACK_ANSWER
