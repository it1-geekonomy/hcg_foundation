import re

from app.rag import constants as C

_EXACT = {
    r"^(hi+|hello|hey|hy|namaste|namaskara|good\s*(morning|afternoon|evening))(\s+there)?[\s!.]*$": "greeting",
    r"^((hi+|hello|hey)[\s,!.]*)?(how\s+(are|r)\s+(you|u)(\s+doing)?(\s+today)?|how'?s\s+it\s+going"
    r"|how\s+do\s+you\s+do|what'?s\s+up|wassup)[\s?!.]*$": "small_talk",
    r"^(who\s+are\s+you|what\s+are\s+you|what'?s\s+your\s+name|what\s+is\s+your\s+name"
    r"|are\s+you\s+(a\s+)?(bot|robot|human|real|ai|real\s+person))[\s?!.]*$": "about_bot",
    r"^(ok|okay|cool|nice|great|good|fine|alright|got\s+it|i\s+see|hmm+|super|awesome|perfect)[\s!.]*$": "ack",
    r"^(thanks|thank\s*you|thx|ty)(\s+(so\s+much|a\s+lot|very\s+much))?[\s!.]*$": "thanks",
    r"^(bye|bye\s+bye|goodbye|see\s*you|good\s*night)[\s!.]*$": "bye",
    r"^(help|menu|what\s+can\s+you\s+do)[\s!.]*$": "help",
    r"^(donate|donation)[\s!.]*$": "donate",
    r"^who\s+is\s+the\s+founder[\s?!.]*$": "founder",
}


def match_fast_intent(message: str) -> dict | None:
    text = (message or "").strip().lower()
    if not text:
        return {
            "intent": "unclear",
            "answer": "Could you share a bit more about what you’d like to know?",
            "sources": [],
        }

    if len(text) == 1 or re.fullmatch(r"[^\w\s]+", text):
        return {
            "intent": "unclear",
            "answer": "Could you rephrase your question in a few words?",
            "sources": [],
        }

    for pattern, intent in _EXACT.items():
        if re.fullmatch(pattern, text, flags=re.IGNORECASE):
            if intent == "greeting":
                return {"intent": intent, "answer": C.GREETING_ANSWER, "sources": []}
            if intent == "small_talk":
                return {"intent": intent, "answer": C.SMALL_TALK_ANSWER, "sources": []}
            if intent == "about_bot":
                return {"intent": intent, "answer": C.ABOUT_BOT_ANSWER, "sources": []}
            if intent == "ack":
                return {"intent": intent, "answer": C.ACK_ANSWER, "sources": []}
            if intent == "thanks":
                return {"intent": intent, "answer": C.THANKS_ANSWER, "sources": []}
            if intent == "bye":
                return {"intent": intent, "answer": C.GOODBYE_ANSWER, "sources": []}
            if intent == "help":
                return {"intent": intent, "answer": C.HELP_ANSWER, "sources": []}
            if intent == "donate":
                return {
                    "intent": intent,
                    "answer": C.DONATE_INTENT_ANSWER,
                    "sources": [
                        {"title": C.PAGE_LABELS[C.DONATE_URL], "url": C.DONATE_URL}
                    ],
                }
            if intent == "founder":
                return {
                    "intent": intent,
                    "answer": C.FOUNDER_INTENT_ANSWER,
                    "sources": [
                        {"title": C.PAGE_LABELS[C.TEAM_URL], "url": C.TEAM_URL}
                    ],
                }
    return None


def _has(text: str, *patterns: str) -> bool:
    """Match keywords at the start of a word, so "reach" doesn't fire on "outreach"."""
    return any(re.search(r"\b" + p, text) for p in patterns)


_TOPIC_WORDS = (
    "hcg", "foundation", "cancer", "oncolog", "tumou?r", "chemo", "radiation", "patient",
    "treatment", "hospital", "donat", "volunteer", "intern", "camp", "screening", "trust",
    "program", "project", "event", "stor(?:y|ies)", "testimonial", "report", "csr", "80g",
    "12a", "fcra", "hpv", "vaccin", "swast", "aa?sha", "charity", "ngo", "fund",
)


def is_on_topic(text: str, intents: set[str]) -> bool:
    """Whether a question is about the Foundation or cancer care at all (vs. "who is the PM?")."""
    return bool(intents) or _has((text or "").lower(), *_TOPIC_WORDS)


def detect_intents(text: str) -> set[str]:
    t = (text or "").lower()
    intents: set[str] = set()
    if _has(t, "donat", "donor", "80g", "tax receipt", "receipt"):
        intents.add("donate")
    if _has(t, "fcra", "foreign", "overseas", r"nris?\b"):
        intents.add("fcra")
    if _has(
        t,
        "bank",
        "account number",
        "account no",
        "a/c",
        "ifsc",
        "swift",
        "neft",
        "rtgs",
        "wire transfer",
    ):
        intents.add("bank")
        intents.add("fcra")
    if _has(t, r"pan\b", "permanent account"):
        intents.add("pan")
        intents.add("certificate")
    if _has(t, "12a", "csr", "darpan", "certificate", "registration"):
        intents.add("certificate")
    if _has(t, "trustee", r"board\b", "who runs", "leadership", "governing"):
        intents.add("trustees")
    if _has(t, "founder", "ajaikumar"):
        intents.add("founder")
    if _has(t, r"intern(ship)?s?\b"):
        intents.add("internship")
    if _has(t, "volunteer", "fundrais", "get involved", "participat"):
        intents.add("volunteer")
    if _has(
        t,
        "patient aid",
        "how do i apply",
        "sponsor",
        "adopt a patient",
        "eligib",
        "aasha daan",
        "asha daan",
        "financial aid",
        "financial support",
        "afford",
    ):
        intents.add("patient_aid")
    if _has(
        t,
        "contact",
        "phone",
        r"e-?mail\b",
        "address",
        r"reach\b",
        "helpline",
        "help line",
        "call you",
        "call us",
        "whatsapp",
        "mobile number",
    ):
        intents.add("contact")
    if _has(t, "privacy"):
        intents.add("privacy")
    if _has(t, r"terms\b", "t&c"):
        intents.add("terms")
    if _has(t, "program", "project", "mission", "what do you do", "initiative"):
        intents.add("programs")
    if _has(t, r"events?\b"):
        intents.add("events")
    if _has(t, "hospital", r"cancer cent(?:re|er)"):
        intents.add("hospital")
    if _has(t, "bengaluru", "bangalore", "how many patient"):
        intents.add("patient_count")
    if _has(t, "heart attack", "diabetes", "non-cancer", "non cancer"):
        intents.add("non_cancer")
    if _has(t, "psycholog", "counsel", "mental"):
        intents.add("psychological")
    if _has(t, "monthly", "recurring"):
        intents.add("monthly")
    return intents
