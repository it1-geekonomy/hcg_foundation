import re

from app.rag import constants as C

_EXACT = {
    r"^(hi|hello|hey|good\s*(morning|afternoon|evening))[\s!.]*$": "greeting",
    r"^(thanks|thank\s*you|thx)[\s!.]*$": "thanks",
    r"^(bye|goodbye|see\s*you)[\s!.]*$": "bye",
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
                    "sources": [{"title": "Donate Now", "url": "/donate"}],
                }
            if intent == "founder":
                return {
                    "intent": intent,
                    "answer": C.FOUNDER_INTENT_ANSWER,
                    "sources": [
                        {"title": "Our Team / Trustees", "url": "/about/our-team"}
                    ],
                }
    return None


def detect_intents(text: str) -> set[str]:
    t = (text or "").lower()
    intents: set[str] = set()
    if any(k in t for k in ("donate", "donation", "80g", "tax receipt", "receipt")):
        intents.add("donate")
    if any(k in t for k in ("fcra", "foreign", "overseas", "nri")):
        intents.add("fcra")
    if any(k in t for k in ("12a", "csr", "darpan", "certificate", "registration")):
        intents.add("certificate")
    if any(
        k in t
        for k in ("trustee", "board", "who runs", "leadership", "governing")
    ):
        intents.add("trustees")
    if any(k in t for k in ("founder", "ajaikumar")):
        intents.add("founder")
    if "internship" in t or "intern " in t:
        intents.add("internship")
    if any(
        k in t
        for k in (
            "patient aid",
            "how do i apply",
            "sponsor",
            "adopt a patient",
            "eligible",
        )
    ):
        intents.add("patient_aid")
    if any(k in t for k in ("contact", "phone", "email", "address", "reach")):
        intents.add("contact")
    if "privacy" in t:
        intents.add("privacy")
    if "terms" in t:
        intents.add("terms")
    if any(k in t for k in ("program", "project", "mission", "what do you do")):
        intents.add("programs")
    if "event" in t:
        intents.add("events")
    if "hospital" in t:
        intents.add("hospital")
    if any(k in t for k in ("bengaluru", "bangalore", "how many patient")):
        intents.add("patient_count")
    if any(k in t for k in ("heart attack", "diabetes", "non-cancer", "non cancer")):
        intents.add("non_cancer")
    if any(k in t for k in ("psychological", "counsel", "mental")):
        intents.add("psychological")
    if any(k in t for k in ("monthly", "recurring")):
        intents.add("monthly")
    return intents
